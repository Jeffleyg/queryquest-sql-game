import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LeaderboardEntry } from '../types';
import api from '../utils/api';
import '../styles/Rankings.css';

export default function RankingsPage() {
  const navigate = useNavigate();
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/progress/rankings?limit=100');
      
      setRankings(response.data.rankings);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar rankings');
      console.error('Fetch rankings error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rankings-page">
      <div className="rankings-header">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          ← Voltar
        </button>
        <h1>🏆 Classificação Mundial</h1>
        <p className="subtitle">Os melhores jogadores do QueryQuest</p>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Carregando rankings...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : rankings.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum jogador verificado ainda</p>
        </div>
      ) : (
        <div className="leaderboard-container">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th className="rank-col">Posição</th>
                <th className="name-col">Jogador</th>
                <th className="level-col">Nível</th>
                <th className="xp-col">EXP</th>
                <th className="missions-col">Missões</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((entry) => (
                <tr key={entry.userId} className={`rank-row ${getRowClass(entry.rank)}`}>
                  <td className="rank-col">
                    <span className="rank-badge">{getMedalEmoji(entry.rank)}</span>
                    <span className="rank-number">#{entry.rank}</span>
                  </td>
                  <td className="name-col">
                    <div className="player-name">{entry.username}</div>
                  </td>
                  <td className="level-col">
                    <span className="level-badge">Lv. {entry.currentLevel}</span>
                  </td>
                  <td className="xp-col">
                    <span className="xp-value">{entry.currentXP.toLocaleString()}</span>
                  </td>
                  <td className="missions-col">
                    <span className="missions-badge">{entry.missionsCompleted}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function getMedalEmoji(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return '⭐';
}

function getRowClass(rank: number): string {
  if (rank === 1) return 'gold-rank';
  if (rank === 2) return 'silver-rank';
  if (rank === 3) return 'bronze-rank';
  return 'normal-rank';
}
