---
name: "Analytics Patterns SQL & Modeling Guide"
globs: ["models/**/*.sql", "snapshots/**/*.sql", "models/**/*.yml"]
rules:
  - "Define grain & business keys explicitly in model docs (YML)."
  - "All pattern models must be incremental or use merging with **deterministic keys**."
  - "Use event time **watermarks** + a late-arrival allowance for any incremental loads; avoid unlimited lookback."
  - "For funnel models: enforce declared step order (strict vs loose) and document re-entry logic."
  - "For SCD Type 2: use `effective_from`, `effective_to`, `is_current` fields with non-overlapping intervals (no duplicate current rows)."
  - "For sessionization: specify inactivity threshold (e.g., 30min) and how to break ties for concurrent sessions."
  - "Cumulative fact tables must state their restatement policy (full rebuild vs rolling window) in comments."
  - "Add tests for each pattern: primary key uniqueness, referential integrity, and any business-specific rules."
autofix_hints: true
---

How it works: When editing a SQL model, these instructions remind the user to follow best practices. For example, if the user forgets to include an is_current flag in an SCD Type 2 model, Copilot will prompt them (as per the rule) to add it so that historical records have a clear end date. If a funnel model's SQL doesn't enforce step ordering, it will hint to incorporate that logic. The instructions effectively encode the acceptance criteria of each pattern (like idempotency, watermark for late data, no full deletes for backfill, etc.) so that the generated pipelines are robust.
