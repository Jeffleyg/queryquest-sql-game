import XPBar from './XPBar';
import type { PlayerState } from '../types';

interface HeaderProps {
  player: PlayerState;
}

export default function Header({ player }: HeaderProps) {
  return (
    <header className="header">
      <span className="header-logo">🔍 QueryQuest</span>
      <div className="header-player">
        <span className="header-level">LVL {player.level}</span>
        <XPBar current={player.xp} max={player.xpToNextLevel} />
      </div>
    </header>
  );
}
