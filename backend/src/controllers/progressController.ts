import { Request, Response } from 'express';
import { getPlayerProgress, resetProgress } from '../services/playerProgressService';

export function getProgress(req: Request, res: Response): void {
  const playerId = req.query.playerId as string || 'default';
  const progress = getPlayerProgress(playerId);
  res.json(progress);
}

export function resetPlayerProgress(req: Request, res: Response): void {
  const playerId = req.body.playerId as string || 'default';
  resetProgress(playerId);
  const progress = getPlayerProgress(playerId);
  res.json({ message: 'Progress reset successfully', progress });
}
