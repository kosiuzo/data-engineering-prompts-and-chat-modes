---
description: "Create cohort tables (e.g., monthly signup cohorts) and compute retention over time for each cohort."
mode: "agent"
model: "GPT-4o"
tools: ["codebase"]
---

# Cohort Analysis Generator

Create cohort tables (e.g., monthly signup cohorts) and compute retention over time for each cohort.

# Problem
**Cohort analysis** groups users by their start period (e.g., signup month) and tracks each group's behavior over time. A common metric is retention: what percentage of a cohort is still active after N days/weeks/months. This pattern helps answer questions like "What percent of January signups were active 3 months later?" It surfaces trends that aggregate metrics might hide (e.g., improving retention in newer cohorts vs older ones).

Challenges:
- Defining the cohort (usually by first activity date, but could be by first purchase, etc.).
- Calculating retention properly (avoiding survivor bias by always referencing the original cohort size).
- Dealing with partial periods (the most recent cohorts haven't had as much time to retain – how to display their shorter observation period).
- Rolling vs fixed cohorts: e.g., monthly buckets vs weekly.

# Data Requirements
- **User base table**: `${input:base_users }` with at least:
- `${input:user_id }`: Unique user identifier.
- `${input:signup_date }`: The date (or datetime) the user signed up (or whatever cohort-defining action).
- **Activity table**: `${input:activity_table }` with:
- `${input:user_id }`: to link to base_users.
- `${input:activity_date }`: dates of a recurring action of interest (e.g., login date, purchase date).
- Define **cohort_grain** (if not provided, default to monthly). This means we bucket `signup_date` into the start of the period (e.g., if monthly, cohort label = first day of that month).
- We assume each user has one signup_date (first occurrence). If not, use MIN(signup_date) per user to define cohort.

# Steps
1. **Define cohorts**: Create a dimension or mapping of each user to a cohort label (e.g., `cohort_month = DATE_TRUNC('month', signup_date)`).
```sql
SELECT user_id, DATE_TRUNC('month', ${input:signup_date }) as cohort_month
FROM ${input:base_users };
```
(If `cohort_grain` is weekly, use week; if daily, the date itself.)

2. **Join activity**: Join the activity records to cohort info:
- Link `${input:activity_table }` with the cohort mapping on user_id.
- Filter out activity that happened **before** the cohort start if needed (usually, retention considers activity *after* the initial action; if signup is the cohort, then any activity on the signup date could count as day 0 or might be excluded if we want post-signup retention).

3. **Calculate retention periods**:
- Decide on the time buckets for measuring retention (e.g., 7-day, 30-day, etc. or 1 month after, 2 months after).
- E.g., for monthly cohorts and monthly retention intervals: compute difference in months between cohort_month and activity date.
- For daily retention: difference in days between signup_date and activity_date.
- For N-day rolling retention (like 7-day retention often means user came back at least once within 7 days of signup, 14-day means within 14 days, etc.):
- Define windows: activity_date <= signup_date + N days.

4. **Pivot or aggregate**:
- For each cohort and each period, determine number of users active.
- Approach:
- Start with cohort size = number of distinct users in each cohort.
- Then for each cohort, for each period X (day X, week X, month X), count distinct users who had activity in that period.
- "Period X" typically means between X-1 and X months since signup for monthly (for example, Month 3 retention = users active in the third month after signup). For daily retention, Day 7 retention = users active on day 7 after signup (or between day 7-13 depending on definition).
- Use a CASE WHEN or pivot logic. For SQL, maybe do:
```sql
SELECT cohort_month,
COUNT(DISTINCT user_id) as cohort_size,
COUNT(DISTINCT CASE WHEN MONTHS_BETWEEN(activity_date, cohort_month) >= 0 AND MONTHS_BETWEEN(activity_date, cohort_month) < 1 THEN user_id END) as month0_active, -- sign-up month
COUNT(DISTINCT CASE WHEN MONTHS_BETWEEN(activity_date, cohort_month) >= 1 AND MONTHS_BETWEEN(activity_date, cohort_month) < 2 THEN user_id END) as month1_active,
...
FROM cohort_users c
LEFT JOIN ${input:activity_table } a ON a.user_id = c.user_id
GROUP BY cohort_month;
```
Alternatively, use datediff for daily or weeks.

5. **Calculate retention rates**:
- For each cohort row, divide active counts by cohort_size to get percentage retained.
- E.g., retention_month1 = month1_active / cohort_size.
- These are your retention curves per cohort.

6. **Format results**:
- Often present as a matrix: Cohort vs. period (e.g., rows = Jan, Feb, Mar signups; columns = Month 0, Month 1, Month 2 retention, etc.), where values are % or counts.
- We may output a flattened table or a pivoted format.

# SQL / ETL Skeleton
*(Example for monthly cohorts and monthly retention up to 3 months out)*
```sql
WITH cohorts AS (
SELECT
${input:user_id } as user_id,
DATE_TRUNC('month', ${input:signup_date }) as cohort_month
FROM ${input:base_users }
),
activity AS (
SELECT
c.cohort_month,
a.${input:user_id },
DATE_TRUNC('month', a.${input:activity_date }) as activity_month,
MONTHS_BETWEEN(DATE_TRUNC('month', a.${input:activity_date }), c.cohort_month) as months_since_cohort
FROM cohorts c
LEFT JOIN ${input:activity_table } a
ON a.${input:user_id } = c.user_id
AND a.${input:activity_date } >= c.cohort_month -- ensure activity is on/after cohort start
)
SELECT
cohort_month,
COUNT(DISTINCT user_id) as cohort_size,
COUNT(DISTINCT CASE WHEN months_since_cohort >= 0 THEN user_id END) as month0_active,
COUNT(DISTINCT CASE WHEN months_since_cohort >= 1 THEN user_id END) as month1_active,
COUNT(DISTINCT CASE WHEN months_since_cohort >= 2 THEN user_id END) as month2_active,
COUNT(DISTINCT CASE WHEN months_since_cohort >= 3 THEN user_id END) as month3_active
FROM activity
GROUP BY cohort_month
ORDER BY cohort_month;
```
(The above counts any user active in or after each month threshold. You might modify to count exactly in that month interval or at least once by that month depending on definition.)

# Idempotency & Backfills
- Static cohorts: Once a user's cohort is assigned (based on signup_date), it doesn't change. So the cohort assignment part is static and idempotent.
- Activity linking: As long as the activity table is not double-counting, counting distinct users per period is naturally idempotent (rerunning yields same counts).
- Backfill: Typically you compute cohorts over a range (say last 12 months of signups) and their retention to date. If new data arrives (e.g., more recent activity for those cohorts), rerun the aggregation – it will update the later retention numbers.
- This can be run as a snapshot on a schedule. Because each run recalculates retention up to now, it's fine. If you want to store historical retention snapshots (e.g., how retention looked after exactly 3 months vs after 6 months), that's a more complex analysis (requires freezing data at certain points).
- Late signups or activity: If some signups were not present initially (late data correction), their cohort might be assigned later – but since we recompute, they'll just appear in the appropriate cohort when data is in. It's more about data completeness.

# Tests
- Cohort sum check: Sum of all cohort_sizes should equal total users in base_users (assuming one cohort per user).
- Retention <= 100%: For each cohort and period, active count ≤ cohort_size. And retention rates ≤ 1.0. (No cohort should have more active users than it started with – if so, likely a user without a valid cohort or a join issue.)
- Monotonic decay: Usually retention % should non-increase over periods (it can stay flat or drop, but not rise, unless some users became active later for first time which is fine). Actually, retention defined as "ever active by that time" will be non-decreasing counts (you accumulate more unique users as time goes on, but the rate of "active by N" increases with N). If we define period-specific (e.g., active in month N specifically), those can fluctuate. Clarify definition in tests.
- Cohort consistency: Check a few random user_ids – verify their cohort assignment is correct (their signup date bucket matches), and that if they have activity in later periods, they are counted appropriately.
- Recent cohort partial: The most recent cohort (say last month) won't have data for 3 months out. Make sure those fields are either null or zero or excluded. (Our query above counts them if months_since_cohort >= 3, which for recent will be false so count=0, that's fine.)

