import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Header from '../components/Header';
import MissionCard from '../components/MissionCard';
import type { Mission } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerProgress, setPlayerProgress] = useState<any>(null);
  
  const username = localStorage.getItem('username') || 'Player';

  useEffect(() => {
    // Load progress from backend
    api.get('/progress')
      .then((res) => setPlayerProgress(res.data))
      .catch(() => console.error('Failed to load progress'));

    // Load missions
    api.get<Mission[]>('/missions')
      .then((res) => setMissions(res.data))
      .catch(() => setError('Failed to load missions. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  const player = playerProgress ? {
    level: playerProgress.currentLevel,
    xp: playerProgress.currentXP,
    xpToNextLevel: playerProgress.xpToNextLevel,
    completedMissions: playerProgress.completedMissions,
  } : { level: 1, xp: 0, xpToNextLevel: 500, completedMissions: [] };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleResetProgress = async () => {
    alert('Reset functionality not implemented yet.');
  };

  return (
    <>
      <Header player={player} />
      <main className="dashboard">
        <div className="dashboard-hero">
          <div className="hero-text">
            <div className="hero-badge">Welcome back, {username}!</div>
            <h1>Data Detective HQ</h1>
            <p>Crack cases with SQL queries, uncover clues, and master database mysteries.</p>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-label">Cases</span>
                <span className="hero-stat-value">30+</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-label">Your Level</span>
                <span className="hero-stat-value">{player.level}</span>
              </div>
              <div className="hero-stat">
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </div>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <svg viewBox="0 0 420 260" role="img">
              <defs>
                <linearGradient id="cityGlow" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#00d4c4" />
                  <stop offset="100%" stopColor="#ff8a4c" />
                </linearGradient>
              </defs>
              <rect width="420" height="260" rx="24" fill="#0c1727" />
              <rect x="24" y="60" width="86" height="140" rx="10" fill="#17233b" />
              <rect x="126" y="40" width="96" height="160" rx="10" fill="#1d2c49" />
              <rect x="238" y="76" width="70" height="124" rx="10" fill="#16233a" />
              <rect x="318" y="50" width="78" height="150" rx="10" fill="#1f2f50" />
              <circle cx="120" cy="120" r="38" fill="url(#cityGlow)" opacity="0.25" />
              <circle cx="290" cy="110" r="44" fill="url(#cityGlow)" opacity="0.2" />
              <path d="M80 210c28-26 74-30 110 0" stroke="#00d4c4" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
              <path d="M220 210c28-26 74-30 110 0" stroke="#ff8a4c" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
              <circle cx="72" cy="196" r="18" fill="#0b1220" stroke="#00d4c4" strokeWidth="4" />
              <circle cx="194" cy="196" r="18" fill="#0b1220" stroke="#ff8a4c" strokeWidth="4" />
            </svg>
            <div className="hero-art-label">City of Clues</div>
          </div>
        </div>

        {loading && <div className="loading-spinner">⏳ Loading missions…</div>}
        {error && <div className="error-state">{error}</div>}

        {!loading && !error && (
          <>
            <div className="dashboard-progress-section">
              <div className="dashboard-section-title">🗺️ Available Missions</div>
              <div className="progress-info">
                <span className="progress-text">
                  {playerProgress.completedMissions.length} of {missions.length} missions completed
                </span>
                <button className="btn-reset" onClick={handleResetProgress} title="Reset Progress">
                  ↺ Reset
                </button>
              </div>
            </div>
            <div className="missions-grid">{missions.map((m) => {
                const isUnlocked = playerProgress?.unlockedMissions?.includes(m.id) || false;
                const isCompleted = playerProgress?.completedMissions?.includes(m.id) || false;
                return (
                  <MissionCard 
                    key={m.id} 
                    mission={m} 
                    isLocked={!isUnlocked}
                    isCompleted={isCompleted}
                  />
                );
              })}
              {missions.length === 0 && (
                <p className="missions-empty">No missions found.</p>
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}
