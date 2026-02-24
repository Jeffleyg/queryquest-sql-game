# QueryQuest - Quick Commands Reference

## 🚀 Start Everything (First Time)

```bash
# Terminal 1 - Start Database
docker-compose up -d

# Terminal 2 - Start Backend
cd backend
npm install
npm run dev

# Terminal 3 - Start Frontend  
cd frontend
npm install
npm run dev
```

Then open: **http://localhost:5173**

---

## 🔄 Restart Everything (Already Installed)

```bash
# Terminal 1 - Database (if not running)
docker-compose up -d

# Terminal 2 - Backend
cd backend
npm run dev

# Terminal 3 - Frontend
cd frontend
npm run dev
```

---

## 🛑 Stop Everything

```bash
# Stop Backend/Frontend: Ctrl+C in each terminal

# Stop Database
docker-compose down
```

---

## 🧹 Clean Restart

```bash
# Stop all containers
docker-compose down -v

# Rebuild and start
docker-compose up -d

# Restart backend/frontend (Ctrl+C then npm run dev)
```

---

## 🔍 Check Status

```bash
# Check database
docker ps

# Check backend health
curl http://localhost:3001/health

# Check if ports are in use
netstat -ano | findstr :3001
netstat -ano | findstr :5173
netstat -ano | findstr :5432
```

---

## 📊 API Testing Commands

```bash
# Get all missions
curl http://localhost:3001/api/missions

# Get specific mission
curl http://localhost:3001/api/missions/level1-mission1

# Get player progress
curl http://localhost:3001/api/progress?playerId=default

# Execute query
curl -X POST http://localhost:3001/api/query \
  -H "Content-Type: application/json" \
  -d "{\"sql\":\"SELECT * FROM citizens WHERE district='Downtown';\",\"missionId\":\"level1-mission1\",\"playerId\":\"default\"}"

# Reset progress
curl -X POST http://localhost:3001/api/progress/reset \
  -H "Content-Type: application/json" \
  -d "{\"playerId\":\"default\"}"
```

---

## 🐛 Troubleshooting Commands

### Port Already in Use

```bash
# Windows - Kill process on port
netstat -ano | findstr :<PORT>
taskkill /PID <PID> /F

# Example for backend (port 3001)
netstat -ano | findstr :3001
taskkill /PID 12345 /F
```

### Database Connection Issues

```bash
# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db

# Access database directly
docker exec -it queryquest-db psql -U postgres -d queryquest
```

### Clear Browser Cache

1. Open DevTools (F12)
2. Application tab → Storage → Clear site data
3. Or: Settings → Privacy → Clear browsing data

### Reset Everything

```bash
# Backend - no cache
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend - no cache
cd frontend
rm -rf node_modules package-lock.json
npm install

# Database - fresh start
docker-compose down -v
docker-compose up -d
```

---

## 📝 Development Commands

### Backend

```bash
cd backend

# Development with auto-reload
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Run tests (if configured)
npm test

# Lint code
npm run lint
```

### Frontend

```bash
cd frontend

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests (if configured)
npm test

# Lint code
npm run lint
```

---

## 🗄️ Database Commands

```bash
# Connect to database
docker exec -it queryquest-db psql -U postgres -d queryquest

# Inside PostgreSQL:
\dt              # List tables
\d citizens      # Describe citizens table
SELECT * FROM citizens;  # View all citizens
\q               # Quit
```

---

## 📦 Update Dependencies

```bash
# Backend
cd backend
npm update

# Frontend
cd frontend
npm update

# Check for outdated packages
npm outdated
```

---

## 🎯 Quick Test Queries

### Mission 1
```sql
SELECT * FROM citizens WHERE district = 'Downtown';
```

### Mission 2
```sql
SELECT * FROM citizens WHERE age >= 21;
```

### Mission 3
```sql
SELECT * FROM citizens ORDER BY age DESC;
```

### Mission 4
```sql
SELECT district, COUNT(*) FROM citizens GROUP BY district;
```

### Mission 5
```sql
SELECT * FROM citizens WHERE age BETWEEN 18 AND 25;
```

### Mission 6
```sql
SELECT AVG(age) FROM citizens WHERE district = 'Downtown';
```

### Mission 7
```sql
SELECT * FROM citizens WHERE name LIKE 'A%';
```

### Mission 8
```sql
SELECT * FROM citizens WHERE district IN ('Downtown', 'Uptown');
```

### Mission 9
```sql
SELECT district, COUNT(*) as count FROM citizens GROUP BY district ORDER BY count DESC LIMIT 1;
```

### Mission 10
```sql
SELECT district, COUNT(*) as count, AVG(age) as avg_age FROM citizens GROUP BY district ORDER BY count DESC;
```

---

## 🎨 Browser DevTools Tips

### Check Player Progress
1. F12 → Application → Local Storage
2. Look for: `queryquest_player_progress`
3. Value shows current level, XP, completed missions

### View API Calls
1. F12 → Network tab
2. Filter: XHR/Fetch
3. Click on request to see details

### Check for Errors
1. F12 → Console tab
2. Look for red error messages
3. Check Sources tab for debugging

---

## 📚 Documentation Reference

- **README.md** - Project overview & setup
- **PROGRESSION_SYSTEM.md** - How progression works
- **TESTING_GUIDE.md** - Full testing scenarios
- **CHANGELOG.md** - What was implemented
- **QUICK_COMMANDS.md** - This file

---

## 🆘 Emergency Fixes

### "Cannot GET /"
- Frontend not running or wrong URL
- Check: http://localhost:5173 (not 3001)

### "Failed to load missions"
- Backend not running
- Check: http://localhost:3001/health

### "Database connection failed"
- PostgreSQL not running
- Run: `docker-compose up -d`

### "Port already in use"
- Another instance running
- Kill process or change port

### "Mission won't unlock"
- Try Reset Progress button
- Check localStorage in DevTools
- Refresh page

---

## ✅ Quick Checklist

Before reporting issues, verify:

- [ ] Docker is running
- [ ] PostgreSQL container is up (`docker ps`)
- [ ] Backend is running on port 3001
- [ ] Frontend is running on port 5173
- [ ] Browser is on http://localhost:5173 (not 3001)
- [ ] No console errors (F12)
- [ ] Tried refreshing the page
- [ ] Tried clearing browser cache

---

**Need more help?** Check the full documentation files!
