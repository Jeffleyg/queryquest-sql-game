# QueryQuest - Progression System Documentation

## Overview

QueryQuest implements a comprehensive progression system with:
- **10 SQL Missions** (extendable)
- **Sequential unlocking** (complete Mission 1 to unlock Mission 2, etc.)
- **XP (Experience Points)** system with level progression
- **XP caps** to prevent overflow
- **Progress persistence** using browser localStorage and backend sync

## Mission Structure

### Available Missions

1. **Mission 1**: The Missing Citizens - Basic SELECT and WHERE
2. **Mission 2**: Age Verification - Comparison operators (>=)
3. **Mission 3**: Sorting the Census - ORDER BY DESC
4. **Mission 4**: Count the Population - COUNT() and GROUP BY
5. **Mission 5**: The Young Ones - BETWEEN/AND conditions
6. **Mission 6**: Average Age Investigation - AVG() function
7. **Mission 7**: Name Pattern Search - LIKE operator
8. **Mission 8**: Multiple District Search - IN/OR operators
9. **Mission 9**: District with Most Citizens - COUNT, GROUP BY, ORDER BY, LIMIT
10. **Mission 10**: The Grand Census Report - Multiple aggregates (COUNT & AVG)

### XP Rewards

Each mission awards progressively more XP:
- Mission 1: 100 XP
- Mission 2: 150 XP
- Mission 3: 200 XP
- Mission 4: 250 XP
- Mission 5: 300 XP
- Mission 6: 350 XP
- Mission 7: 400 XP
- Mission 8: 450 XP
- Mission 9: 500 XP
- Mission 10: 600 XP

**Total XP Available**: 3,200 XP

## Level System

### Level Progression

- **Starting Level**: 1
- **XP per Level**: 500 × Current Level
  - Level 1 → 2: 500 XP
  - Level 2 → 3: 1,000 XP
  - Level 3 → 4: 1,500 XP
  - etc.

- **Maximum Level**: 10
- **XP Cap**: Once at max level, XP is capped at the next level threshold

### Level-Up Calculation

```typescript
while (currentXP >= xpToNextLevel && currentLevel < MAX_LEVEL) {
  currentXP -= xpToNextLevel;
  currentLevel++;
  xpToNextLevel = 500 * currentLevel;
}
```

## Mission Unlocking Logic

### Rules

1. **First Mission**: Always unlocked (level1-mission1)
2. **Subsequent Missions**: Unlocked sequentially after completing the previous one
3. **Already Completed**: Can be replayed but no XP is awarded on subsequent completions
4. **Locked Missions**: Cannot be accessed until previous mission is completed

### Backend Validation

The backend validates:
- Is the mission unlocked for this player?
- Has the player already completed this mission?
- Should XP be awarded?

### Frontend Display

Missions display three states:
- **🔒 Locked**: Grayed out with lock overlay
- **Available**: Normal appearance, "Start Mission →" button
- **✓ Completed**: Green border, "Play Again →" button (no XP on replay)

## Storage & Persistence

### Frontend (Client-Side)

Uses `localStorage` to store:
```json
{
  "currentLevel": 1,
  "currentXP": 0,
  "xpToNextLevel": 500,
  "completedMissions": ["level1-mission1"],
  "unlockedMissions": ["level1-mission1", "level1-mission2"]
}
```

### Backend (Server-Side)

Currently uses in-memory storage (Map) with player ID "default".
- Tracks same data structure as frontend
- Automatically unlocks next mission on completion
- Manages XP addition and level-up calculations

**Note**: For production, replace with database storage (PostgreSQL, MongoDB, etc.)

## API Endpoints

### Get Player Progress
```
GET /api/progress?playerId=default
```

Returns:
```json
{
  "currentLevel": 2,
  "currentXP": 150,
  "xpToNextLevel": 1000,
  "completedMissions": ["level1-mission1", "level1-mission2"],
  "unlockedMissions": ["level1-mission1", "level1-mission2", "level1-mission3"]
}
```

