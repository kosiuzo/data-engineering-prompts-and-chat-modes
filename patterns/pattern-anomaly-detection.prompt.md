---
description: "Implement anomaly detection for time series data and metrics using statistical and machine learning methods."
mode: "agent"
model: "GPT-4o"
tools: ["codebase"]
---

# Anomaly Detection Pattern

Implement anomaly detection for time series data and metrics using statistical and machine learning methods.

# Problem
Anomaly detection identifies unusual patterns or outliers in data that may indicate problems, opportunities, or interesting events. This pattern implements various anomaly detection methods for time series data and metrics monitoring.

Key challenges:
- **False positives**: Minimizing alerts for normal variations
- **Sensitivity tuning**: Balancing detection sensitivity with noise
- **Seasonality**: Handling seasonal patterns and trends
- **Real-time detection**: Detecting anomalies as they occur
- **Context awareness**: Understanding what constitutes an anomaly

# Data Requirements
- **Time series table**: `${input:time_series_table }` with:
- `${input:time_column }`: timestamp or date column
- `${input:value_column }`: metric value to monitor
- `${input:group_columns }`: optional grouping columns (e.g., product, region)
- Historical data for training and baseline establishment
- Data should be clean and properly indexed

# Steps
1. **Data Preparation**:
- Clean and validate time series data
- Handle missing values and gaps
- Create rolling windows and features
- Normalize data if necessary

2. **Baseline Establishment**:
- Calculate historical statistics (mean, std, percentiles)
- Identify seasonal patterns and trends
- Create baseline models
- Set up reference periods

3. **Anomaly Detection**:
- Apply chosen detection method
- Calculate anomaly scores
- Set detection thresholds
- Flag potential anomalies

4. **Validation & Tuning**:
- Validate detected anomalies
- Tune sensitivity parameters
- Reduce false positives
- Optimize detection performance

5. **Alerting & Monitoring**:
- Set up anomaly alerts
- Create monitoring dashboards
- Implement escalation procedures
- Track detection performance

# SQL / ETL Skeleton
```sql
-- Statistical Anomaly Detection (Z-Score)
WITH time_series_stats AS (
SELECT 
${input:time_column },
${input:value_column },
-- Calculate rolling statistics
AVG(${input:value_column }) OVER (
  ORDER BY ${input:time_column } 
  ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
) as rolling_mean,
STDDEV(${input:value_column }) OVER (
  ORDER BY ${input:time_column } 
  ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
) as rolling_std
FROM ${input:time_series_table }
),
anomaly_detection AS (
SELECT 
${input:time_column },
${input:value_column },
rolling_mean,
rolling_std,
-- Calculate Z-score
(${input:value_column } - rolling_mean) / rolling_std as z_score,
-- Flag anomalies (Z-score > 2 or < -2)
CASE 
  WHEN ABS((${input:value_column } - rolling_mean) / rolling_std) > 2 THEN 'ANOMALY'
  ELSE 'NORMAL'
END as anomaly_flag
FROM time_series_stats
WHERE rolling_std > 0
)
SELECT 
${input:time_column },
${input:value_column },
z_score,
anomaly_flag
FROM anomaly_detection
WHERE anomaly_flag = 'ANOMALY';

-- Percentile-based Anomaly Detection
WITH percentile_stats AS (
SELECT 
${input:time_column },
${input:value_column },
-- Calculate rolling percentiles
PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY ${input:value_column }) OVER (
  ORDER BY ${input:time_column } 
  ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
) as rolling_q25,
PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY ${input:value_column }) OVER (
  ORDER BY ${input:time_column } 
  ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
) as rolling_q75
FROM ${input:time_series_table }
),
iqr_anomalies AS (
SELECT 
${input:time_column },
${input:value_column },
rolling_q25,
rolling_q75,
rolling_q75 - rolling_q25 as iqr,
-- Flag outliers using IQR method
CASE 
  WHEN ${input:value_column } < rolling_q25 - 1.5 * (rolling_q75 - rolling_q25) 
    OR ${input:value_column } > rolling_q75 + 1.5 * (rolling_q75 - rolling_q25) 
  THEN 'ANOMALY'
  ELSE 'NORMAL'
END as anomaly_flag
FROM percentile_stats
)
SELECT 
${input:time_column },
${input:value_column },
anomaly_flag
FROM iqr_anomalies
WHERE anomaly_flag = 'ANOMALY';

-- Seasonal Anomaly Detection
WITH seasonal_decomposition AS (
SELECT 
${input:time_column },
${input:value_column },
-- Extract seasonal components
EXTRACT(MONTH FROM ${input:time_column }) as month,
EXTRACT(DAYOFWEEK FROM ${input:time_column }) as day_of_week,
-- Calculate seasonal averages
AVG(${input:value_column }) OVER (PARTITION BY EXTRACT(MONTH FROM ${input:time_column })) as seasonal_avg,
STDDEV(${input:value_column }) OVER (PARTITION BY EXTRACT(MONTH FROM ${input:time_column })) as seasonal_std
FROM ${input:time_series_table }
),
seasonal_anomalies AS (
SELECT 
${input:time_column },
${input:value_column },
seasonal_avg,
seasonal_std,
-- Calculate seasonal Z-score
(${input:value_column } - seasonal_avg) / seasonal_std as seasonal_z_score,
CASE 
  WHEN ABS((${input:value_column } - seasonal_avg) / seasonal_std) > 2 THEN 'SEASONAL_ANOMALY'
  ELSE 'NORMAL'
END as anomaly_flag
FROM seasonal_decomposition
WHERE seasonal_std > 0
)
SELECT 
${input:time_column },
${input:value_column },
seasonal_z_score,
anomaly_flag
FROM seasonal_anomalies
WHERE anomaly_flag = 'SEASONAL_ANOMALY';
```

# Idempotency & Backfills
- Anomaly detection is deterministic given the same data and parameters
- Can be re-run with updated data to include new observations
- Historical anomalies can be preserved for analysis
- Detection parameters can be updated without affecting past results

# Tests
- Detection accuracy: Verify anomalies are correctly identified
- False positive rate: Ensure low rate of false alarms
- Sensitivity tuning: Test different sensitivity levels
- Performance: Validate detection runs within acceptable time
- Coverage: Ensure all critical metrics are monitored

# Success Criteria
- Accurate anomaly detection with low false positive rate
- Timely identification of significant events
- Clear anomaly reporting and alerting
- Maintainable detection framework
- Measurable improvement in incident response

# Example
User Input:
/choose-pattern name=anomaly-detection
time_series_table="analytics.daily_metrics"
time_column="date"
value_column="revenue"
detection_method="z_score"
sensitivity="medium"
group_columns=["product_category"]

Copilot would generate:
- SQL queries for statistical anomaly detection
- Seasonal anomaly detection logic
- Alert generation and notification setup
- Performance monitoring queries
- Anomaly validation and reporting


## Requirements
- Follow data engineering best practices
- Include comprehensive error handling
- Optimize for performance and scalability
- Use appropriate tools and frameworks
- Ensure code is production-ready