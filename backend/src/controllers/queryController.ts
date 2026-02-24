import { Request, Response } from 'express';
import pool from '../config/database';
import { isSafeQuery } from '../middleware/sqlSafety';
import { getMissionById } from '../services/missionService';
import { 
  getUserProgress,
  addXP as addUserXP,
  completeMission as completeUserMission,
  getCompletedMissions,
  getUnlockedMissions,
  saveQueryHistory
} from '../services/authService';
import { AuthRequest } from '../middleware/auth';

const MAX_LEVEL = 30;

export async function executeUserQuery(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId!;
  const { sql, missionId } = req.body as { sql: string; missionId?: string };

  if (!sql || typeof sql !== 'string') {
    res.status(400).json({ success: false, feedback: 'No SQL query provided.' });
    return;
  }

  const safetyCheck = isSafeQuery(sql, missionId);
  if (!safetyCheck.safe) {
    await saveQueryHistory(userId, missionId || null, sql, false);
    res.status(400).json({ success: false, feedback: safetyCheck.reason ?? 'Unsafe query.' });
    return;
  }

  let mission = missionId ? getMissionById(missionId) : null;

  // Check if mission is unlocked
  if (mission) {
    const unlockedMissions = await getUnlockedMissions(userId);
    if (!unlockedMissions.includes(missionId!)) {
      await saveQueryHistory(userId, missionId || null, sql, false);
      res.status(403).json({ 
        success: false, 
        feedback: 'This mission is locked. Complete previous missions first!' 
      });
      return;
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (mission?.tableSetup) {
      // Handle both string and array formats
      const setupQueries = Array.isArray(mission.tableSetup) 
        ? mission.tableSetup 
        : [mission.tableSetup];
      
      for (const query of setupQueries) {
        await client.query(query);
      }
    }

    const result = await client.query(sql);
    const columns = result.fields.map((f) => f.name);
    const rows = result.rows as Record<string, unknown>[];
    const rowCount = result.rowCount ?? rows.length;

    await client.query('ROLLBACK');

    let feedback = 'Query executed successfully!';
    let success = true;
    let xpEarned: number | undefined;

    if (mission) {
      const upperSql = sql.toUpperCase();
      const rules = mission.validationRules;
      const required = rules.requiredKeywords || [];
      const forbidden = rules.forbiddenKeywords || [];

      const missingKeywords = required.filter((kw) => !upperSql.includes(kw.toUpperCase()));
      const usedForbidden = forbidden.filter((kw) => upperSql.includes(kw.toUpperCase()));

      if (missingKeywords.length > 0) {
        success = false;
        feedback = `Almost there! Your query is missing: ${missingKeywords.join(', ')}. 💡 Check the hint!`;
      } else if (usedForbidden.length > 0) {
        success = false;
        feedback = `Your query uses forbidden keyword(s): ${usedForbidden.join(', ')}. Try a different approach!`;
      } else if (rules.expectedColumns && columns.length > 0) {
        // Validate column names if specified
        const expectedCols = rules.expectedColumns.map(c => c.toLowerCase());
        const actualCols = columns.map(c => c.toLowerCase());
        const missingCols = expectedCols.filter(col => !actualCols.includes(col));
        
        if (missingCols.length > 0) {
          success = false;
          feedback = `Your result is missing expected columns: ${missingCols.join(', ')}. Check your SELECT clause!`;
        }
      } else if (rules.minRows && rowCount < rules.minRows) {
        success = false;
        feedback = `Expected at least ${rules.minRows} rows, but got ${rowCount}. Review your WHERE conditions!`;
      } else if (rules.expectedRowCountAfter && rowCount !== rules.expectedRowCountAfter) {
        success = false;
        feedback = `Expected exactly ${rules.expectedRowCountAfter} rows after operation, but got ${rowCount}. Check your query!`;
      } else if (rowCount === 0 && !rules.minRows && !rules.expectedRowCountAfter) {
        success = false;
        feedback = 'Your query ran but returned no rows. Try adjusting your conditions or check the table data.';
      }
      
      if (success) {
        // Mission completed successfully!
        const completedMissions = await getCompletedMissions(userId);
        const alreadyCompleted = completedMissions.includes(missionId!);
        
        if (!alreadyCompleted) {
          await completeUserMission(userId, missionId!, mission.xpReward);
          await addUserXP(userId, mission.xpReward);
          
          feedback = `🎉 Mission Complete! +${mission.xpReward} XP${await checkLevelUp(userId)}`;
          xpEarned = mission.xpReward;
        } else {
          feedback = `✓ Already completed! Your query is correct but you already earned the XP for this mission.`;
        }
      }
      
      await saveQueryHistory(userId, missionId || null, sql, success);
    } else {
      // No mission context - just run query
      await saveQueryHistory(userId, null, sql, true);
    }
    
    res.json({ 
      success, 
      feedback, 
      columns, 
      rows, 
      rowCount,
      xpEarned 
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => null);
    await saveQueryHistory(userId, missionId || null, sql, false);
    
    const message = err instanceof Error ? err.message : 'Unknown error';
    
    // Provide helpful error messages
    let userFriendlyMessage = message;
    if (message.includes('syntax error')) {
      userFriendlyMessage = '❌ SQL Syntax Error: Check your query structure. ' + message;
    } else if (message.includes('does not exist')) {
      userFriendlyMessage = '❌ Table or column not found: ' + message;
    } else if (message.includes('permission denied')) {
      userFriendlyMessage = '❌ Permission denied: This operation is not allowed.';
    }
    
    res.status(500).json({ success: false, feedback: userFriendlyMessage });
  } finally {
    client.release();
  }
}

async function checkLevelUp(userId: string): Promise<string> {
  const progress = await getUserProgress(userId);
  if (!progress) return '';
  
  const currentLevel = progress.current_level;
  const xpNeeded = currentLevel * 500;
  
  if (progress.current_xp >= xpNeeded && currentLevel < MAX_LEVEL) {
    // Level up is handled by addXP in authService
    return `\n\n🎊 LEVEL UP! You are now Level ${currentLevel + 1}! 🎊`;
  }
  
  return '';
}
