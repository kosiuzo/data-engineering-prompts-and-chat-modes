---
description: "Maintain a clean Slowly Changing Dimension Type 2 table with deterministic merges and no duplicate active records."
mode: "agent"
model: "GPT-4o"
tools: ["codebase"]
---

# Idempotent SCD Type 2 History

Maintain a clean Slowly Changing Dimension Type 2 table with deterministic merges and no duplicate active records.

# Problem
A Slowly Changing Dimension Type 2 (SCD2) table tracks the full history of changes for dimension records (e.g., a customer's address changes over time). The SCD2 pattern creates a new row for each change and marks old rows as expired. Key requirements:
- Exactly one current ("active") record per business key at any time.
- Accurate `effective_from` and `effective_to` timestamps to define the validity period of each record.
- Idempotent updates: rerunning the load should not create duplicates or shift the history.

Challenges:
- Detecting changes in the source (comparing new vs last version).
- Handling late arriving changes (out-of-order events) – if an older change shows up after a newer one, we may need to adjust history.
- Ensuring **no overlapping intervals** for a given key (end of one period = start of next).

# Data Requirements
- **Source table** (`${input:src_table }`): each row represents the latest version of an entity (if doing change capture via full snapshot) or a change event (if using CDC logs).
- `${input:business_key }`: Natural key to identify the entity (e.g. customer_id).
- `${input:change_ts|default("update_timestamp") }`: Timestamp of the change/event (could be an "updated_at" or an event time).
- Other columns that we want to track changes for (list them in `${input:change_cols }`).
- Initially, the SCD2 table might be empty or have an initial load of historical data.
- We assume we can identify when a *change* happened by comparing new data to previous data or using an explicit change feed.

# Steps
1. **Identify new changes**: Compare incoming source data to the current SCD table:
- For each `${input:business_key }` in source, get the corresponding current record from SCD (if exists).
- Determine if any of the `${input:change_cols }` values differ from the current record's values.
- If different (or if key not in SCD yet), that source row represents a new change to apply.
- If no difference, skip (no change).

2. **Prepare SCD inserts/updates**:
- For each identified change:
- "Expire" the old current record: set its `effective_to` to (new change's timestamp or one second before it) and `is_current = false`.
- Create a new record with `effective_from = change_ts` (when this change is effective), `effective_to = null` (open-ended), and `is_current = true`.
- Populate all dimension attributes from the source.
- Compute a hash or checksum of `${input:change_cols }` for both old and new records to compare – this helps ensure deterministic change detection (some implementations use a hash to quickly check if any relevant column changed).

3. **Merge into SCD table**:
- Use a single MERGE (if supported) or transaction:
- MATCH on `business_key`.
- When matched (existing current record) and data is changed, update the existing record to expire it.
- Then INSERT the new record.
- Ensure that if no current record exists (new key), just INSERT with `effective_from` = change_ts and no expiration.

4. **Late arrivals handling**:
- If `${input:late_arrival_window }` is set (e.g., allow updates up to 7 days old), handle out-of-order events:
- If an incoming change has a timestamp older than the latest `effective_from` for that key (meaning we already have a newer change), we may need to insert it *before* the newer change:
- Find where it fits in the timeline and adjust the neighboring records' `effective_from`/`effective_to` accordingly.
- This scenario is complex; often one might reject or log late arrivals beyond a threshold. But the pattern should at least detect it.
- Often, for simplicity, anything outside a late window is ignored or triggers a full rebuild for that key.

5. **Housekeeping**:
- Optionally, periodically deduplicate or recompute hashes to ensure no drift.
- Keep track of the last processed `change_ts` per key to handle incremental loads.

# Merge Skeleton
Below example uses pseudo-SQL for a MERGE (target is `scd2` table, source is `staging` data of changes to apply):
```sql
MERGE INTO scd2 t
USING staged_changes s
ON t.${input:business_key } = s.${input:business_key }
AND t.is_current = TRUE
WHEN MATCHED
THEN UPDATE
SET t.is_current = FALSE,
t.effective_to = s.change_ts - INTERVAL '1' SECOND
-- (or some small delta, assuming change_ts is inclusive start of new record)
WHEN NOT MATCHED
THEN INSERT (
${input:business_key }, <other columns>,
effective_from, effective_to, is_current
)
VALUES (
s.${input:business_key }, <other columns>,
s.change_ts, NULL, TRUE
);
```
(Note: The ON clause might also match on keys where t.is_current=TRUE to only update the current record.)

If MERGE not available, the logic is: 
- For each change in staged_changes: 
1. UPDATE scd2 set effective_to = <new_ts - δ>, is_current=FALSE where business_key = X and is_current = TRUE. 
2. INSERT new row for business_key = X with effective_from = new_ts, effective_to = NULL, is_current = TRUE.

# Idempotency & Late Arrivals
- Deterministic change detection: Use a hash of change_cols to decide if a new row differs from the old. Store that hash in SCD2 (could be an additional column). This way, if the same source record is processed twice, you can detect no actual change and skip inserting a duplicate.
- Idempotent pipeline: If you accidentally run the SCD load twice for the same data, the hash comparison or checking is_current flags prevents inserting the same change twice.
- Late arrival window: If a late change comes in (older than the latest current record in SCD):
  - If within ${input:late_arrival_window|default(0) } days of tolerance, process it by adjusting history (might require updating the next record's effective_from to the late change's time, and setting the late change's effective_to to that next record's start).
  - If beyond the window, either drop it (and log) or flag for manual intervention. The pattern should not blindly insert it because it would violate ordering.
- Backfill/Re-run: You should be able to truncate and reload the SCD table from scratch (from earliest source records) and get the same result as the incrementally built table, to validate correctness.

# Tests
- Single current record: For each business_key, at most one row where is_current = TRUE. (Test: no key has two trues).
- Non-overlapping intervals: For each business_key, the date ranges [effective_from, effective_to) should not overlap between records. A query like:
```sql
SELECT business_key
FROM scd2 a
JOIN scd2 b USING(business_key)
WHERE a.effective_from < b.effective_to
AND b.effective_from < a.effective_to
AND a.id <> b.id;
```
should return zero rows.
- Integrity of change data: If a hash or version number is stored, test that no two consecutive records for same key have identical hash (meaning a change was recorded when nothing changed).
- Timeliness: If late_arrival_window is set, test that no incoming change older than that window was applied (or that appropriate adjustments were made).
- Correct attribute values: Optionally, if you have a separate truth dataset or audit log, sample a few keys to verify that the SCD table reflects the correct sequence of values over time.

# Success Criteria
- Complete history: The SCD2 table correctly reflects every change in ${input:change_cols } for each ${input:business_key }. Historical values are preserved (Type 2) rather than overwritten.
- No duplication: Re-running the process yields the same table state (idempotent). There are no duplicate records or accidental multiple current records for a key.
- Accurate period tracking: The effective_from and effective_to delineate each period of a particular attribute set. For any given point in time, one can query "as of that time" and get the valid dimension record.
- Handles out-of-order updates: Within reason, late arriving changes are incorporated properly or flagged. The history remains chronologically consistent.
- Auditable: One can trace any record in the SCD table back to a source change (via change_ts or hash), ensuring transparency.

# Example
Imagine src_table = customers_delta (daily delta of customer info), business_key = customer_id, change_cols = [address, phone], change_ts = last_updated.

User prompts the pattern:
/choose-pattern name=scd2-idempotent
src_table="staging.customers_delta"
business_key="customer_id"
change_cols=["address","phone"]
late_arrival_window=7

Copilot would output: 
- A dbt model or SQL script implementing the SCD2 logic described, likely as a MERGE into a dimension table dim_customer_scd2. 
- It would include logic to expire old records and insert new ones. 
- It might also provide a helper query or comment on how to handle late arrivals (e.g. "if an update is older than 7 days compared to current record, consider manual review"). 
- Tests ensuring one current record per customer, no overlaps, etc., would be included (or in a YAML schema file).


## Requirements
- Follow data engineering best practices
- Include comprehensive error handling
- Optimize for performance and scalability
- Use appropriate tools and frameworks
- Ensure code is production-ready