# QueryQuest - Publish Guide (Production)

## 1) Final pre-release checklist

- [ ] Backend tests passing (`cd backend && npm test`)
- [ ] Backend build passing (`cd backend && npm run build`)
- [ ] Frontend build passing (`cd frontend && npm run build`)
- [ ] PostgreSQL running and schema loaded
- [ ] Firebase Auth configured (Google + Email/Password)
- [ ] SMTP configured for verification/reset emails

## 2) Firebase project setup

Before deploying frontend to Firebase Hosting:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Copy your **Project ID** (visible in Project Settings → General)
4. Enable Firestore/Realtime Database (if needed for later features)
5. In **Authentication**, enable:
   - Email/Password provider
   - Google provider
6. Copy Firebase Web config (Settings → Your apps → Web app) for frontend `.env`

## 3) Environment configuration

### Backend (`backend/.env`)

Use `backend/.env.example` or `backend/.env.production.example` as template:

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `PORT`
- `FRONTEND_URL=https://querygame-b48a7.web.app` ← your Firebase URL
- `CORS_ORIGIN=https://querygame-b48a7.web.app` ← same as above
- `FIREBASE_SERVICE_ACCOUNT_PATH` ← download from Firebase Console
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`

### Frontend (`frontend/.env`)

Use `frontend/.env.example` or `frontend/.env.production.example` as template:

- `VITE_API_BASE_URL` ← update with your backend URL after backend deploys
- Firebase `VITE_FIREBASE_*` variables (copy from Firebase Console)

## 4) Build validation

```bash
cd backend
npm ci
npm test
npm run build

cd ../frontend
npm ci
npm run build
```

## 5) Publish frontend (Firebase Hosting)

```bash
npm install -g firebase-tools
firebase login

# Set active Firebase project (find your project ID in Firebase Console)
firebase use --add
# Select your project and give it an alias (e.g., "production")

# Build and deploy
cd frontend
npm run build
cd ..

firebase deploy --only hosting
```

If you already have a `firebase.json` with `projects` configured:
```bash
firebase deploy --only hosting --project your-project-id
```

## 6) Publish backend

### Option A: Render (recommended, easiest)

1. Go to [Render](https://render.com) and sign up
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Fill in:
   - **Name**: `queryquest-api`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm ci && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Working directory** (if available): leave blank, Render will auto-detect
5. Add environment variables (Settings → Environment):
   - Copy all values from `backend/.env.example`
   - Set `FRONTEND_URL=https://querygame-b48a7.web.app`
   - Set `CORS_ORIGIN=https://querygame-b48a7.web.app`
   - Database details (PostgreSQL, Firebase service account, SMTP)
6. Click **Create Web Service**
7. Wait for deploy (2-5 minutes)
8. Copy the generated URL (e.g., `https://queryquest-api-xxxx.onrender.com`)

### Option B: Railway

1. Go to [Railway](https://railway.app) and sign up with GitHub
2. Click **New Project** → **Deploy from GitHub**
3. Select your repository
4. Railway auto-detects `package.json`, add root env var:
   - `MONOREPO_WORKING_DIR=backend`
5. Add all environment variables from step 3
6. Wait for deploy
7. Copy service URL

### Option C: Fly.io

1. Install [Fly CLI](https://fly.io/docs/getting-started/installing-flyctl/)
2. Run:
   ```bash
   fly auth login
   fly launch --name queryquest-api
   # Choose to copy Dockerfile? → Yes
   # Select region
   ```
3. Update `fly.toml`:
   ```toml
   [build]
     cmd = "cd backend && npm ci && npm run build"
   [env]
     MONOREPO_WORKING_DIR = "backend"
   ```
4. Add secrets:
   ```bash
   fly secrets set DB_HOST=your-db-host DB_USER=queryquest ...
   ```
5. Deploy:
   ```bash
   fly deploy
   ```

### Option D: VPS (Digital Ocean, Linode, AWS EC2)

1. SSH into your server
2. Install Node.js 18+:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   ```
3. Clone your repo:
   ```bash
   git clone your-repo-url
   cd queryquest-sql-game/backend
   ```
4. Setup environment:
   ```bash
   cp .env.example .env
   nano .env  # edit with real values
   ```
5. Install and build:
   ```bash
   npm ci
   npm run build
   ```
6. Use PM2 for process management:
   ```bash
   sudo npm install -g pm2
   pm2 start "npm start" --name queryquest
   pm2 startup
   pm2 save
   ```
7. Setup Nginx reverse proxy (optional but recommended):
   ```bash
   sudo apt install nginx
   # Create /etc/nginx/sites-available/queryquest
   # Point to localhost:3001
   # Enable HTTPS with Let's Encrypt
   ```

### After backend deploy

1. Note your backend URL (e.g., `https://queryquest-api-xxxx.onrender.com`)
2. Update frontend `frontend/.env`:
   ```
   VITE_API_BASE_URL=https://queryquest-api-xxxx.onrender.com/api
   ```
3. Rebuild and redeploy frontend:
   ```bash
   cd frontend
   npm run build
   cd ..
   firebase deploy --only hosting
   ```

## 7) Post-deploy smoke tests

- `GET /health` returns `{ status: "ok" }`
- Frontend login/register works
- Email verification link opens `FRONTEND_URL/verify-email`
- Reset password flow works end-to-end
- Mission loading and SQL query execution work

## 8) Recommended release tag

After successful smoke tests:

```bash
git tag -a v1.0.0 -m "QueryQuest production release"
git push origin v1.0.0
```

---

## Complete Publication Checklist (Summary)

1. ✅ **Frontend deployed** → `https://querygame-b48a7.web.app`
2. **Choose backend provider** (Render recommended)
3. **Deploy backend** → get URL like `https://queryquest-api-xxxx.onrender.com`
4. **Update `.env` files** with real URLs
5. **Run smoke tests** to verify everything works
6. **Tag release** in Git
7. **Monitor** - set up error tracking (Sentry) and logs

### Quick Reference: Your URLs

**Frontend (Live):**
- https://querygame-b48a7.web.app

**Backend (Deploy it next → get from platform):**
- https://queryquest-api-xxxx.onrender.com (example)

**Firebase Console:**
- https://console.firebase.google.com/project/querygame-b48a7

**Environment files:**
- Backend template: `backend/.env.production.example`
- Frontend template: `frontend/.env.production.example`
