---
description: "Group event streams into sessions given an inactivity timeout, handling overlapping sessions and bots."
mode: "agent"
model: "GPT-4o"
tools: ["codebase"]
---

# Sessionization (User Session Identification)

Group event streams into sessions given an inactivity timeout, handling overlapping sessions and bots.

# Problem
In clickstream or log analytics, we often need to break a continuous event stream into discrete **sessions** – periods of activity separated by a certain gap of inactivity. For example, if a user is inactive for 30+ minutes, any new activity starts a new session. Sessionization helps analyze behaviors like "average session length" or "events per session".

Key considerations:
- **Inactivity threshold**: If no events for X minutes, session ends. A common default is 30 minutes of inactivity.
- **Overlapping sessions**: Normally, sessions for a single user shouldn't overlap. But if data is not sorted or if using machine timestamps, weird overlaps can occur (shouldn't if using proper event time).
- **Concurrent sessions**: If `user_key` is something like a device ID, a user could have multiple devices (multiple sessions) concurrently. We may ignore this or treat each device as separate user.
- **Bots or automated events**: These can create extremely long "sessions" (continuous events with no gaps). Sometimes it's useful to cap session length or filter bot activity.

# Data Requirements
- **Events table**: `${input:events_table }` with:
- `${input:user_key }`: User or session grouping key (e.g., user_id, or device_id).
- `${input:event_ts }`: Timestamp of each event (ideally in datetime format).
- Data must be **sorted by event timestamp within each user** to sessionize (if not, sort first).
- Ideally, events are in UTC or all in the same timezone (or have tz info to interpret correctly).

# Steps
1. **Sort events** (per user): Ensure input events are ordered by `event_ts` for each `${input:user_key }`. In SQL, this might mean using `ROW_NUMBER() OVER (PARTITION BY user ORDER BY event_ts)` if not already ordered, or using a window lag function.

2. **Calculate time gap**: Compute the time difference between consecutive events for each user:
- Use `LAG(${input:event_ts })` to get previous event timestamp for the same user.
- Compute `diff_minutes = TIMESTAMPDIFF(MINUTE, lag_event_ts, current_event_ts)` (or in your SQL dialect).

3. **Assign session IDs**:
- Start a new session if `diff_minutes` is `NULL` (first event for user) **or** `diff_minutes > ${input:session_timeout_minutes }` (i.e., gap too large).
- You can generate a session_id by using a cumulative sum:
```sql
session_id = SUM(CASE WHEN diff_minutes IS NULL OR diff_minutes > ${input:session_timeout_minutes } THEN 1 ELSE 0 END)
OVER (PARTITION BY user_id ORDER BY event_ts ROWS UNBOUNDED PRECEDING)
```
This effectively increments the session counter each time a new session starts.
- Or, use a UUID or concatenate user_id with session start timestamp.

4. **Session table**: Optionally, aggregate events to one row per session:
- session_id (as defined), user_id, session_start (first event_ts of session), session_end (last event_ts), number_of_events, session_duration_minutes.
- Compute session_duration as difference between last and first timestamps in session.

5. **Overlapping sessions check**: Since by construction sessions for a given user won't overlap (they're sequential), we only worry if user had multiple devices. If `user_key` can repeat concurrently (like the same user_id on two devices), then the sessionization above actually treats them as one sequence. In such cases, use a composite key (user + device) to separate streams.

6. **Bot filtering**: If needed, identify sessions that are unrealistically long or have thousands of events (could be non-human). Mark them for exclusion or separate analysis.

