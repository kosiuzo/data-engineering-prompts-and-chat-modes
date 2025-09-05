---
description: "Create a basic Airflow DAG Python code with given tasks and dependencies."
mode: "agent"
model: "GPT-4o"
tools: ["codebase"]
---

# Airflow DAG Generator

Create a basic Airflow DAG Python code with given tasks and dependencies.

**Goal**: Define an Airflow DAG called `${input:dag_name }` with tasks: ${input:tasks }.

**Instructions**:
- Use standard DAG declarations (`with DAG(...) as dag:`).
- Create one task per name in `tasks` (use BashOperator or PythonOperator for demo).
- If a task name contains `>>` or `->`, interpret it as dependency (e.g. `"extract >> transform"` means transform depends on extract).

**Output**: Provide a complete Python code for the DAG, respecting Airflow best practices (no hard-coded dates outside default_args, use `@daily` schedule, etc.), and show the dependency setup.


## Requirements
- Follow data engineering best practices
- Include comprehensive error handling
- Optimize for performance and scalability
- Use appropriate tools and frameworks
- Ensure code is production-ready