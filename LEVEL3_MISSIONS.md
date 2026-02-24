# Level 3 Missions - Expert SQL

This document describes the 10 expert-level SQL missions that teach advanced query techniques and complex JOINs.

## Mission Overview

### Level 3-1: Right Side Investigation (1400 XP)
**Concept**: RIGHT JOIN
**Story**: Find all job positions including vacant ones
**Key Learning**: RIGHT JOIN keeps all records from right table, opposite of LEFT JOIN
**Query Example**: 
```sql
SELECT j.position, c.name 
FROM citizens c 
RIGHT JOIN jobs j ON c.id = j.citizen_id;
```
**Why It Matters**: Useful when the "lookup" table is on the right and you want to see all options, even unused ones.

### Level 3-2: Complete Picture (1500 XP)
**Concept**: FULL OUTER JOIN
**Story**: See all citizens AND all jobs, showing matches and gaps from both sides
**Key Learning**: FULL OUTER JOIN combines LEFT and RIGHT JOIN - keeps everything from both tables
**Query Example**:
```sql
SELECT c.name, j.position 
FROM citizens c 
FULL OUTER JOIN jobs j ON c.id = j.citizen_id;
```
**Why It Matters**: Perfect for finding orphaned records on either side of a relationship.

### Level 3-3: Mirror Match (1600 XP)
**Concept**: SELF JOIN
**Story**: Find pairs of citizens living in the same district
**Key Learning**: A table can JOIN to itself using aliases to find relationships within the same dataset
**Query Example**:
```sql
SELECT c1.name AS person1, c2.name AS person2, c1.district
FROM citizens c1 
JOIN citizens c2 ON c1.district = c2.district 
WHERE c1.id < c2.id;
```
**Why It Matters**: Essential for hierarchical data (employees-managers), finding duplicates, or pairing records.

### Level 3-4: United Forces (1700 XP)
**Concept**: UNION
**Story**: Combine current_residents and new_applicants into one list
**Key Learning**: UNION vertically combines results from multiple SELECT statements
**Query Example**:
```sql
SELECT name, age, 'Current' AS status FROM current_residents
UNION
SELECT name, age, 'New' AS status FROM new_applicants;
```
**Why It Matters**: Merging data from similar tables, combining historical and current data, or creating reports from multiple sources.

### Level 3-5: Selective Grouping (1800 XP)
**Concept**: HAVING Clause
**Story**: Find overcrowded districts with more than 2 residents
**Key Learning**: HAVING filters AFTER aggregation (WHERE filters BEFORE)
**Query Example**:
```sql
SELECT district, COUNT(*) AS population 
FROM citizens 
GROUP BY district 
HAVING COUNT(*) > 2;
```
**Why It Matters**: Report on aggregated data that meets certain thresholds.

### Level 3-6: Conditional Logic (1900 XP)
**Concept**: CASE Statements
**Story**: Categorize citizens by age group dynamically
**Key Learning**: CASE adds if/else logic directly in SQL
**Query Example**:
```sql
SELECT name, age,
  CASE 
    WHEN age < 30 THEN 'Young'
    WHEN age <= 50 THEN 'Adult'
    ELSE 'Senior'
  END AS age_group
FROM citizens;
```
**Why It Matters**: Dynamic categorization, custom sorting, conditional calculations.

### Level 3-7: Department Analytics (2000 XP)
**Concept**: Multi-table JOINs with Aggregations
**Story**: Join 4 tables to calculate department salary spending and employee counts
**Key Learning**: Combining multiple JOINs with GROUP BY and aggregate functions
**Query Example**:
```sql
SELECT d.name, COUNT(DISTINCT c.id) AS employees, SUM(j.salary) AS total_salary
FROM departments d
JOIN jobs j ON d.id = j.department_id
JOIN citizens c ON j.citizen_id = c.id
GROUP BY d.name;
```
**Why It Matters**: Real-world reporting requires joining many tables and aggregating data.

### Level 3-8: Existence Check (2100 XP)
**Concept**: EXISTS with Correlated Subqueries
**Story**: Find employed citizens using EXISTS
**Key Learning**: EXISTS is often more efficient than JOIN when you only care about existence
**Query Example**:
```sql
SELECT name 
FROM citizens c 
WHERE EXISTS (
  SELECT 1 FROM jobs j WHERE j.citizen_id = c.id
);
```
**Why It Matters**: Performance optimization, checking for related records without retrieving them.

### Level 3-9: The Top Performers (2200 XP)
**Concept**: Subqueries with HAVING
**Story**: Find departments where average salary exceeds city average
**Key Learning**: Combining subqueries in HAVING clause for advanced filtering
**Query Example**:
```sql
SELECT d.name, AVG(j.salary) AS avg_salary
FROM departments d 
JOIN jobs j ON d.id = j.department_id
GROUP BY d.name
HAVING AVG(j.salary) > (SELECT AVG(salary) FROM jobs);
```
**Why It Matters**: Comparative analysis, finding outliers, performance benchmarking.

