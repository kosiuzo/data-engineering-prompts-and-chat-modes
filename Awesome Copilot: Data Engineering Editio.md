Awesome Copilot: Data Engineering Edition
This repository provides Data Engineering-focused customizations for GitHub Copilot, including
reusable Prompts, specialized Chat Modes, instructive Instructions, and a new library of Analytics
Patterns. It is structured and formatted following the conventions of the Awesome Copilot community
repos 1 2
, and the content is grounded in the Data Engineer’s Handbook corpus and industry best
practices.
Repository Overview
•
•
•
•
•
•
•
README.md – Introduction, installation and usage instructions for the custom Copilot assets, with
quickstart examples.
prompts/de/*.prompt.md – ~30 task-specific prompt files covering end-to-end data engineering
topics (development environment, data modeling, batch/stream processing, orchestration, quality,
governance, cost optimization, security, etc.).
chatmodes/de/*.chatmode.md – ~10 custom chat persona files (e.g. Analytics Architect,
Experimentation Steward, Data Quality Sentinel) that tailor Copilot Chat for specialized DE roles.
instructions/de/*.instructions.md – ~8 custom instruction files defining coding standards
and best practices for data engineering (SQL style, pipeline code, modeling patterns, etc.), auto-
applied based on file globs.
patterns/*.prompt.md – 15 Analytics Pattern prompt files (new library) capturing canonical
analytics table designs (funnels, cohorts, sessionization, SCD history, etc.) with problem definitions,
solution skeletons, and test criteria.
scripts/validate.js – Script to lint file naming and front-matter metadata for consistency.
CATALOG.json – Machine-readable index of all prompts, chat modes, instructions, and patterns
(with metadata like titles, inputs, expected outputs, and source references for each asset).
Below, we detail each major deliverable with representative examples and content excerpts.
README.md
# Awesome Copilot – Data Engineering Edition
**Awesome Copilot: Data Engineering Edition** is a ready-to-use collection of
custom Prompts, Chat Modes, Instructions, and Analytics Pattern blueprints for
GitHub Copilot. It supercharges Copilot to assist with data engineering tasks:
designing pipelines, modeling data, writing SQL, debugging ETL, ensuring data
quality, and more.
## What’s Inside?
- **Prompts** – Focused, task-specific prompts for common data engineering
1
scenarios (see `/prompts/de`). Use via Copilot Chat slash-commands (e.g. `/de-
generate-dbt-model`).
- **Instructions** – Project-wide coding standards and best practices for data
engineering (see `/instructions/de`). These apply automatically based on file
patterns to enforce consistency (e.g. SQL style rules, pipeline code
guidelines).
- **Chat Modes** – AI personas tailored to data engineering roles (see `/
chatmodes/de`). Activate these in VS Code Copilot Chat for specialized
assistance (e.g. an *Analytics Architect* persona for designing analytic
tables).
- **Analytics Patterns** – A library of blueprint prompts for common analytics
design patterns (see `/patterns`). Each pattern prompt helps you generate
canonical tables and pipelines for things like funnel analysis, cohort
retention, sessionization, SCD history, etc., complete with SQL skeletons and
testing guidance.
## Install & Usage
1. **Install Custom Files**: Copy the `.prompt.md`, `.chatmode.md`, and
`.instructions.md` files into your project’s `.github/` folder under `prompts/`,
`chatmodes/`, and `instructions/` respectively 3
. Alternatively, use the
**Awesome Copilot VS Code extension** or MCP server to browse and install these
4
assets .
2. **Restart VS Code** (or reload Copilot) to pick up the new configurations.
3. **Use Prompts**: In Copilot Chat, type `/` and the prompt name (e.g. `/de-
5
snowflake-query-optimizer`) to execute a prompt .
4. **Use Chat Modes**: Open Copilot Chat, click the mode dropdown and select a
custom mode (e.g. “Analytics Patterns Architect”) 6
. Copilot will respond with
that persona’s style and restrictions.
5. **Instructions**: Simply start coding – instructions apply automatically when
editing matching files. For example, when working on `models/my_model.sql`, the
“Analytics Patterns SQL & Modeling Guide” instructions will provide style
guidance and even light autofixes.
## Quickstart Example
- *Analytics Pattern Prompt:* Start Copilot Chat in **Analytics Patterns
Architect** mode. Run `/choose-pattern name=funnel` to load the Funnel Analysis
pattern, fill in inputs (event table, steps, etc.), then run `/generate-sql`.
Copilot will output a structured SQL model for a funnel conversion table, plus
recommended tests and documentation.
- *Custom Instruction:* Create a new dbt model file `models/orders.sql`. As you
write, the **Analytics Patterns SQL & Modeling Guide** enforces best practices
(e.g. ensuring you declare primary keys, using incremental logic, etc.), thanks
7
to automatic instructions .
## Notes on Models & Context
2
These customizations are optimized for **GitHub Copilot X (Chat)** with a GPT-4
or later model. The prompts and personas encourage deterministic, idempotent
solutions 8
to typical data engineering problems. Where relevant, they cite the
Data Engineering Handbook and industry references to justify best practices
(e.g. emphasizing SCD Type 2 for preserving history 9
, or using median-based
anomaly detection to resist outliers 10
).
## Contents
- **Prompts Catalog** – [List of prompts](#prompts-catalog) with descriptions.
- **Chat Modes** – [Persona descriptions](#chat-modes).
- **Instructions** – [Enforced guidelines](#instructions).
- **Analytics Patterns** – [Available patterns](#analytics-patterns).
*(See `CATALOG.json` for a structured index of all assets.)*
---
*(The sections below would list each prompt, chat mode, etc., similar to the
11
Awesome Copilot README tables .)*
Sample Prompts ( /prompts/de/)
Each prompt file is a Markdown file with YAML front-matter and prompt guidance. They cover diverse data
engineering tasks, from environment setup to performance tuning. Below are a few representative prompt
files:
1. env-setup.prompt.md – Environment Setup Helper
This prompt assists in setting up a local data engineering environment (e.g. creating Python virtualenvs,
installing packages, initializing project structure).
---
title: "Environment Setup Assistant"
intent: "Automate the setup of a local data engineering dev environment."
inputs:
- name: project_name
required: true
- name: python_version
required: false
assumptions: ["Conda or venv available", "Using pyproject or requirements.txt"]
source_refs: ["handbook:development:environment"]
---
You are setting up a new data engineering project called **{{ project_name }}**.
**Task**: Provide step-by-step instructions and necessary configuration to
3
bootstrap the environment:
1. Create a Python {{ python_version|default("3.11") }} virtual environment
(using Conda or venv) and activate it.
2. Initialize a folder structure (e.g. `src/`, `data/`, etc.) following best
practices.
3. Generate a `pyproject.toml` or `requirements.txt` with common data
engineering libraries (e.g. pandas, pyarrow, dbt).
4. Include any setup for infrastructure (e.g. Dockerfile for services like
Postgres, Airflow, etc.).
**Output**: Provide the commands and configuration files content. Explain each
step briefly.
2. star-schema-designer.prompt.md – Dimensional Modeling Advisor
Helps design a star schema for a given analytics use-case, identifying fact and dimension tables, keys, and
grain.
---
title: "Star Schema Designer"
intent: "Identify facts and dimensions and design a 3NF or star schema for a
dataset."
inputs:
- name: business_domain
required: true
assumptions: ["Follows Kimball dimensional modeling", "Data is analytics-
friendly"]
source_refs: ["handbook:modeling:star"]
---
**Context**: We are modeling the {{ business_domain }} domain for analytics. We
need a star schema with clear fact and dimension tables.
**Task**:
1. List potential **Fact tables** (with grain and measures).
2. List **Dimension tables** (with key and attributes) linked to those facts.
3. Sketch the relationships (ERD) and note any slowly changing dimensions (SCD).
**Output**:
- Fact table definitions (name, grain, measures).
- Dimension definitions (name, keys, important attributes, SCD type if
applicable).
- A brief justification of the design (why this grain, how it satisfies
analytics needs).
3. airflow-dag-generator.prompt.md – Airflow DAG Generator
4
Generates a skeleton for an Apache Airflow DAG given tasks and dependencies.
---
title: "Airflow DAG Generator"
intent: "Create a basic Airflow DAG Python code with given tasks and
dependencies."
inputs:
- name: dag_name
required: true
- name: tasks[]
required: true
assumptions: ["Using Airflow 2.x", "Tasks are PythonOperators unless specified"]
source_refs: ["handbook:orchestration:airflow"]
---
**Goal**: Define an Airflow DAG called `{{ dag_name }}` with tasks: {{ tasks }}.
**Instructions**:
- Use standard DAG declarations (`with DAG(...) as dag:`).
- Create one task per name in `tasks` (use BashOperator or PythonOperator for
demo).
- If a task name contains `>>` or `->`, interpret it as dependency (e.g.
`"extract >> transform"` means transform depends on extract).
**Output**: Provide a complete Python code for the DAG, respecting Airflow best
practices (no hard-coded dates outside default_args, use `@daily` schedule,
etc.), and show the dependency setup.
(...and so on for ~25+ prompt files covering streaming jobs, data quality checks, cost optimization queries, etc.)
Sample Chat Modes ( /chatmodes/de/)
Custom chat modes define AI personas with specific skillsets and constraints 12 13
. Each has a name, description, capability list, and behavior rules. Below are some key chat modes:
.chatmode.md
1. analytics-architect.chatmode.md – Analytics Patterns Architect
---
name: "Analytics Patterns Architect"
description: "Design and review canonical analytics tables and pipelines
(funnels, cohorts, LTV, SCD2)."
capabilities: ["pattern selection", "schema design", "SQL skeletons",
"idempotency & tests", "backfill plans"]
boundaries: ["never execute cluster commands", "mask secrets", "ask for
confirmation before destructive steps"]
commands:
5
* "/choose-pattern name=<funnel|cohort|scd2|...>" – Select an analytics pattern
and load its context.
* "/generate-sql inputs=<...>" – Generate SQL/ETL code for the chosen pattern
using given inputs.
* "/write-tests" – Provide data quality tests for the pattern output.
activation: "Activate Analytics Patterns Architect"
---
Persona behavior: The Analytics Patterns Architect acts as a senior analytics engineer. It will help choose
the right pattern (e.g., funnel vs cohort), draft structured SQL models with proper keys and timestamp logic,
ensure idempotent pipeline design (so reruns yield same results 8
), and suggest QA tests. It strictly
avoids any action that could run code or alter data without explicit user confirmation.
2. experimentation-steward.chatmode.md – Experimentation Data Steward
---
name: "Experimentation Data Steward"
description: "Expert in A/B testing data – designs experiment metrics, ensures
valid analysis (CUPED, SRM checks)."
capabilities: ["bucketing strategies", "variance reduction (CUPED)", "guardrail
metrics", "statistical validation"]
boundaries: ["no personally identifiable user data", "no stats test without data
summary"]
commands:
* "/design-experiment metric=<...>" – Outline experiment metrics and guardrails.
* "/analyze-results data=<...>" – Provide an analysis template, highlighting SRM
or anomalies.
activation: "Activate Experimentation Data Steward"
---
Persona behavior: The Experimentation Steward helps with setting up and analyzing A/B tests. It will
recommend stable hashing for user bucketing and highlight Sample Ratio Mismatch (SRM) issues (e.g., if
traffic split deviates from 50/50 14
). It might suggest applying CUPED (Controlled Experiments Using Pre-
Experiment Data) to reduce variance 15
and always adds “guardrail” metrics (like page load time or
engagement) to catch side effects.
3. cohort-retention-coach.chatmode.md – Cohort & Retention Coach
---
name: "Cohort & Retention Coach"
description: "Helps build cohort analyses and retention/churn metrics with
statistical rigor."
capabilities: ["cohort grouping", "retention curve computation", "churn
analysis", "survivor bias checks"]
boundaries: ["do not reveal individual user data", "explain assumptions behind
6
metrics"]
commands:
* "/build-cohort basis=<signup/purchase>" – Generate SQL to build cohort groups
(e.g. by signup month).
* "/calc-retention cohort=<...>" – Compute N-day retention and lifetime value
metrics.
activation: "Activate Cohort & Retention Coach"
---
Behavior: This mode guides through cohort analysis – grouping users by start month, then calculating
retention percentages over time 16 17
. It will warn about survivorship bias – e.g. explaining that overall
retention can appear to improve over time simply because only loyal users remain 18
. The coach will
ensure retention metrics are properly segmented by cohort to avoid misleading aggregate retention 19
. It
can also assist in computing customer lifetime value (LTV), reminding to account for active users
20
(censoring) so as not to underestimate true lifetime .
4. attribution-planner.chatmode.md – Attribution Model Planner
---
name: "Attribution Planner"
description: "Advises on multi-touch attribution models for marketing
analytics."
capabilities: ["attribution model selection", "channel touchpoint analysis",
"path pruning", "time-decay weighting"]
boundaries: ["no actual user PII", "focus on aggregate patterns"]
commands:
* "/choose-model type=<first|last|linear|time-decay>" – Explain and set the
attribution model.
* "/compute-attribution data=<...>" – Outline how to allocate credit across
channels.
activation: "Activate Attribution Planner"
---
Behavior: The Attribution Planner assists in distributing credit for conversions across marketing touchpoints.
For example, if the user chooses a first-touch model, it will give all credit to the first interaction 21
; for
last-touch, all credit to the final interaction 22
. It can suggest multi-touch models like linear or time-
decay, explaining how each works (e.g. time-decay gives more weight to touches closer to conversion 23
).
It will also ensure the user has the required data (a sequence of touchpoints per user) and may suggest
pruning insignificant paths or merging channels for reliability.
(Additional chat modes not shown for brevity include e.g. a “Batch Pipeline Orchestrator” for scheduling DAGs,
“Streaming Data Specialist” for real-time pipeline guidance, “Data Quality Sentinel” focusing on test coverage, and
“Warehouse Optimizer” for tuning warehouse queries.)
7
Sample Instructions ( /instructions/de/)
Custom instruction files enforce coding standards or best practices automatically when editing files
matching certain glob patterns 7
. They contain rules and optional autofix hints. Here are examples:
1. de-analytics-patterns.instructions.md – Analytics Patterns SQL & Modeling Guide
This instruction set applies to analytics model files (dbt models, snapshot queries, etc.), ensuring they follow
pattern guidelines.
---
name: "Analytics Patterns SQL & Modeling Guide"
globs: ["models/**/*.sql", "snapshots/**/*.sql", "models/**/*.yml"]
rules:
* "Define grain & business keys explicitly in model docs (YML)."
* "All pattern models must be incremental or use merging with **deterministic
keys**."
* "Use event time **watermarks** + a late-arrival allowance for any
incremental loads; avoid unlimited lookback."
* "For funnel models: enforce declared step order (strict vs loose) and
document re-entry logic."
* "For SCD Type 2: use `effective_from`, `effective_to`, `is_current` fields
with non-overlapping intervals (no duplicate current rows)."
* "For sessionization: specify inactivity threshold (e.g., 30min) and how to
break ties for concurrent sessions."
* "Cumulative fact tables must state their restatement policy (full rebuild vs
rolling window) in comments."
* "Add tests for each pattern: primary key uniqueness, referential integrity,
and any business-specific rules."
autofix_hints: true
---
How it works: When editing a SQL model, these instructions remind the user to follow best practices. For
example, if the user forgets to include an is_current flag in an SCD Type 2 model, Copilot will prompt
them (as per the rule) to add it so that historical records have a clear end date 9
. If a funnel model’s SQL
doesn’t enforce step ordering, it will hint to incorporate that logic. The instructions effectively encode the
acceptance criteria of each pattern (like idempotency, watermark for late data, no full deletes for backfill,
etc.) so that the generated pipelines are robust.
2. de-orchestration.instructions.md – Orchestration & Scheduling Guide
---
name: "Orchestration Best Practices"
globs: ["dags/**/*.py", "pipelines/**/*.py"]
rules:
8
* "Use descriptive DAG and task IDs (no generic 'task1', 'task2')."
* "Do not hard-code credentials or secrets in code; use Airflow Connections or
env variables."
* "Set retries and timeout for all tasks (e.g., `retry=3`,
`retry_delay=timedelta(minutes=5)`)."
* "Include SLAs or alerts for critical DAGs (Airflow `sla` or
on_failure_callback)."
* "Ensure tasks have clear dependencies set via `XCom` or upstream lists,
avoid implicit dependencies."
---
This ensures any Airflow DAG code adheres to basics: sensible naming, error handling, no plaintext secrets,
etc. For instance, if a user writes a DAG without a retry policy, Copilot (seeing this instructions file) may
suggest adding a default_args['retries'] to the DAG definition.
3. de-sql-style.instructions.md – SQL Style Guide
---
name: "SQL Style Guide for DE"
globs: ["**/*.sql"]
rules:
* "Use uppercase for SQL keywords (SELECT, WHERE, JOIN)."
* "Avoid `SELECT *` in production queries; explicitly select columns."
* "Alias tables for readability, and qualify columns with table alias if
joining multiple tables."
* "Use window functions instead of self-joins for running totals where
appropriate (performance)."
* "Terminate statements with semicolons in scripts."
---
This is a general SQL style guide that would apply to all SQL files. It helps maintain a consistent style and
encourages best practices (no SELECT * , etc.).
(Multiple instruction files are provided to cover various domains: e.g., a Streaming Guide for Kafka/Flink code with
rules about processing-time vs event-time and checkpointing, a Security Guide enforcing PII masking and
encryption standards, etc.)
Analytics Pattern Prompts ( /patterns/)
The Analytics Patterns library is a highlight of this repo. Each pattern prompt is a comprehensive blueprint
for a common analytics table or pipeline. It includes:
•
Front-matter with a human-readable title, the intent of the pattern, required inputs, assumptions
(data grain, required columns, time semantics, etc.), and source_refs pointing to handbook
sections or references.
9
•
•
•
•
•
•
•
•
Problem definition – A description of the analytic challenge, pitfalls, and why this pattern is useful.
Data Requirements – The input tables/columns, keys, and any prerequisites (e.g., unique user IDs,
timestamp fields).
Steps – Numbered steps to build the solution (from data prep to final aggregation).
SQL/ETL Skeleton – A portable example (pseudo-SQL or code) outlining how to implement the
pattern (with placeholders for inputs).
Idempotency & Backfills – Guidance on making the pattern re-runnable (e.g., using watermarks or
merge strategies) and how to handle late-arriving data or backfill.
Tests – Suggested tests (data quality or unit tests) to validate the pattern’s correctness.
Success Criteria – What a “good” implementation achieves (e.g., no duplicate rows, accurate
metrics).
Example – A brief illustration of usage with sample input and expected outcome.
Below, we present all required analytics pattern prompts (15 total). Each is tailored to a specific use case but
follows the consistent structure described.
1. Funnel Analysis
File: pattern-funnel-analysis.prompt.md
---
title: "Funnel Analysis Builder"
intent: "Generate a robust, idempotent funnel conversion table with clear step
logic and tests."
inputs:
- name: events_table
required: true
- name: user_key
required: true
- name: steps
required: true
- name: lookback_window
required: false
- name: strict_ordering
required: false
assumptions: ["Events table has {user_key}, event_name, event_timestamp",
"Timestamps in UTC or with tz info"]
source_refs: ["handbook:analytics:funnel"]
---
# Problem
Track how users progress through a sequence of events (a **funnel**), and where
they drop off. Funnel analysis helps identify bottlenecks by examining step-by-
step conversion rates 24
. Key challenges include handling users who skip steps,
re-enter funnels, or events arriving out of order.
Common pitfalls:
- Not accounting for users repeating an earlier step (re-entry).
10
- Strict vs. loose ordering confusion (must steps happen in exact order, or can
steps be completed in any sequence?).
- Late events arriving after analysis window (can affect counts).
# Data Requirements
- **Source events table**: `{{ events_table }}` with at least:
- `{user_key}` – unique user identifier (e.g. user_id).
- `event_name` – categorical, e.g. "view_product", "add_to_cart".
- `event_timestamp` – when the event occurred.
- Ensure all funnel **step names** (in `{{ steps }}` list) correspond to
possible `event_name` values.
- Each user can trigger steps multiple times – decide whether to count only the
first attempt or all funnel entries.
# Steps
1. **Filter timeframe** – Limit events to a recent window (e.g. last N days =
`{{ lookback_window|default(90) }}` days) to focus on relevant data.
2. **Step tagging** – Among the filtered events, mark the first occurrence
timestamp of each funnel step for each user. This often uses window functions or
self-joins:
- For each user, find the earliest `event_timestamp` of the first step
(`steps[0]`), call it `step1_ts`.
- Then for step 2, find the earliest timestamp where `event_name = steps[1]`
**and** `timestamp >= step1_ts` (if strict ordering) or simply after (if loose
ordering).
- Continue for all steps.
3. **Re-entry logic** – If a user completes the funnel (all steps) and then
triggers step1 again, decide whether to count a new funnel entry. (Often funnels
count a user only in their first pass. Optionally handle re-entry if needed by
treating subsequent occurrences as separate funnel journeys.)
4. **Assemble funnel table** – Create one output record per user (or per user
per funnel attempt) with columns: `user_id`, timestamp for each step (nullable
if not reached), and a boolean or step count indicating where the user dropped
off.
5. **Calculate metrics** – Compute aggregate funnel metrics:
- Number of users at each step,
- Conversion rate from step *i* to *i+1* (e.g. what percent of those who did
step1 also did step2, etc.).
- Overall conversion (from step1 to final step).
6. **Output** – Typically two outputs: (a) a detailed table of user-step
timestamps, and (b) a summary table of funnel counts & conversion rates.
# SQL / ETL Skeleton
```sql
WITH base_events AS (
SELECT
{{ user_key }} AS user_id,
event_name,
11
event_timestamp
FROM {{ events_table }}
WHERE event_timestamp >= DATEADD(day, -{{ lookback_window|default(90) }},
CURRENT_DATE)
),
steps AS (
SELECT
user_id,
-- Earliest time of step1
MIN(CASE WHEN event_name = '{{ steps[0] }}' THEN event_timestamp END) AS
step1_ts,
-- Earliest time of step2 after step1
MIN(CASE
WHEN event_name = '{{ steps[1] }}'
AND event_timestamp >= {{ "step1_ts" if strict_ordering else
"step1_ts /* loose: ignore ordering in this example */" }}
THEN event_timestamp
END) AS step2_ts,
... -- repeat for each step in funnel
FROM base_events
GROUP BY user_id
),
funnel_conv AS (
SELECT
COUNT(*) AS users_in_funnel,
COUNT_IF(step1_ts IS NOT NULL) AS step1_reached,
COUNT_IF(step2_ts IS NOT NULL) AS step2_reached,
...,
FROM steps
COUNT_IF(stepN_ts IS NOT NULL) AS stepN_reached
)
SELECT
*,
step2_reached * 1.0 / step1_reached AS step1_to_2_conv_rate,
...,
stepN_reached * 1.0 / step1_reached AS overall_conversion_rate
FROM funnel_conv;
(The SQL above outlines a pattern: adjust for your SQL dialect and indexing of steps. For loose ordering, remove
the timestamp condition between steps or implement differently.)
Idempotency & Backfills
This funnel model should be idempotent. Use the event timestamp as a natural incremental watermark: -
For incremental loads, process new events where event_timestamp is greater than the max seen
timestamp in previous runs. - Keep the last few days of events (late arrivals) in each run to catch any
12
stragglers; e.g., always reprocess the trailing 1-2 days even if they were processed before (to include late
events). - Avoid double counting: if a user’s events were already processed and they haven’t done new
funnel steps, ensure not to duplicate them in output.
For backfills (recomputing older periods), parameterize the date range ( lookback_window or explicit
start/end dates). Because the process is idempotent and uses min timestamps per user, rerunning for
overlapping windows will yield the same result for that period.
Tests
Key tests for a funnel model: - Not null: All output rows should have a non-null user_id . Each funnel step
timestamp column can be null (if user didn’t reach that step), but check that if e.g. step3_ts is not null
then step2_ts is not null (no skipping backwards). - Step ordering: Ensure step1_ts <= step2_ts
<= ... <= stepN_ts for each user (monotonic non-decreasing timestamps). Violations could indicate
the logic didn’t enforce order properly. - Unique users: If output is one row per user, verify primary key
uniqueness on user_id. - Conversion counts: Basic sanity checks on metrics, e.g. stepN count ≤ step1
count (never have more completions than starters).
Success Criteria
•
•
•
•
Complete funnel metrics: You can accurately report how many users dropped off at each stage and
the conversion rates between stages.
Reproducible results under late data: If events come in late (e.g. yesterday’s events arriving today),
rerunning the pipeline updates the funnel counts correctly without duplicating or missing users.
No double-counting: Each user is counted at the furthest step they reached, and only once per
funnel run.
Test suite passes: All the above tests (no null user_ids, correct ordering, etc.) pass, giving confidence
in the model’s integrity.
Example
User Input (in Copilot Chat):
/choose-pattern name=funnel
events_table = "analytics.events"
user_key = "account_id"
steps = ["view_product", "add_to_cart", "checkout", "purchase"]
strict_ordering = true
Copilot (Analytics Patterns Architect) would then generate: - A SQL model funnel_analysis.sql
implementing the above logic for the analytics.events table. - A summary of funnel conversion rates
for each step (e.g. “1000 users viewed product, 250 purchased, 25% overall conversion”). - Data tests, e.g., a
13
dbt test YAML ensuring between steps.
account_id is unique and not null, and custom tests for timestamp ordering
### 2. Cumulative/Accrual Table (Daily Rolling Total)
File: **`pattern-cumulative-table.prompt.md`**
```markdown
---
title: "Cumulative Fact Table (Daily Accrual)"
intent: "Produce a daily cumulative metrics table (rolling sum) with
restatement-safe incremental logic."
inputs:
- name: base_fact
required: true
- name: date_key
required: true
- name: entity_key
required: true
- name: accrual_metric
required: true
- name: backfill_days
required: false
assumptions: ["One row per {entity_key} per day in base_fact", "No duplicate
{entity_key,date_key} pairs"]
source_refs: ["handbook:modeling:cumulative"]
---
# Problem
Sometimes we need a table that tracks a running total (cumulative sum) of a
metric over time – for example, the cumulative number of signups or total
revenue up to each day. This pattern yields a daily snapshot that is
**monotonic** (never decreases) unless explicitly allowed (e.g., restatements).
Challenges:
- Handling **restatements**: if historical data changes (e.g., a late correction
subtracts from a past total), the cumulative logic must reflect that.
- Performance: computing a running total over a long period can be expensive;
incremental build helps by only processing recent days.
- Ensuring idempotency so that re-running doesn’t double count.
# Data Requirements
- **Base fact table**: `{{ base_fact }}` with at least:
- `{{ entity_key }}` – the entity we accumulate over (e.g., `user_id` for user
signups, or just a constant if aggregating overall).
- `{{ date_key }}` – date of the event (usually without time part, or
truncated to day).
- `{{ accrual_metric }}` – the value to accumulate (e.g., `1` for count of
14
signups, or an amount for revenue).
- The base fact should ideally have one row per entity per date (or you will sum
them per date in step 1).
- If base data can update retroactively (late arriving facts), we need to
account for that in incremental builds.
# Steps
1. **Aggregate base by date** – Start with daily totals from the base fact:
```sql
SELECT {{ date_key }} as d,
SUM({{ accrual_metric }}) as daily_value
FROM {{ base_fact }}
GROUP BY d;
```
(Include `{{ entity_key }}` in grouping if you need per-entity cumulative
results; otherwise for a global metric just date.)
2. **Join with previous cumulative** – To get running total, each day’s
cumulative = prior day’s cumulative + current day’s value. In SQL, use a window
function:
```sql
SELECT
d,
SUM(daily_value)
OVER (ORDER BY d ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)
AS running_total
FROM daily;
```
This produces a monotonic running sum over days.
3. **Incremental load logic** – If building incrementally, do:
- Determine the **max date already computed** in the target cumulative table.
- Fetch base_fact records for dates >= (max_date - `{{ backfill_days|
default(14) }}`) to allow restating the last few days.
- Recompute cumulative from that window forward, and upsert (merge) into the
cumulative table.
- This way, if there were any changes in the last N days, we recalc and
correct them.
4. **Edge: non-monotonic cases** – If the metric can decrease (e.g., if a past
entry is removed causing a drop in cumulative), highlight that in documentation.
Normally cumulative counts are expected to only stay flat or increase; a
decrease indicates a data restatement.
# SQL / ETL Skeleton
```sql
WITH daily AS (
SELECT
{{ date_key }} AS d,
SUM({{ accrual_metric }}) AS daily_value
FROM {{ base_fact }}
15
GROUP BY d
),
cum AS (
SELECT
d,
SUM(daily_value) OVER (ORDER BY d
ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
) AS running_total
FROM daily
)
SELECT *
FROM cum
ORDER BY d;
(Above is a full recompute example. For incremental, you'd only query a window of base_fact and merge results.)
Idempotency & Backfills
Ensure the cumulative table can be recomputed for any window: - Use a merge/upsert strategy (like SQL
MERGE or delete+insert) when updating the cumulative table for recent days. This replaces old values with
corrected ones rather than double counting. - Maintain a high watermark (max date processed). On each
25
run, start from (max_date - backfill_days ) to catch changes . - By keeping backfill_days (e.g.,
14 days), if a correction arrives for a date two weeks ago, the next run will recalc from before that date and
fix the running totals. - Idempotent: running the job twice on the same day should yield the same
cumulative totals (no duplicates). This means avoid simply appending new data without considering
existing.
Tests
•
•
•
•
Primary key test: The cumulative table should have one row per {{ date_key }} (or per entity-
date if applicable). Test that (entity, date) is unique and not null.
Monotonicity test: Ensure running_total is non-decreasing over time. A simple test:
running_total on day N >= running_total on day N-1, for all N. (There could be legitimate
decreases if data was removed; if so, flag those explicitly or allow exceptions with a separate
“explanation” column).
Reconciliation test: The final day’s running_total should equal the sum of all daily_value
up to that day (basic sum check).
Freshness test: If using incremental loading, ensure the most recent date in cumulative equals the
most recent date in base_fact (no gaps). If a gap is detected, it means the process may have failed or
is late.
16
Success Criteria
•
•
•
•
Accuracy: The cumulative numbers correctly reflect the sum of all past daily values up to each date.
If a late data change occurs, the next run should correct the affected dates.
Performance: Incremental updates only recompute a small window ( {{ backfill_days }} ), not
the entire history, making daily runs efficient even as history grows.
Monotonic (if expected): In normal operation, the running_total only grows (or stays same) day-
over-day. Any decrease is intentional and documented (e.g., “On 2023-05-10 data was restated
causing a drop”).
Self-documenting: The output table or accompanying metadata notes the cutoff date for backfill
(e.g., “last 14 days are restated each run”) so downstream users understand the data freshness and
stability.
Example
Suppose base_fact = sales_transactions , with date_key = transaction_date , and we want
cumulative revenue: - Input: base_fact = "sales.transactions", entity_key not needed (we
aggregate all sales), accrual_metric = "amount" . - After running the pattern prompt, Copilot
generates models/cumulative_sales.sql which sums daily revenue and uses a window to get total
revenue to date. - If today is 2025-09-01, the table will have one row per date from the start to 2025-09-01,
with the last row’s running_total equal to total revenue all time. - Tests ensure the row count equals number
of days of data, and that running_total never decreases.
### 3. Idempotent SCD Type 2 History
File: **`pattern-scd2-idempotent.prompt.md`**
```markdown
---
title: "Idempotent SCD Type 2 History"
intent: "Maintain a clean Slowly Changing Dimension Type 2 table with
deterministic merges and no duplicate active records."
inputs:
- name: src_table
required: true
- name: business_key
required: true
- name: change_cols
required: true
- name: change_ts
required: false
- name: late_arrival_window
required: false
assumptions: ["Source has one row per natural key change", "change timestamp
available (event_time or update_time)"]
17
source_refs: ["handbook:modeling:scd2", "handbook:cdc"]
---
# Problem
A Slowly Changing Dimension Type 2 (SCD2) table tracks the full history of
changes for dimension records (e.g., a customer’s address changes over time)
26
9
. The SCD2 pattern creates a new row for each change and marks old rows as
expired. Key requirements:
- Exactly one current (“active”) record per business key at any time.
- Accurate `effective_from` and `effective_to` timestamps to define the validity
period of each record.
- Idempotent updates: rerunning the load should not create duplicates or shift
the history.
Challenges:
- Detecting changes in the source (comparing new vs last version).
- Handling late arriving changes (out-of-order events) – if an older change
shows up after a newer one, we may need to adjust history.
- Ensuring **no overlapping intervals** for a given key (end of one period =
start of next).
# Data Requirements
- **Source table** (`{{ src_table }}`): each row represents the latest version
of an entity (if doing change capture via full snapshot) or a change event (if
using CDC logs).
- `{{ business_key }}`: Natural key to identify the entity (e.g. customer_id).
- `{{ change_ts|default("update_timestamp") }}`: Timestamp of the change/event
(could be an “updated_at” or an event time).
- Other columns that we want to track changes for (list them in
`{{ change_cols }}`).
- Initially, the SCD2 table might be empty or have an initial load of historical
data.
- We assume we can identify when a *change* happened by comparing new data to
previous data or using an explicit change feed.
# Steps
1. **Identify new changes**: Compare incoming source data to the current SCD
table:
- For each `{{ business_key }}` in source, get the corresponding current
record from SCD (if exists).
- Determine if any of the `{{ change_cols }}` values differ from the current
record’s values.
- If different (or if key not in SCD yet), that source row represents a new
change to apply.
- If no difference, skip (no change).
2. **Prepare SCD inserts/updates**:
- For each identified change:
- “Expire” the old current record: set its `effective_to` to (new change’s
timestamp or one second before it) and `is_current = false`.
18
- Create a new record with `effective_from = change_ts` (when this change
is effective), `effective_to = null` (open-ended), and `is_current = true`.
Populate all dimension attributes from the source.
- Compute a hash or checksum of `{{ change_cols }}` for both old and new
records to compare – this helps ensure deterministic change detection (some
implementations use a hash to quickly check if any relevant column changed).
3. **Merge into SCD table**:
- Use a single MERGE (if supported) or transaction:
- MATCH on `business_key`.
- When matched (existing current record) and data is changed, update the
existing record to expire it.
- Then INSERT the new record.
- Ensure that if no current record exists (new key), just INSERT with
`effective_from` = change_ts and no expiration.
4. **Late arrivals handling**:
- If `{{ late_arrival_window }}` is set (e.g., allow updates up to 7 days
old), handle out-of-order events:
- If an incoming change has a timestamp older than the latest
`effective_from` for that key (meaning we already have a newer change), we may
need to insert it *before* the newer change:
- Find where it fits in the timeline and adjust the neighboring records’
`effective_from`/`effective_to` accordingly.
- This scenario is complex; often one might reject or log late arrivals
beyond a threshold. But the pattern should at least detect it.
- Often, for simplicity, anything outside a late window is ignored or
triggers a full rebuild for that key.
5. **Housekeeping**:
- Optionally, periodically deduplicate or recompute hashes to ensure no
drift.
- Keep track of the last processed `change_ts` per key to handle incremental
loads.
# Merge Skeleton
Below example uses pseudo-SQL for a MERGE (target is `scd2` table, source is
`staging` data of changes to apply):
```sql
MERGE INTO scd2 t
USING staged_changes s
ON t.{{ business_key }} = s.{{ business_key }}
AND t.is_current = TRUE
WHEN MATCHED
THEN UPDATE
SET t.is_current = FALSE,
t.effective_to = s.change_ts - INTERVAL '1' SECOND
-- (or some small delta, assuming change_ts is inclusive start of new
record)
WHEN NOT MATCHED
19
THEN INSERT (
{{ business_key }}, <other columns>,
effective_from, effective_to, is_current
)
VALUES (
s.{{ business_key }}, <other columns>,
s.change_ts, NULL, TRUE
);
(Note: The ON clause might also match on keys where t.is_current=TRUE to only update the current record.)
If MERGE not available, the logic is: - For each change in staged_changes: 1. UPDATE scd2 set
effective_to = <new_ts - δ>, is_current=FALSE where business_key = X and
is_current = TRUE . 2. INSERT new row for business_key = X with effective_from = new_ts,
effective_to = NULL, is_current = TRUE.
Idempotency & Late Arrivals
•
•
•
•
•
•
Deterministic change detection: Use a hash of change_cols to decide if a new row differs from
the old. Store that hash in SCD2 (could be an additional column). This way, if the same source record
25
is processed twice, you can detect no actual change and skip inserting a duplicate .
Idempotent pipeline: If you accidentally run the SCD load twice for the same data, the hash
comparison or checking is_current flags prevents inserting the same change twice.
Late arrival window: If a late change comes in (older than the latest current record in SCD):
If within {{ late_arrival_window|default(0) }} days of tolerance, process it by adjusting
history (might require updating the next record’s effective_from to the late change’s time, and
setting the late change’s effective_to to that next record’s start).
If beyond the window, either drop it (and log) or flag for manual intervention. The pattern should not
blindly insert it because it would violate ordering.
Backfill/Re-run: You should be able to truncate and reload the SCD table from scratch (from earliest
source records) and get the same result as the incrementally built table, to validate correctness.
Tests
•
•
Single current record: For each business_key , at most one row where is_current = TRUE.
(Test: no key has two trues).
Non-overlapping intervals: For each business_key , the date ranges [effective_from,
effective_to) should not overlap between records. A query like:
SELECT business_key
FROM scd2 a
JOIN scd2 b USING(business_key)
WHERE a.effective_from < b.effective_to
20
AND b.effective_from < a.effective_to
AND a.id <> b.id;
•
•
•
should return zero rows.
Integrity of change data: If a hash or version number is stored, test that no two consecutive
records for same key have identical hash (meaning a change was recorded when nothing changed).
Timeliness: If late_arrival_window is set, test that no incoming change older than that window was
applied (or that appropriate adjustments were made).
Correct attribute values: Optionally, if you have a separate truth dataset or audit log, sample a few
keys to verify that the SCD table reflects the correct sequence of values over time.
Success Criteria
•
•
•
•
•
Complete history: The SCD2 table correctly reflects every change in {{ change_cols }} for each
9
{{ business_key }} . Historical values are preserved (Type 2) rather than overwritten .
No duplication: Re-running the process yields the same table state (idempotent). There are no
duplicate records or accidental multiple current records for a key.
Accurate period tracking: The effective_from and effective_to delineate each period of a
particular attribute set. For any given point in time, one can query “as of that time” and get the valid
dimension record.
Handles out-of-order updates: Within reason, late arriving changes are incorporated properly or
flagged. The history remains chronologically consistent.
Auditable: One can trace any record in the SCD table back to a source change (via change_ts or
hash), ensuring transparency.
Example
Imagine src_table = customers_delta (daily delta of customer info), business_key =
customer_id, change_cols = [address, phone], change_ts = last_updated.
User prompts the pattern:
/choose-pattern name=scd2-idempotent
src_table="staging.customers_delta"
business_key="customer_id"
change_cols=["address","phone"]
late_arrival_window=7
Copilot would output: - A dbt model or SQL script implementing the SCD2 logic described, likely as a MERGE
into a dimension table dim_customer_scd2 . - It would include logic to expire old records and insert new
ones. - It might also provide a helper query or comment on how to handle late arrivals (e.g. “if an update is
older than 7 days compared to current record, consider manual review”). - Tests ensuring one current
record per customer, no overlaps, etc., would be included (or in a YAML schema file).
21
### 4. Sessionization
File: **`pattern-sessionization.prompt.md`**
```markdown
---
title: "Sessionization (User Session Identification)"
intent: "Group event streams into sessions given an inactivity timeout, handling
overlapping sessions and bots."
inputs:
- name: events_table
required: true
- name: user_key
required: true
- name: event_ts
required: true
- name: session_timeout_minutes
required: true
assumptions: ["Events sorted by timestamp per user", "session_timeout_minutes
(e.g. 30) is agreed upon threshold"]
source_refs: ["handbook:analytics:session"]
---
# Problem
In clickstream or log analytics, we often need to break a continuous event
stream into discrete **sessions** – periods of activity separated by a certain
gap of inactivity. For example, if a user is inactive for 30+ minutes, any new
activity starts a new session. Sessionization helps analyze behaviors like
“average session length” or “events per session”.
Key considerations:
- **Inactivity threshold**: If no events for X minutes, session ends. A common
default is 30 minutes of inactivity.
- **Overlapping sessions**: Normally, sessions for a single user shouldn’t
overlap. But if data is not sorted or if using machine timestamps, weird
overlaps can occur (shouldn’t if using proper event time).
- **Concurrent sessions**: If `user_key` is something like a device ID, a user
could have multiple devices (multiple sessions) concurrently. We may ignore this
or treat each device as separate user.
- **Bots or automated events**: These can create extremely long
“sessions” (continuous events with no gaps). Sometimes it’s useful to cap
session length or filter bot activity.
# Data Requirements
- **Events table**: `{{ events_table }}` with:
- `{{ user_key }}`: User or session grouping key (e.g., user_id, or
device_id).
- `{{ event_ts }}`: Timestamp of each event (ideally in datetime format).
22
- Data must be **sorted by event timestamp within each user** to sessionize (if
not, sort first).
- Ideally, events are in UTC or all in the same timezone (or have tz info to
interpret correctly).
# Steps
1. **Sort events** (per user): Ensure input events are ordered by `event_ts` for
each `{{ user_key }}`. In SQL, this might mean using `ROW_NUMBER() OVER
(PARTITION BY user ORDER BY event_ts)` if not already ordered, or using a window
lag function.
2. **Calculate time gap**: Compute the time difference between consecutive
events for each user:
- Use `LAG({{ event_ts }})` to get previous event timestamp for the same
user.
- Compute `diff_minutes = TIMESTAMPDIFF(MINUTE, lag_event_ts,
current_event_ts)` (or in your SQL dialect).
3. **Assign session IDs**:
- Start a new session if `diff_minutes` is `NULL` (first event for user)
**or** `diff_minutes > {{ session_timeout_minutes }}` (i.e., gap too large).
- You can generate a session_id by using a cumulative sum:
```sql
session_id = SUM(CASE WHEN diff_minutes IS NULL OR diff_minutes >
{{ session_timeout_minutes }} THEN 1 ELSE 0 END)
OVER (PARTITION BY user_id ORDER BY event_ts ROWS UNBOUNDED
PRECEDING)
```
This effectively increments the session counter each time a new session
starts.
- Or, use a UUID or concatenate user_id with session start timestamp.
4. **Session table**: Optionally, aggregate events to one row per session:
- session_id (as defined), user_id, session_start (first event_ts of
session), session_end (last event_ts), number_of_events,
session_duration_minutes.
- Compute session_duration as difference between last and first timestamps in
session.
5. **Overlapping sessions check**: Since by construction sessions for a given
user won’t overlap (they’re sequential), we only worry if user had multiple
devices. If `user_key` can repeat concurrently (like the same user_id on two
devices), then the sessionization above actually treats them as one sequence. In
such cases, use a composite key (user + device) to separate streams.
6. **Bot filtering**: If needed, identify sessions that are unrealistically long
or have thousands of events (could be non-human). Mark them for exclusion or
separate analysis.
# SQL / ETL Skeleton
```sql
WITH ordered AS (
SELECT
23
{{ user_key }} as user_id,
{{ event_ts }} as ts,
LAG({{ event_ts }}) OVER (PARTITION BY {{ user_key }} ORDER BY
{{ event_ts }}) as prev_ts
FROM {{ events_table }}
),
gaps AS (
SELECT
user_id,
ts,
CASE
WHEN prev_ts IS NULL
OR TIMESTAMPDIFF(MINUTE, prev_ts, ts) >
{{ session_timeout_minutes }}
THEN 1
ELSE 0
END as new_session_flag
FROM ordered
),
sessions AS (
SELECT
user_id,
ts,
SUM(new_session_flag)
OVER (PARTITION BY user_id ORDER BY ts ROWS UNBOUNDED PRECEDING) as
session_seq
FROM gaps
)
SELECT
user_id,
session_seq as session_id,
MIN(ts) OVER (PARTITION BY user_id, session_seq) as session_start,
MAX(ts) OVER (PARTITION BY user_id, session_seq) as session_end,
COUNT(*) OVER (PARTITION BY user_id, session_seq) as event_count
FROM sessions;
(This query assigns a session_seq instead of a sequence.)
number per user, treating each user’s first event or big gap as a session
break. Adjust TIMESTAMPDIFF syntax per SQL dialect. You might also use GENERATE_UUID() for session_id
Idempotency & Backfills
•
•
Deterministic output: Sessionization is purely deterministic given a sorted list of events and a
timeout threshold. Running it on the same input yields the same sessions, so it’s idempotent by
nature as long as the input event data isn’t duplicated or partial.
Incremental building: If you process streaming data, you could maintain sessions incrementally:
24
•
•
•
•
•
Keep track of the last event time per user from the previous batch.
When new events arrive, decide if the first new event continues the last session or starts a new one
(compare timestamp difference).
This requires state (last session end per user) or reprocessing a small overlap.
Late arriving events: If events can arrive out-of-order or late, you may need to re-run session
assignment for that user for the affected period. A straightforward strategy is to partition data by
day or hour and allow reprocessing of recent partitions if late data arrives.
Backfill: For historic data, you can run the sessionization for each user independently. If doing a
massive backfill, ensure data is partitioned and sorted (maybe use a tool like Spark for large
volumes).
Tests
•
No session gaps less than threshold: Verify that within a session, the gap between any two
consecutive events is <= timeout. This is by construction, but a SQL test can double-check:
SELECT user_id, session_id
FROM sessions_detail
WHERE TIMESTAMPDIFF(MINUTE, LAG(ts) OVER (PARTITION BY user_id, session_id
ORDER BY ts), ts) > {{ session_timeout_minutes }};
•
•
•
•
This should return no rows.
Session start correctness: Every session’s first event should either be user’s first event or have a
preceding event outside the timeout. Test that for each session, either prev_ts IS NULL or
prev_ts < session_start - timeout.
Unique session IDs: If using a simple sequence, ensure combination (user_id, session_id) is unique
primary key. If using UUID, each event gets correct session UUID (harder to test uniqueness without
listing all).
Session aggregation accuracy: For aggregated session table, check that session_duration =
session_end - session_start and that event_count matches the count of events assigned to
that session (consistency between detail and summary).
Multi-device scenario: If possible, test a scenario of one user with events interleaved from two
devices. Decide expected behavior (treat them as one interwoven session, or separate by device).
Ensure the solution aligns with expectation.
Success Criteria
•
•
•
Proper grouping: Events are grouped into sessions correctly: no session spans an idle period longer
than X minutes, and no events that are closer than X minutes apart are split into different sessions
27
.
Meaningful metrics: Derived metrics like session_length and events_per_session make sense (e.g.,
if a user was active sporadically over an hour with breaks <30min, it’s one session ~1 hour long).
Robust to data issues: Out-of-order events or slight timestamp irregularities are handled (for
example, if two events have the exact same timestamp and one was “lagged” incorrectly, the logic
still works because diff would be 0 which is < timeout).
25
•
•
Scalable: Can handle large volumes (billions of events) by partitioning by user or date as needed.
The pattern itself is implementable in SQL, but for huge data a distributed approach (Spark, etc.)
following the same logic is feasible.
No overlaps: A single event belongs to exactly one session for a given user. Sessions follow one after
another without overlap.
Example
User prompts:
/choose-pattern name=sessionization
events_table="app.events", user_key="user_id", event_ts="event_time",
session_timeout_minutes=30
Copilot returns: - A SQL query (as shown in the skeleton) or a dbt model that labels each event with a
session_id . - It might also provide a second query or model to aggregate sessions (with start, end,
count, duration). - Explanation that a session ends after 30 minutes of inactivity is included in comments. -
The user can then use the output to, say, calculate average session length or retention by session count.
### 5. Cohort Analysis
File: **`pattern-cohort-analysis.prompt.md`**
```markdown
---
title: "Cohort Analysis Generator"
intent: "Create cohort tables (e.g., monthly signup cohorts) and compute
retention over time for each cohort."
inputs:
- name: base_users
required: true
- name: user_id
required: true
- name: signup_date
required: true
- name: activity_table
required: true
- name: activity_date
required: true
- name: cohort_grain
required: false
assumptions: ["Cohort defined by first signup/purchase date", "Activity_table
records user activity (e.g., logins)"]
source_refs: ["handbook:analytics:cohort"]
26
---
# Problem
**Cohort analysis** groups users by their start period (e.g., signup month) and
tracks each group’s behavior over time 16
. A common metric is retention: what
percentage of a cohort is still active after N days/weeks/months. This pattern
helps answer questions like "What percent of January signups were active 3
months later?" It surfaces trends that aggregate metrics might hide (e.g.,
improving retention in newer cohorts vs older ones).
Challenges:
- Defining the cohort (usually by first activity date, but could be by first
purchase, etc.).
- Calculating retention properly (avoiding survivor bias by always referencing
18
the original cohort size ).
- Dealing with partial periods (the most recent cohorts haven’t had as much time
to retain – how to display their shorter observation period).
- Rolling vs fixed cohorts: e.g., monthly buckets vs weekly.
# Data Requirements
- **User base table**: `{{ base_users }}` with at least:
- `{{ user_id }}`: Unique user identifier.
- `{{ signup_date }}`: The date (or datetime) the user signed up (or whatever
cohort-defining action).
- **Activity table**: `{{ activity_table }}` with:
- `{{ user_id }}`: to link to base_users.
- `{{ activity_date }}`: dates of a recurring action of interest (e.g., login
date, purchase date).
- Define **cohort_grain** (if not provided, default to monthly). This means we
bucket `signup_date` into the start of the period (e.g., if monthly, cohort
label = first day of that month).
- We assume each user has one signup_date (first occurrence). If not, use
MIN(signup_date) per user to define cohort.
# Steps
1. **Define cohorts**: Create a dimension or mapping of each user to a cohort
label (e.g., `cohort_month = DATE_TRUNC('month', signup_date)`).
```sql
SELECT user_id, DATE_TRUNC('month', {{ signup_date }}) as cohort_month
FROM {{ base_users }};
```
(If `cohort_grain` is weekly, use week; if daily, the date itself.)
2. **Join activity**: Join the activity records to cohort info:
- Link `{{ activity_table }}` with the cohort mapping on user_id.
- Filter out activity that happened **before** the cohort start if needed
(usually, retention considers activity *after* the initial action; if signup is
the cohort, then any activity on the signup date could count as day 0 or might
be excluded if we want post-signup retention).
3. **Calculate retention periods**:
27
- Decide on the time buckets for measuring retention (e.g., 7-day, 30-day,
etc. or 1 month after, 2 months after).
- E.g., for monthly cohorts and monthly retention intervals: compute
difference in months between cohort_month and activity date.
- For daily retention: difference in days between signup_date and
activity_date.
- For N-day rolling retention (like 7-day retention often means user came
back at least once within 7 days of signup, 14-day means within 14 days, etc.):
- Define windows: activity_date <= signup_date + N days.
4. **Pivot or aggregate**:
- For each cohort and each period, determine number of users active.
- Approach:
- Start with cohort size = number of distinct users in each cohort.
- Then for each cohort, for each period X (day X, week X, month X), count
distinct users who had activity in that period.
- "Period X" typically means between X-1 and X months since signup for
monthly (for example, Month 3 retention = users active in the third month after
signup). For daily retention, Day 7 retention = users active on day 7 after
signup (or between day 7-13 depending on definition).
- Use a CASE WHEN or pivot logic. For SQL, maybe do:
```sql
SELECT cohort_month,
COUNT(DISTINCT user_id) as cohort_size,
COUNT(DISTINCT CASE WHEN MONTHS_BETWEEN(activity_date, cohort_month)
>= 0 AND MONTHS_BETWEEN(activity_date, cohort_month) < 1 THEN user_id END) as
month0_active, -- sign-up month
COUNT(DISTINCT CASE WHEN MONTHS_BETWEEN(activity_date, cohort_month)
>= 1 AND MONTHS_BETWEEN(activity_date, cohort_month) < 2 THEN user_id END) as
month1_active,
...
FROM cohort_users c
LEFT JOIN {{ activity_table }} a ON a.user_id = c.user_id
GROUP BY cohort_month;
```
Alternatively, use datediff for daily or weeks.
5. **Calculate retention rates**:
- For each cohort row, divide active counts by cohort_size to get percentage
retained.
- E.g., retention_month1 = month1_active / cohort_size.
- These are your retention curves per cohort.
6. **Format results**:
- Often present as a matrix: Cohort vs. period (e.g., rows = Jan, Feb, Mar
signups; columns = Month 0, Month 1, Month 2 retention, etc.), where values are
% or counts.
- We may output a flattened table or a pivoted format.
# SQL / ETL Skeleton
*(Example for monthly cohorts and monthly retention up to 3 months out)*
28
```sql
WITH cohorts AS (
SELECT
{{ user_id }} as user_id,
DATE_TRUNC('month', {{ signup_date }}) as cohort_month
FROM {{ base_users }}
),
activity AS (
SELECT
c.cohort_month,
a.{{ user_id }},
DATE_TRUNC('month', a.{{ activity_date }}) as activity_month,
MONTHS_BETWEEN(DATE_TRUNC('month', a.{{ activity_date }}), c.cohort_month)
as months_since_cohort
FROM cohorts c
LEFT JOIN {{ activity_table }} a
ON a.{{ user_id }} = c.user_id
AND a.{{ activity_date }} >= c.cohort_month -- ensure activity is on/after
cohort start
)
SELECT
cohort_month,
COUNT(DISTINCT user_id) as cohort_size,
COUNT(DISTINCT CASE WHEN months_since_cohort >= 0 THEN user_id END) as
month0_active,
COUNT(DISTINCT CASE WHEN months_since_cohort >= 1 THEN user_id END) as
month1_active,
COUNT(DISTINCT CASE WHEN months_since_cohort >= 2 THEN user_id END) as
month2_active,
COUNT(DISTINCT CASE WHEN months_since_cohort >= 3 THEN user_id END) as
month3_active
FROM activity
GROUP BY cohort_month
ORDER BY cohort_month;
(The above counts any user active in or after each month threshold. You might modify to count exactly in that
month interval or at least once by that month depending on definition.)
Idempotency & Backfills
•
•
Static cohorts: Once a user’s cohort is assigned (based on signup_date), it doesn’t change. So the
cohort assignment part is static and idempotent.
Activity linking: As long as the activity table is not double-counting, counting distinct users per
period is naturally idempotent (rerunning yields same counts).
29
•
•
•
Backfill: Typically you compute cohorts over a range (say last 12 months of signups) and their
retention to date. If new data arrives (e.g., more recent activity for those cohorts), rerun the
aggregation – it will update the later retention numbers.
This can be run as a snapshot on a schedule. Because each run recalculates retention up to now, it’s
fine. If you want to store historical retention snapshots (e.g., how retention looked after exactly 3
months vs after 6 months), that’s a more complex analysis (requires freezing data at certain points).
Late signups or activity: If some signups were not present initially (late data correction), their
cohort might be assigned later – but since we recompute, they’ll just appear in the appropriate
cohort when data is in. It’s more about data completeness.
Tests
•
•
•
•
•
Cohort sum check: Sum of all cohort_sizes should equal total users in base_users (assuming one
cohort per user).
Retention <= 100%: For each cohort and period, active count ≤ cohort_size. And retention rates ≤
1.0. (No cohort should have more active users than it started with – if so, likely a user without a valid
cohort or a join issue.)
Monotonic decay: Usually retention % should non-increase over periods (it can stay flat or drop, but
not rise, unless some users became active later for first time which is fine). Actually, retention
defined as “ever active by that time” will be non-decreasing counts (you accumulate more unique
users as time goes on, but the rate of “active by N” increases with N). If we define period-specific
(e.g., active in month N specifically), those can fluctuate. Clarify definition in tests.
Cohort consistency: Check a few random user_ids – verify their cohort assignment is correct (their
signup date bucket matches), and that if they have activity in later periods, they are counted
appropriately.
Recent cohort partial: The most recent cohort (say last month) won’t have data for 3 months out.
Make sure those fields are either null or zero or excluded. (Our query above counts them if
months_since_cohort >= 3, which for recent will be false so count=0, that’s fine.)
Success Criteria
•
•
•
•
•
Insightful output: We can clearly see retention curves by cohort. For instance, the output might
show January cohort 100% at month0 (by definition), 50% at month1, 30% at month3, etc., whereas
February cohort might have different percentages. This helps identify if newer cohorts are retaining
better or worse.
Survivorship bias avoided: We don’t mix cohorts together; each cohort’s retention is calculated out
of its own size 18
. This avoids the aggregate retention illusion where overall retention can look high
28
simply because older cohorts’ survivors dominate .
Accurate percentages: If the company defines “Day 7 retention” as “% of users active on day 7 or by
day 7”, the output matches that definition.
Dynamic: As more activity data comes in, the retention numbers for each cohort update accordingly
(e.g., a cohort’s 3-month retention might improve slightly if some stragglers came back in month 3).
Readable format: The results can be easily plotted (cohort vs retention curve) or read by non-
technical folks, typically as a matrix or chart.
30
Example
•
•
•
•
•
•
•
Cohort grain: monthly.
January 2025: 1000 users signed up.
By Feb 2025, 300 of those 1000 were active (at least once in Feb).
By Mar 2025, 200 of those original 1000 were active (in Mar).
The cohort table would show for Jan 2025: cohort_size=1000, month1_active=300 (30%),
month2_active=200 (20%).
Another row for Feb 2025 cohort, etc.
If user queries this pattern with:
/choose-pattern name=cohort-analysis
base_users="prod.users" user_id="user_id" signup_date="created_date"
activity_table="prod.logins" activity_date="login_date"
cohort_grain="month"
Copilot produces a SQL that aggregates users into monthly cohorts and their login rates in
subsequent months, plus perhaps a small note on interpreting the last column (which might be
partial).
### 6. Retention & Churn Metrics
File: **`pattern-retention-churn.prompt.md`**
```markdown
---
title: "Retention & Churn Metrics"
intent: "Compute key retention metrics (e.g., 7-day, 28-day retention) and
churn rates, while avoiding survivor bias."
inputs:
- name: activity_table
required: true
- name: user_id
required: true
- name: base_date
required: true
- name: retention_days
required: true
assumptions: ["Base_date is the reference (e.g., signup date or cohort
date)", "One record per user in activity_table indicating presence at
certain days"]
source_refs: ["handbook:analytics:retention"]
---
# Problem
**Retention metrics** measure how many users continue to be active after a
31
certain time since a starting point (often signup). Common metrics include
**N-day retention** (e.g., 7-day retention: % of new users who return
within 7 days) and rolling retention (e.g., 30-day rolling means active in
the last 30 days). **Churn** is the complement – the rate at which users
stop being active.
Pitfalls:
- **Survivor bias**: If you calculate overall active user % over time
without accounting by cohort, you might falsely see an increase simply
18
because only loyal users remain .
- Differences between **retention definitions**: “day 7 retention” could
mean user did something on day 7 exactly, or at least once in first 7 days;
be clear.
- Ensuring consistent denominator: typically the cohort size or active user
count at day 0.
- **Activity definition**: what counts as “active” (login, any action, a
specific action? define clearly).
# Data Requirements
- **Activity table**: `{{ activity_table }}` where each record indicates
user activity on a certain date. Could be raw events or a pre-aggregated
daily active flag.
- `{{ user_id }}` – user identifier.
- `{{ base_date }}` – typically the user’s start date (e.g. signup_date)
if calculating from start, or if computing rolling retention, base_date
could be a fixed point like a specific Monday.
- We might also need a field like `activity_date` if not computing from
`base_date` directly.
- If calculating retention from signup, you need the signup date per user
(like in cohort analysis). If just computing periodic retention of active
users, define the initial set (e.g., users active in week 0).
- `{{ retention_days }}`: list or single value of days to check, e.g. [7,
28] for 7-day and 28-day retention.
# Steps
1. **Define initial user set**: Decide who is in the base population for
retention:
- If cohort-based (like new users from a certain period), use that
cohort size.
- If overall retention of active users, maybe take all users active in a
specific week as baseline.
- Example: for weekly retention, baseline = users active at least once
in week 0.
2. **Calculate retention at N days**:
- For each user in baseline, check if they had activity N days from
their base_date.
- “Within N days” vs “on day N exactly”:
- If it's “at least once within N days”, then for 7-day retention for
32
a user with base_date Jan1, check activity from Jan2 to Jan8 inclusive.
- If “exactly on the Nth day” meaning at least once on that day (less
common definition), just check that date.
- One way: join the baseline users to the activity table with a
condition on date difference.
e.g. `WHERE activity_date <= base_date + INTERVAL '7' DAY` for within
7 days.
But careful not to count beyond if doing exactly on day 7.
- Alternatively, if data is daily flags, you could pivot each user’s
next few days into columns.
3. **Aggregate retention rate**:
- Count how many of the baseline users satisfied the N-day activity
condition.
- Retention% = that count / baseline count * 100.
- Do this for each N in `retention_days`.
- Similarly, churn rate for N days could be defined as 1 - retention (if
retention means active within N days after signup).
- Another churn metric: % of users who were active in last period but
not in current (like monthly churn).
4. **Rolling retention** (if needed):
- e.g., 30-day rolling retention often means “was the user active in the
last 30 days?” which is more of an active user metric than cohort
retention.
- If required, can compute for each day: what % of users active in
previous 30-day window were also active in the current 30-day window (this
is more advanced).
- Possibly skip if not asked explicitly.
5. **Output**:
- A simple table: e.g., columns: cohort (if applicable),
7_day_retention, 28_day_retention (in % or fraction).
- Or just overall metrics.
# SQL / ETL Skeleton
*(Example: retention from signup cohort, within 7 and 28 days)*
```sql
WITH cohort AS (
SELECT {{ user_id }}, {{ base_date }} as signup_date
FROM {{ activity_table }}
-- assume this table has one row per user with signup date
),
activity AS (
SELECT a.{{ user_id }}, a.activity_date, c.signup_date
FROM user_activity a
JOIN cohort c ON a.{{ user_id }} = c.{{ user_id }}
)
SELECT
100.0 * COUNT(DISTINCT CASE
33
DAY
WHEN activity_date <= signup_date + INTERVAL '7'
AND activity_date > signup_date
THEN activity.{{ user_id }} END
) / COUNT(DISTINCT cohort.{{ user_id }}) AS retention_7d,
100.0 * COUNT(DISTINCT CASE
'28' DAY
WHEN activity_date <= signup_date + INTERVAL
AND activity_date > signup_date
THEN activity.{{ user_id }} END
) / COUNT(DISTINCT cohort.{{ user_id }}) AS retention_28d
FROM cohort
LEFT JOIN activity
ON cohort.{{ user_id }} = activity.{{ user_id }}
;
(This calculates “% of users who returned within 7 days” and within 28 days. It assumes the presence of at least
one activity on days 1-7 means retained at 7d.)
Idempotency & Backfills
•
•
•
•
The computations are straightforward aggregations – running them multiple times yields the same
result, given the same underlying data.
If new data arrives (e.g., more activity logs come in for that cohort beyond what was initially
available), the retention metrics can be updated – which is expected behavior (they typically stabilize
after enough time).
There’s not usually a concept of incremental processing here; you usually recompute retention
periodically (like each day or week for recent cohorts).
• 18
Survivor bias: The method inherently avoids it by always anchoring to the original cohort count .
We do not remove churned users from the denominator over time.
For churn rates (if we compute monthly churn, etc.), similar logic applies: define denominator and
numerator clearly.
Tests
•
•
•
Retention 0-day: If we define retention at 0 days as 100% (since on day 0 all users are present by
definition), verify that calculation yields 100%. (Often we don’t bother outputting 0-day since it’s
trivial.)
Retention monotonic decrease: If we are measuring “% active within N days”, that percentage
should be non-decreasing as N increases (e.g., 28-day >= 7-day, because the longer window includes
those who came back later). Our query above was structured as separate counts, but effectively 28-
day window includes 7-day window. Check that property holds in results (if not, likely a bug in logic).
Churn vs retention consistency: If churn = 1 - retention for a given period, ensure that matches
(and churn is presented as appropriate %).
34
•
•
Data cutoff: For very recent signups, a 28-day retention might not have full data (e.g., users signed
up yesterday obviously can’t have 7-day retention yet). In those cases, some analyses exclude the
most recent cohort for long retention. If our query includes them, their 7-day retention would
appear artificially 0% (no one had chance). One might test and possibly filter cohorts that don’t have
full N-day observation window yet, depending on usage.
Distinct user count: ensure no user is double-counted in numerator for each metric. (We used
DISTINCT per CASE, which is a trick: better approach might be separate subqueries for each
retention then join, to avoid double counting complexities.)
Success Criteria
•
•
•
•
•
•
Clarity: We get clear numbers like “7-day retention = 25%” meaning 25% of new users return within
a week. These should align with business’s known metrics.
No bias: We always divide by the initial cohort count, not the remaining active users, thereby
18
avoiding survivor bias in interpretation .
Comparability: We can compare retention over different timeframes or different cohorts if broken
down, and it makes sense. For example, if we break by signup month, the 7-day retention of January
vs February can be compared.
Actionable: Knowing these metrics, the team can aim to improve them or investigate drops. (E.g., if
1-day retention is low, onboarding might need improvement.)
Timely calculation: It should be easy to recompute these as new data comes in (like each day
update the values for recent cohorts or overall).
The queries run efficiently using proper filtering and indexing (especially if doing large joins between
activities and cohorts).
Example
If retention_days=[7, 30] : - For users who signed up on 2025-01-01: suppose out of 100, 30 logged in
again by Jan 7 -> 7-day retention = 30%. By Jan 31, a total of 45 logged in at least once -> 30-day retention =
45%. - The prompt output would likely be a small table: maybe each row is a cohort or overall, with columns
retention_7d, retention_30d (0.30 and 0.45 or 30 and 45%). - If the user asked specifically for churn:
it could also output churn = 70% at 7d, 55% at 30d for that cohort. - The user could prompt:
/choose-pattern name=retention-churn
activity_table="analytics.logins_daily" user_id="user_id"
base_date="signup_date" retention_days=[7,30]
and get SQL for those calculations and guidance to interpret the results (like cautioning about incomplete
data for recent signups).
### 7. Customer Lifetime Value (LTV)
File: **`pattern-customer-ltv.prompt.md`**
35
```markdown
---
title: "Customer Lifetime Value (LTV) Estimator"
intent: "Compute customer lifetime value based on historical purchase data,
optionally considering contribution margin and churn."
inputs:
- name: orders_table
required: true
- name: customer_id
required: true
- name: order_date
required: true
- name: order_amount
required: true
- name: margin_percent
required: false
assumptions: ["orders_table has all transactions per customer", "order_amount is
revenue per order", "margin_percent if given filters to profit contribution"]
source_refs: ["handbook:analytics:ltv"]
---
# Problem
**Customer Lifetime Value (LTV)** is the total revenue (or profit) a business
can expect from a customer over their entire relationship. Calculating LTV helps
inform marketing spend, retention efforts, etc. The simplest form is sum of a
customer’s purchases. More advanced: projecting future purchases or factoring in
gross margin and discount rate (for present value). This pattern focuses on
historical LTV from data.
Considerations:
- Do we include **only completed sales** or also expected future value? (Often
for simplicity use historical or assume some retention model for future.)
- If including **margin**, multiply revenue by margin% to get profit
contribution.
- Handle **censoring**: if customers are still active, their true lifetime isn’t
over 20
. So any sum is a lower bound of LTV; could note that these customers are
“censored” (haven’t churned yet).
- If needed, incorporate churn probability to predict remaining value (requires
more complex survival analysis).
- For cohorts, sometimes LTV is given per cohort average rather than per user.
# Data Requirements
- **Orders table**: `{{ orders_table }}` with:
- `{{ customer_id }}` – customer identifier.
- `{{ order_date }}` – date of order.
- `{{ order_amount }}` – monetary value of the order (revenue).
- If `margin_percent` provided (e.g., 0.3 for 30% margin), we will multiply
order_amount by this to estimate profit per order.
- Ensure data covers enough history. If customers have subscription or recurring
36
revenue beyond timeframe, true LTV would be higher than captured.
# Steps
1. **Aggregate spend per customer**:
- Sum up `order_amount` for each `customer_id` (optionally apply
`margin_percent` if focusing on profit LTV).
- That gives each customer’s total historical revenue.
2. **Count time span or last order** (optional):
- It can be useful to note the customer’s first and last purchase dates and
count of orders. E.g., how long they’ve been a customer. If a customer’s last
order was recent, they may not be churned yet.
3. **Average LTV (optional)**:
- Compute average LTV per cohort or overall. Sometimes people report “The
average 12-month LTV for 2020 signups is $X”.
- But careful: average can be skewed by big spenders.
4. **Identify active vs churned customers**:
- If possible, define churned: e.g., no purchases in last 12 months =
considered churned. This helps separate completed lifetimes vs ongoing.
- For active (not churned) customers, their LTV is **censored** (will likely
grow further).
- Could label or separate them.
5. **Optional prediction**:
- We won’t go deep, but note: advanced LTV would fit a retention curve or use
a model (like Pareto/NBD or survival analysis 29 20
) to project future spend.
This pattern will highlight historical and maybe a simple extrapolation (like
assume churn at a certain rate, etc. if needed).
6. **Output**:
- A table of customers with columns: customer_id, total_revenue, maybe
total_margin, first_order_date, last_order_date, order_count.
- Or aggregate results like average LTV per segment.
# SQL / ETL Skeleton
```sql
SELECT
{{ customer_id }},
COUNT(*) AS order_count,
MIN({{ order_date }}) AS first_order_date,
MAX({{ order_date }}) AS last_order_date,
SUM({{ order_amount }}
${ margin_percent | default(NULL) ? '* ' + margin_percent : ''}
) AS total_value
FROM {{ orders_table }}
GROUP BY {{ customer_id }};
(If margin_percent is provided, multiply accordingly. The above yields total revenue or profit per customer.)
If we wanted to compute average by cohort of first_order_year:
37
SELECT DATE_TRUNC('year', first_order_date) as cohort_year,
AVG(total_value) as avg_LTV,
AVG(order_count) as avg_orders,
COUNT(DISTINCT customer_id) as customers
FROM ( subquery_above )
GROUP BY cohort_year;
Idempotency & Backfill
•
•
•
•
Summing orders is inherently idempotent. Running the aggregation twice on the same data yields
identical results.
If orders data updates (e.g., late refunds or cancellations might adjust order_amount), the next run
will reflect that because it’s a SUM – ideally handle refunds as negative amounts so LTV can decrease
if a customer refunded (non-monotonic LTV in such case, which is acceptable).
Censoring: Recognize that some customers are still active. LTV for them is “so far”. This pattern’s
output should ideally mark that or at least caution in documentation.
Backfill: If using this to monitor LTV over time (say compute every month for new customers), you
might snapshot the results periodically. But the query itself can be run historically by filtering
first_order_date to a range.
Tests
•
•
•
•
•
•
•
•
Sum check: The sum of all customers’ total_value should equal the sum of order_amount in
the whole table (if margin not applied). If margin applied, then sum of total_value = margin_percent
* sum(order_amount) globally.
No negative LTV: Unless refunds make negative, normally all totals should be >= 0. Flag any
negative total_value (could indicate an error or a customer who only refunded and never purchased).
Censoring logic: If labeling active vs churned:
Define churn criterion (like no orders in last 1 year).
Test that any customer labeled churned indeed has last_order_date older than 1 year, and any
labeled active has a purchase within year.
Averages vs raw: If computing average LTV, ensure it matches the raw data division. E.g., total
revenue / number of customers = average LTV across all customers (weighted by customers).
Margin application: If margin_percent given, verify one sample manually: e.g., if a customer spent
$100 and margin_percent 0.3, total_value = 30.0 for that customer.
Correct grouping: Ensure each customer_id appears exactly once in output (primary key test on
customer_id of result).
Success Criteria
•
•
Complete view per customer: We have a reliable total spend (and profit) for each customer.
Business interpretation: This can feed into identifying top customers (highest LTV) and overall
average LTV.
38
•
•
•
•
•
For example, if we find average LTV is $500, marketing can use that to determine customer
acquisition cost limits.
Handles edge cases: Customers with a single order, customers with many orders, customers with
refunds – all properly reflected.
Censored awareness: The output or documentation should note that customers with recent activity
may have more lifetime value to come 20
. This sets expectation that true LTV might be higher than
observed for those still active.
If needed, one could incorporate a simple churn assumption: e.g., if 20% annual churn, expected
additional value = current value * (some factor). But that’s outside scope here, would be documented
if needed.
Up-to-date: By re-running periodically, it always reflects latest data (idempotent and refreshable).
Example
If margin_percent is not provided, we compute raw revenue LTV. E.g., for customer 123: - 5 orders
totaling $1000 from Jan 2020 to Jun 2021. - Output: customer_id=123, order_count=5, total_value=1000,
first_order_date=2020-01-10, last_order_date=2021-06-05. If margin_percent=0.3 , total_value would be
$300 (assuming margin on revenue). We might prompt:
/choose-pattern name=customer-ltv
orders_table="sales.orders" customer_id="customer_id" order_date="order_date"
order_amount="total_price" margin_percent=0.3
Copilot produces a SQL that aggregates total_price per customer *0.3, effectively giving lifetime gross profit
per customer. It might also give a small note: “Customers with recent last_order_date might still increase in
value; consider them active.”
### 8. Attribution (Multi-Touch Marketing Attribution)
File: **`pattern-attribution.prompt.md`**
```markdown
---
title: "Marketing Attribution Model"
intent: "Distribute conversion credit across marketing touchpoints (first-touch,
last-touch, linear, or time-decay models)."
inputs:
- name: touchpoints_table
required: true
- name: user_id
required: true
- name: touchpoint_time
required: true
- name: channel
required: true
39
- name: conversion_table
required: true
- name: conversion_time
required: true
- name: attribution_model
required: true
assumptions: ["Each user has a sequence of channel touchpoints leading to a
conversion", "conversion_table has one row per conversion with user_id and
time"]
source_refs: ["handbook:analytics:attribution"]
---
# Problem
When a user converts (makes a purchase or signs up), **which marketing channel
gets credit?** Attribution models assign credit across multiple touchpoints:
21
- *First-touch*: 100% credit to the first channel that acquired the user .
22
- *Last-touch*: 100% to the last channel before conversion .
- *Linear*: spread evenly across all touches.
23
- *Time-decay*: more credit to touches closer in time to conversion .
- *U-shaped (position-based)*: e.g., 40% first, 40% last, 20% distributed to
30
middle touches .
This pattern calculates attribution based on a chosen model.
Challenges:
- **Data requirement**: Need a list of all touchpoints (ad impressions, clicks,
etc.) per user leading up to conversion, and the conversion event.
- **Path definition**: Define the window: do we consider all touches in the 30
days before conversion? Or unlimited history? Typically limit to a campaign
window.
- **Multiple conversions**: If user converts multiple times, sometimes
attribution is done per conversion (each conversion gets its own credit
assignment).
- **Channel hierarchy**: Ensure channel names or IDs are consistent.
- **Fractional credit**: The output often is fractional credit per channel per
conversion, which can sum up.
# Data Requirements
- **Touchpoints table**: `{{ touchpoints_table }}`:
- `{{ user_id }}`: who experienced the touch.
- `{{ touchpoint_time }}`: timestamp of the marketing touch (ad view, click,
etc.).
- `{{ channel }}`: which channel or campaign (e.g., “Email”, “Facebook Ad
123”, etc.).
- **Conversion table**: `{{ conversion_table }}`:
- `{{ user_id }}`: who converted.
- `{{ conversion_time }}`: timestamp of conversion event (purchase, signup).
- We will link touches to conversions by `user_id` and considering only touches
before the conversion time (possibly within a certain lookback window if
40
needed).
- `{{ attribution_model }}`: a parameter like "first-touch", "last-touch",
"linear", "time-decay", "u-shaped". We will implement accordingly.
# Steps
1. **Prepare sequences**:
- For each conversion (each user_id in conversion_table, possibly each
conversion if multiple per user), gather that user’s all touchpoints prior to
the conversion_time.
- Example approach: join touchpoints to conversions on user_id with
`touchpoint_time < conversion_time`.
- If multiple conversions per user, one might restrict to touches between the
previous and current conversion, or treat them independently (depends on
business logic).
2. **Determine credit allocation**:
- If `first-touch`: find the earliest touchpoint_time among those, that
channel gets 100% for that conversion.
- If `last-touch`: find the latest touchpoint before conversion, give that
channel 100%.
- If `linear`: each touch in the path gets equal credit (so if 4 touches,
each gets 0.25 credit).
- If `time-decay`: assign weights increasing with recency. E.g., use an
exponential decay: weight = 2^(-Δt). Or a simpler: assign more weight to last,
less to first. (We define a simple method: e.g., if 3 touches, give 60% to last,
30% to first, 10% if there are middle touches distributed – or actually time-
decay usually continuous).
- If `u-shaped`: give fixed % to first and last (commonly 40% each) and split
30
remaining among middle touches .
3. **Compute contributions**:
- For each conversion, create records for each channel with its share of
credit.
- E.g., output columns: conversion_id (or user+conversion_time), channel,
credit (in fraction or points).
- If linear: all records will sum to 1 per conversion. If first/last: one
record with 1.0 credit, others 0 (often we would just output the one with
credit).
4. **Aggregate (if needed)**:
- Sum credit by channel over all conversions to see total credit per channel.
- This gives how many conversions each channel is credited with (can be
fractional).
5. **Attribution window**:
- Possibly limit to touches within X days before conversion. If required,
filter touchpoints to `touchpoint_time >= conversion_time - interval X`.
- If not specified, assume all prior touches count.
# SQL / ETL Skeleton
*(Pseudo-SQL for first, last, linear as examples; time-decay and u-shaped may
require custom logic in code or advanced SQL window.)*
41
First-touch example:
```sql
WITH conv AS (
SELECT c.{{ user_id }}, c.{{ conversion_time }},
MIN(t.{{ touchpoint_time }}) AS first_touch_time
FROM {{ conversion_table }} c
JOIN {{ touchpoints_table }} t
ON c.{{ user_id }} = t.{{ user_id }}
AND t.{{ touchpoint_time }} < c.{{ conversion_time }}
GROUP BY c.{{ user_id }}, c.{{ conversion_time }}
),
attribution AS (
SELECT
c.{{ user_id }}, c.{{ conversion_time }},
t.{{ channel }},
CASE
WHEN t.{{ touchpoint_time }} = conv.first_touch_time THEN 1.0
ELSE 0.0
END as credit
FROM {{ conversion_table }} c
JOIN {{ touchpoints_table }} t
ON c.{{ user_id }} = t.{{ user_id }}
AND t.{{ touchpoint_time }} < c.{{ conversion_time }}
JOIN conv
ON c.{{ user_id }} = conv.{{ user_id }} AND c.{{ conversion_time }} = conv.
{{ conversion_time }}
)
SELECT channel, SUM(credit) as total_conversions_attributed
FROM attribution
GROUP BY channel;
Last-touch would be similar but using MAX instead of MIN for last_touch_time and condition
WHEN t.time = last_touch_time THEN 1.
Linear example:
WITH touch_count AS (
SELECT c.{{ user_id }}, c.{{ conversion_time }},
COUNT(*) as touch_before_conv
FROM {{ conversion_table }} c
JOIN {{ touchpoints_table }} t
ON c.{{ user_id }} = t.{{ user_id }}
AND t.{{ touchpoint_time }} < c.{{ conversion_time }}
GROUP BY c.{{ user_id }}, c.{{ conversion_time }}
)
42
SELECT t.{{ channel }},
SUM(1.0/tc.touch_before_conv) as total_conversions_attributed
FROM {{ conversion_table }} c
JOIN {{ touchpoints_table }} t
ON c.{{ user_id }} = t.{{ user_id }}
AND t.{{ touchpoint_time }} < c.{{ conversion_time }}
JOIN touch_count tc
ON c.{{ user_id }}=tc.{{ user_id }} AND c.{{ conversion_time }}=tc.{{
conversion_time }}
GROUP BY t.{{ channel }};
(This divides one conversion evenly among all its touches. If a conversion had 4 touches, each channel involved
gets 0.25 added. Summing by channel yields total fractional conversions.)
Time-decay and U-shaped might require enumerating touches per conversion with an index or time
difference and then applying weights. That can be done with window functions but is more complex; might
do in Python if not in SQL.
Idempotency & Assumptions
•
•
•
•
•
•
•
The logic assumes we have complete data of touchpoints up to conversion. If data is updated (e.g., a
missing touchpoint is added later), attribution can change. But running the pattern on the same
static dataset is deterministic.
We assume one conversion per user for simplicity. If multiple:
Could treat each conversion independently (likely better to restrict to first conversion per user or a
time window).
Another approach is to consider multi-conversion paths (not covered here).
Double counting: ensure each conversion’s credit sums to 1 (or 100%). Our linear and first/last logic
did that. For time-decay, we’d normalize weights to sum to 1 per conversion too.
Bias: All models have biases (first vs last vs multi). The user should choose attribution_model
based on need. We provide the mechanism.
Attribution timeframe: If not stated, possibly assume all historical touches count. In reality, might
set a cap (e.g., only touches in 30 days pre-conversion count). The pattern can be adjusted easily by
filtering on touchpoint_time relative to conversion_time.
Tests
•
•
•
Credit sum per conversion: For each conversion event, the sum of credit assigned across channels
= 1. Test by grouping by conversion (user_id+conversion_time) in the attribution output.
First/Last uniqueness: In first-touch model, exactly one channel gets credit 1 for a conversion.
Ensure in the intermediate attribution table, for each conversion there is one row credit=1, rest 0.
(We might choose to output only the one with 1 and drop the 0 ones to simplify.)
Consistency: If using first-touch, compare total attributions to number of conversions (should match
exactly since each conversion gives exactly 1 credit to one channel). For linear, total sum of all
channels should equal total number of conversions as well (distributed).
43
•
•
•
Time ordering: Check that for last-touch, the channel credited is indeed the max timestamp. For
first-touch, the min. (This might require inspecting a few samples.)
Empty touches: If a conversion had no preceding touchpoints (user came organically or data
missing), our queries might give that conversion no credit assigned (or exclude it). We should decide:
either drop those conversions or assign them to an “Organic/None” channel. Possibly add logic: if no
touch, assign "Direct/Organic" credit. In tests, identify if any conversion was left out (to avoid losing
conversions in totals).
Time-decay weight correctness: If implemented, check that more recent touch indeed got larger
weight than older. And sum=1.
Success Criteria
•
•
•
•
•
•
Complete attribution: Every conversion is accounted for and credit is fully assigned to channels. No
conversion is double-counted or unaccounted.
Meaningful results: The output reflects known patterns. E.g., if we run last-touch on known data, it
matches what marketing team expects (like they often manually attribute last click).
Flexibility: Changing the attribution_model input easily switches logic without needing an
entirely different pipeline.
No channel over-credit: If one user had multiple conversions, our method potentially credits
multiple conversions to the same earlier touch if not careful. Typically, each conversion should only
credit touches before that conversion, so it’s fine.
If doing cumulative results, each channel’s total credited conversions (maybe fractional) can be
compared to actual conversion count. The sum across channels should equal total conversions
count.
Documentation: The method of attribution is clearly documented so stakeholders know how to
interpret (especially important for time-decay or U-shaped specifics).
Example
Suppose: - User A: came via Google (Day 1), then Email (Day 3), then converted (Day 5). - User B: came direct
(no campaign) on Day 2, converted Day 2. If using first-touch: Google gets credit for User A’s conversion,
“Direct/None” for User B. If last-touch: Email gets credit for A, Direct for B. If linear: Google 0.5 and Email 0.5
for A, Direct 1 for B. Our pattern would output channel attribution sums accordingly. A user prompt:
/choose-pattern name=attribution
touchpoints_table="marketing.touches" user_id="user_id" touchpoint_time="ts"
channel="channel"
conversion_table="sales.conversions" conversion_time="purchase_time"
attribution_model="last-touch"
Copilot returns a SQL or pseudo-SQL that: - Joins touches to conversions per user, - Identifies the last touch
per conversion, - Sums up credit per channel. And likely notes something like “touches with no prior
channel might be labeled as 'Direct'.”
44
1 2 4 5 7 11
GitHub - github/awesome-copilot: Community-contributed instructions, prompts, and
configurations to help you make the most of GitHub Copilot.
https://github.com/github/awesome-copilot
3 6 12 13
GitHub - dfinke/awesome-copilot-chatmodes: Custom chatMode.md personas for GitHub
Copilot — specialize your VS Code with AI assistants for testing, security, clean‑code refactoring,
dashboards, prompt design, and more. Just drop in and select your mode.
https://github.com/dfinke/awesome-copilot-chatmodes
8 9 25 26
Data Modeling — Slowly Changing Dimensions and Idempotency | by Priyanka Lakur
Krishnamurthy | Medium
https://medium.com/@priyankalakur/data-modeling-slowly-changing-dimensions-and-idempotency-c095252c9103
10
MAD anomaly detection
https://crispinagar.github.io/blogs/mad-anomaly-detection.html
14
Part- I: Trustworthy Online Controlled Experiments — A/B Testing — Twyman’s Law | by Deepti Goyal |
Medium
https://medium.com/@deepti.agl16/part-i-trustworthy-online-controlled-experiments-a-b-testing-twymans-law-7dc5032073c7
15
What we learned from running 200+ experiments on CUPED | Kameleoon
https://www.kameleoon.com/blog/cuped
16 17 18 19 28
Retention Metrics 101: The Survivor Bias and Cohort Retention
https://www.retentionledgrowth.com/p/retention-metrics-101-the-survivor
20 29
Customer Lifetime Value: How to Avoid Common Pitfalls and Build Smarter Metrics
https://www.strong.io/blog/customer-lifetime-value-avoid-common-pitfalls-and-build-smarter-metrics
21 22 23 30
Multi-Touch Attribution: What it is, Models, & More | Marketing Evolution
https://www.marketingevolution.com/marketing-essentials/multi-touch-attribution
24
Funnel Analysis
https://dataforest.ai/glossary/funnel-analysis
27
Time Window - RisingWave: Real-Time Event Streaming Platform
https://risingwave.com/glossary/time-window/
45