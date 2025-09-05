---
description: "Prepare data for recommendation systems including user-item interactions, feature engineering, and evaluation metrics."
mode: "agent"
model: "GPT-4o"
tools: ["codebase"]
---

# Recommendation System Data Prep

Prepare data for recommendation systems including user-item interactions, feature engineering, and evaluation metrics.

# Problem
Recommendation systems help users discover relevant items by analyzing their past behavior and preferences. This pattern prepares data for various recommendation algorithms including collaborative filtering, content-based filtering, and hybrid approaches.

Key challenges:
- **Data sparsity**: User-item interaction matrices are typically very sparse
- **Cold start problem**: New users or items with no interaction history
- **Scalability**: Handling large user and item catalogs
- **Evaluation**: Measuring recommendation quality and business impact
- **Feature engineering**: Creating meaningful user and item features

# Data Requirements
- **Interactions table**: `${input:interactions_table }` with:
- `${input:user_id }`: user identifier
- `${input:item_id }`: item identifier
- `${input:rating_column }`: interaction strength (rating, purchase, view, etc.)
- `${input:item_features_table }`: optional item metadata (category, price, etc.)
- `${input:user_features_table }`: optional user metadata (demographics, preferences)

# Steps
1. **Data Preparation**:
- Clean and validate interaction data
- Handle missing values and outliers
- Create user-item interaction matrix
- Split data into train/validation/test sets

2. **Feature Engineering**:
- Create user features (activity level, preferences, etc.)
- Create item features (popularity, category, etc.)
- Generate interaction features (recency, frequency, etc.)
- Handle categorical and numerical features

3. **Data Quality Checks**:
- Validate interaction patterns
- Check for data leakage
- Ensure proper train/test splits
- Validate feature distributions

4. **Evaluation Setup**:
- Define evaluation metrics (precision, recall, NDCG, etc.)
- Create holdout sets for testing
- Set up A/B testing framework
- Define business metrics

5. **Model Preparation**:
- Format data for different algorithms
- Handle cold start scenarios
- Optimize for scalability
- Prepare for real-time inference

# SQL / ETL Skeleton
```sql
-- User-Item Interaction Matrix
WITH user_item_interactions AS (
SELECT 
${input:user_id },
${input:item_id },
${input:rating_column|default("1") } as rating,
COUNT(*) as interaction_count,
MAX(interaction_date) as last_interaction
FROM ${input:interactions_table }
GROUP BY ${input:user_id }, ${input:item_id }
),
-- User Features
user_features AS (
SELECT 
${input:user_id },
COUNT(DISTINCT ${input:item_id }) as total_items,
COUNT(*) as total_interactions,
AVG(${input:rating_column|default("1") }) as avg_rating,
DATEDIFF(CURRENT_DATE, MAX(interaction_date)) as days_since_last_activity
FROM ${input:interactions_table }
GROUP BY ${input:user_id }
),
-- Item Features
item_features AS (
SELECT 
${input:item_id },
COUNT(DISTINCT ${input:user_id }) as total_users,
COUNT(*) as total_interactions,
AVG(${input:rating_column|default("1") }) as avg_rating,
DATEDIFF(CURRENT_DATE, MAX(interaction_date)) as days_since_last_interaction
FROM ${input:interactions_table }
GROUP BY ${input:item_id }
),
-- Popularity Features
popularity_features AS (
SELECT 
${input:item_id },
-- Item popularity score
COUNT(*) as popularity_score,
-- Item recency score
DATEDIFF(CURRENT_DATE, MAX(interaction_date)) as recency_score
FROM ${input:interactions_table }
GROUP BY ${input:item_id }
)
-- Final dataset for recommendations
SELECT 
ui.${input:user_id },
ui.${input:item_id },
ui.rating,
ui.interaction_count,
uf.total_items as user_total_items,
uf.avg_rating as user_avg_rating,
if.total_users as item_total_users,
if.avg_rating as item_avg_rating,
pf.popularity_score,
pf.recency_score
FROM user_item_interactions ui
LEFT JOIN user_features uf ON ui.${input:user_id } = uf.${input:user_id }
LEFT JOIN item_features if ON ui.${input:item_id } = if.${input:item_id }
LEFT JOIN popularity_features pf ON ui.${input:item_id } = pf.${input:item_id };

-- Train/Validation/Test Split
WITH interaction_split AS (
SELECT 
${input:user_id },
${input:item_id },
${input:rating_column|default("1") } as rating,
-- Random split for train/validation/test
CASE 
  WHEN RAND() < 0.7 THEN 'train'
  WHEN RAND() < 0.85 THEN 'validation'
  ELSE 'test'
END as split
FROM ${input:interactions_table }
)
SELECT 
${input:user_id },
${input:item_id },
rating,
split
FROM interaction_split;

-- Evaluation Metrics (simplified)
WITH recommendation_evaluation AS (
SELECT 
${input:user_id },
${input:item_id },
rating,
predicted_rating,
-- Calculate various metrics
ABS(rating - predicted_rating) as absolute_error,
CASE WHEN rating >= 4 AND predicted_rating >= 4 THEN 1 ELSE 0 END as precision_hit,
CASE WHEN rating >= 4 THEN 1 ELSE 0 END as recall_hit
FROM recommendations_with_ratings
)
SELECT 
AVG(absolute_error) as mean_absolute_error,
AVG(precision_hit) as precision,
AVG(recall_hit) as recall
FROM recommendation_evaluation;
```

# Idempotency & Backfills
- Interaction data can be updated incrementally
- Feature calculations are deterministic
- Train/test splits should be consistent
- Historical recommendations can be preserved

# Tests
- Data completeness: Verify all required fields are present
- Interaction validation: Check for valid user-item pairs
- Feature quality: Validate feature distributions and ranges
- Split consistency: Ensure train/test splits are stable
- Evaluation metrics: Verify calculation accuracy

# Success Criteria
- Clean, well-structured interaction data
- Meaningful user and item features
- Proper train/validation/test splits
- Comprehensive evaluation framework
- Scalable data preparation pipeline

# Example
User Input:
/choose-pattern name=recommendation
interactions_table="analytics.user_interactions"
user_id="user_id"
item_id="product_id"
rating_column="interaction_strength"
item_features_table="products.metadata"
user_features_table="users.profiles"

Copilot would generate:
- SQL queries for data preparation and feature engineering
- User-item interaction matrix creation
- Train/validation/test split logic
- Evaluation metrics calculation
- Data quality validation queries


## Requirements
- Follow data engineering best practices
- Include comprehensive error handling
- Optimize for performance and scalability
- Use appropriate tools and frameworks
- Ensure code is production-ready