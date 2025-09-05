---
description: "Distribute conversion credit across marketing touchpoints (first-touch, last-touch, linear, or time-decay models)."
mode: "agent"
model: "GPT-4o"
tools: ["codebase"]
---

# Marketing Attribution Model

Distribute conversion credit across marketing touchpoints (first-touch, last-touch, linear, or time-decay models).

# Problem
When a user converts (makes a purchase or signs up), **which marketing channel gets credit?** Attribution models assign credit across multiple touchpoints:
- *First-touch*: 100% credit to the first channel that acquired the user.
- *Last-touch*: 100% to the last channel before conversion.
- *Linear*: spread evenly across all touches.
- *Time-decay*: more credit to touches closer in time to conversion.
- *U-shaped (position-based)*: e.g., 40% first, 40% last, 20% distributed to middle touches.

This pattern calculates attribution based on a chosen model.

Challenges:
- **Data requirement**: Need a list of all touchpoints (ad impressions, clicks, etc.) per user leading up to conversion, and the conversion event.
- **Path definition**: Define the window: do we consider all touches in the 30 days before conversion? Or unlimited history? Typically limit to a campaign window.
- **Multiple conversions**: If user converts multiple times, sometimes attribution is done per conversion (each conversion gets its own credit assignment).
- **Channel hierarchy**: Ensure channel names or IDs are consistent.
- **Fractional credit**: The output often is fractional credit per channel per conversion, which can sum up.

# Data Requirements
- **Touchpoints table**: `${input:touchpoints_table }`:
- `${input:user_id }`: who experienced the touch.
- `${input:touchpoint_time }`: timestamp of the marketing touch (ad view, click, etc.).
- `${input:channel }`: which channel or campaign (e.g., "Email", "Facebook Ad 123", etc.).
- **Conversion table**: `${input:conversion_table }`:
- `${input:user_id }`: who converted.
- `${input:conversion_time }`: timestamp of conversion event (purchase, signup).
- We will link touches to conversions by `user_id` and considering only touches before the conversion time (possibly within a certain lookback window if needed).
- `${input:attribution_model }`: a parameter like "first-touch", "last-touch", "linear", "time-decay", "u-shaped". We will implement accordingly.

# Steps
1. **Prepare sequences**:
- For each conversion (each user_id in conversion_table, possibly each conversion if multiple per user), gather that user's all touchpoints prior to the conversion_time.
- Example approach: join touchpoints to conversions on user_id with `touchpoint_time < conversion_time`.
- If multiple conversions per user, one might restrict to touches between the previous and current conversion, or treat them independently (depends on business logic).

2. **Determine credit allocation**:
- If `first-touch`: find the earliest touchpoint_time among those, that channel gets 100% for that conversion.
- If `last-touch`: find the latest touchpoint before conversion, give that channel 100%.
- If `linear`: each touch in the path gets equal credit (so if 4 touches, each gets 0.25 credit).
- If `time-decay`: assign weights increasing with recency. E.g., use an exponential decay: weight = 2^(-Δt). Or a simpler: assign more weight to last, less to first. (We define a simple method: e.g., if 3 touches, give 60% to last, 30% to first, 10% if there are middle touches distributed – or actually time-decay usually continuous).
- If `u-shaped`: give fixed % to first and last (commonly 40% each) and split remaining among middle touches.

3. **Compute contributions**:
- For each conversion, create records for each channel with its share of credit.
- E.g., output columns: conversion_id (or user+conversion_time), channel, credit (in fraction or points).
- If linear: all records will sum to 1 per conversion. If first/last: one record with 1.0 credit, others 0 (often we would just output the one with credit).

4. **Aggregate (if needed)**:
- Sum credit by channel over all conversions to see total credit per channel.
- This gives how many conversions each channel is credited with (can be fractional).

5. **Attribution window**:
- Possibly limit to touches within X days before conversion. If required, filter touchpoints to `touchpoint_time >= conversion_time - interval X`.
- If not specified, assume all prior touches count.

# SQL / ETL Skeleton
*(Pseudo-SQL for first, last, linear as examples; time-decay and u-shaped may require custom logic in code or advanced SQL window.)*

First-touch example:
```sql
WITH conv AS (
SELECT c.${input:user_id }, c.${input:conversion_time },
MIN(t.${input:touchpoint_time }) AS first_touch_time
FROM ${input:conversion_table } c
JOIN ${input:touchpoints_table } t
ON c.${input:user_id } = t.${input:user_id }
AND t.${input:touchpoint_time } < c.${input:conversion_time }
GROUP BY c.${input:user_id }, c.${input:conversion_time }
),
attribution AS (
SELECT
c.${input:user_id }, c.${input:conversion_time },
t.${input:channel },
CASE
WHEN t.${input:touchpoint_time } = conv.first_touch_time THEN 1.0
ELSE 0.0
END as credit
FROM ${input:conversion_table } c
JOIN ${input:touchpoints_table } t
ON c.${input:user_id } = t.${input:user_id }
AND t.${input:touchpoint_time } < c.${input:conversion_time }
JOIN conv
ON c.${input:user_id } = conv.${input:user_id } AND c.${input:conversion_time } = conv.${input:conversion_time }
)
SELECT channel, SUM(credit) as total_conversions_attributed
FROM attribution
GROUP BY channel;
```

Last-touch would be similar but using MAX instead of MIN for last_touch_time and condition WHEN t.time = last_touch_time THEN 1.

