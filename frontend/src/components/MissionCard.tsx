import { useNavigate } from 'react-router-dom';
import type { Mission } from '../types';

interface MissionCardProps {
  mission: Mission;
}

export default function MissionCard({ mission }: MissionCardProps) {
  const navigate = useNavigate();
  return (
    <div className="mission-card">
      <div className="mission-card-header">
        <span className="level-badge">Level {mission.level}</span>
        <span className="xp-badge">⚡ {mission.xpReward} XP</span>
      </div>
      <h3 className="mission-card-title">{mission.title}</h3>
      <p className="mission-card-desc">{mission.description}</p>
      <button
        className="btn-primary"
        onClick={() => navigate(`/mission/${mission.id}`)}
      >
        Start Mission →
      </button>
    </div>
  );
}
