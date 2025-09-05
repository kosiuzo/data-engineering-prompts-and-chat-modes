---
description: "Implement PII detection, classification, and masking strategies for data privacy compliance."
mode: "agent"
model: "GPT-4o"
tools: ["codebase"]
---

# PII Detection and Masking

Implement PII detection, classification, and masking strategies for data privacy compliance.

**Context**: Implementing PII protection for data in ${input:data_source }.

**PII Types to detect**: ${input:pii_types }

**Task**: Create a comprehensive PII protection system:

1. **PII Detection**:
   - Pattern matching for ${input:pii_types }
   - Machine learning-based detection
   - False positive reduction

2. **Data Classification**:
   - Automatic PII classification
   - Sensitivity level assignment
   - Data lineage tracking

3. **Masking Strategies**:
   ${input:masking_strategy }
   - Strategy: ${input:masking_strategy }
   {% else %}
   - Tokenization
   - Encryption
   - Data anonymization
   - Format preserving encryption
   

4. **Compliance Framework**:
   ${input:compliance_standard }
   - Standard: ${input:compliance_standard }
   
   - GDPR/CCPA compliance
   - Data retention policies
   - Right to be forgotten

5. **Monitoring & Auditing**:
   - PII access logging
   - Compliance reporting
   - Data breach detection

**Output**: Complete PII protection pipeline with detection, masking, and compliance monitoring.


## Requirements
- Follow data engineering best practices
- Include comprehensive error handling
- Optimize for performance and scalability
- Use appropriate tools and frameworks
- Ensure code is production-ready