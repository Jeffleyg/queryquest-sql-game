export interface PlayerProgress {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  completedMissions: string[];
  unlockedMissions: string[];
}

const XP_PER_LEVEL = 500;
const MAX_LEVEL = 30;

// Simple in-memory storage (in production, use a database)
const playerData: Map<string, PlayerProgress> = new Map();

export function getPlayerProgress(playerId: string = 'default'): PlayerProgress {
  if (!playerData.has(playerId)) {
    playerData.set(playerId, {
      currentLevel: 1,
      currentXP: 0,
      xpToNextLevel: XP_PER_LEVEL,
      completedMissions: [],
      unlockedMissions: ['level1-mission1'], // First mission is always unlocked
    });
  }
  return playerData.get(playerId)!;
}

export function addXP(playerId: string = 'default', xp: number): PlayerProgress {
  const progress = getPlayerProgress(playerId);
  
  // Add XP
  progress.currentXP += xp;
  
  // Check for level up
  while (progress.currentXP >= progress.xpToNextLevel && progress.currentLevel < MAX_LEVEL) {
    progress.currentXP -= progress.xpToNextLevel;
    progress.currentLevel++;
    progress.xpToNextLevel = XP_PER_LEVEL * progress.currentLevel;
  }
  
  // Cap XP at current level max if at max level
  if (progress.currentLevel >= MAX_LEVEL) {
    progress.currentXP = Math.min(progress.currentXP, progress.xpToNextLevel);
  }
  
  return progress;
}

export function completeMission(playerId: string = 'default', missionId: string): PlayerProgress {
  const progress = getPlayerProgress(playerId);
  
  // Don't add if already completed
  if (progress.completedMissions.includes(missionId)) {
    return progress;
  }
  
  progress.completedMissions.push(missionId);
  
  // Unlock next mission automatically
  const missionMatch = missionId.match(/level(\d+)-mission(\d+)/);
  if (missionMatch) {
    const level = parseInt(missionMatch[1], 10);
    const missionNumber = parseInt(missionMatch[2], 10);
    
    // If it's the last mission of a level, unlock first mission of next level
    if (missionNumber === 10) {
      const nextLevel = level + 1;
      const nextMissionId = `level${nextLevel}-mission1`;
      if (!progress.unlockedMissions.includes(nextMissionId)) {
        progress.unlockedMissions.push(nextMissionId);
      }
    }
    // Otherwise, unlock next mission in same level
    else if (missionNumber < 10) {
      const nextMissionId = `level${level}-mission${missionNumber + 1}`;
      if (!progress.unlockedMissions.includes(nextMissionId)) {
        progress.unlockedMissions.push(nextMissionId);
      }
    }
  }
  
  return progress;
}

export function isMissionUnlocked(playerId: string = 'default', missionId: string): boolean {
  const progress = getPlayerProgress(playerId);
  return progress.unlockedMissions.includes(missionId);
}

export function isMissionCompleted(playerId: string = 'default', missionId: string): boolean {
  const progress = getPlayerProgress(playerId);
  return progress.completedMissions.includes(missionId);
}

function extractMissionNumber(missionId: string): number {
  const match = missionId.match(/mission(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

export function resetProgress(playerId: string = 'default'): void {
  playerData.delete(playerId);
}
