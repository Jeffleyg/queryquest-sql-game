import { Link } from 'react-router-dom';
import XPBar from './XPBar';
import type { PlayerState } from '../types';

interface HeaderProps {
  player: PlayerState;
}

export default function Header({ player }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-brand">
        <span className="header-logo">QueryQuest</span>
        <span className="header-tagline">Mystery Lab</span>
      </div>
      <div className="header-player">
        <span className="header-level">LVL {player.level}</span>
        <XPBar current={player.xp} max={player.xpToNextLevel} />
        <Link to="/rankings" className="rankings-link" aria-label="View rankings" title="Rankings">
          🏆
        </Link>
        <Link to="/settings" className="settings-link" aria-label="Open settings">
          ⚙
        </Link>
      </div>
    </header>
  );
}
