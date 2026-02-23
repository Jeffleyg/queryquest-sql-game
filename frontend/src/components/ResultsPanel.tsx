import type { QueryResult } from '../types';

interface ResultsPanelProps {
  result: QueryResult | null;
  isLoading: boolean;
}

export default function ResultsPanel({ result, isLoading }: ResultsPanelProps) {
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
          <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontWeight: 400 }}>
            {result.rowCount} row{result.rowCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

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
