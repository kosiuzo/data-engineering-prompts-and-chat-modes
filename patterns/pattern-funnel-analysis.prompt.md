---
description: "Generate a robust, idempotent funnel conversion table with clear step logic and tests."
mode: "agent"
model: "GPT-4o"
tools: ["codebase"]
---

# Funnel Analysis Builder

Generate a robust, idempotent funnel conversion table with clear step logic and tests.

# Problem
Track how users progress through a sequence of events (a **funnel**), and where they drop off. Funnel analysis helps identify bottlenecks by examining step-by-step conversion rates. Key challenges include handling users who skip steps, re-enter funnels, or events arriving out of order.

Common pitfalls:
- Not accounting for users repeating an earlier step (re-entry).
- Strict vs. loose ordering confusion (must steps happen in exact order, or can steps be completed in any sequence?).
- Late events arriving after analysis window (can affect counts).

# Data Requirements
- **Source events table**: `${input:events_table }` with at least:
- `{user_key}` – unique user identifier (e.g. user_id).
- `event_name` – categorical, e.g. "view_product", "add_to_cart".
- `event_timestamp` – when the event occurred.
- Ensure all funnel **step names** (in `${input:steps }` list) correspond to possible `event_name` values.
- Each user can trigger steps multiple times – decide whether to count only the first attempt or all funnel entries.

# Steps
1. **Filter timeframe** – Limit events to a recent window (e.g. last N days = `${input:lookback_window|default(90) }` days) to focus on relevant data.
2. **Step tagging** – Among the filtered events, mark the first occurrence timestamp of each funnel step for each user. This often uses window functions or self-joins:
- For each user, find the earliest `event_timestamp` of the first step (`steps[0]`), call it `step1_ts`.
- Then for step 2, find the earliest timestamp where `event_name = steps[1]` **and** `timestamp >= step1_ts` (if strict ordering) or simply after (if loose ordering).
- Continue for all steps.
3. **Re-entry logic** – If a user completes the funnel (all steps) and then triggers step1 again, decide whether to count a new funnel entry. (Often funnels count a user only in their first pass. Optionally handle re-entry if needed by treating subsequent occurrences as separate funnel journeys.)
4. **Assemble funnel table** – Create one output record per user (or per user per funnel attempt) with columns: `user_id`, timestamp for each step (nullable if not reached), and a boolean or step count indicating where the user dropped off.
5. **Calculate metrics** – Compute aggregate funnel metrics:
- Number of users at each step,
- Conversion rate from step *i* to *i+1* (e.g. what percent of those who did step1 also did step2, etc.).
- Overall conversion (from step1 to final step).
6. **Output** – Typically two outputs: (a) a detailed table of user-step timestamps, and (b) a summary table of funnel counts & conversion rates.

# SQL / ETL Skeleton
```sql
WITH base_events AS (
SELECT
${input:user_key } AS user_id,
event_name,
event_timestamp
FROM ${input:events_table }
WHERE event_timestamp >= DATEADD(day, -${input:lookback_window|default(90) }, CURRENT_DATE)
),
steps AS (
SELECT
user_id,
-- Earliest time of step1
MIN(CASE WHEN event_name = '${input:steps[0] }' THEN event_timestamp END) AS step1_ts,
-- Earliest time of step2 after step1
MIN(CASE
WHEN event_name = '${input:steps[1] }'
AND event_timestamp >= ${input:"step1_ts" if strict_ordering else "step1_ts /* loose: ignore ordering in this example */" }
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
```
(The SQL above outlines a pattern: adjust for your SQL dialect and indexing of steps. For loose ordering, remove the timestamp condition between steps or implement differently.)

# Idempotency & Backfills
This funnel model should be idempotent. Use the event timestamp as a natural incremental watermark: 
- For incremental loads, process new events where event_timestamp is greater than the max seen timestamp in previous runs. 
- Keep the last few days of events (late arrivals) in each run to catch any stragglers; e.g., always reprocess the trailing 1-2 days even if they were processed before (to include late events). 
- Avoid double counting: if a user's events were already processed and they haven't done new funnel steps, ensure not to duplicate them in output.

For backfills (recomputing older periods), parameterize the date range (lookback_window or explicit start/end dates). Because the process is idempotent and uses min timestamps per user, rerunning for overlapping windows will yield the same result for that period.

# Tests
Key tests for a funnel model: 
- Not null: All output rows should have a non-null user_id. Each funnel step timestamp column can be null (if user didn't reach that step), but check that if e.g. step3_ts is not null then step2_ts is not null (no skipping backwards). 
- Step ordering: Ensure step1_ts <= step2_ts <= ... <= stepN_ts for each user (monotonic non-decreasing timestamps). Violations could indicate the logic didn't enforce order properly. 
- Unique users: If output is one row per user, verify primary key uniqueness on user_id. 
- Conversion counts: Basic sanity checks on metrics, e.g. stepN count ≤ step1 count (never have more completions than starters).

# Success Criteria
- Complete funnel metrics: You can accurately report how many users dropped off at each stage and the conversion rates between stages.
- Reproducible results under late data: If events come in late (e.g. yesterday's events arriving today), rerunning the pipeline updates the funnel counts correctly without duplicating or missing users.
- No double-counting: Each user is counted at the furthest step they reached, and only once per funnel run.
- Test suite passes: All the above tests (no null user_ids, correct ordering, etc.) pass, giving confidence in the model's integrity.

# Example
User Input (in Copilot Chat):
/choose-pattern name=funnel
events_table = "analytics.events"
user_key = "account_id"
steps = ["view_product", "add_to_cart", "checkout", "purchase"]
strict_ordering = true

Copilot (Analytics Patterns Architect) would then generate: 
- A SQL model funnel_analysis.sql implementing the above logic for the analytics.events table. 
- A summary of funnel conversion rates for each step (e.g. "1000 users viewed product, 250 purchased, 25% overall conversion"). 
- Data tests, e.g., a dbt test YAML ensuring account_id is unique and not null, and custom tests for timestamp ordering between steps.


## Requirements
- Follow data engineering best practices
- Include comprehensive error handling
- Optimize for performance and scalability
- Use appropriate tools and frameworks
- Ensure code is production-ready