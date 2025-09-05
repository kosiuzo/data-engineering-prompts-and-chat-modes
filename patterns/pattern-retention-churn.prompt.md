---
description: "Compute key retention metrics (e.g., 7-day, 28-day retention) and churn rates, while avoiding survivor bias."
mode: "agent"
model: "GPT-4o"
tools: ["codebase"]
---

# Retention & Churn Metrics

Compute key retention metrics (e.g., 7-day, 28-day retention) and churn rates, while avoiding survivor bias.

# Problem
**Retention metrics** measure how many users continue to be active after a certain time since a starting point (often signup). Common metrics include **N-day retention** (e.g., 7-day retention: % of new users who return within 7 days) and rolling retention (e.g., 30-day rolling means active in the last 30 days). **Churn** is the complement – the rate at which users stop being active.

Pitfalls:
- **Survivor bias**: If you calculate overall active user % over time without accounting by cohort, you might falsely see an increase simply because only loyal users remain.
- Differences between **retention definitions**: "day 7 retention" could mean user did something on day 7 exactly, or at least once in first 7 days; be clear.
- Ensuring consistent denominator: typically the cohort size or active user count at day 0.
- **Activity definition**: what counts as "active" (login, any action, a specific action? define clearly).

# Data Requirements
- **Activity table**: `${input:activity_table }` where each record indicates user activity on a certain date. Could be raw events or a pre-aggregated daily active flag.
- `${input:user_id }` – user identifier.
- `${input:base_date }` – typically the user's start date (e.g. signup_date) if calculating from start, or if computing rolling retention, base_date could be a fixed point like a specific Monday.
- We might also need a field like `activity_date` if not computing from `base_date` directly.
- If calculating retention from signup, you need the signup date per user (like in cohort analysis). If just computing periodic retention of active users, define the initial set (e.g., users active in week 0).
- `${input:retention_days }`: list or single value of days to check, e.g. [7, 28] for 7-day and 28-day retention.

# Steps
1. **Define initial user set**: Decide who is in the base population for retention:
- If cohort-based (like new users from a certain period), use that cohort size.
- If overall retention of active users, maybe take all users active in a specific week as baseline.
- Example: for weekly retention, baseline = users active at least once in week 0.

2. **Calculate retention at N days**:
- For each user in baseline, check if they had activity N days from their base_date.
- "Within N days" vs "on day N exactly":
- If it's "at least once within N days", then for 7-day retention for a user with base_date Jan1, check activity from Jan2 to Jan8 inclusive.
- If "exactly on the Nth day" meaning at least once on that day (less common definition), just check that date.
- One way: join the baseline users to the activity table with a condition on date difference.
e.g. `WHERE activity_date <= base_date + INTERVAL '7' DAY` for within 7 days.
But careful not to count beyond if doing exactly on day 7.
- Alternatively, if data is daily flags, you could pivot each user's next few days into columns.

3. **Aggregate retention rate**:
- Count how many of the baseline users satisfied the N-day activity condition.
- Retention% = that count / baseline count * 100.
- Do this for each N in `retention_days`.
- Similarly, churn rate for N days could be defined as 1 - retention (if retention means active within N days after signup).
- Another churn metric: % of users who were active in last period but not in current (like monthly churn).

4. **Rolling retention** (if needed):
- e.g., 30-day rolling retention often means "was the user active in the last 30 days?" which is more of an active user metric than cohort retention.
- If required, can compute for each day: what % of users active in previous 30-day window were also active in the current 30-day window (this is more advanced).
- Possibly skip if not asked explicitly.

5. **Output**:
- A simple table: e.g., columns: cohort (if applicable), 7_day_retention, 28_day_retention (in % or fraction).
- Or just overall metrics.

