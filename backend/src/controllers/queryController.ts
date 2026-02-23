import { Request, Response } from 'express';
import { isSafeQuery } from '../middleware/sqlSafety';
import { getMissionById } from '../services/missionService';
import pool from '../config/database';

export async function executeUserQuery(req: Request, res: Response): Promise<void> {
  const { sql, missionId } = req.body as { sql: string; missionId?: string };

  if (!sql || typeof sql !== 'string') {
    res.status(400).json({ success: false, feedback: 'No SQL query provided.' });
    return;
  }

  const safetyCheck = isSafeQuery(sql);
  if (!safetyCheck.safe) {
    res.status(400).json({ success: false, feedback: safetyCheck.reason ?? 'Unsafe query.' });
    return;
  }

  let mission = missionId ? getMissionById(missionId) : null;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (mission?.tableSetup) {
      await client.query(mission.tableSetup);
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
      const required = mission.validationRules.requiredKeywords;
      const forbidden = mission.validationRules.forbiddenKeywords ?? [];

      const missingKeywords = required.filter((kw) => !upperSql.includes(kw.toUpperCase()));
      const usedForbidden = forbidden.filter((kw) => upperSql.includes(kw.toUpperCase()));

      if (missingKeywords.length > 0) {
        success = false;
        feedback = `Almost there! Your query is missing: ${missingKeywords.join(', ')}.`;
      } else if (usedForbidden.length > 0) {
        success = false;
        feedback = `Your query uses forbidden keyword(s): ${usedForbidden.join(', ')}.`;
      } else if (rowCount === 0) {
        success = false;
        feedback = 'Your query ran but returned no rows. Try adjusting your conditions.';
      } else {
        feedback = `Mission complete! You found ${rowCount} record(s). Well done, Detective! 🎉`;
        xpEarned = mission.xpReward;
      }
    }

    res.json({ success, columns, rows, rowCount, feedback, xpEarned });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => null);
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ success: false, feedback: `Query error: ${message}` });
  } finally {
    client.release();
  }
}
