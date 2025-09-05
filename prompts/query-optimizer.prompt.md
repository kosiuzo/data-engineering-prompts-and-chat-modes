---
description: "Analyze and optimize SQL queries for better performance and cost efficiency."
mode: "agent"
model: "GPT-4o"
tools: ["codebase"]
---

# SQL Query Optimizer

Analyze and optimize SQL queries for better performance and cost efficiency.

**Context**: Optimizing a SQL query for ${input:database_type|default("standard SQL") } database.

**Query to optimize**:
```sql
${input:query }
```

**Task**: Provide optimization recommendations including:

1. **Query Structure Analysis**:
   - Identify performance bottlenecks
   - Suggest index recommendations
   - Optimize JOIN strategies

2. **Query Rewriting**:
   - Provide optimized version of the query
   - Explain changes and reasoning

3. **Performance Considerations**:
   ${input:table_sizes }
   - Table size considerations: ${input:table_sizes }
   
   ${input:performance_requirements }
   - Performance requirements: ${input:performance_requirements }
   

4. **Cost Optimization**:
   - Reduce data scanning
   - Optimize aggregations
   - Minimize resource usage

**Output**: 
- Optimized query with comments
- Performance improvement estimates
- Index recommendations
- Best practices for similar queries


## Requirements
- Follow data engineering best practices
- Include comprehensive error handling
- Optimize for performance and scalability
- Use appropriate tools and frameworks
- Ensure code is production-ready