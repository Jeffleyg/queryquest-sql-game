import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import MissionCard from '../components/MissionCard';
import type { Mission, PlayerProgress } from '../types';
import { loadPlayerProgress, savePlayerProgress, getDefaultProgress, getPlayerId } from '../utils/playerStorage';

export default function Dashboard() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress>(
    loadPlayerProgress() || getDefaultProgress()
  );

  useEffect(() => {
    // Load progress from backend
    const playerId = getPlayerId();
    axios
      .get<PlayerProgress>(`/api/progress?playerId=${playerId}`)
      .then((res) => {
        setPlayerProgress(res.data);
        savePlayerProgress(res.data);
      })
      .catch(() => {
        // If backend fails, use local storage
        const local = loadPlayerProgress();
        if (local) setPlayerProgress(local);
      });

    // Load missions
    axios
      .get<Mission[]>('/api/missions')
      .then((res) => setMissions(res.data))
      .catch(() => setError('Failed to load missions. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  const player = {
    level: playerProgress.currentLevel,
    xp: playerProgress.currentXP,
    xpToNextLevel: playerProgress.xpToNextLevel,
    completedMissions: playerProgress.completedMissions,
  };

  const handleResetProgress = async () => {
    if (!confirm('Are you sure you want to reset all progress? This cannot be undone.')) return;
    
    const playerId = getPlayerId();
    try {
      await axios.post('/api/progress/reset', { playerId });
      const defaultProgress = getDefaultProgress();
      setPlayerProgress(defaultProgress);
      savePlayerProgress(defaultProgress);
      window.location.reload();
    } catch (err) {
      console.error('Failed to reset progress:', err);
      alert('Failed to reset progress. Please try again.');
    }
  };

  return (
    <>
      <Header player={player} />
      <main className="dashboard">
        <div className="dashboard-hero">
          <div className="hero-text">
            <div className="hero-badge">Co-op mystery missions</div>
            <h1>Welcome, Data Detective!</h1>
            <p>Crack cases with friends, uncover clues, and learn SQL through puzzles, not lectures.</p>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-label">Cases</span>
                <span className="hero-stat-value">30+</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-label">Skills</span>
                <span className="hero-stat-value">Advanced JOINs, Subqueries</span>
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
                const isUnlocked = playerProgress.unlockedMissions.includes(m.id);
                const isCompleted = playerProgress.completedMissions.includes(m.id);
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
                <p style={{ color: 'var(--text-muted)' }}>No missions found.</p>
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}
