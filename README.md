# Awesome Copilot – Data Engineering Edition

**Awesome Copilot: Data Engineering Edition** is a ready-to-use collection of custom Prompts, Chat Modes, Instructions, and Analytics Pattern blueprints for GitHub Copilot. It supercharges Copilot to assist with data engineering tasks: designing pipelines, modeling data, writing SQL, debugging ETL, ensuring data quality, and more.

## What's Inside?

- **Prompts** – Focused, task-specific prompts for common data engineering scenarios (see `/prompts/de`). Use via Copilot Chat slash-commands (e.g. `/de-generate-dbt-model`).

- **Instructions** – Project-wide coding standards and best practices for data engineering (see `/instructions/de`). These apply automatically based on file patterns to enforce consistency (e.g. SQL style rules, pipeline code guidelines).

- **Chat Modes** – AI personas tailored to data engineering roles (see `/chatmodes/de`). Activate these in VS Code Copilot Chat for specialized assistance (e.g. an *Analytics Architect* persona for designing analytic tables).

- **Analytics Patterns** – A library of blueprint prompts for common analytics design patterns (see `/patterns`). Each pattern prompt helps you generate canonical tables and pipelines for things like funnel analysis, cohort retention, sessionization, SCD history, etc., complete with SQL skeletons and testing guidance.

## Install & Usage

1. **Install Custom Files**: Copy the `.prompt.md`, `.chatmode.md`, and `.instructions.md` files into your project's `.github/` folder under `prompts/`, `chatmodes/`, and `instructions/` respectively. Alternatively, use the **Awesome Copilot VS Code extension** or MCP server to browse and install these assets.

2. **Enable Prompt Files**: In VS Code, enable the `chat.promptFiles` setting to use prompt files.

3. **Restart VS Code** (or reload Copilot) to pick up the new configurations.

4. **Use Prompts**: In Copilot Chat, type `/` followed by the prompt file name (e.g. `/spark-etl-builder`) to execute a prompt. You can also pass input variables like `/spark-etl-builder source_format=parquet target_format=delta`.

5. **Use Chat Modes**: Open Copilot Chat, click the mode dropdown and select a custom mode (e.g. "Analytics Patterns Architect"). Copilot will respond with that persona's style and restrictions.

6. **Instructions**: Simply start coding – instructions apply automatically when editing matching files. For example, when working on `models/my_model.sql`, the "Analytics Patterns SQL & Modeling Guide" instructions will provide style guidance and even light autofixes.

## Quickstart Example

- *Prompt File:* In Copilot Chat, type `/spark-etl-builder source_format=parquet target_format=delta transformations="filter,aggregate,join"` to generate a complete Apache Spark ETL pipeline with the specified parameters.

- *Chat Mode:* Open Copilot Chat, select **Analytics Patterns Architect** mode, then ask "Help me design a funnel analysis for our e-commerce data" to get specialized assistance with analytics patterns.

- *Custom Instruction:* Create a new dbt model file `models/orders.sql`. As you write, the **Analytics Patterns SQL & Modeling Guide** enforces best practices (e.g. ensuring you declare primary keys, using incremental logic, etc.), thanks to automatic instructions.

## Notes on Models & Context

These customizations are optimized for **GitHub Copilot X (Chat)** with a GPT-4 or later model. The prompts and personas encourage deterministic, idempotent solutions to typical data engineering problems. Where relevant, they cite the Data Engineering Handbook and industry references to justify best practices (e.g. emphasizing SCD Type 2 for preserving history, or using median-based anomaly detection to resist outliers).

## Contents

