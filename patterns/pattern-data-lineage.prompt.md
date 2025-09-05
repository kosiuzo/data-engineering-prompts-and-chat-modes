---
description: "Track data lineage and dependencies across data pipelines, transformations, and systems."
mode: "agent"
model: "GPT-4o"
tools: ["codebase"]
---

# Data Lineage Tracking

Track data lineage and dependencies across data pipelines, transformations, and systems.

# Problem
Data lineage tracks the flow of data from source to destination, showing how data is transformed and used throughout the organization. This pattern helps create comprehensive data lineage tracking for compliance, debugging, and impact analysis.

Key challenges:
- **Complex dependencies**: Tracking data flow across multiple systems
- **Transformation logic**: Documenting how data is transformed
- **Metadata management**: Storing and maintaining lineage information
- **Real-time updates**: Keeping lineage current as systems change
- **Visualization**: Presenting lineage in an understandable format

# Data Requirements
- **Source tables**: `${input:source_tables }` - origin of data
- **Target tables**: `${input:target_tables }` - destination of data
- `${input:transformation_logic }`: description of data transformations
- `${input:lineage_type }`: type of lineage (column-level, table-level, etc.)
- `${input:metadata_schema }`: schema for storing lineage metadata

# Steps
1. **Lineage Discovery**:
- Identify data sources and destinations
- Map transformation logic and dependencies
- Document data flow patterns
- Create lineage metadata

2. **Dependency Mapping**:
- Map table-to-table dependencies
- Track column-level transformations
- Identify data quality rules
- Document business logic

3. **Metadata Storage**:
- Store lineage information in metadata tables
- Track transformation history
- Maintain dependency graphs
- Store business context

4. **Impact Analysis**:
- Identify downstream impacts of changes
- Track data usage patterns
- Analyze transformation dependencies
- Assess change risks

5. **Monitoring & Updates**:
- Monitor lineage changes
- Update lineage information
- Validate lineage accuracy
- Maintain lineage documentation

# SQL / ETL Skeleton
```sql
-- Data Lineage Metadata Schema
CREATE TABLE data_lineage (
  lineage_id STRING,
  source_table STRING,
  target_table STRING,
  transformation_type STRING,
  transformation_logic STRING,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Table-level Lineage
WITH table_lineage AS (
SELECT 
'${input:source_tables[0] }' as source_table,
'${input:target_tables[0] }' as target_table,
'${input:transformation_logic }' as transformation_type,
'${input:transformation_logic }' as transformation_logic,
CURRENT_TIMESTAMP as created_at
UNION ALL
-- Add more lineage relationships
SELECT 
'${input:source_tables[1] }' as source_table,
'${input:target_tables[1] }' as target_table,
'${input:transformation_logic }' as transformation_type,
'${input:transformation_logic }' as transformation_logic,
CURRENT_TIMESTAMP as created_at
)
SELECT * FROM table_lineage;

-- Column-level Lineage
WITH column_lineage AS (
SELECT 
'${input:source_tables[0] }' as source_table,
'${input:source_tables[0] }.user_id' as source_column,
'${input:target_tables[0] }' as target_table,
'${input:target_tables[0] }.customer_id' as target_column,
'DIRECT_MAPPING' as transformation_type,
'user_id -> customer_id' as transformation_logic,
CURRENT_TIMESTAMP as created_at
UNION ALL
SELECT 
'${input:source_tables[0] }' as source_table,
'${input:source_tables[0] }.order_amount' as source_column,
'${input:target_tables[0] }' as target_table,
'${input:target_tables[0] }.total_revenue' as target_column,
'AGGREGATION' as transformation_type,
'SUM(order_amount) -> total_revenue' as transformation_logic,
CURRENT_TIMESTAMP as created_at
)
SELECT * FROM column_lineage;

-- Dependency Analysis
WITH dependency_graph AS (
SELECT 
source_table,
target_table,
COUNT(*) as dependency_count
FROM data_lineage
GROUP BY source_table, target_table
),
-- Find tables with no dependencies (leaf nodes)
leaf_tables AS (
SELECT 
target_table as table_name
FROM dependency_graph
WHERE target_table NOT IN (SELECT source_table FROM dependency_graph)
),
-- Find tables with no dependents (root nodes)
root_tables AS (
SELECT 
source_table as table_name
FROM dependency_graph
WHERE source_table NOT IN (SELECT target_table FROM dependency_graph)
)
SELECT 
'leaf_tables' as table_type,
table_name
FROM leaf_tables
UNION ALL
SELECT 
'root_tables' as table_type,
table_name
FROM root_tables;

-- Impact Analysis
WITH impact_analysis AS (
SELECT 
source_table,
target_table,
transformation_type,
-- Count downstream dependencies
(SELECT COUNT(*) FROM data_lineage dl2 WHERE dl2.source_table = dl.target_table) as downstream_count
FROM data_lineage dl
)
SELECT 
source_table,
target_table,
transformation_type,
downstream_count,
CASE 
  WHEN downstream_count = 0 THEN 'LEAF_NODE'
  WHEN downstream_count > 5 THEN 'HIGH_IMPACT'
  ELSE 'MEDIUM_IMPACT'
END as impact_level
FROM impact_analysis
ORDER BY downstream_count DESC;
```

# Idempotency & Backfills
- Lineage information can be updated incrementally
- Historical lineage can be preserved for analysis
- Lineage can be rebuilt from scratch if needed
- Changes to lineage are tracked and auditable

# Tests
- Lineage completeness: Verify all transformations are documented
- Dependency accuracy: Validate dependency relationships
- Metadata quality: Ensure lineage information is accurate
- Impact analysis: Test impact analysis calculations
- Visualization: Validate lineage visualization accuracy

# Success Criteria
- Comprehensive data lineage coverage
- Accurate dependency mapping
- Clear impact analysis capabilities
- Maintainable lineage documentation
- Effective lineage visualization

# Example
User Input:
/choose-pattern name=data-lineage
source_tables=["raw.orders", "raw.customers"]
target_tables=["analytics.order_summary", "analytics.customer_metrics"]
transformation_logic="ETL pipeline with aggregation and joins"
lineage_type="table_and_column"
metadata_schema="governance.lineage_metadata"

Copilot would generate:
- SQL queries for lineage metadata creation
- Dependency mapping and analysis
- Impact analysis calculations
- Lineage visualization queries
- Metadata management and updates


## Requirements
- Follow data engineering best practices
- Include comprehensive error handling
- Optimize for performance and scalability
- Use appropriate tools and frameworks
- Ensure code is production-ready