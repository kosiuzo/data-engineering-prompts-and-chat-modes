---
description: "Compute customer lifetime value based on historical purchase data, optionally considering contribution margin and churn."
mode: "agent"
model: "GPT-4o"
tools: ["codebase"]
---

# Customer Lifetime Value (LTV) Estimator

Compute customer lifetime value based on historical purchase data, optionally considering contribution margin and churn.

# Problem
**Customer Lifetime Value (LTV)** is the total revenue (or profit) a business can expect from a customer over their entire relationship. Calculating LTV helps inform marketing spend, retention efforts, etc. The simplest form is sum of a customer's purchases. More advanced: projecting future purchases or factoring in gross margin and discount rate (for present value). This pattern focuses on historical LTV from data.

Considerations:
- Do we include **only completed sales** or also expected future value? (Often for simplicity use historical or assume some retention model for future.)
- If including **margin**, multiply revenue by margin% to get profit contribution.
- Handle **censoring**: if customers are still active, their true lifetime isn't over. So any sum is a lower bound of LTV; could note that these customers are "censored" (haven't churned yet).
- If needed, incorporate churn probability to predict remaining value (requires more complex survival analysis).
- For cohorts, sometimes LTV is given per cohort average rather than per user.

# Data Requirements
- **Orders table**: `${input:orders_table }` with:
- `${input:customer_id }` – customer identifier.
- `${input:order_date }` – date of order.
- `${input:order_amount }` – monetary value of the order (revenue).
- If `margin_percent` provided (e.g., 0.3 for 30% margin), we will multiply order_amount by this to estimate profit per order.
- Ensure data covers enough history. If customers have subscription or recurring revenue beyond timeframe, true LTV would be higher than captured.

# Steps
1. **Aggregate spend per customer**:
- Sum up `order_amount` for each `customer_id` (optionally apply `margin_percent` if focusing on profit LTV).
- That gives each customer's total historical revenue.

2. **Count time span or last order** (optional):
- It can be useful to note the customer's first and last purchase dates and count of orders. E.g., how long they've been a customer. If a customer's last order was recent, they may not be churned yet.

3. **Average LTV (optional)**:
- Compute average LTV per cohort or overall. Sometimes people report "The average 12-month LTV for 2020 signups is $X".
- But careful: average can be skewed by big spenders.

4. **Identify active vs churned customers**:
- If possible, define churned: e.g., no purchases in last 12 months = considered churned. This helps separate completed lifetimes vs ongoing.
- For active (not churned) customers, their LTV is **censored** (will likely grow further).
- Could label or separate them.

5. **Optional prediction**:
- We won't go deep, but note: advanced LTV would fit a retention curve or use a model (like Pareto/NBD or survival analysis) to project future spend.
This pattern will highlight historical and maybe a simple extrapolation (like assume churn at a certain rate, etc. if needed).

6. **Output**:
- A table of customers with columns: customer_id, total_revenue, maybe total_margin, first_order_date, last_order_date, order_count.
- Or aggregate results like average LTV per segment.

# SQL / ETL Skeleton
```sql
SELECT
${input:customer_id },
COUNT(*) AS order_count,
MIN(${input:order_date }) AS first_order_date,
MAX(${input:order_date }) AS last_order_date,
SUM(${input:order_amount }
${input:margin_percent }* ${input:margin_percent }
) AS total_value
FROM ${input:orders_table }
GROUP BY ${input:customer_id };
```
(If margin_percent is provided, multiply accordingly. The above yields total revenue or profit per customer.)

If we wanted to compute average by cohort of first_order_year:
```sql
SELECT DATE_TRUNC('year', first_order_date) as cohort_year,
AVG(total_value) as avg_LTV,
AVG(order_count) as avg_orders,
COUNT(DISTINCT customer_id) as customers
FROM ( subquery_above )
GROUP BY cohort_year;
```

# Idempotency & Backfill
- Summing orders is inherently idempotent. Running the aggregation twice on the same data yields identical results.
- If orders data updates (e.g., late refunds or cancellations might adjust order_amount), the next run will reflect that because it's a SUM – ideally handle refunds as negative amounts so LTV can decrease if a customer refunded (non-monotonic LTV in such case, which is acceptable).
- Censoring: Recognize that some customers are still active. LTV for them is "so far". This pattern's output should ideally mark that or at least caution in documentation.
- Backfill: If using this to monitor LTV over time (say compute every month for new customers), you might snapshot the results periodically. But the query itself can be run historically by filtering first_order_date to a range.

# Tests
- Sum check: The sum of all customers' total_value should equal the sum of order_amount in the whole table (if margin not applied). If margin applied, then sum of total_value = margin_percent * sum(order_amount) globally.
- No negative LTV: Unless refunds make negative, normally all totals should be >= 0. Flag any negative total_value (could indicate an error or a customer who only refunded and never purchased).
- Censoring logic: If labeling active vs churned:
  - Define churn criterion (like no orders in last 1 year).
  - Test that any customer labeled churned indeed has last_order_date older than 1 year, and any labeled active has a purchase within year.
- Averages vs raw: If computing average LTV, ensure it matches the raw data division. E.g., total revenue / number of customers = average LTV across all customers (weighted by customers).
- Margin application: If margin_percent given, verify one sample manually: e.g., if a customer spent $100 and margin_percent 0.3, total_value = 30.0 for that customer.
- Correct grouping: Ensure each customer_id appears exactly once in output (primary key test on customer_id of result).

# Success Criteria
- Complete view per customer: We have a reliable total spend (and profit) for each customer.
- Business interpretation: This can feed into identifying top customers (highest LTV) and overall average LTV.
- For example, if we find average LTV is $500, marketing can use that to determine customer acquisition cost limits.
- Handles edge cases: Customers with a single order, customers with many orders, customers with refunds – all properly reflected.
- Censored awareness: The output or documentation should note that customers with recent activity may have more lifetime value to come. This sets expectation that true LTV might be higher than observed for those still active.
- If needed, one could incorporate a simple churn assumption: e.g., if 20% annual churn, expected additional value = current value * (some factor). But that's outside scope here, would be documented if needed.
- Up-to-date: By re-running periodically, it always reflects latest data (idempotent and refreshable).

# Example
If margin_percent is not provided, we compute raw revenue LTV. E.g., for customer 123: 
- 5 orders totaling $1000 from Jan 2020 to Jun 2021. 
- Output: customer_id=123, order_count=5, total_value=1000, first_order_date=2020-01-10, last_order_date=2021-06-05. 
If margin_percent=0.3, total_value would be $300 (assuming margin on revenue). 

We might prompt:
/choose-pattern name=customer-ltv
orders_table="sales.orders" customer_id="customer_id" order_date="order_date"
order_amount="total_price" margin_percent=0.3

Copilot produces a SQL that aggregates total_price per customer *0.3, effectively giving lifetime gross profit per customer. It might also give a small note: "Customers with recent last_order_date might still increase in value; consider them active."


## Requirements
- Follow data engineering best practices
- Include comprehensive error handling
- Optimize for performance and scalability
- Use appropriate tools and frameworks
- Ensure code is production-ready