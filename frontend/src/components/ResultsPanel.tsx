import { useEffect, useState } from 'react';
import type { QueryResult } from '../types';
import PerformanceTab from './PerformanceTab';

interface ResultsPanelProps {
  result: QueryResult | null;
  isLoading: boolean;
  showCelebration?: boolean;
  query?: string;
  missionId?: string;
}

export default function ResultsPanel({ result, isLoading, showCelebration = true, query = '', missionId }: ResultsPanelProps) {
  const [celebrate, setCelebrate] = useState(false);
  const [activeTab, setActiveTab] = useState<'results' | 'performance'>('results');

  useEffect(() => {
    if (showCelebration && result?.success && result.xpEarned && result.xpEarned > 0) {
      setCelebrate(true);
      const timer = setTimeout(() => setCelebrate(false), 2200);
      return () => clearTimeout(timer);
    }

    return undefined;
  }, [result?.success, result?.xpEarned]);

  if (isLoading) {
    return (
      <div className="results-panel">
        <div className="results-panel-header">📊 Results</div>
        <div className="results-empty">Running query…</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="results-panel">
        <div className="results-panel-header">📊 Results</div>
        <div className="results-empty">Run a query to see results here.</div>
      </div>
    );
  }

  const feedbackClass = result.success ? 'success' : result.columns.length > 0 ? 'info' : 'error';

  return (
    <div className="results-panel">
      <div className="results-panel-header">
        📊 Results
        {result.rowCount > 0 && (
          <span className="results-rowcount">
            {result.rowCount} row{result.rowCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #3a3f5c', marginBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('results')}
          style={{
            background: activeTab === 'results' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            border: activeTab === 'results' ? '2px solid #6366f1' : 'none',
            borderBottom: activeTab === 'results' ? '2px solid #6366f1' : '1px solid #3a3f5c',
            color: activeTab === 'results' ? '#a78bfa' : '#8b92b8',
            padding: '10px 16px',
            cursor: 'pointer',
            fontWeight: activeTab === 'results' ? '600' : '400',
            transition: 'all 0.2s',
          }}
        >
          📋 Results
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          style={{
            background: activeTab === 'performance' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            border: activeTab === 'performance' ? '2px solid #6366f1' : 'none',
            borderBottom: activeTab === 'performance' ? '2px solid #6366f1' : '1px solid #3a3f5c',
            color: activeTab === 'performance' ? '#a78bfa' : '#8b92b8',
            padding: '10px 16px',
            cursor: 'pointer',
            fontWeight: activeTab === 'performance' ? '600' : '400',
            transition: 'all 0.2s',
          }}
        >
          ⚡ Performance
        </button>
      </div>

      {activeTab === 'results' && (
        <>
          {celebrate && (
            <div className="results-celebration" aria-hidden="true">
              <div className="celebration-banner">Mission complete!</div>
              <div className="confetti">
                {Array.from({ length: 16 }).map((_, i) => (
                  <span key={i} className={`confetti-piece confetti-${i % 6}`} />
                ))}
              </div>
            </div>
          )}

          <div className={`results-feedback ${feedbackClass}`}>{result.feedback}</div>

          {result.xpEarned !== undefined && result.xpEarned > 0 && (
            <div className="xp-earned-banner">
              🏆 +{result.xpEarned} XP earned!
            </div>
          )}

          {result.columns.length > 0 && (
            <div className="results-table-wrapper">
              <table className="results-table">
                <thead>
                  <tr>
                    {result.columns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, i) => (
                    <tr key={i}>
                      {result.columns.map((col) => (
                        <td key={col}>{String(row[col] ?? '')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {result.columns.length === 0 && result.success && (
            <div className="results-empty">Query ran successfully with no rows returned.</div>
          )}
        </>
      )}

      {activeTab === 'performance' && (
        <PerformanceTab query={query} missionId={missionId} />
      )}
    </div>
  );
}
