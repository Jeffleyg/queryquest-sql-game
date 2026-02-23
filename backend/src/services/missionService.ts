import fs from 'fs';
import path from 'path';

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

const missionsDir = path.join(__dirname, '..', 'missions');

function loadMissions(): Mission[] {
  if (!fs.existsSync(missionsDir)) return [];
  const files = fs.readdirSync(missionsDir).filter((f) => f.endsWith('.json'));
  return files.map((file) => {
    const raw = fs.readFileSync(path.join(missionsDir, file), 'utf-8');
    return JSON.parse(raw) as Mission;
  });
}

export function getAllMissions(): Mission[] {
  return loadMissions();
}

export function getMissionById(id: string): Mission | null {
  const missions = loadMissions();
  return missions.find((m) => m.id === id) ?? null;
}
