---
description: "Create customer segments based on behavior, demographics, or value using clustering and RFM analysis."
mode: "agent"
model: "GPT-4o"
tools: ["codebase"]
---

# Customer Segmentation

Create customer segments based on behavior, demographics, or value using clustering and RFM analysis.

# Problem
Customer segmentation divides customers into groups based on shared characteristics, behaviors, or value. This helps businesses tailor marketing, product development, and customer service to different customer needs. Common approaches include RFM analysis, behavioral clustering, and demographic segmentation.

Key challenges:
- **Feature selection**: Choosing relevant metrics for segmentation
- **Clustering algorithm**: Selecting appropriate method (K-means, hierarchical, etc.)
- **Segment stability**: Ensuring segments are meaningful and stable
- **Actionability**: Creating segments that drive business decisions
- **Validation**: Measuring segment quality and business impact

# Data Requirements
- **Customer table**: `${input:customer_table }` with:
- `${input:customer_id }`: unique customer identifier
- `${input:behavior_metrics }`: metrics for segmentation (e.g., recency, frequency, monetary value)
- Additional demographic or behavioral features
- Data should be clean and normalized
- Sufficient sample size for meaningful segments

# Steps
1. **Data Preparation**:
- Clean and normalize customer data
- Calculate behavior metrics (RFM, engagement, etc.)
- Handle missing values and outliers
- Scale features for clustering

2. **Feature Engineering**:
- Create derived metrics (e.g., customer lifetime value, engagement score)
- Calculate recency, frequency, monetary value (RFM)
- Add demographic features if available
- Create interaction features

3. **Segmentation**:
- Choose segmentation method (RFM, clustering, etc.)
- Determine optimal number of segments
- Apply segmentation algorithm
- Validate segment quality

4. **Segment Profiling**:
- Analyze segment characteristics
- Identify key differentiators
- Calculate segment metrics
- Create segment personas

5. **Validation & Action**:
- Validate segment stability
- Test segment business impact
- Create actionable insights
- Develop segment-specific strategies

# SQL / ETL Skeleton
```sql
-- RFM Analysis
WITH rfm_data AS (
SELECT 
${input:customer_id },
-- Recency: days since last purchase
DATEDIFF(CURRENT_DATE, MAX(order_date)) as recency,
-- Frequency: number of purchases
COUNT(*) as frequency,
-- Monetary: total spend
SUM(order_amount) as monetary
FROM ${input:customer_table }
GROUP BY ${input:customer_id }
),
rfm_scores AS (
SELECT 
${input:customer_id },
recency,
frequency,
monetary,
-- Calculate RFM scores (1-5 scale)
NTILE(5) OVER (ORDER BY recency DESC) as r_score,
NTILE(5) OVER (ORDER BY frequency) as f_score,
NTILE(5) OVER (ORDER BY monetary) as m_score
FROM rfm_data
),
rfm_segments AS (
SELECT 
${input:customer_id },
r_score,
f_score,
m_score,
-- Create RFM segments
CASE 
  WHEN r_score >= 4 AND f_score >= 4 AND m_score >= 4 THEN 'Champions'
  WHEN r_score >= 3 AND f_score >= 3 AND m_score >= 3 THEN 'Loyal Customers'
  WHEN r_score >= 4 AND f_score <= 2 AND m_score <= 2 THEN 'New Customers'
  WHEN r_score <= 2 AND f_score >= 3 AND m_score >= 3 THEN 'At Risk'
  WHEN r_score <= 2 AND f_score <= 2 AND m_score <= 2 THEN 'Lost'
  ELSE 'Other'
END as segment
FROM rfm_scores
)
SELECT 
segment,
COUNT(*) as customer_count,
AVG(recency) as avg_recency,
AVG(frequency) as avg_frequency,
AVG(monetary) as avg_monetary
FROM rfm_segments
GROUP BY segment
ORDER BY customer_count DESC;

-- Behavioral Clustering (simplified)
WITH customer_features AS (
SELECT 
${input:customer_id },
-- Calculate various behavior metrics
COUNT(*) as total_orders,
SUM(order_amount) as total_spent,
AVG(order_amount) as avg_order_value,
DATEDIFF(CURRENT_DATE, MAX(order_date)) as days_since_last_order,
DATEDIFF(MAX(order_date), MIN(order_date)) as customer_lifespan_days
FROM ${input:customer_table }
GROUP BY ${input:customer_id }
),
normalized_features AS (
SELECT 
${input:customer_id },
-- Normalize features for clustering
(total_orders - AVG(total_orders) OVER ()) / STDDEV(total_orders) OVER () as norm_orders,
(total_spent - AVG(total_spent) OVER ()) / STDDEV(total_spent) OVER () as norm_spent,
(avg_order_value - AVG(avg_order_value) OVER ()) / STDDEV(avg_order_value) OVER () as norm_avg_value
FROM customer_features
)
-- Note: Actual clustering would require more complex SQL or external tools
SELECT 
${input:customer_id },
norm_orders,
norm_spent,
norm_avg_value
FROM normalized_features;
```

# Idempotency & Backfills
- Segmentation can be re-run with updated data
- Historical segments can be preserved for analysis
- New customers can be assigned to existing segments
- Segment definitions can be updated over time

# Tests
- Segment stability: Verify segments don't change dramatically over time
- Segment size: Ensure segments are meaningful (not too small or large)
- Feature importance: Validate that features used are relevant
- Business validation: Confirm segments align with business understanding
- Predictive power: Test if segments predict future behavior

# Success Criteria
- Meaningful and actionable customer segments
- Clear segment characteristics and personas
- Stable segments that don't change frequently
- Business value from segment-specific strategies
- Measurable impact on key metrics

# Example
User Input:
/choose-pattern name=segmentation
customer_table="analytics.customer_orders"
customer_id="customer_id"
behavior_metrics=["order_frequency", "total_spent", "last_order_date"]
segmentation_method="rfm"
num_segments=5

Copilot would generate:
- SQL queries for RFM analysis and scoring
- Customer segmentation logic
- Segment profiling and characterization
- Validation queries for segment quality
- Recommendations for segment-specific strategies


## Requirements
- Follow data engineering best practices
- Include comprehensive error handling
- Optimize for performance and scalability
- Use appropriate tools and frameworks
- Ensure code is production-ready