Linear example:
```sql
WITH touch_count AS (
SELECT c.${input:user_id }, c.${input:conversion_time },
COUNT(*) as touch_before_conv
FROM ${input:conversion_table } c
JOIN ${input:touchpoints_table } t
ON c.${input:user_id } = t.${input:user_id }
AND t.${input:touchpoint_time } < c.${input:conversion_time }
GROUP BY c.${input:user_id }, c.${input:conversion_time }
)
SELECT t.${input:channel },
SUM(1.0/tc.touch_before_conv) as total_conversions_attributed
FROM ${input:conversion_table } c
JOIN ${input:touchpoints_table } t
ON c.${input:user_id } = t.${input:user_id }
AND t.${input:touchpoint_time } < c.${input:conversion_time }
JOIN touch_count tc
ON c.${input:user_id }=tc.${input:user_id } AND c.${input:conversion_time }=tc.${input:conversion_time }
GROUP BY t.${input:channel };
```
(This divides one conversion evenly among all its touches. If a conversion had 4 touches, each channel involved gets 0.25 added. Summing by channel yields total fractional conversions.)

Time-decay and U-shaped might require enumerating touches per conversion with an index or time difference and then applying weights. That can be done with window functions but is more complex; might do in Python if not in SQL.

# Idempotency & Assumptions
- The logic assumes we have complete data of touchpoints up to conversion. If data is updated (e.g., a missing touchpoint is added later), attribution can change. But running the pattern on the same static dataset is deterministic.
- We assume one conversion per user for simplicity. If multiple:
  - Could treat each conversion independently (likely better to restrict to first conversion per user or a time window).
  - Another approach is to consider multi-conversion paths (not covered here).
- Double counting: ensure each conversion's credit sums to 1 (or 100%). Our linear and first/last logic did that. For time-decay, we'd normalize weights to sum to 1 per conversion too.
- Bias: All models have biases (first vs last vs multi). The user should choose attribution_model based on need. We provide the mechanism.
- Attribution timeframe: If not stated, possibly assume all historical touches count. In reality, might set a cap (e.g., only touches in 30 days pre-conversion count). The pattern can be adjusted easily by filtering on touchpoint_time relative to conversion_time.

# Tests
- Credit sum per conversion: For each conversion event, the sum of credit assigned across channels = 1. Test by grouping by conversion (user_id+conversion_time) in the attribution output.
- First/Last uniqueness: In first-touch model, exactly one channel gets credit 1 for a conversion. Ensure in the intermediate attribution table, for each conversion there is one row credit=1, rest 0. (We might choose to output only the one with 1 and drop the 0 ones to simplify.)
- Consistency: If using first-touch, compare total attributions to number of conversions (should match exactly since each conversion gives exactly 1 credit to one channel). For linear, total sum of all channels should equal total number of conversions as well (distributed).
- Time ordering: Check that for last-touch, the channel credited is indeed the max timestamp. For first-touch, the min. (This might require inspecting a few samples.)
- Empty touches: If a conversion had no preceding touchpoints (user came organically or data missing), our queries might give that conversion no credit assigned (or exclude it). We should decide: either drop those conversions or assign them to an "Organic/None" channel. Possibly add logic: if no touch, assign "Direct/Organic" credit. In tests, identify if any conversion was left out (to avoid losing conversions in totals).
- Time-decay weight correctness: If implemented, check that more recent touch indeed got larger weight than older. And sum=1.

# Success Criteria
- Complete attribution: Every conversion is accounted for and credit is fully assigned to channels. No conversion is double-counted or unaccounted.
- Meaningful results: The output reflects known patterns. E.g., if we run last-touch on known data, it matches what marketing team expects (like they often manually attribute last click).
- Flexibility: Changing the attribution_model input easily switches logic without needing an entirely different pipeline.
- No channel over-credit: If one user had multiple conversions, our method potentially credits multiple conversions to the same earlier touch if not careful. Typically, each conversion should only credit touches before that conversion, so it's fine.
- If doing cumulative results, each channel's total credited conversions (maybe fractional) can be compared to actual conversion count. The sum across channels should equal total conversions count.
- Documentation: The method of attribution is clearly documented so stakeholders know how to interpret (especially important for time-decay or U-shaped specifics).

# Example
Suppose: 
- User A: came via Google (Day 1), then Email (Day 3), then converted (Day 5). 
- User B: came direct (no campaign) on Day 2, converted Day 2. 

If using first-touch: Google gets credit for User A's conversion, "Direct/None" for User B. 
If last-touch: Email gets credit for A, Direct for B. 
If linear: Google 0.5 and Email 0.5 for A, Direct 1 for B. 

Our pattern would output channel attribution sums accordingly. A user prompt:
/choose-pattern name=attribution
touchpoints_table="marketing.touches" user_id="user_id" touchpoint_time="ts"
channel="channel"
conversion_table="sales.conversions" conversion_time="purchase_time"
attribution_model="last-touch"

Copilot returns a SQL or pseudo-SQL that: 
- Joins touches to conversions per user, 
- Identifies the last touch per conversion, 
- Sums up credit per channel. 
And likely notes something like "touches with no prior channel might be labeled as 'Direct'."


## Requirements
- Follow data engineering best practices
- Include comprehensive error handling
- Optimize for performance and scalability
- Use appropriate tools and frameworks
- Ensure code is production-ready