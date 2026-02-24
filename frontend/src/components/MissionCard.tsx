import { useNavigate } from 'react-router-dom';
import type { Mission } from '../types';

interface MissionCardProps {
  mission: Mission;
  isLocked?: boolean;
  isCompleted?: boolean;
}

export default function MissionCard({ mission, isLocked = false, isCompleted = false }: MissionCardProps) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (isLocked) return;
    navigate(`/mission/${mission.id}`);
  };

  return (
    <div className={`mission-card ${isLocked ? 'mission-card-locked' : ''} ${isCompleted ? 'mission-card-completed' : ''}`}>
      <div className="mission-card-art" aria-hidden="true" />
      {isLocked && (
        <div className="mission-lock-overlay">
          <span className="lock-icon">🔒</span>
          <span className="lock-text">Locked</span>
        </div>
      )}
      {isCompleted && !isLocked && (
        <div className="mission-completed-badge">✓ Completed</div>
      )}
      <div className="mission-card-header">
        <span className="level-badge">Level {mission.level}</span>
        <span className="xp-badge">⚡ {mission.xpReward} XP</span>
      </div>
      <h3 className="mission-card-title">{mission.title}</h3>
      <p className="mission-card-desc">{mission.description}</p>
      <button
        className={isLocked ? 'btn-secondary' : 'btn-primary'}
        onClick={handleClick}
        disabled={isLocked}
      >
        {isLocked ? '🔒 Locked' : isCompleted ? 'Play Again →' : 'Start Mission →'}
      </button>
    </div>
  );
}
