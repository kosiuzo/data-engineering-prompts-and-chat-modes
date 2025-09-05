---
description: "Create comprehensive data quality checks and validation rules for datasets."
mode: "agent"
model: "GPT-4o"
tools: ["codebase"]
---

# Data Quality Validation

Create comprehensive data quality checks and validation rules for datasets.

**Context**: Setting up data quality validation for table `${input:table_name }` with primary key `${input:primary_key }`.

**Task**: Create a comprehensive data quality testing suite including:

1. **Completeness Tests**:
   - Check for null values in critical columns: ${input:critical_columns }
   - Verify required fields are populated

2. **Uniqueness Tests**:
   - Ensure primary key uniqueness
   - Check for duplicate records

3. **Consistency Tests**:
   - Data type validation
   - Format validation (dates, emails, etc.)
   - Referential integrity checks

4. **Business Rule Validation**:
   ${input:business_rules }
   - Custom business rules: ${input:business_rules }
   

5. **Freshness Tests**:
   - Data recency checks
   - Pipeline completion validation

**Output**: Provide dbt test configurations, SQL validation queries, and monitoring setup recommendations.


## Requirements
- Follow data engineering best practices
- Include comprehensive error handling
- Optimize for performance and scalability
- Use appropriate tools and frameworks
- Ensure code is production-ready