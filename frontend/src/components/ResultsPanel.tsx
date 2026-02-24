import { useEffect, useState } from 'react';
import type { QueryResult } from '../types';

interface ResultsPanelProps {
  result: QueryResult | null;
  isLoading: boolean;
  showCelebration?: boolean;
}

export default function ResultsPanel({ result, isLoading, showCelebration = true }: ResultsPanelProps) {
  const [celebrate, setCelebrate] = useState(false);

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
    </div>
  );
}
