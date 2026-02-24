import { Request, Response } from 'express';
import { getUserProgress, getCompletedMissions, getUnlockedMissions } from '../services/authService';
import { AuthRequest } from '../middleware/auth';

export async function getProgress(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    
    const [progress, completedMissions, unlockedMissions] = await Promise.all([
      getUserProgress(userId),
      getCompletedMissions(userId),
      getUnlockedMissions(userId),
    ]);

    if (!progress) {
      res.status(404).json({ error: 'Progress not found' });
      return;
    }

    res.json({
      currentLevel: progress.current_level,
      currentXP: progress.current_xp,
      xpToNextLevel: progress.xp_to_next_level,
      completedMissions,
      unlockedMissions,
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to get progress' });
  }
}

export async function resetPlayerProgress(req: AuthRequest, res: Response): Promise<void> {
  res.status(501).json({ error: 'Reset functionality not implemented yet' });
}
