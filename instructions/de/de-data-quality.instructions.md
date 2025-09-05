---
name: "Data Quality Testing Standards"
globs: ["tests/**/*.sql", "models/**/*.yml", "**/*test*.sql"]
rules:
  - "Every critical table must have primary key uniqueness tests."
  - "Include not_null tests for all required columns."
  - "Add referential integrity tests for foreign key relationships."
  - "Implement custom business logic tests for domain-specific rules."
  - "Use dbt test severity levels appropriately (error, warn, info)."
  - "Include data freshness tests for time-sensitive data sources."
  - "Add data volume tests to detect unexpected drops or spikes."
  - "Implement data distribution tests for key metrics and dimensions."
  - "Use test tags to organize and run specific test suites."
  - "Document test purpose and expected behavior in test descriptions."
autofix_hints: true
---

These instructions ensure comprehensive data quality testing across all data models. They help maintain data integrity and catch issues early in the data pipeline.
