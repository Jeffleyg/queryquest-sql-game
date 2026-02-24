import pool from '../config/database';

export async function executeQuery(sql: string): Promise<{
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
}> {
  const result = await pool.query(sql);
  const columns = result.fields.map((f) => f.name);
  const rows = result.rows as Record<string, unknown>[];
  const rowCount = result.rowCount ?? rows.length;
  return { columns, rows, rowCount };
}

export async function getQueryPerformance(sql: string): Promise<{
  plan: string[];
  executionTime: number;
}> {
  const startTime = Date.now();
  const result = await pool.query(`EXPLAIN ANALYZE ${sql}`);
  const executionTime = Date.now() - startTime;
  
  const plan = (result.rows as Array<{ 'QUERY PLAN': string }>).map(row => row['QUERY PLAN']);
  
  return { plan, executionTime };
}
