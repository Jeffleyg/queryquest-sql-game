# QueryQuest - Quick Start & Testing Guide

## 🚀 Quick Start

### 1. Start the Database

```bash
docker-compose up -d
```

### 2. Start the Backend

```bash
cd backend
npm install
npm run dev
```

Backend will run on: `http://localhost:3001`

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on: `http://localhost:5173`

### 4. Open in Browser

Navigate to: `http://localhost:5173`

## ✅ Testing the Progression System

### Test Scenario 1: Complete Mission 1

1. Open the dashboard
2. You should see **Mission 1** unlocked and **Missions 2-10** locked (🔒)
3. Click "Start Mission →" on Mission 1
4. Write this query:
   ```sql
   SELECT * FROM citizens WHERE district = 'Downtown';
   ```
5. Click "▶ Run Query"
6. You should see:
   - ✅ Success message with "+100 XP"
   - XP bar increases
   - Mission 2 unlocks

### Test Scenario 2: Sequential Unlocking

1. Go back to dashboard
2. Mission 1 should show "✓ Completed" badge
3. Mission 2 should now be unlocked
4. Missions 3-10 should still be locked
5. Click Mission 2: "Age Verification"
6. Write this query:
   ```sql
   SELECT * FROM citizens WHERE age >= 21;
   ```
7. Run query → earn 150 XP → Mission 3 unlocks

### Test Scenario 3: Replay Completed Mission

1. Go back to Mission 1
2. Run the same query again
3. You should see:
   - ✅ Success message
   - But message says "(Mission already completed - no XP awarded)"
   - XP does not increase
   - Button says "Play Again →"

### Test Scenario 4: Level Up

Complete missions sequentially until you reach 500 XP:
- Mission 1: 100 XP (total: 100)
- Mission 2: 150 XP (total: 250)
- Mission 3: 200 XP (total: 450)
- Mission 4: 250 XP (total: 700) ← **LEVEL UP to Level 2!**

Watch the header:
- Level badge updates: "LVL 1" → "LVL 2"
- XP bar resets and fills again
- XP to next level increases: 500 → 1000

### Test Scenario 5: Progress Persistence

1. Complete Mission 1
2. Refresh the page (F5)
3. Progress should be maintained:
   - Level and XP preserved
   - Mission 1 still marked as completed
   - Mission 2 still unlocked

### Test Scenario 6: Reset Progress

1. Click "↺ Reset" button in dashboard
2. Confirm the action
3. Page reloads
4. All progress reset:
   - Level 1, 0 XP
   - Only Mission 1 unlocked
   - All missions marked as incomplete

## 🎯 Solution Queries for All Missions

### Mission 1: The Missing Citizens
```sql
SELECT * FROM citizens WHERE district = 'Downtown';
```

### Mission 2: Age Verification
```sql
SELECT * FROM citizens WHERE age >= 21;
```

### Mission 3: Sorting the Census
```sql
SELECT * FROM citizens ORDER BY age DESC;
```

### Mission 4: Count the Population
```sql
SELECT district, COUNT(*) FROM citizens GROUP BY district;
```

### Mission 5: The Young Ones
```sql
SELECT * FROM citizens WHERE age BETWEEN 18 AND 25;
-- OR
SELECT * FROM citizens WHERE age >= 18 AND age <= 25;
```

### Mission 6: Average Age Investigation
```sql
SELECT AVG(age) FROM citizens WHERE district = 'Downtown';
```

### Mission 7: Name Pattern Search
```sql
SELECT * FROM citizens WHERE name LIKE 'A%';
```

### Mission 8: Multiple District Search
```sql
SELECT * FROM citizens WHERE district IN ('Downtown', 'Uptown');
-- OR
SELECT * FROM citizens WHERE district = 'Downtown' OR district = 'Uptown';
```

### Mission 9: District with Most Citizens
```sql
SELECT district, COUNT(*) as count 
FROM citizens 
GROUP BY district 
ORDER BY count DESC 
LIMIT 1;
```

### Mission 10: The Grand Census Report
```sql
SELECT district, COUNT(*) as count, AVG(age) as avg_age
FROM citizens 
GROUP BY district 
ORDER BY count DESC;
```

## 🐛 Troubleshooting

### Database Connection Issues

**Error**: "Failed to connect to database"

**Solution**:
```bash
# Check if PostgreSQL container is running
docker ps

# If not running, start it
docker-compose up -d

# Check logs
docker-compose logs db
```

### Backend Not Starting

**Error**: "Port 3001 already in use"

**Solution**:
```bash
# Find process using port 3001
netstat -ano | findstr :3001

# Kill the process (Windows)
taskkill /PID <process_id> /F

# Or change port in backend/.env
PORT=3002
```

### Frontend Not Loading Missions

**Error**: "Failed to load missions"

**Solution**:
1. Check backend is running: `http://localhost:3001/health`
2. Check browser console for errors (F12)
3. Verify CORS is enabled in backend
4. Check API URL in frontend code

### Progress Not Saving

**Solution**:
1. Open DevTools → Application → Local Storage
2. Check for `queryquest_player_progress` key
3. If missing, backend might not be responding
4. Try Reset Progress button

### Mission Locked Even After Completing Previous

**Solution**:
1. Check browser localStorage
2. Verify `completedMissions` array includes previous mission
3. Check `unlockedMissions` array includes current mission
4. Try refreshing the page
5. If still locked, use Reset Progress and try again

## 📊 Expected Progress Metrics

### After Completing All 10 Missions

- **Total XP Earned**: 3,200 XP
- **Expected Level**: ~3-4 (depends on XP curve)
- **Completed Missions**: 10/10
- **Unlocked Missions**: All 10

### XP Progression Table

| Missions Completed | Total XP | Expected Level | XP to Next Level |
|-------------------|----------|----------------|------------------|
| 0                 | 0        | 1              | 500              |
| 1                 | 100      | 1              | 500              |
| 2                 | 250      | 1              | 500              |
| 3                 | 450      | 1              | 500              |
| 4                 | 700      | 2              | 1000             |
| 5                 | 1000     | 2              | 1000             |
| 6                 | 1350     | 2              | 1000             |
| 7                 | 1750     | 3              | 1500             |
| 8                 | 2200     | 3              | 1500             |
| 9                 | 2700     | 3              | 1500             |
| 10                | 3300     | 4              | 2000             |

## 🎮 Advanced Testing

### Test API Directly with curl

```bash
# Get player progress
curl http://localhost:3001/api/progress?playerId=default

# Get all missions
curl http://localhost:3001/api/missions

# Execute a query
curl -X POST http://localhost:3001/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "SELECT * FROM citizens WHERE district = '\''Downtown'\'';",
    "missionId": "level1-mission1",
    "playerId": "default"
  }'

# Reset progress
curl -X POST http://localhost:3001/api/progress/reset \
  -H "Content-Type: application/json" \
  -d '{"playerId": "default"}'
```

### Test with Multiple Players

1. Open browser in incognito mode
2. Or use different browsers
3. Or manually change playerId in localStorage:
   ```javascript
   localStorage.setItem('queryquest_player_id', 'player2');
   ```

## 📝 Notes

- All missions run in database transactions that are rolled back
- Data is safe - no permanent changes to the database
- Progress is stored in-memory on backend (resets on server restart)
- Frontend uses localStorage for offline persistence
- For production, implement proper database storage for player progress

---

**Happy Testing! 🎉**
