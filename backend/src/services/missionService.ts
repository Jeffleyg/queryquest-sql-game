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

const missionsDir = path.join(__dirname, '..', 'missions');

function loadMissions(): Mission[] {
  if (!fs.existsSync(missionsDir)) return [];
  const files = fs.readdirSync(missionsDir).filter((f) => f.endsWith('.json'));
  const missions = files.map((file) => {
    const raw = fs.readFileSync(path.join(missionsDir, file), 'utf-8');
    return JSON.parse(raw) as Mission;
  });
  
  // Sort missions by level first, then by mission number
  return missions.sort((a, b) => {
    if (a.level !== b.level) {
      return a.level - b.level;
    }
    const aNum = extractMissionNumber(a.id);
    const bNum = extractMissionNumber(b.id);
    return aNum - bNum;
  });
}

function extractMissionNumber(id: string): number {
  const match = id.match(/mission(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

export function getAllMissions(): Mission[] {
  return loadMissions();
}

export function getMissionById(id: string): Mission | null {
  const missions = loadMissions();
  return missions.find((m) => m.id === id) ?? null;
}
