---
description: "Generate data engineering code"
mode: "agent"
model: "GPT-4o"
tools: ["codebase"]
---

# Data Engineering Prompt

Generate data engineering code

# Apache Spark ETL Pipeline Generator

Generate a complete Apache Spark ETL pipeline for data processing and transformation.

## Context
Building an Apache Spark ETL pipeline to process `${input:source_format}` data and output `${input:target_format}`.

## Transformations needed
${input:transformations}

## Task
Generate a complete Spark ETL pipeline including:

### 1. Data Ingestion
- Read from `${input:source_format}` source
- Handle schema inference and validation
- Error handling for malformed records

### 2. Data Processing
- Apply transformations: ${input:transformations}
- Optimize for performance (caching, partitioning)
- Handle data quality issues

### 3. Data Output
- Write to `${input:target_format}` target
- Partition by: ${input:output_partitioning}
- Optimize write performance

### 4. Pipeline Configuration
- Spark configuration tuning
- Resource allocation
- Monitoring and logging

## Output
Complete PySpark/Scala code with configuration, error handling, and performance optimizations.

## Requirements
- Use PySpark or Scala
- Assume Spark cluster is available
- Follow data engineering best practices
- Include comprehensive error handling
- Optimize for performance and scalability


## Requirements
- Follow data engineering best practices
- Include comprehensive error handling
- Optimize for performance and scalability
- Use appropriate tools and frameworks
- Ensure code is production-ready