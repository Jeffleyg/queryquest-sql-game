const BLOCKED_KEYWORDS = [
  'DROP',
  'DELETE',
  'TRUNCATE',
  'ALTER',
  'CREATE',
  'INSERT',
  'UPDATE',
  'GRANT',
  'REVOKE',
  'EXEC',
  'EXECUTE',
];

export function isSafeQuery(sql: string): { safe: boolean; reason?: string } {
  const normalized = sql.trim().toUpperCase();

  for (const keyword of BLOCKED_KEYWORDS) {
    // Match keyword as a whole word (surrounded by non-alphanumeric or start/end)
    const pattern = new RegExp(`(^|[^A-Z0-9_])${keyword}([^A-Z0-9_]|$)`);
    if (pattern.test(normalized)) {
      return { safe: false, reason: `Query contains forbidden keyword: ${keyword}` };
    }
  }

  if (!normalized.startsWith('SELECT') && !normalized.startsWith('WITH')) {
    return { safe: false, reason: 'Only SELECT (or WITH) statements are allowed.' };
  }

  return { safe: true };
}