### Level 3-10: Master Query Challenge (2500 XP)
**Concept**: Combined Advanced Techniques
**Story**: Create comprehensive city report with multiple advanced SQL features
**Key Learning**: Real-world queries often combine many techniques
**Query Example**:
```sql
SELECT 
  d.name AS district,
  COUNT(c.id) AS population,
  COUNT(j.id) AS employed,
  COALESCE(AVG(j.salary), 0) AS avg_salary,
  CASE 
    WHEN COUNT(j.id)::FLOAT / COUNT(c.id) > 0.6 THEN 'High'
    WHEN COUNT(j.id)::FLOAT / COUNT(c.id) >= 0.3 THEN 'Medium'
    ELSE 'Low'
  END AS employment_level
FROM districts d
LEFT JOIN citizens c ON d.id = c.district_id
LEFT JOIN jobs j ON c.id = j.citizen_id
GROUP BY d.name;
```
**Why It Matters**: Demonstrates how to build complex, production-ready analytical queries.

## SQL Concepts Covered

### JOIN Types Mastery
- **INNER JOIN** (Level 2): Only matching records
- **LEFT JOIN** (Level 2): All left + matching right
- **RIGHT JOIN** (Level 3): All right + matching left
- **FULL OUTER JOIN** (Level 3): Everything from both sides
- **SELF JOIN** (Level 3): Table joined to itself
- **Multiple JOINs** (Levels 2-3): Chaining 3+ tables

### Advanced Filtering
- **HAVING** (Level 3): Filter aggregated results
- **EXISTS** (Level 3): Check for related record existence
- **IN with Subqueries** (Levels 1-3): Match against subquery results

### Data Combination
- **UNION** (Level 3): Vertically combine result sets
- **UNION ALL** (Level 3): Keep duplicates when combining

### Logic and Calculation
- **CASE** (Level 3): Conditional logic in queries
- **COALESCE** (Level 3): Handle NULL values
- **Subqueries** (Levels 2-3): Nested SELECT statements
- **Correlated Subqueries** (Level 3): Subqueries referencing outer query

### Complex Aggregations
- **GROUP BY with multiple JOINs** (Level 3)
- **HAVING with subqueries** (Level 3)
- **Multiple aggregate functions** (Level 3)
- **COUNT DISTINCT** (Level 3)

## Progression System

### XP Distribution
- **Level 1** (Missions 1-10): 100-600 XP = 3,500 XP total
- **Level 2** (Missions 11-20): 700-1,300 XP = 9,500 XP total
- **Level 3** (Missions 21-30): 1,400-2,500 XP = 19,000 XP total
- **Grand Total**: 32,000 XP across 30 missions

### Level Requirements
- Level 1 → 2: Complete Mission 10
- Level 2 → 3: Complete Mission 20
- Player levels scale: 500 × current_level XP per level
- Maximum player level: 30

## Technical Challenge Progression

### Complexity Metrics
1. **Number of tables**: 1 → 2 → 3 → 4+
2. **JOIN depth**: No JOINs → 1 JOIN → 2 JOINs → 3+ JOINs
3. **Subquery nesting**: 0 → 1 level → 2+ levels
4. **Aggregation complexity**: None → Simple → Multiple → With HAVING
5. **Logic complexity**: Direct → CASE → Correlated subqueries

### Real-World Applications
- **Business Intelligence**: Department analytics, performance reporting
- **Data Auditing**: Finding orphaned records, checking relationships
- **ETL Processes**: Combining data sources with UNION
- **Performance Analysis**: Finding outliers, comparative metrics
- **Hierarchical Data**: Self-joins for org charts, category trees

## Study Tips

### Mastering JOINs
1. Draw Venn diagrams to visualize which JOIN type you need
2. Start with INNER JOIN, then expand to LEFT/RIGHT/FULL as needed
3. Always alias tables when joining more than 2 tables
4. Use meaningful aliases (c for citizens, j for jobs, not t1, t2)

### Debugging Complex Queries
1. Build incrementally: Start with basic SELECT, add JOINs one at a time
2. Test aggregations before adding HAVING
3. Verify subqueries independently before nesting
4. Use COUNT(*) to verify JOIN results aren't creating duplicates

### Performance Considerations
1. EXISTS vs IN: EXISTS stops at first match (faster)
2. JOIN vs Subquery: JOINs are often faster for large datasets
3. HAVING vs WHERE: Filter early with WHERE when possible
4. Indexes matter: JOINs on indexed columns are much faster

## Next Steps

After completing Level 3, students will have mastered:
✅ All JOIN types including SELF JOIN
✅ Complex multi-table queries
✅ Subqueries and correlated subqueries
✅ Advanced filtering with HAVING and EXISTS
✅ Conditional logic with CASE
✅ Data combination with UNION
✅ Real-world analytical queries

### Future Expansion Ideas
- **Level 4**: Window functions (ROW_NUMBER, RANK, LAG/LEAD)
- **Level 5**: CTEs (Common Table Expressions), Recursive queries
- **Level 6**: Query optimization, EXPLAIN plans, indexes
- **Level 7**: Transactions, ACID properties, concurrency
- **Level 8**: Views, materialized views, stored procedures
- **Level 9**: Triggers, constraints, database design
- **Level 10**: Advanced topics (JSON, full-text search, partitioning)
