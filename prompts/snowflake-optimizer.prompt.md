---
description: "Optimize Snowflake queries and warehouse configuration for cost and performance."
mode: "agent"
model: "GPT-4o"
tools: ["codebase"]
---

# Snowflake Performance Tuning

Optimize Snowflake queries and warehouse configuration for cost and performance.

**Context**: Optimizing a Snowflake query for performance and cost efficiency.

**Query**:
```sql
${input:query }
```

**Current Configuration**:
- Warehouse size: ${input:warehouse_size|default("X-Small") }
- Data volume: ${input:data_volume|default("Unknown") }
- Execution frequency: ${input:frequency|default("Ad-hoc") }

**Task**: Provide Snowflake-specific optimizations:

1. **Query Optimization**:
   - Clustering key recommendations
   - Partition pruning opportunities
   - Window function optimizations
   - Subquery to CTE conversions

2. **Warehouse Sizing**:
   - Recommend appropriate warehouse size
   - Auto-suspend configuration
   - Multi-cluster considerations

3. **Cost Optimization**:
   - Query result caching strategies
   - Data sharing opportunities
   - Storage optimization (compression, clustering)

4. **Performance Monitoring**:
   - Query profile analysis points
   - Performance metrics to track
   - Alerting recommendations

**Output**:
- Optimized query with Snowflake-specific features
- Warehouse configuration recommendations
- Cost and performance estimates
- Monitoring and alerting setup


## Requirements
- Follow data engineering best practices
- Include comprehensive error handling
- Optimize for performance and scalability
- Use appropriate tools and frameworks
- Ensure code is production-ready