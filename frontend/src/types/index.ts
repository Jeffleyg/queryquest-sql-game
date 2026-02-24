export interface Mission {
  id: string;
  title: string;
  level: number;
  description: string;
  story: string;
  hint: string;
  xpReward: number;
  tableSetup: string | string[];
  expectedQuery?: string;
  validationRules: {
    requiredKeywords: string[];
    forbiddenKeywords?: string[];
    expectedColumns?: string[];
    minRows?: number;
    expectedRowCountAfter?: number;
    mustContainValues?: string[];
    mustNotExist?: string[];
  };
}

export interface QueryResult {
  success: boolean;
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  feedback: string;
  xpEarned?: number;
  playerProgress?: PlayerProgress;
}

export interface PlayerState {
  level: number;
  xp: number;
  xpToNextLevel: number;
  completedMissions: string[];
}

export interface PlayerProgress {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  completedMissions: string[];
  unlockedMissions: string[];
}
