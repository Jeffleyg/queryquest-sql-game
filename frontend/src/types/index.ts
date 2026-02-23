export interface Mission {
  id: string;
  title: string;
  level: number;
  description: string;
  story: string;
  hint: string;
  xpReward: number;
  tableSetup: string;
  expectedQuery?: string;
  validationRules: {
    requiredKeywords: string[];
    forbiddenKeywords?: string[];
  };
}

export interface QueryResult {
  success: boolean;
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  feedback: string;
  xpEarned?: number;
}

export interface PlayerState {
  level: number;
  xp: number;
  xpToNextLevel: number;
  completedMissions: string[];
}
