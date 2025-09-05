---
description: "Automate the setup of a local data engineering dev environment."
mode: "agent"
model: "GPT-4o"
tools: ["codebase"]
---

# Environment Setup Assistant

Automate the setup of a local data engineering dev environment.

You are setting up a new data engineering project called **${input:project_name }**.

**Task**: Provide step-by-step instructions and necessary configuration to bootstrap the environment:

1. Create a Python ${input:python_version|default("3.11") } virtual environment (using Conda or venv) and activate it.
2. Initialize a folder structure (e.g. `src/`, `data/`, etc.) following best practices.
3. Generate a `pyproject.toml` or `requirements.txt` with common data engineering libraries (e.g. pandas, pyarrow, dbt).
4. Include any setup for infrastructure (e.g. Dockerfile for services like Postgres, Airflow, etc.).

**Output**: Provide the commands and configuration files content. Explain each step briefly.


## Requirements
- Follow data engineering best practices
- Include comprehensive error handling
- Optimize for performance and scalability
- Use appropriate tools and frameworks
- Ensure code is production-ready