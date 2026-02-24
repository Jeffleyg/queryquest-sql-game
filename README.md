# QueryQuest - SQL Learning Game 🎮

A gamified SQL learning platform for teenagers (12–16 years old), designed to teach database concepts through interactive missions and real query execution.

## 📋 Overview

QueryQuest transforms SQL learning into an engaging adventure where students complete missions by writing and executing real SQL queries. The platform provides a safe, containerized PostgreSQL environment and tracks progress through an XP (experience points) system.

## ✨ Features

- **20+ Interactive Missions**: Learn SQL through story-driven challenges across 2 levels
  - **Level 1 (Missions 1-10)**: Fundamentals - SELECT, WHERE, ORDER BY, GROUP BY, aggregates
  - **Level 2 (Missions 11-20)**: Advanced - JOINs, INSERT, UPDATE, DELETE, CREATE/ALTER/DROP
- **Real-time Query Execution**: Execute SQL queries against a live PostgreSQL database
- **Progression System**: Earn XP, level up, and unlock new missions sequentially
- **Visual Query Builder**: Drag-and-drop interface for constructing queries
- **SQL Safety**: Built-in validation to prevent destructive operations
- **Modern UI**: Clean, responsive interface built with React and TypeScript
- **Dockerized Environment**: Easy setup with Docker Compose

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [Docker](https://www.docker.com/) and Docker Compose
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/queryquest-sql-game.git
   cd queryquest-sql-game
   ```

2. **Start the PostgreSQL database**
   ```bash
   docker-compose up -d
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```

5. **Install frontend dependencies** (in a new terminal)
   ```bash
   cd frontend
   npm install
   ```

6. **Start the frontend development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   
   Navigate to `http://localhost:5173` to start playing!

### Firebase Auth setup

1. **Create a Firebase project**
   - Go to https://console.firebase.google.com/
   - Create a project and add a Web app

2. **Enable Authentication providers**
   - In Authentication, enable **Google** and **Email/Password**

3. **Frontend env vars**
   - Create or edit `frontend/.env` with your Firebase web config:
   ```bash
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_FIREBASE_MEASUREMENT_ID=...
   ```

4. **Backend service account**
   - Create a service account JSON in Firebase Console
   - Set `FIREBASE_SERVICE_ACCOUNT_PATH` in your backend environment, for example:
   ```bash
   FIREBASE_SERVICE_ACCOUNT_PATH=C:\\path\\to\\firebase-service-account.json
   ```

5. **Update database schema (if needed)**
   - If the database already exists, run:
   ```sql
   ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
   ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(255) UNIQUE;
   ```

## 🧪 Testing

### Backend Tests

Run unit and integration tests:

```bash
cd backend
npm install  # Install Jest and testing dependencies
npm test
```

Run tests in watch mode (for development):
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm run test:coverage
```

**Test Coverage:**
- SQL Safety validation (DELETE/UPDATE without WHERE, CREATE/ALTER/DROP restrictions)
- Authentication and token generation
- Query execution and error handling

### CI/CD Pipeline

GitHub Actions is configured to:
- Run backend tests and TypeScript type checking on every push to `main` or `develop`
- Build the frontend and check for type errors
- Audit dependencies for security vulnerabilities
- Generate coverage reports

Workflows are defined in `.github/workflows/`:
- `backend.yml` - Backend tests, build, and security checks
- `frontend.yml` - Frontend build and type checking

## 📊 Query Performance Analysis

The platform now includes **EXPLAIN ANALYZE** functionality to help students understand query performance:

1. **Execute a query** normally in a mission
2. **Click the "⚡ Performance" tab** in the results panel
3. **Click "Analyze Performance"** to see the execution plan
4. Understand:
   - **Execution Time:** How long the query took to run
   - **Query Plan:** PostgreSQL's plan for executing the query
   - **Cost:** Lower is better - indicates more efficient queries
   - **Seq Scan vs Index Scan:** Learning when to optimize with indexes

This helps students learn:
- Why some queries are faster than others
- How indexes improve performance
- Database optimization techniques

### Firebase Hosting (optional)

If you want to deploy the frontend on Firebase Hosting:

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login and init**
   ```bash
   firebase login
   firebase init
   ```
   - Choose **Hosting**
   - Set the public directory to `frontend/dist`
   - Use `true` for single-page app rewrite

3. **Build and deploy**
   ```bash
   cd frontend
   npm run build
   cd ..
   firebase deploy
   ```

## 🏗️ Project Structure

```
queryquest-sql-game/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # SQL safety validation
│   │   ├── missions/        # Mission definitions (JSON)
│   │   ├── routes/          # API routes
│   │   └── services/        # Business logic
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   └── types/           # TypeScript type definitions
│   └── package.json
└── docker-compose.yml       # PostgreSQL container setup
```

## 🎯 How to Play

1. **Choose a Mission**: Select a mission from the dashboard
2. **Read the Challenge**: Understand what data you need to retrieve
3. **Write Your Query**: Use the SQL editor to craft your query
4. **Execute**: Run your query against the live database
5. **Validate**: Get instant feedback on your solution
6. **Earn XP**: Complete missions to gain experience points!

## 🛠️ Technology Stack

### Backend
- **Node.js** with **Express**: REST API server
- **TypeScript**: Type-safe development
- **PostgreSQL**: Relational database
- **pg**: PostgreSQL client for Node.js

### Frontend
- **React**: User interface library
- **TypeScript**: Type-safe development
- **Vite**: Build tool and development server
- **CSS**: Custom styling

### DevOps
- **Docker**: Container platform
- **Docker Compose**: Multi-container orchestration

## 📚 API Endpoints

### Missions
- `GET /api/missions` - Get all available missions
- `GET /api/missions/:id` - Get a specific mission

### Query Execution
- `POST /api/query/execute` - Execute a SQL query
- `POST /api/query/validate` - Validate a query for a mission

## 🎓 Learning Path

### Level 1: SQL Fundamentals (Missions 1-10)
Master the basics of data retrieval:
- Mission 1-2: SELECT and WHERE clauses
- Mission 3: ORDER BY for sorting
- Mission 4-5: GROUP BY and aggregate functions
- Mission 6: AVG for calculations
- Mission 7: LIKE for pattern matching
- Mission 8: IN and OR operators
- Mission 9-10: Complex aggregations and multi-condition queries

### Level 2: Advanced SQL (Missions 11-20)
Build on fundamentals with powerful operations:
- Mission 11-12: INNER JOIN and LEFT JOIN
- Mission 13-15: INSERT, UPDATE, and DELETE operations
- Mission 16-17: CREATE TABLE and ALTER TABLE
- Mission 18: Multiple JOINs across three tables
- Mission 19: Subqueries and nested SELECT
- Mission 20: DROP TABLE

### Level 3: Expert SQL (Missions 21-30)
Master complex queries and advanced techniques:
- Mission 21-22: RIGHT JOIN and FULL OUTER JOIN
- Mission 23: SELF JOIN for hierarchical data
- Mission 24: UNION for combining result sets
- Mission 25: HAVING clause with GROUP BY
- Mission 26: CASE statements for conditional logic
- Mission 27: Multi-table JOINs with aggregations
- Mission 28: EXISTS and correlated subqueries
- Mission 29: Complex subqueries with HAVING
- Mission 30: Master challenge with COALESCE, multiple JOINs, CASE, and aggregations

**Progression System**:
- Complete missions sequentially to unlock the next
- Earn 100-2500 XP per mission (total: 39,000 XP)
- Level up every 500 × current_level XP
- Maximum level: 30

See [LEVEL2_MISSIONS.md](LEVEL2_MISSIONS.md) and [LEVEL3_MISSIONS.md](LEVEL3_MISSIONS.md) for detailed mission descriptions and solutions.

## 🔒 Security

The platform includes SQL safety middleware that:
- Prevents DELETE operations without WHERE clauses
- Blocks UPDATE operations without WHERE clauses
- Validates query structure before execution
- Provides a safe learning environment

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👥 Authors

Created with ❤️ for aspiring SQL developers

## 🐛 Known Issues

- None currently reported

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

Happy querying! 🎉
