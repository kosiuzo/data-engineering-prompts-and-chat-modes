---
description: "Set up anomaly detection for time series data and metrics monitoring."
mode: "agent"
model: "GPT-4o"
tools: ["codebase"]
---

# Anomaly Detection Setup

Set up anomaly detection for time series data and metrics monitoring.

**Context**: Setting up anomaly detection for metrics in ${input:data_source }.

**Metrics to monitor**: ${input:metric_columns }

**Task**: Create an anomaly detection system including:

1. **Data Preparation**:
   - Time series data preprocessing
   - Feature engineering for anomaly detection
   - Data quality validation

2. **Detection Methods**:
   ${input:detection_method }
   - Method: ${input:detection_method }
   {% else %}
   - Statistical methods (Z-score, IQR)
   - Machine learning approaches (Isolation Forest, LSTM)
   - Time series decomposition
   

3. **Threshold Configuration**:
   - Sensitivity setting: ${input:sensitivity|default("medium") }
   - Dynamic threshold adjustment
   - False positive reduction

4. **Alerting System**:
   - Real-time anomaly alerts
   - Escalation procedures
   - Dashboard integration

5. **Model Monitoring**:
   - Model performance tracking
   - Drift detection
   - Retraining triggers

**Output**: Complete anomaly detection pipeline with configuration, monitoring, and alerting setup.


## Requirements
- Follow data engineering best practices
- Include comprehensive error handling
- Optimize for performance and scalability
- Use appropriate tools and frameworks
- Ensure code is production-ready