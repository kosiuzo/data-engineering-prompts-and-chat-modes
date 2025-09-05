---
description: "Design and analyze A/B tests with proper statistical rigor, including CUPED and guardrail metrics."
mode: "agent"
model: "GPT-4o"
tools: ["codebase"]
---

# A/B Testing Analysis

Design and analyze A/B tests with proper statistical rigor, including CUPED and guardrail metrics.

# Problem
A/B testing is a method of comparing two versions of a product or feature to determine which performs better. This pattern helps design experiments and analyze results with proper statistical rigor, including variance reduction techniques like CUPED and guardrail metrics to catch unintended side effects.

Key challenges:
- **Sample Ratio Mismatch (SRM)**: Traffic split deviates from intended (e.g., 50/50 becomes 48/52).
- **Statistical power**: Ensuring sufficient sample size to detect meaningful differences.
- **Multiple testing**: Running many tests increases false positive rates.
- **Variance reduction**: Using pre-experiment data to reduce noise and improve sensitivity.
- **Guardrail metrics**: Monitoring for unintended negative impacts on other metrics.

# Data Requirements
- **Experiment table**: `${input:experiment_table }` with:
- `${input:user_id }`: unique user identifier
- `${input:variant }`: experiment variant (e.g., "control", "treatment")
- `${input:primary_metric }`: main metric to optimize (e.g., conversion rate, revenue)
- `${input:guardrail_metrics }`: additional metrics to monitor (e.g., page load time, engagement)
- `${input:pre_experiment_data }`: historical data for CUPED (if available)

# Steps
1. **Experiment Design**:
- Define hypothesis and success criteria
- Calculate required sample size for statistical power
- Set up proper randomization and bucketing
- Define guardrail metrics and thresholds

2. **Data Quality Checks**:
- Verify random assignment (no systematic bias)
- Check for data leakage between variants
- Validate sample ratio (SRM check)
- Ensure data completeness

3. **Statistical Analysis**:
- Calculate primary metric differences
- Apply CUPED for variance reduction (if pre-experiment data available)
- Perform statistical significance tests
- Calculate confidence intervals

4. **Guardrail Analysis**:
- Check guardrail metrics for negative impacts
- Identify any unintended side effects
- Validate experiment integrity

5. **Results Interpretation**:
- Present findings with proper context
- Highlight statistical significance and practical significance
- Provide recommendations for next steps

# SQL / ETL Skeleton
```sql
-- Sample Ratio Mismatch Check
WITH variant_counts AS (
SELECT 
${input:variant },
COUNT(*) as user_count
FROM ${input:experiment_table }
GROUP BY ${input:variant }
),
total_users AS (
SELECT SUM(user_count) as total
FROM variant_counts
)
SELECT 
${input:variant },
user_count,
ROUND(user_count * 100.0 / total, 2) as percentage
FROM variant_counts, total_users;

-- Primary Metric Analysis
WITH experiment_metrics AS (
SELECT 
${input:variant },
COUNT(DISTINCT ${input:user_id }) as users,
SUM(${input:primary_metric }) as total_metric,
AVG(${input:primary_metric }) as avg_metric,
STDDEV(${input:primary_metric }) as std_metric
FROM ${input:experiment_table }
GROUP BY ${input:variant }
)
SELECT 
${input:variant },
users,
avg_metric,
std_metric,
-- Calculate confidence intervals and statistical tests
FROM experiment_metrics;

-- CUPED Analysis (if pre-experiment data available)
WITH cuped_data AS (
SELECT 
e.${input:user_id },
e.${input:variant },
e.${input:primary_metric },
p.pre_experiment_metric
FROM ${input:experiment_table } e
LEFT JOIN ${input:pre_experiment_data } p ON e.${input:user_id } = p.${input:user_id }
)
SELECT 
${input:variant },
-- CUPED calculations here
FROM cuped_data
GROUP BY ${input:variant };
```

# Idempotency & Backfills
- Experiment data is typically immutable once collected
- Analysis can be re-run multiple times with same results
- Historical data can be re-analyzed with different methodologies
- CUPED requires pre-experiment data to be stable

# Tests
- Sample ratio validation: Check that variant distribution matches intended split
- Statistical significance: Verify p-values and confidence intervals
- Guardrail monitoring: Ensure no negative impacts on critical metrics
- Data integrity: Validate no data leakage or contamination
- Power analysis: Confirm sufficient sample size for detection

# Success Criteria
- Clean experiment design with proper randomization
- Statistically significant results with practical significance
- No negative impacts on guardrail metrics
- Proper variance reduction techniques applied
- Clear, actionable recommendations for stakeholders

# Example
User Input:
/choose-pattern name=ab-testing
experiment_table="experiments.checkout_flow"
user_id="user_id"
variant="variant"
primary_metric="conversion_rate"
guardrail_metrics=["page_load_time", "bounce_rate"]
pre_experiment_data="user_metrics.historical"

Copilot would generate:
- SQL queries for SRM checks and statistical analysis
- CUPED implementation for variance reduction
- Guardrail monitoring queries
- Statistical significance tests
- Results interpretation and recommendations


## Requirements
- Follow data engineering best practices
- Include comprehensive error handling
- Optimize for performance and scalability
- Use appropriate tools and frameworks
- Ensure code is production-ready