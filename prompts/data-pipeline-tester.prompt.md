---
description: "Create comprehensive testing framework for data pipelines including unit, integration, and data quality tests."
mode: "agent"
model: "GPT-4o"
tools: ["codebase"]
---

# Pipeline Testing Framework

Create comprehensive testing framework for data pipelines including unit, integration, and data quality tests.

**Context**: Setting up testing framework for ${input:pipeline_type } pipeline with data sources: ${input:data_sources }.

**Task**: Create a comprehensive testing strategy including:

1. **Unit Tests**:
   - Test individual functions and transformations
   - Mock external dependencies
   - Edge case handling

2. **Integration Tests**:
   - End-to-end pipeline testing
   - Data source connectivity
   - Output validation

3. **Data Quality Tests**:
   ${input:business_rules }
   - Business rule validation: ${input:business_rules }
   
   - Schema validation
   - Data completeness checks
   - Performance benchmarks

4. **Test Data Management**:
   - Test data generation
   - Data isolation strategies
   - Cleanup procedures

5. **CI/CD Integration**:
   - Automated test execution
   - Test reporting
   - Failure notifications

**Output**: Complete testing framework with test cases, configuration, and CI/CD integration setup.


## Requirements
- Follow data engineering best practices
- Include comprehensive error handling
- Optimize for performance and scalability
- Use appropriate tools and frameworks
- Ensure code is production-ready