import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import QueryBuilder from '../components/QueryBuilder';
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
  const [sqlPreview, setSqlPreview] = useState('');
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
        setSqlPreview('');
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
          <div className="squad-panel">
            <div className="squad-header">
              <span>Study Squad</span>
              <span className="squad-status">Live</span>
            </div>
            <div className="squad-avatars">
              <span className="avatar" />
              <span className="avatar" />
              <span className="avatar" />
              <span className="avatar avatar-muted">+2</span>
            </div>
            <div className="squad-note">Solve together, compare answers, and trade clues.</div>
          </div>
        </aside>

        {/* Main workspace */}
        <section className="mission-main">
          <h1 style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {mission.description}
          </h1>
          <div className="mission-scene-grid">
            <div className="scene-card" aria-hidden="true">
              <div className="scene-header">Case Scene</div>
              <svg viewBox="0 0 520 260" role="img" className="scene-svg">
                <defs>
                  <linearGradient id="sceneGlow" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#00d4c4" />
                    <stop offset="100%" stopColor="#ff8a4c" />
                  </linearGradient>
                </defs>
                <rect width="520" height="260" rx="20" fill="#0b1320" />
                <rect x="28" y="54" width="120" height="150" rx="12" fill="#17233b" />
                <rect x="166" y="32" width="150" height="172" rx="12" fill="#1f2f50" />
                <rect x="334" y="68" width="120" height="136" rx="12" fill="#16233a" />
                <circle cx="130" cy="124" r="44" fill="url(#sceneGlow)" opacity="0.18" />
                <circle cx="332" cy="110" r="52" fill="url(#sceneGlow)" opacity="0.2" />
                <path d="M70 220c38-28 96-32 142 0" stroke="#00d4c4" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
                <path d="M270 220c38-28 96-32 142 0" stroke="#ff8a4c" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
                <circle cx="98" cy="196" r="20" fill="#0b1220" stroke="#00d4c4" strokeWidth="4" />
                <circle cx="246" cy="196" r="20" fill="#0b1220" stroke="#ff8a4c" strokeWidth="4" />
                <rect x="380" y="180" width="80" height="40" rx="14" fill="#0f172a" stroke="#ff8a4c" strokeWidth="3" />
              </svg>
              <div className="scene-caption">Downtown district, 8:45 PM</div>
            </div>
            <div className="clue-board">
              <div className="clue-header">Clue Board</div>
              <div className="clue-grid">
                <div className="clue-card">
                  <div className="clue-title">Suspects</div>
                  <div className="clue-text">Look for rows that match a specific district.</div>
                </div>
                <div className="clue-card">
                  <div className="clue-title">Evidence</div>
                  <div className="clue-text">Names and locations live in the same table.</div>
                </div>
                <div className="clue-card">
                  <div className="clue-title">Objective</div>
                  <div className="clue-text">Return everyone connected to Downtown.</div>
                </div>
              </div>
              <div className="clue-tags">
                <span className="clue-tag">Filter</span>
                <span className="clue-tag">Equal to</span>
                <span className="clue-tag">Text match</span>
              </div>
            </div>
          </div>
          <QueryBuilder mission={mission} onSqlChange={setSql} onPreviewChange={setSqlPreview} />
          <SqlEditor
            value={sqlPreview || sql}
            onChange={(value) => {
              setSql(value);
              setSqlPreview(value);
            }}
          />
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