- **Prompts Catalog** – [List of prompts](#prompts-catalog) with descriptions.
- **Chat Modes** – [Persona descriptions](#chat-modes).
- **Instructions** – [Enforced guidelines](#instructions).
- **Analytics Patterns** – [Available patterns](#analytics-patterns).

*(See `CATALOG.json` for a structured index of all assets.)*

---

## Prompts Catalog

### Environment & Setup
- `env-setup.prompt.md` – Environment Setup Helper
- `docker-compose.prompt.md` – Docker Compose for Data Services
- `airflow-setup.prompt.md` – Apache Airflow Environment Setup

### Data Modeling
- `star-schema-designer.prompt.md` – Dimensional Modeling Advisor
- `data-vault-builder.prompt.md` – Data Vault 2.0 Pattern Builder
- `scd2-implementation.prompt.md` – Slowly Changing Dimension Type 2
- `normalization-guide.prompt.md` – Database Normalization Assistant

### ETL & Pipelines
- `airflow-dag-generator.prompt.md` – Airflow DAG Generator
- `dbt-model-generator.prompt.md` – dbt Model Generator
- `spark-etl-builder.prompt.md` – Apache Spark ETL Pipeline
- `kafka-stream-processor.prompt.md` – Kafka Stream Processing
- `data-pipeline-tester.prompt.md` – Pipeline Testing Framework

### Data Quality
- `data-quality-checks.prompt.md` – Data Quality Validation
- `anomaly-detection.prompt.md` – Anomaly Detection Setup
- `data-lineage-tracker.prompt.md` – Data Lineage Documentation
- `schema-evolution.prompt.md` – Schema Evolution Handler

### Performance & Optimization
- `query-optimizer.prompt.md` – SQL Query Optimizer
- `snowflake-optimizer.prompt.md` – Snowflake Performance Tuning
- `bigquery-optimizer.prompt.md` – BigQuery Cost Optimization
- `partitioning-strategy.prompt.md` – Table Partitioning Advisor

### Security & Governance
- `data-classification.prompt.md` – Data Classification Helper
- `pii-detection.prompt.md` – PII Detection and Masking
- `access-control.prompt.md` – Access Control Design
- `compliance-checker.prompt.md` – Compliance Validation

### Monitoring & Alerting
- `pipeline-monitoring.prompt.md` – Pipeline Health Monitoring
- `data-freshness.prompt.md` – Data Freshness Tracking
- `cost-monitoring.prompt.md` – Cloud Cost Monitoring
- `sla-tracker.prompt.md` – SLA Monitoring Setup

## Chat Modes

### Analytics & Patterns
- `analytics-architect.chatmode.md` – Analytics Patterns Architect
- `experimentation-steward.chatmode.md` – Experimentation Data Steward
- `cohort-retention-coach.chatmode.md` – Cohort & Retention Coach
- `attribution-planner.chatmode.md` – Attribution Model Planner

### Data Engineering Specialists
- `batch-pipeline-orchestrator.chatmode.md` – Batch Pipeline Orchestrator
- `streaming-data-specialist.chatmode.md` – Streaming Data Specialist
- `data-quality-sentinel.chatmode.md` – Data Quality Sentinel
- `warehouse-optimizer.chatmode.md` – Warehouse Optimizer

### Infrastructure & Operations
- `infrastructure-engineer.chatmode.md` – Infrastructure Engineer
- `devops-data-engineer.chatmode.md` – DevOps Data Engineer

## Instructions

### SQL & Modeling
- `de-analytics-patterns.instructions.md` – Analytics Patterns SQL & Modeling Guide
- `de-sql-style.instructions.md` – SQL Style Guide for DE
- `de-dbt-conventions.instructions.md` – dbt Conventions and Best Practices

### Orchestration & Scheduling
- `de-orchestration.instructions.md` – Orchestration & Scheduling Guide
- `de-airflow-standards.instructions.md` – Airflow Coding Standards

### Data Quality & Testing
- `de-data-quality.instructions.md` – Data Quality Testing Standards
- `de-testing-framework.instructions.md` – Testing Framework Guidelines

### Security & Compliance
- `de-security.instructions.md` – Data Security Best Practices
- `de-privacy.instructions.md` – Privacy and PII Handling

## Analytics Patterns

### Core Analytics Patterns
- `pattern-funnel-analysis.prompt.md` – Funnel Analysis Builder
- `pattern-cohort-analysis.prompt.md` – Cohort Analysis Generator
- `pattern-sessionization.prompt.md` – Sessionization (User Session Identification)
- `pattern-cumulative-table.prompt.md` – Cumulative Fact Table (Daily Accrual)
- `pattern-scd2-idempotent.prompt.md` – Idempotent SCD Type 2 History

### Retention & Value Metrics
- `pattern-retention-churn.prompt.md` – Retention & Churn Metrics
- `pattern-customer-ltv.prompt.md` – Customer Lifetime Value (LTV) Estimator
- `pattern-attribution.prompt.md` – Marketing Attribution Model

### Advanced Analytics
- `pattern-ab-testing.prompt.md` – A/B Testing Analysis
- `pattern-time-series.prompt.md` – Time Series Analysis
- `pattern-segmentation.prompt.md` – Customer Segmentation
- `pattern-recommendation.prompt.md` – Recommendation System Data Prep

### Data Quality Patterns
- `pattern-data-validation.prompt.md` – Data Validation Framework
- `pattern-anomaly-detection.prompt.md` – Anomaly Detection Pattern
- `pattern-data-lineage.prompt.md` – Data Lineage Tracking

## Contributing

This repository follows the conventions of the Awesome Copilot community. Contributions are welcome! Please ensure:

1. All files follow the established naming conventions
2. Front-matter metadata is complete and consistent
3. Content is grounded in data engineering best practices
4. Examples are practical and well-documented

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## References

- [Data Engineer's Handbook](https://www.dataengineeringhandbook.com/)
- [Awesome Copilot](https://github.com/github/awesome-copilot)
- [Awesome Copilot Chat Modes](https://github.com/dfinke/awesome-copilot-chatmodes)
