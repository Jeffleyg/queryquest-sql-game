import { useState } from 'react';
import axios from 'axios';
import type { QueryAnalysis } from '../types';

interface PerformanceTabProps {
  query: string;
  missionId?: string;
}

export default function PerformanceTab({ query, missionId }: PerformanceTabProps) {
  const [analysis, setAnalysis] = useState<QueryAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function analyzeQuery() {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:3001/api/query/analyze', {
        sql: query,
        missionId,
      });

      if (response.data.success) {
        setAnalysis(response.data);
      } else {
        setError(response.data.error || 'Failed to analyze query');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error analyzing query');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '16px', color: '#8b92b8' }}>
      <button
        onClick={analyzeQuery}
        disabled={loading}
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)',
          border: 'none',
          color: '#fff',
          padding: '10px 20px',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '16px',
          fontWeight: '600',
        }}
      >
        {loading ? '⏳ Analyzing...' : '📊 Analyze Performance'}
      </button>

      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            color: '#fca5a5',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
          }}
        >
          {error}
        </div>
      )}

      {analysis && (
        <div>
          <div
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid #3b82f6',
              color: '#60a5fa',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px',
            }}
          >
            ⚡ Execution Time: <strong>{analysis.executionTime}ms</strong>
          </div>

          <div style={{ fontSize: '13px' }}>
            <strong>Query Execution Plan:</strong>
            <pre
              style={{
                background: '#0f0c29',
                border: '1px solid #3a3f5c',
                padding: '12px',
                borderRadius: '8px',
                overflow: 'auto',
                maxHeight: '300px',
                color: '#a78bfa',
                fontFamily: 'monospace',
                marginTop: '8px',
              }}
            >
              {analysis.plan.join('\n')}
            </pre>
          </div>

          <div style={{ fontSize: '12px', marginTop: '12px', color: '#6b7280' }}>
            💡 <strong>Performance Tip:</strong> A lower cost value indicates better performance.
            Look for "Seq Scan" operations - if your result is large, consider adding indexes.
          </div>
        </div>
      )}
    </div>
  );
}
