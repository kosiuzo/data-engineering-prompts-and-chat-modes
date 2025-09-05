---
description: "Identify facts and dimensions and design a 3NF or star schema for a dataset."
mode: "agent"
model: "GPT-4o"
tools: ["codebase"]
---

# Star Schema Designer

Identify facts and dimensions and design a 3NF or star schema for a dataset.

**Context**: We are modeling the ${input:business_domain } domain for analytics. We need a star schema with clear fact and dimension tables.

**Task**:
1. List potential **Fact tables** (with grain and measures).
2. List **Dimension tables** (with key and attributes) linked to those facts.
3. Sketch the relationships (ERD) and note any slowly changing dimensions (SCD).

**Output**:
- Fact table definitions (name, grain, measures).
- Dimension definitions (name, keys, important attributes, SCD type if applicable).
- A brief justification of the design (why this grain, how it satisfies analytics needs).


## Requirements
- Follow data engineering best practices
- Include comprehensive error handling
- Optimize for performance and scalability
- Use appropriate tools and frameworks
- Ensure code is production-ready