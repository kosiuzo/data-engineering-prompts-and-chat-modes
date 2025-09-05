---
description: "Create Kafka stream processing pipeline for real-time data processing."
mode: "agent"
model: "GPT-4o"
tools: ["codebase"]
---

# Kafka Stream Processing

Create Kafka stream processing pipeline for real-time data processing.

**Context**: Building a Kafka stream processing pipeline from `${input:input_topic }` to `${input:output_topic }`.

**Processing Logic**: ${input:processing_logic }

**Task**: Generate a complete Kafka stream processing solution:

1. **Stream Configuration**:
   - Kafka Streams application setup
   - Consumer and producer configuration
   - Serialization/deserialization setup

2. **Stream Processing**:
   - Implement processing logic: ${input:processing_logic }
   ${input:window_size }
   - Apply windowing: ${input:window_size }
   
   - Handle late-arriving data
   - State management for aggregations

3. **Error Handling**:
   - Dead letter queue setup
   - Retry mechanisms
   - Monitoring and alerting

4. **Performance Tuning**:
   - Partitioning strategy
   - Parallelism configuration
   - Resource optimization

**Output**: Complete Kafka Streams code with configuration, monitoring, and deployment considerations.


## Requirements
- Follow data engineering best practices
- Include comprehensive error handling
- Optimize for performance and scalability
- Use appropriate tools and frameworks
- Ensure code is production-ready