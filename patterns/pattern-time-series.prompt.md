---
description: "Analyze time series data for trends, seasonality, and forecasting with proper statistical methods."
mode: "agent"
model: "GPT-4o"
tools: ["codebase"]
---

# Time Series Analysis

Analyze time series data for trends, seasonality, and forecasting with proper statistical methods.

# Problem
Time series analysis involves analyzing data points collected over time to identify patterns, trends, and make forecasts. This pattern helps with trend analysis, seasonality detection, anomaly identification, and forecasting future values.

Key challenges:
- **Trend identification**: Distinguishing between real trends and random fluctuations
- **Seasonality**: Detecting and modeling recurring patterns
- **Stationarity**: Ensuring data is stationary for proper analysis
- **Missing data**: Handling gaps in time series
- **Forecasting accuracy**: Providing reliable predictions with confidence intervals

# Data Requirements
- **Time series table**: `${input:time_series_table }` with:
- `${input:time_column }`: timestamp or date column
- `${input:value_column }`: metric value to analyze
- `${input:group_columns }`: optional grouping columns (e.g., product, region)
- Data should be properly indexed by time
- No missing time periods (or handle gaps appropriately)

# Steps
1. **Data Preparation**:
- Ensure proper time indexing
- Handle missing values
- Check for outliers and anomalies
- Validate data quality

2. **Exploratory Analysis**:
- Plot time series to visualize trends
- Calculate basic statistics (mean, variance, etc.)
- Identify seasonality patterns
- Check for stationarity

3. **Trend Analysis**:
- Apply moving averages
- Calculate trend components
- Identify significant changes
- Measure trend strength

4. **Seasonality Detection**:
- Decompose time series into components
- Identify seasonal patterns
- Calculate seasonal indices
- Validate seasonality significance

5. **Forecasting**:
- Choose appropriate forecasting method
- Generate predictions with confidence intervals
- Validate forecast accuracy
- Provide uncertainty measures

# SQL / ETL Skeleton
```sql
-- Basic Time Series Statistics
WITH time_series_stats AS (
SELECT 
${input:time_column },
${input:value_column },
-- Calculate moving averages
AVG(${input:value_column }) OVER (
  ORDER BY ${input:time_column } 
  ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
) as moving_avg_7,
-- Calculate trend
LAG(${input:value_column }) OVER (ORDER BY ${input:time_column }) as prev_value,
${input:value_column } - LAG(${input:value_column }) OVER (ORDER BY ${input:time_column }) as value_change
FROM ${input:time_series_table }
ORDER BY ${input:time_column }
)
SELECT 
${input:time_column },
${input:value_column },
moving_avg_7,
value_change,
-- Calculate percentage change
ROUND((value_change * 100.0 / prev_value), 2) as pct_change
FROM time_series_stats;

-- Seasonality Analysis
WITH seasonal_decomposition AS (
SELECT 
${input:time_column },
${input:value_column },
-- Extract seasonal components
EXTRACT(MONTH FROM ${input:time_column }) as month,
EXTRACT(DAYOFWEEK FROM ${input:time_column }) as day_of_week,
-- Calculate seasonal averages
AVG(${input:value_column }) OVER (PARTITION BY EXTRACT(MONTH FROM ${input:time_column })) as monthly_avg,
AVG(${input:value_column }) OVER (PARTITION BY EXTRACT(DAYOFWEEK FROM ${input:time_column })) as daily_avg
FROM ${input:time_series_table }
)
SELECT 
month,
AVG(${input:value_column }) as avg_value,
STDDEV(${input:value_column }) as std_value
FROM seasonal_decomposition
GROUP BY month
ORDER BY month;

-- Anomaly Detection
WITH anomaly_detection AS (
SELECT 
${input:time_column },
${input:value_column },
AVG(${input:value_column }) OVER (ORDER BY ${input:time_column } ROWS BETWEEN 29 PRECEDING AND CURRENT ROW) as rolling_avg,
STDDEV(${input:value_column }) OVER (ORDER BY ${input:time_column } ROWS BETWEEN 29 PRECEDING AND CURRENT ROW) as rolling_std
FROM ${input:time_series_table }
)
SELECT 
${input:time_column },
${input:value_column },
rolling_avg,
rolling_std,
-- Flag anomalies (values > 2 standard deviations from mean)
CASE 
  WHEN ABS(${input:value_column } - rolling_avg) > 2 * rolling_std THEN 'ANOMALY'
  ELSE 'NORMAL'
END as anomaly_flag
FROM anomaly_detection;
```

# Idempotency & Backfills
- Time series analysis is deterministic given the same data
- Can be re-run with updated data to include new observations
- Historical analysis remains consistent
- Forecasting can be updated as new data becomes available

# Tests
- Data completeness: Verify no missing time periods
- Trend consistency: Check that trends are statistically significant
- Seasonality validation: Ensure seasonal patterns are meaningful
- Forecast accuracy: Validate predictions against actual values
- Anomaly detection: Verify flagged anomalies are genuine

# Success Criteria
- Clear identification of trends and seasonality
- Accurate forecasts with proper confidence intervals
- Effective anomaly detection
- Actionable insights for business decisions
- Proper handling of data quality issues

# Example
User Input:
/choose-pattern name=time-series
time_series_table="analytics.daily_metrics"
time_column="date"
value_column="revenue"
group_columns=["product_category"]
analysis_type="trend_and_seasonality"

Copilot would generate:
- SQL queries for trend analysis and seasonality detection
- Anomaly detection algorithms
- Forecasting models with confidence intervals
- Data quality validation queries
- Visualization recommendations for results


## Requirements
- Follow data engineering best practices
- Include comprehensive error handling
- Optimize for performance and scalability
- Use appropriate tools and frameworks
- Ensure code is production-ready