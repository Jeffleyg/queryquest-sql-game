import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import MissionCard from '../components/MissionCard';
import type { Mission, PlayerState } from '../types';

const DEFAULT_PLAYER: PlayerState = { level: 1, xp: 0, xpToNextLevel: 500, completedMissions: [] };

export default function Dashboard() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [player] = useState<PlayerState>(DEFAULT_PLAYER);

  useEffect(() => {
    axios
      .get<Mission[]>('/api/missions')
      .then((res) => setMissions(res.data))
      .catch(() => setError('Failed to load missions. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header player={player} />
      <main className="dashboard">
        <div className="dashboard-hero">
          <h1>Welcome, Data Detective!</h1>
          <p>Master SQL by solving mysteries hidden in the data. Choose a mission to begin.</p>
        </div>

        {loading && <div className="loading-spinner">⏳ Loading missions…</div>}
        {error && <div className="error-state">{error}</div>}

        {!loading && !error && (
          <>
            <div className="dashboard-section-title">🗺️ Available Missions</div>
            <div className="missions-grid">
              {missions.map((m) => (
                <MissionCard key={m.id} mission={m} />
              ))}
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
