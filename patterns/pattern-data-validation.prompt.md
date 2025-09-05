---
description: "Create comprehensive data validation framework with automated tests, monitoring, and alerting."
mode: "agent"
model: "GPT-4o"
tools: ["codebase"]
---

# Data Validation Framework

Create comprehensive data validation framework with automated tests, monitoring, and alerting.

# Problem
Data validation ensures data quality and integrity throughout the data pipeline. This pattern creates a comprehensive framework for automated data validation, monitoring, and alerting to catch issues early and maintain data quality standards.

Key challenges:
- **Rule definition**: Creating meaningful and testable validation rules
- **Performance**: Validating large datasets efficiently
- **Alerting**: Providing timely notifications for data quality issues
- **Maintenance**: Keeping validation rules up-to-date with changing requirements
- **Coverage**: Ensuring comprehensive validation across all critical data

# Data Requirements
- **Target table**: `${input:target_table }` to validate
- `${input:validation_rules }`: list of validation rules to apply
- `${input:alert_thresholds }`: thresholds for triggering alerts
- `${input:validation_frequency }`: how often to run validations
- Data quality standards and business rules

# Steps
1. **Rule Definition**:
- Define data quality rules and constraints
- Create business logic validation rules
- Set up referential integrity checks
- Define data freshness requirements

2. **Validation Implementation**:
- Create SQL queries for each validation rule
- Implement automated test execution
- Set up validation result storage
- Create validation reporting

3. **Monitoring Setup**:
- Configure validation scheduling
- Set up alerting thresholds
- Create monitoring dashboards
- Implement escalation procedures

4. **Alerting & Notification**:
- Define alert conditions and thresholds
- Set up notification channels
- Create alert templates
- Implement escalation workflows

5. **Maintenance & Updates**:
- Regular review of validation rules
- Update rules based on business changes
- Monitor validation performance
- Continuous improvement of coverage

# SQL / ETL Skeleton
```sql
-- Data Quality Validation Rules
WITH validation_results AS (
SELECT 
'completeness' as rule_type,
'not_null_check' as rule_name,
COUNT(*) as total_rows,
COUNT(${input:validation_rules[0] }) as non_null_rows,
ROUND(COUNT(${input:validation_rules[0] }) * 100.0 / COUNT(*), 2) as compliance_rate
FROM ${input:target_table }
UNION ALL
SELECT 
'uniqueness' as rule_type,
'primary_key_check' as rule_name,
COUNT(*) as total_rows,
COUNT(DISTINCT ${input:validation_rules[1] }) as unique_rows,
ROUND(COUNT(DISTINCT ${input:validation_rules[1] }) * 100.0 / COUNT(*), 2) as compliance_rate
FROM ${input:target_table }
UNION ALL
SELECT 
'consistency' as rule_type,
'range_check' as rule_name,
COUNT(*) as total_rows,
COUNT(CASE WHEN ${input:validation_rules[2] } BETWEEN 0 AND 100 THEN 1 END) as valid_rows,
ROUND(COUNT(CASE WHEN ${input:validation_rules[2] } BETWEEN 0 AND 100 THEN 1 END) * 100.0 / COUNT(*), 2) as compliance_rate
FROM ${input:target_table }
),
-- Alert Generation
alerts AS (
SELECT 
rule_type,
rule_name,
compliance_rate,
CASE 
  WHEN compliance_rate < ${input:alert_thresholds|default(95) } THEN 'ALERT'
  WHEN compliance_rate < ${input:alert_thresholds|default(95) } + 5 THEN 'WARNING'
  ELSE 'PASS'
END as alert_level
FROM validation_results
)
SELECT 
rule_type,
rule_name,
compliance_rate,
alert_level,
CURRENT_TIMESTAMP as validation_time
FROM alerts
WHERE alert_level IN ('ALERT', 'WARNING');

-- Data Freshness Check
WITH freshness_check AS (
SELECT 
MAX(${input:validation_rules[3] }) as last_update,
CURRENT_TIMESTAMP as current_time,
DATEDIFF(HOUR, MAX(${input:validation_rules[3] }), CURRENT_TIMESTAMP) as hours_since_update
FROM ${input:target_table }
)
SELECT 
last_update,
current_time,
hours_since_update,
CASE 
  WHEN hours_since_update > ${input:alert_thresholds|default(24) } THEN 'STALE_DATA_ALERT'
  ELSE 'FRESH'
END as freshness_status
FROM freshness_check;

-- Referential Integrity Check
WITH referential_check AS (
SELECT 
COUNT(*) as total_rows,
COUNT(CASE WHEN fk_column IN (SELECT pk_column FROM reference_table) THEN 1 END) as valid_fk_rows
FROM ${input:target_table }
)
SELECT 
total_rows,
valid_fk_rows,
ROUND(valid_fk_rows * 100.0 / total_rows, 2) as referential_integrity_rate
FROM referential_check;
```

# Idempotency & Backfills
- Validation rules are deterministic and can be re-run
- Historical validation results can be preserved
- Validation can be run on historical data for analysis
- Rules can be updated without affecting past results

# Tests
- Rule accuracy: Verify validation rules work correctly
- Performance: Ensure validations run within acceptable time
- Alert reliability: Test alert generation and delivery
- Coverage: Validate that all critical data is covered
- Maintenance: Test rule updates and modifications

# Success Criteria
- Comprehensive data quality coverage
- Reliable and timely alerting
- Clear validation reporting
- Maintainable validation framework
- Measurable improvement in data quality

# Example
User Input:
/choose-pattern name=data-validation
target_table="analytics.user_events"
validation_rules=["user_id", "event_id", "event_value", "created_at"]
alert_thresholds=95
validation_frequency="daily"

Copilot would generate:
- SQL queries for comprehensive data validation
- Alert generation and notification logic
- Data freshness monitoring
- Referential integrity checks
- Validation reporting and dashboard queries


## Requirements
- Follow data engineering best practices
- Include comprehensive error handling
- Optimize for performance and scalability
- Use appropriate tools and frameworks
- Ensure code is production-ready