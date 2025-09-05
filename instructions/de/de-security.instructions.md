---
name: "Data Security Best Practices"
globs: ["**/*.py", "**/*.sql", "**/*.yml", "**/*.yaml"]
rules:
  - "Never hardcode passwords, API keys, or sensitive credentials in code."
  - "Use environment variables or secure secret management systems for credentials."
  - "Implement proper access controls and least privilege principles."
  - "Mask or encrypt PII data in logs and error messages."
  - "Use parameterized queries to prevent SQL injection attacks."
  - "Implement proper data classification and handling procedures."
  - "Include audit logging for data access and modifications."
  - "Use secure communication protocols (HTTPS, TLS) for data transfers."
  - "Implement proper data retention and deletion policies."
  - "Regularly review and update security configurations and access permissions."
autofix_hints: true
---

These instructions ensure data security best practices are followed throughout the data engineering codebase, protecting sensitive data and maintaining compliance with security standards.
