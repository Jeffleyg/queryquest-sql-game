import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import SqlEditor from '../components/SqlEditor';
import ResultsPanel from '../components/ResultsPanel';
import type { Mission, QueryResult, PlayerState } from '../types';

const DEFAULT_PLAYER: PlayerState = { level: 1, xp: 0, xpToNextLevel: 500, completedMissions: [] };

export default function MissionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sql, setSql] = useState('SELECT * FROM citizens WHERE district = \'Downtown\';');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [running, setRunning] = useState(false);
  const [player, setPlayer] = useState<PlayerState>(DEFAULT_PLAYER);

  useEffect(() => {
    if (!id) return;
    axios
      .get<Mission>(`/api/missions/${id}`)
      .then((res) => {
        setMission(res.data);
        setSql('');
      })
      .catch(() => setError('Mission not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleRunQuery() {
    if (!sql.trim()) return;
    setRunning(true);
    setResult(null);
    try {
      const res = await axios.post<QueryResult>('/api/query', {
        sql,
        missionId: id,
      });
      setResult(res.data);
      if (res.data.xpEarned) {
        setPlayer((prev) => ({ ...prev, xp: prev.xp + (res.data.xpEarned ?? 0) }));
      }
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.feedback
          ? (err.response.data as QueryResult).feedback
          : 'An error occurred while running the query.';
      setResult({ success: false, columns: [], rows: [], rowCount: 0, feedback: message });
    } finally {
      setRunning(false);
    }
  }

  if (loading) return (
    <>
      <Header player={player} />
      <div className="loading-spinner">⏳ Loading mission…</div>
    </>
  );

  if (error || !mission) return (
    <>
      <Header player={player} />
      <div className="error-state">{error ?? 'Mission not found.'}</div>
    </>
  );

  return (
    <>
      <Header player={player} />
      <div className="mission-page">
        {/* Sidebar */}
        <aside className="mission-sidebar">
          <button className="btn-secondary" onClick={() => navigate('/')}>← Back</button>
          <div className="mission-title-row">
            <span className="level-badge">Level {mission.level}</span>
            <span className="xp-badge">⚡ {mission.xpReward} XP</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{mission.title}</h2>
          <p className="mission-story">{mission.story}</p>
          <div className="mission-hint">
            <strong>💡 Hint</strong>
            {mission.hint}
          </div>
        </aside>

        {/* Main workspace */}
        <section className="mission-main">
          <h1 style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {mission.description}
          </h1>
          <SqlEditor value={sql} onChange={setSql} />
          <div className="run-row">
            <button className="btn-run" onClick={handleRunQuery} disabled={running || !sql.trim()}>
              {running ? '⏳ Running…' : '▶ Run Query'}
            </button>
            <button className="btn-secondary" onClick={() => setSql('')}>Clear</button>
          </div>
          <ResultsPanel result={result} isLoading={running} />
        </section>
      </div>
    </>
  );
}
