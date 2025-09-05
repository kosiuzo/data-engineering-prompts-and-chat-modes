---
name: "SQL Style Guide for DE"
globs: ["**/*.sql"]
rules:
  - "Use uppercase for SQL keywords (SELECT, WHERE, JOIN)."
  - "Avoid `SELECT *` in production queries; explicitly select columns."
  - "Alias tables for readability, and qualify columns with table alias if joining multiple tables."
  - "Use window functions instead of self-joins for running totals where appropriate (performance)."
  - "Terminate statements with semicolons in scripts."
  - "Use meaningful column aliases and avoid abbreviations unless they're standard."
  - "Format complex queries with proper indentation and line breaks."
  - "Include comments for complex business logic or non-obvious calculations."
  - "Use CTEs (WITH clauses) for complex queries to improve readability."
  - "Prefer explicit JOIN syntax over comma-separated table lists."
autofix_hints: true
---

This is a general SQL style guide that would apply to all SQL files. It helps maintain a consistent style and encourages best practices (no SELECT *, proper formatting, etc.).