# SQL / ETL Skeleton
```sql
WITH ordered AS (
SELECT
${input:user_key } as user_id,
${input:event_ts } as ts,
LAG(${input:event_ts }) OVER (PARTITION BY ${input:user_key } ORDER BY ${input:event_ts }) as prev_ts
FROM ${input:events_table }
),
gaps AS (
SELECT
user_id,
ts,
CASE
WHEN prev_ts IS NULL
OR TIMESTAMPDIFF(MINUTE, prev_ts, ts) > ${input:session_timeout_minutes }
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
OVER (PARTITION BY user_id ORDER BY ts ROWS UNBOUNDED PRECEDING) as session_seq
FROM gaps
)
SELECT
user_id,
session_seq as session_id,
MIN(ts) OVER (PARTITION BY user_id, session_seq) as session_start,
MAX(ts) OVER (PARTITION BY user_id, session_seq) as session_end,
COUNT(*) OVER (PARTITION BY user_id, session_seq) as event_count
FROM sessions;
```
(This query assigns a session_seq instead of a sequence number per user, treating each user's first event or big gap as a session break. Adjust TIMESTAMPDIFF syntax per SQL dialect. You might also use GENERATE_UUID() for session_id)

# Idempotency & Backfills
- Deterministic output: Sessionization is purely deterministic given a sorted list of events and a timeout threshold. Running it on the same input yields the same sessions, so it's idempotent by nature as long as the input event data isn't duplicated or partial.
- Incremental building: If you process streaming data, you could maintain sessions incrementally:
  - Keep track of the last event time per user from the previous batch.
  - When new events arrive, decide if the first new event continues the last session or starts a new one (compare timestamp difference).
  - This requires state (last session end per user) or reprocessing a small overlap.
- Late arriving events: If events can arrive out-of-order or late, you may need to re-run session assignment for that user for the affected period. A straightforward strategy is to partition data by day or hour and allow reprocessing of recent partitions if late data arrives.
- Backfill: For historic data, you can run the sessionization for each user independently. If doing a massive backfill, ensure data is partitioned and sorted (maybe use a tool like Spark for large volumes).

# Tests
- No session gaps less than threshold: Verify that within a session, the gap between any two consecutive events is <= timeout. This is by construction, but a SQL test can double-check:
```sql
SELECT user_id, session_id
FROM sessions_detail
WHERE TIMESTAMPDIFF(MINUTE, LAG(ts) OVER (PARTITION BY user_id, session_id ORDER BY ts), ts) > ${input:session_timeout_minutes };
```
This should return no rows.
- Session start correctness: Every session's first event should either be user's first event or have a preceding event outside the timeout. Test that for each session, either prev_ts IS NULL or prev_ts < session_start - timeout.
- Unique session IDs: If using a simple sequence, ensure combination (user_id, session_id) is unique primary key. If using UUID, each event gets correct session UUID (harder to test uniqueness without listing all).
- Session aggregation accuracy: For aggregated session table, check that session_duration = session_end - session_start and that event_count matches the count of events assigned to that session (consistency between detail and summary).
- Multi-device scenario: If possible, test a scenario of one user with events interleaved from two devices. Decide expected behavior (treat them as one interwoven session, or separate by device). Ensure the solution aligns with expectation.

# Success Criteria
- Proper grouping: Events are grouped into sessions correctly: no session spans an idle period longer than X minutes, and no events that are closer than X minutes apart are split into different sessions.
- Meaningful metrics: Derived metrics like session_length and events_per_session make sense (e.g., if a user was active sporadically over an hour with breaks <30min, it's one session ~1 hour long).
- Robust to data issues: Out-of-order events or slight timestamp irregularities are handled (for example, if two events have the exact same timestamp and one was "lagged" incorrectly, the logic still works because diff would be 0 which is < timeout).
- Scalable: Can handle large volumes (billions of events) by partitioning by user or date as needed. The pattern itself is implementable in SQL, but for huge data a distributed approach (Spark, etc.) following the same logic is feasible.
- No overlaps: A single event belongs to exactly one session for a given user. Sessions follow one after another without overlap.

# Example
User prompts:
/choose-pattern name=sessionization
events_table="app.events", user_key="user_id", event_ts="event_time", session_timeout_minutes=30

Copilot returns: 
- A SQL query (as shown in the skeleton) or a dbt model that labels each event with a session_id. 
- It might also provide a second query or model to aggregate sessions (with start, end, count, duration). 
- Explanation that a session ends after 30 minutes of inactivity is included in comments. 
- The user can then use the output to, say, calculate average session length or retention by session count.


## Requirements
- Follow data engineering best practices
- Include comprehensive error handling
- Optimize for performance and scalability
- Use appropriate tools and frameworks
- Ensure code is production-ready