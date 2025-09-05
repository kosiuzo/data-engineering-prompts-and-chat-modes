---
name: "dbt Conventions and Best Practices"
globs: ["models/**/*.sql", "models/**/*.yml", "macros/**/*.sql", "tests/**/*.sql"]
rules:
  - "Use snake_case for all model, column, and variable names."
  - "Include proper model documentation in schema.yml files with descriptions and tests."
  - "Use materialized views or tables for frequently accessed models, views for lightweight transformations."
  - "Implement incremental models for large tables with proper unique_key and is_incremental logic."
  - "Use ref() function for all model references, never hardcode table names."
  - "Include data quality tests (unique, not_null, relationships) for all critical models."
  - "Use source() function for raw data references and define sources in schema.yml."
  - "Implement proper model dependencies and avoid circular references."
  - "Use macros for reusable SQL logic and avoid code duplication."
  - "Include proper model configuration (materialized, indexes, etc.) in model files or dbt_project.yml."
autofix_hints: true
---

These instructions ensure dbt models follow best practices for maintainability, performance, and data quality. They help enforce consistent naming conventions, proper documentation, and robust testing strategies.
