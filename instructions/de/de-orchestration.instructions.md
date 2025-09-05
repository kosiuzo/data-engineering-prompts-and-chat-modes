---
name: "Orchestration Best Practices"
globs: ["dags/**/*.py", "pipelines/**/*.py"]
rules:
  - "Use descriptive DAG and task IDs (no generic 'task1', 'task2')."
  - "Do not hard-code credentials or secrets in code; use Airflow Connections or env variables."
  - "Set retries and timeout for all tasks (e.g., `retry=3`, `retry_delay=timedelta(minutes=5)`)."
  - "Include SLAs or alerts for critical DAGs (Airflow `sla` or on_failure_callback)."
  - "Ensure tasks have clear dependencies set via `XCom` or upstream lists, avoid implicit dependencies."
  - "Use idempotent operations that can be safely rerun without side effects."
  - "Include proper error handling and logging in all tasks."
  - "Document DAG purpose and any special requirements in docstrings."
  - "Use appropriate task types (PythonOperator, BashOperator, etc.) for the specific use case."
  - "Implement proper resource management and avoid resource conflicts between tasks."
autofix_hints: true
---

This ensures any Airflow DAG code adheres to basics: sensible naming, error handling, no plaintext secrets, etc. For instance, if a user writes a DAG without a retry policy, Copilot (seeing this instructions file) may suggest adding a default_args['retries'] to the DAG definition.
