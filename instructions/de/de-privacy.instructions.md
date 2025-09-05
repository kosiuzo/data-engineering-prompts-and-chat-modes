---
name: "Privacy and PII Handling"
globs: ["**/*.py", "**/*.sql", "**/*.yml", "**/*.yaml"]
rules:
  - "Identify and classify all PII data fields in data models and transformations."
  - "Implement data anonymization or pseudonymization for PII data when possible."
  - "Use data masking techniques for non-production environments."
  - "Implement proper consent management for data collection and processing."
  - "Follow GDPR, CCPA, and other privacy regulations in data handling."
  - "Include data retention policies and automatic data deletion mechanisms."
  - "Implement right to be forgotten functionality for user data."
  - "Use secure data sharing mechanisms and avoid unnecessary data exposure."
  - "Document data processing purposes and legal basis for data collection."
  - "Regularly audit data processing activities for privacy compliance."
autofix_hints: true
---

These instructions ensure privacy and PII handling best practices are followed, helping maintain compliance with privacy regulations and protecting user data.
