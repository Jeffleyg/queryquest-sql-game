import { Request, Response } from 'express';
import { getAllMissions, getMissionById } from '../services/missionService';

export function getMissions(_req: Request, res: Response): void {
  const missions = getAllMissions();
  res.json(missions);
}

export function getMission(req: Request, res: Response): void {
  const mission = getMissionById(req.params.id);
  if (!mission) {
    res.status(404).json({ error: 'Mission not found.' });
    return;
  }
  res.json(mission);
}
