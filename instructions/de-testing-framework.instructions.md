---
name: "Testing Framework Guidelines"
globs: ["tests/**/*.py", "tests/**/*.sql", "**/*test*.py", "**/*test*.sql"]
rules:
  - "Write unit tests for all data transformation functions and business logic."
  - "Include integration tests for end-to-end data pipeline workflows."
  - "Use fixtures and test data factories for consistent test data setup."
  - "Implement proper test isolation to avoid test interdependencies."
  - "Include performance tests for critical data processing operations."
  - "Use appropriate test frameworks (pytest, unittest) for Python code."
  - "Implement data quality tests using dbt or similar tools for SQL transformations."
  - "Include regression tests to prevent breaking changes in data outputs."
  - "Use mocking for external dependencies and services in tests."
  - "Document test coverage requirements and maintain high coverage percentages."
autofix_hints: true
---

These instructions ensure comprehensive testing practices across data engineering projects, improving code quality and reducing the risk of data issues in production.
