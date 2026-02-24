import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Header from '../components/Header';
import QueryBuilder from '../components/QueryBuilder';
import SqlEditor from '../components/SqlEditor';
import ResultsPanel from '../components/ResultsPanel';
import { HelpModal } from '../components/HelpModal';
import { useSettings } from '../hooks/useSettings';
import type { Mission, QueryResult, PlayerProgress } from '../types';

export default function MissionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [mission, setMission] = useState<Mission | null>(null);
  const [allMissions, setAllMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [missionsLoading, setMissionsLoading] = useState(true);
  const [sql, setSql] = useState('');
  const [sqlPreview, setSqlPreview] = useState('');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [running, setRunning] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [playerProgress, setPlayerProgress] = useState<any>(null);
  const [hintVisible, setHintVisible] = useState(true);
  const { settings } = useSettings();

  const player = playerProgress ? {
    level: playerProgress.currentLevel,
    xp: playerProgress.currentXP,
    xpToNextLevel: playerProgress.xpToNextLevel,
    completedMissions: playerProgress.completedMissions,
  } : { level: 1, xp: 0, xpToNextLevel: 500, completedMissions: [] };

  // Load player progress
  useEffect(() => {
    api.get('/progress')
      .then((res) => setPlayerProgress(res.data))
      .catch(() => console.error('Failed to load progress'))
      .finally(() => setProgressLoading(false));
  }, []);

  // Load all missions for navigation
  useEffect(() => {
    api.get<Mission[]>('/missions')
      .then((res) => setAllMissions(res.data))
      .catch(() => console.error('Failed to load missions'))
      .finally(() => setMissionsLoading(false));
  }, []);

  useEffect(() => {
    if (!id) return;
    api.get<Mission>(`/missions/${id}`)
      .then((res) => {
        setMission(res.data);
        setSql('');
        setSqlPreview('');
        setHintVisible(settings.showHints);
      })
      .catch(() => setError('Mission not found.'))
      .finally(() => setLoading(false));
  }, [id, settings.showHints]);

  // Navigation logic
  const getUnlockedMissions = () => {
    if (!playerProgress) return [];
    return allMissions.filter((m) => playerProgress.unlockedMissions.includes(m.id));
  };

  const getCurrentMissionIndex = () => {
    const unlockedMissions = getUnlockedMissions();
    return unlockedMissions.findIndex((m) => m.id === id);
  };

  const getPreviousMissionId = () => {
    const unlockedMissions = getUnlockedMissions();
    const currentIndex = getCurrentMissionIndex();
    return currentIndex > 0 ? unlockedMissions[currentIndex - 1].id : null;
  };

  const getNextMissionId = () => {
    const unlockedMissions = getUnlockedMissions();
    const currentIndex = getCurrentMissionIndex();
    return currentIndex >= 0 && currentIndex < unlockedMissions.length - 1
      ? unlockedMissions[currentIndex + 1].id
      : null;
  };

  async function handleRunQuery() {
    if (!sql.trim()) return;
    setRunning(true);
    setResult(null);
    try {
      const res = await api.post<QueryResult>('/query', {
        sql,
        missionId: id,
      });
      setResult(res.data);
      
      // Refresh progress after query
      const progressRes = await api.get('/progress');
      setPlayerProgress(progressRes.data);
    } catch (err: any) {
      const message = err.response?.data?.feedback || 'An error occurred while running the query.';
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
          
          {/* Mission Navigation */}
          <div className="mission-nav-buttons">
            <button 
              className="btn-secondary" 
              onClick={() => getPreviousMissionId() && navigate(`/mission/${getPreviousMissionId()}`)}
              disabled={!getPreviousMissionId()}
              title="Previous mission"
            >
              ← Prev
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => getNextMissionId() && navigate(`/mission/${getNextMissionId()}`)}
              disabled={!getNextMissionId()}
              title="Next mission"
            >
              Next →
            </button>
          </div>

            {(progressLoading || missionsLoading) && (
              <div className="sidebar-status">Loading your mission map…</div>
            )}
            {!progressLoading && !missionsLoading && getUnlockedMissions().length === 0 && (
              <div className="sidebar-status">No missions unlocked yet.</div>
            )}

          <div className="mission-title-row">
            <span className="level-badge">Level {mission.level}</span>
            <span className="xp-badge">⚡ {mission.xpReward} XP</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{mission.title}</h2>
          <p className="mission-story">{mission.story}</p>
          <div className="mission-hint">
            <strong>💡 Hint</strong>
            {hintVisible ? (
              mission.hint
            ) : (
              <span className="hint-hidden">Hint hidden. Use settings to show hints.</span>
            )}
            {!hintVisible && (
              <button className="btn-secondary btn-reveal" onClick={() => setHintVisible(true)}>
                Reveal hint
              </button>
            )}
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
            theme={settings.editorTheme}
          />
          <div className="run-row">
            <button className="btn-run" onClick={handleRunQuery} disabled={running || !sql.trim()}>
              {running ? '⏳ Running…' : '▶ Run Query'}
            </button>
            <button className="btn-secondary" onClick={() => setSql('')}>Clear</button>
            <button className="btn-secondary" onClick={() => setHelpOpen(true)}>📚 Help</button>
          </div>
          <ResultsPanel result={result} isLoading={running} showCelebration={settings.showCelebration} />
        </section>
      </div>
      
      <HelpModal 
        isOpen={helpOpen} 
        onClose={() => setHelpOpen(false)}
        currentMissionId={id}
        onUseTemplate={(query) => {
          setSql(query);
          setSqlPreview(query);
        }}
      />
    </>
  );
}