# SQL / ETL Skeleton
*(Example: retention from signup cohort, within 7 and 28 days)*
```sql
WITH cohort AS (
SELECT ${input:user_id }, ${input:base_date } as signup_date
FROM ${input:activity_table }
-- assume this table has one row per user with signup date
),
activity AS (
SELECT a.${input:user_id }, a.activity_date, c.signup_date
FROM user_activity a
JOIN cohort c ON a.${input:user_id } = c.${input:user_id }
)
SELECT
100.0 * COUNT(DISTINCT CASE
WHEN activity_date <= signup_date + INTERVAL '7' DAY
AND activity_date > signup_date
THEN activity.${input:user_id } END
) / COUNT(DISTINCT cohort.${input:user_id }) AS retention_7d,
100.0 * COUNT(DISTINCT CASE
WHEN activity_date <= signup_date + INTERVAL '28' DAY
AND activity_date > signup_date
THEN activity.${input:user_id } END
) / COUNT(DISTINCT cohort.${input:user_id }) AS retention_28d
FROM cohort
LEFT JOIN activity
ON cohort.${input:user_id } = activity.${input:user_id }
;
```
(This calculates "% of users who returned within 7 days" and within 28 days. It assumes the presence of at least one activity on days 1-7 means retained at 7d.)

# Idempotency & Backfills
- The computations are straightforward aggregations – running them multiple times yields the same result, given the same underlying data.
- If new data arrives (e.g., more activity logs come in for that cohort beyond what was initially available), the retention metrics can be updated – which is expected behavior (they typically stabilize after enough time).
- There's not usually a concept of incremental processing here; you usually recompute retention periodically (like each day or week for recent cohorts).
- Survivor bias: The method inherently avoids it by always anchoring to the original cohort count. We do not remove churned users from the denominator over time.
- For churn rates (if we compute monthly churn, etc.), similar logic applies: define denominator and numerator clearly.

# Tests
- Retention 0-day: If we define retention at 0 days as 100% (since on day 0 all users are present by definition), verify that calculation yields 100%. (Often we don't bother outputting 0-day since it's trivial.)
- Retention monotonic decrease: If we are measuring "% active within N days", that percentage should be non-decreasing as N increases (e.g., 28-day >= 7-day, because the longer window includes those who came back later). Our query above was structured as separate counts, but effectively 28-day window includes 7-day window. Check that property holds in results (if not, likely a bug in logic).
- Churn vs retention consistency: If churn = 1 - retention for a given period, ensure that matches (and churn is presented as appropriate %).
- Data cutoff: For very recent signups, a 28-day retention might not have full data (e.g., users signed up yesterday obviously can't have 7-day retention yet). In those cases, some analyses exclude the most recent cohort for long retention. If our query includes them, their 7-day retention would appear artificially 0% (no one had chance). One might test and possibly filter cohorts that don't have full N-day observation window yet, depending on usage.
- Distinct user count: ensure no user is double-counted in numerator for each metric. (We used DISTINCT per CASE, which is a trick: better approach might be separate subqueries for each retention then join, to avoid double counting complexities.)

# Success Criteria
- Clarity: We get clear numbers like "7-day retention = 25%" meaning 25% of new users return within a week. These should align with business's known metrics.
- No bias: We always divide by the initial cohort count, not the remaining active users, thereby avoiding survivor bias in interpretation.
- Comparability: We can compare retention over different timeframes or different cohorts if broken down, and it makes sense. For example, if we break by signup month, the 7-day retention of January vs February can be compared.
- Actionable: Knowing these metrics, the team can aim to improve them or investigate drops. (E.g., if 1-day retention is low, onboarding might need improvement.)
- Timely calculation: It should be easy to recompute these as new data comes in (like each day update the values for recent cohorts or overall).
- The queries run efficiently using proper filtering and indexing (especially if doing large joins between activities and cohorts).

# Example
If retention_days=[7, 30]: 
- For users who signed up on 2025-01-01: suppose out of 100, 30 logged in again by Jan 7 -> 7-day retention = 30%. By Jan 31, a total of 45 logged in at least once -> 30-day retention = 45%. 
- The prompt output would likely be a small table: maybe each row is a cohort or overall, with columns retention_7d, retention_30d (0.30 and 0.45 or 30 and 45%). 
- If the user asked specifically for churn: it could also output churn = 70% at 7d, 55% at 30d for that cohort. 
- The user could prompt:
/choose-pattern name=retention-churn
activity_table="analytics.logins_daily" user_id="user_id"
base_date="signup_date" retention_days=[7,30]
and get SQL for those calculations and guidance to interpret the results (like cautioning about incomplete data for recent signups).


## Requirements
- Follow data engineering best practices
- Include comprehensive error handling
- Optimize for performance and scalability
- Use appropriate tools and frameworks
- Ensure code is production-ready