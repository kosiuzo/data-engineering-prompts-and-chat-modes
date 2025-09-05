---
description: "Produce a daily cumulative metrics table (rolling sum) with restatement-safe incremental logic."
mode: "agent"
model: "GPT-4o"
tools: ["codebase"]
---

# Cumulative Fact Table (Daily Accrual)

Produce a daily cumulative metrics table (rolling sum) with restatement-safe incremental logic.

# Problem
Sometimes we need a table that tracks a running total (cumulative sum) of a metric over time – for example, the cumulative number of signups or total revenue up to each day. This pattern yields a daily snapshot that is **monotonic** (never decreases) unless explicitly allowed (e.g., restatements).

Challenges:
- Handling **restatements**: if historical data changes (e.g., a late correction subtracts from a past total), the cumulative logic must reflect that.
- Performance: computing a running total over a long period can be expensive; incremental build helps by only processing recent days.
- Ensuring idempotency so that re-running doesn't double count.

# Data Requirements
- **Base fact table**: `${input:base_fact }` with at least:
- `${input:entity_key }` – the entity we accumulate over (e.g., `user_id` for user signups, or just a constant if aggregating overall).
- `${input:date_key }` – date of the event (usually without time part, or truncated to day).
- `${input:accrual_metric }` – the value to accumulate (e.g., `1` for count of signups, or an amount for revenue).
- The base fact should ideally have one row per entity per date (or you will sum them per date in step 1).
- If base data can update retroactively (late arriving facts), we need to account for that in incremental builds.

# Steps
1. **Aggregate base by date** – Start with daily totals from the base fact:
```sql
SELECT ${input:date_key } as d,
SUM(${input:accrual_metric }) as daily_value
FROM ${input:base_fact }
GROUP BY d;
```
(Include `${input:entity_key }` in grouping if you need per-entity cumulative results; otherwise for a global metric just date.)

2. **Join with previous cumulative** – To get running total, each day's cumulative = prior day's cumulative + current day's value. In SQL, use a window function:
```sql
SELECT
d,
SUM(daily_value)
OVER (ORDER BY d ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)
AS running_total
FROM daily;
```
This produces a monotonic running sum over days.

3. **Incremental load logic** – If building incrementally, do:
- Determine the **max date already computed** in the target cumulative table.
- Fetch base_fact records for dates >= (max_date - `${input:backfill_days|default(14) }`) to allow restating the last few days.
- Recompute cumulative from that window forward, and upsert (merge) into the cumulative table.
- This way, if there were any changes in the last N days, we recalc and correct them.

4. **Edge: non-monotonic cases** – If the metric can decrease (e.g., if a past entry is removed causing a drop in cumulative), highlight that in documentation. Normally cumulative counts are expected to only stay flat or increase; a decrease indicates a data restatement.

# SQL / ETL Skeleton
```sql
WITH daily AS (
SELECT
${input:date_key } AS d,
SUM(${input:accrual_metric }) AS daily_value
FROM ${input:base_fact }
GROUP BY d
),
cum AS (
SELECT
d,
SUM(daily_value) OVER (ORDER BY d
ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
) AS running_total
FROM daily
)
SELECT *
FROM cum
ORDER BY d;
```
(Above is a full recompute example. For incremental, you'd only query a window of base_fact and merge results.)

# Idempotency & Backfills
Ensure the cumulative table can be recomputed for any window: 
- Use a merge/upsert strategy (like SQL MERGE or delete+insert) when updating the cumulative table for recent days. This replaces old values with corrected ones rather than double counting. 
- Maintain a high watermark (max date processed). On each run, start from (max_date - backfill_days) to catch changes. 
- By keeping backfill_days (e.g., 14 days), if a correction arrives for a date two weeks ago, the next run will recalc from before that date and fix the running totals. 
- Idempotent: running the job twice on the same day should yield the same cumulative totals (no duplicates). This means avoid simply appending new data without considering existing.

# Tests
- Primary key test: The cumulative table should have one row per ${input:date_key } (or per entity-date if applicable). Test that (entity, date) is unique and not null.
- Monotonicity test: Ensure running_total is non-decreasing over time. A simple test: running_total on day N >= running_total on day N-1, for all N. (There could be legitimate decreases if data was removed; if so, flag those explicitly or allow exceptions with a separate "explanation" column).
- Reconciliation test: The final day's running_total should equal the sum of all daily_value up to that day (basic sum check).
- Freshness test: If using incremental loading, ensure the most recent date in cumulative equals the most recent date in base_fact (no gaps). If a gap is detected, it means the process may have failed or is late.

# Success Criteria
- Accuracy: The cumulative numbers correctly reflect the sum of all past daily values up to each date. If a late data change occurs, the next run should correct the affected dates.
- Performance: Incremental updates only recompute a small window (${input:backfill_days }), not the entire history, making daily runs efficient even as history grows.
- Monotonic (if expected): In normal operation, the running_total only grows (or stays same) day-over-day. Any decrease is intentional and documented (e.g., "On 2023-05-10 data was restated causing a drop").
- Self-documenting: The output table or accompanying metadata notes the cutoff date for backfill (e.g., "last 14 days are restated each run") so downstream users understand the data freshness and stability.

# Example
Suppose base_fact = sales_transactions, with date_key = transaction_date, and we want cumulative revenue: 
- Input: base_fact = "sales.transactions", entity_key not needed (we aggregate all sales), accrual_metric = "amount". 
- After running the pattern prompt, Copilot generates models/cumulative_sales.sql which sums daily revenue and uses a window to get total revenue to date. 
- If today is 2025-09-01, the table will have one row per date from the start to 2025-09-01, with the last row's running_total equal to total revenue all time. 
- Tests ensure the row count equals number of days of data, and that running_total never decreases.


## Requirements
- Follow data engineering best practices
- Include comprehensive error handling
- Optimize for performance and scalability
- Use appropriate tools and frameworks
- Ensure code is production-ready