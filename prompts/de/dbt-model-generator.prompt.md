---
description: "Generate a dbt model with proper configuration, tests, and documentation."
mode: "agent"
model: "GPT-4o"
tools: ["codebase"]
---

# dbt Model Generator

Generate a dbt model with proper configuration, tests, and documentation.

**Context**: Creating a dbt model called `${input:model_name }` that transforms data from `${input:source_table }`.

**Task**: Generate a complete dbt model including:
1. SQL transformation logic based on `${input:business_logic }`
2. Model configuration (materialization, indexes, etc.)
3. Schema.yml with tests and documentation
4. Appropriate model type: ${input:model_type|default("table") }

**Requirements**:
- Follow dbt best practices for naming and structure
- Include proper column documentation
- Add relevant data quality tests
- Use appropriate materialization strategy
- Include incremental logic if applicable

**Output**: Provide the complete model file, schema.yml, and any additional configuration needed.


## Requirements
- Follow data engineering best practices
- Include comprehensive error handling
- Optimize for performance and scalability
- Use appropriate tools and frameworks
- Ensure code is production-ready