### Reset Progress (Development Tool)
```
POST /api/progress/reset
Body: { "playerId": "default" }
```

### Execute Query with Progress Tracking
```
POST /api/query
Body: {
  "sql": "SELECT * FROM citizens WHERE district = 'Downtown';",
  "missionId": "level1-mission1",
  "playerId": "default"
}
```

Returns:
```json
{
  "success": true,
  "columns": ["id", "name", "district", "age"],
  "rows": [...],
  "rowCount": 3,
  "feedback": "Mission complete! You found 3 record(s). Well done, Detective! 🎉 +100 XP",
  "xpEarned": 100,
  "playerProgress": {
    "currentLevel": 1,
    "currentXP": 100,
    "xpToNextLevel": 500,
    "completedMissions": ["level1-mission1"],
    "unlockedMissions": ["level1-mission1", "level1-mission2"]
  }
}
```

## Adding New Missions

### Create Mission File

1. Create `backend/src/missions/level1-missionX.json`:

```json
{
  "id": "level1-missionX",
  "title": "Your Mission Title",
  "level": 1,
  "description": "Brief description",
  "story": "Narrative context for the mission",
  "hint": "Help text for students",
  "xpReward": 700,
  "tableSetup": "CREATE TABLE ...; INSERT INTO ...",
  "validationRules": {
    "requiredKeywords": ["SELECT", "FROM", "YOUR_KEYWORD"],
    "forbiddenKeywords": []
  }
}
```

2. The mission will automatically be loaded by the `missionService.ts`

3. Update progression logic if needed (currently auto-unlocks sequentially)

## Testing the Progression System

### Test Flow

1. Start the application
2. Complete Mission 1
3. Verify Mission 2 unlocks
4. Complete all 10 missions
5. Check XP progression and level-ups
6. Try replaying a completed mission (should not award XP)
7. Use "Reset Progress" button to start over

### Manual Testing Commands

```bash
# Frontend
cd frontend
npm run dev

# Backend
cd backend
npm run dev

# Database
docker-compose up -d
```

## Future Enhancements

### Recommended Improvements

1. **Database Integration**: Replace in-memory storage with PostgreSQL
2. **User Accounts**: Add authentication and multi-user support
3. **Achievements**: Add badges for specific accomplishments
4. **Leaderboard**: Track fastest completion times
5. **Hints System**: Cost hints with XP
6. **Daily Challenges**: Rotating bonus missions
7. **Multiplayer**: Compare solutions with friends
8. **Advanced Missions**: Add JOIN operations, subqueries, etc.
9. **Analytics**: Track which missions students struggle with
10. **Mobile Support**: Responsive design improvements

## Troubleshooting

### Progress Not Saving

- Check browser localStorage: Open DevTools → Application → Local Storage
- Verify backend is running on port 3001
- Check network tab for API call failures

### Mission Not Unlocking

- Ensure previous mission shows "✓ Completed"
- Check browser console for errors
- Verify `completedMissions` array in localStorage

### XP Not Updating

- Refresh the page to sync with backend
- Check that query validation passed all checks
- Verify mission wasn't already completed

## Code References

### Key Files

**Backend:**
- `backend/src/services/playerProgressService.ts` - Progress logic
- `backend/src/controllers/queryController.ts` - Query execution & validation
- `backend/src/controllers/progressController.ts` - Progress endpoints
- `backend/src/missions/*.json` - Mission definitions

**Frontend:**
- `frontend/src/utils/playerStorage.ts` - localStorage management
- `frontend/src/pages/Dashboard.tsx` - Mission list with lock states
- `frontend/src/pages/MissionPage.tsx` - Query execution
- `frontend/src/components/MissionCard.tsx` - Mission display states
- `frontend/src/components/Header.tsx` - XP bar display

---

**Created**: February 23, 2026  
**Version**: 1.0  
**Author**: QueryQuest Team
