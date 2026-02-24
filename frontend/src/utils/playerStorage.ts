import type { PlayerProgress } from '../types';

const STORAGE_KEY = 'queryquest_player_progress';
const PLAYER_ID_KEY = 'queryquest_player_id';

export function getPlayerId(): string {
  let playerId = localStorage.getItem(PLAYER_ID_KEY);
  if (!playerId) {
    playerId = 'default';
    localStorage.setItem(PLAYER_ID_KEY, playerId);
  }
  return playerId;
}

export function savePlayerProgress(progress: PlayerProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function loadPlayerProgress(): PlayerProgress | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as PlayerProgress;
  } catch {
    return null;
  }
}

export function clearPlayerProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getDefaultProgress(): PlayerProgress {
  return {
    currentLevel: 1,
    currentXP: 0,
    xpToNextLevel: 500,
    completedMissions: [],
    unlockedMissions: ['level1-mission1'],
  };
}
