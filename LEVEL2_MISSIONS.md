# Level 2 Missions - Advanced SQL

This document describes the 10 advanced SQL missions added to QueryQuest.

## Mission Overview

### Level 2-1: Team Up (700 XP)
**Concept**: INNER JOIN
**Story**: Combine citizens and jobs tables to find who works where
**Key Learning**: Basic JOIN syntax, matching tables on foreign keys
**Query**: `SELECT c.name, j.company, j.position FROM citizens c INNER JOIN jobs j ON c.id = j.citizen_id;`

### Level 2-2: The Missing Records (750 XP)
**Concept**: LEFT JOIN
**Story**: Find all citizens including those without jobs
**Key Learning**: LEFT JOIN keeps all records from left table
**Query**: `SELECT c.name, j.company FROM citizens c LEFT JOIN jobs j ON c.id = j.citizen_id;`

### Level 2-3: New Arrival (800 XP)
**Concept**: INSERT INTO
**Story**: Register a new citizen in the database
**Key Learning**: Adding new records to tables
**Query**: `INSERT INTO citizens (name, age, district) VALUES ('Emma Wilson', 26, 'Downtown');`

### Level 2-4: Address Change (850 XP)
**Concept**: UPDATE
**Story**: Update a citizen's district when they move
**Key Learning**: Modifying existing records with WHERE clause
**Query**: `UPDATE citizens SET district = 'Uptown' WHERE name = 'Alice Johnson';`

### Level 2-5: Clean Up (900 XP)
**Concept**: DELETE
**Story**: Remove test records from database
**Key Learning**: Deleting records safely with WHERE clause
**Query**: `DELETE FROM citizens WHERE district = 'TestDistrict';`

### Level 2-6: Build Your Own (950 XP)
**Concept**: CREATE TABLE
**Story**: Create a new vehicles registration table
**Key Learning**: Defining table structure with columns and data types
**Query**: `CREATE TABLE vehicles (id SERIAL PRIMARY KEY, plate VARCHAR(20), owner VARCHAR(100), model VARCHAR(100), year INT);`

### Level 2-7: Expansion Plan (1000 XP)
**Concept**: ALTER TABLE
**Story**: Add email column to citizens table
**Key Learning**: Modifying table structure after creation
**Query**: `ALTER TABLE citizens ADD COLUMN email VARCHAR(100);`

### Level 2-8: Triple Connection (1100 XP)
**Concept**: Multiple JOINs
**Story**: Connect citizens, jobs, and managers tables
**Key Learning**: Chaining multiple JOINs together
**Query**: `SELECT c.name, j.position, m.department FROM citizens c JOIN jobs j ON c.id = j.citizen_id JOIN managers m ON j.manager_id = m.id;`

### Level 2-9: Nested Intelligence (1200 XP)
**Concept**: Subqueries
**Story**: Find citizens earning above average salary
**Key Learning**: Using queries within queries
**Query**: `SELECT name, salary FROM citizens WHERE salary > (SELECT AVG(salary) FROM citizens);`

### Level 2-10: Demolition Day (1300 XP)
**Concept**: DROP TABLE
**Story**: Remove obsolete temp_data table
**Key Learning**: Permanently removing tables from database
**Query**: `DROP TABLE temp_data;`

## Progression System

- **Level Cap**: Increased from 10 to 20
- **Unlocking**: Complete Level 1-10 to unlock Level 2-1
- **Sequential Unlocking**: Each Level 2 mission unlocks the next
- **Total XP Available**: Level 1 (3,500 XP) + Level 2 (9,500 XP) = 13,000 XP

## Technical Implementation

### Files Created
- `backend/src/missions/level2-mission1.json` through `level2-mission10.json`

### Services Updated
- `missionService.ts`: Updated sorting to handle multiple levels
- `playerProgressService.ts`: 
  - MAX_LEVEL increased to 20
  - completeMission() updated to unlock Level 2-1 after Level 1-10
  - Supports cross-level progression

### Frontend Updates
- `Dashboard.tsx`: Updated hero stats to show "20+ Cases"
- `MissionPage.tsx`: Navigation now works across all unlocked missions
- Mission cards automatically display correct level badge

## Testing New Missions

1. Complete all Level 1 missions (1-10)
2. Level 2-1 will automatically unlock
3. Test each SQL concept progressively
4. Use the QueryBuilder or manual SQL editor

## SQL Concepts Covered

**Data Retrieval (Level 1)**
- SELECT, WHERE, ORDER BY, GROUP BY
- Aggregate functions
- Pattern matching (LIKE, IN, BETWEEN)

**Data Manipulation (Level 2)**
- INSERT, UPDATE, DELETE
- Transactions safety
- WHERE clause importance

**Table Management (Level 2)**
- CREATE TABLE, ALTER TABLE, DROP TABLE
- Table relationships
- Schema design

**Advanced Queries (Level 2)**
- INNER JOIN, LEFT JOIN, Multiple JOINs
- Subqueries
- Complex data relationships

## Next Steps

Future expansions could include:
- Level 3: Transactions, indexes, constraints
- Level 4: Views, stored procedures, triggers
- Level 5: Advanced optimization, window functions
