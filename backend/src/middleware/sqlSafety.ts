const BLOCKED_KEYWORDS_GENERAL = [
  'GRANT',
  'REVOKE',
  'EXEC',
  'EXECUTE',
];

// Keywords that require mission context to be allowed
const RESTRICTED_KEYWORDS = [
  'DROP',
  'DELETE', 
  'TRUNCATE',
  'ALTER',
  'CREATE',
  'INSERT',
  'UPDATE',
];

export function isSafeQuery(sql: string, missionId?: string): { safe: boolean; reason?: string } {
  const normalized = sql.trim().toUpperCase();

  // Always block dangerous keywords
  for (const keyword of BLOCKED_KEYWORDS_GENERAL) {
    const pattern = new RegExp(`(^|[^A-Z0-9_])${keyword}([^A-Z0-9_]|$)`);
    if (pattern.test(normalized)) {
      return { safe: false, reason: `Query contains forbidden keyword: ${keyword}` };
    }
  }

  // Check if this is a Level 2+ mission that allows DDL/DML operations
  const isAdvancedMission = missionId && (
    missionId.startsWith('level2-') || 
    missionId.startsWith('level3-')
  );

  // Block restricted keywords for Level 1 missions only
  if (!isAdvancedMission) {
    for (const keyword of RESTRICTED_KEYWORDS) {
      const pattern = new RegExp(`(^|[^A-Z0-9_])${keyword}([^A-Z0-9_]|$)`);
      if (pattern.test(normalized)) {
        return { 
          safe: false, 
          reason: `${keyword} statements are only available in advanced missions (Level 2+)` 
        };
      }
    }
  }

  // Validate DELETE and UPDATE have WHERE clauses (safety measure even in advanced missions)
  if (normalized.includes('DELETE') && !normalized.includes('WHERE')) {
    return { safe: false, reason: 'DELETE requires a WHERE clause for safety. Use DELETE FROM table WHERE condition;' };
  }

  if (normalized.includes('UPDATE') && !normalized.includes('WHERE')) {
    return { safe: false, reason: 'UPDATE requires a WHERE clause for safety. Use UPDATE table SET ... WHERE condition;' };
  }

  // Allow SELECT, WITH, and DDL/DML for advanced missions
  const startsWithAllowed = 
    normalized.startsWith('SELECT') ||
    normalized.startsWith('WITH') ||
    (isAdvancedMission && (
      normalized.startsWith('INSERT') ||
      normalized.startsWith('UPDATE') ||
      normalized.startsWith('DELETE') ||
      normalized.startsWith('CREATE') ||
      normalized.startsWith('ALTER') ||
      normalized.startsWith('DROP')
    ));

  if (!startsWithAllowed) {
    return { safe: false, reason: 'Only SELECT/WITH queries are allowed (or DDL/DML in Level 2+ missions).' };
  }

  return { safe: true };
}