# Success Criteria
- Insightful output: We can clearly see retention curves by cohort. For instance, the output might show January cohort 100% at month0 (by definition), 50% at month1, 30% at month3, etc., whereas February cohort might have different percentages. This helps identify if newer cohorts are retaining better or worse.
- Survivorship bias avoided: We don't mix cohorts together; each cohort's retention is calculated out of its own size. This avoids the aggregate retention illusion where overall retention can look high simply because older cohorts' survivors dominate.
- Accurate percentages: If the company defines "Day 7 retention" as "% of users active on day 7 or by day 7", the output matches that definition.
- Dynamic: As more activity data comes in, the retention numbers for each cohort update accordingly (e.g., a cohort's 3-month retention might improve slightly if some stragglers came back in month 3).
- Readable format: The results can be easily plotted (cohort vs retention curve) or read by non-technical folks, typically as a matrix or chart.

# Example
- Cohort grain: monthly.
- January 2025: 1000 users signed up.
- By Feb 2025, 300 of those 1000 were active (at least once in Feb).
- By Mar 2025, 200 of those original 1000 were active (in Mar).
- The cohort table would show for Jan 2025: cohort_size=1000, month1_active=300 (30%), month2_active=200 (20%).
- Another row for Feb 2025 cohort, etc.

If user queries this pattern with:
/choose-pattern name=cohort-analysis
base_users="prod.users" user_id="user_id" signup_date="created_date"
activity_table="prod.logins" activity_date="login_date"
cohort_grain="month"

Copilot produces a SQL that aggregates users into monthly cohorts and their login rates in subsequent months, plus perhaps a small note on interpreting the last column (which might be partial).


## Requirements
- Follow data engineering best practices
- Include comprehensive error handling
- Optimize for performance and scalability
- Use appropriate tools and frameworks
- Ensure code is production-ready