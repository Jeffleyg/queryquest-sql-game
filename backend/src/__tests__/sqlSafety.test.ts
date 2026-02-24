import { isSafeQuery } from '../middleware/sqlSafety';

describe('SQL Safety Middleware', () => {
  describe('DELETE validation', () => {
    it('should reject DELETE in Level 1 missions', () => {
      const result = isSafeQuery('DELETE FROM users', 'level1-mission1');
      expect(result.safe).toBe(false);
      expect(result.reason).toContain('only available in advanced missions');
    });

    it('should accept DELETE with WHERE clause in Level 2 missions', () => {
      const result = isSafeQuery('DELETE FROM users WHERE id = 1', 'level2-mission5');
      expect(result.safe).toBe(true);
    });

    it('should reject DELETE without WHERE clause in Level 2 missions', () => {
      const result = isSafeQuery('DELETE FROM users', 'level2-mission5');
      expect(result.safe).toBe(false);
      expect(result.reason).toContain('WHERE');
    });
  });

  describe('UPDATE validation', () => {
    it('should reject UPDATE in Level 1 missions', () => {
      const result = isSafeQuery('UPDATE users SET name = "John"', 'level1-mission1');
      expect(result.safe).toBe(false);
      expect(result.reason).toContain('only available in advanced missions');
    });

    it('should accept UPDATE with WHERE clause in Level 2 missions', () => {
      const result = isSafeQuery('UPDATE users SET name = "John" WHERE id = 1', 'level2-mission4');
      expect(result.safe).toBe(true);
    });

    it('should reject UPDATE without WHERE clause in Level 2 missions', () => {
      const result = isSafeQuery('UPDATE products SET price = 100', 'level2-mission4');
      expect(result.safe).toBe(false);
      expect(result.reason).toContain('WHERE');
    });
  });

  describe('SELECT queries', () => {
    it('should allow basic SELECT', () => {
      const result = isSafeQuery('SELECT * FROM users', 'level1-mission1');
      expect(result.safe).toBe(true);
    });

    it('should allow SELECT with WHERE', () => {
      const result = isSafeQuery('SELECT id, name FROM users WHERE age > 18', 'level1-mission2');
      expect(result.safe).toBe(true);
    });

    it('should allow SELECT with JOIN', () => {
      const result = isSafeQuery('SELECT u.name, o.amount FROM users u JOIN orders o ON u.id = o.user_id', 'level2-mission11');
      expect(result.safe).toBe(true);
    });

    it('should allow SELECT with GROUP BY', () => {
      const result = isSafeQuery('SELECT category, COUNT(*) FROM products GROUP BY category', 'level1-mission4');
      expect(result.safe).toBe(true);
    });
  });

  describe('CREATE/ALTER/DROP operations', () => {
    it('should only allow CREATE/ALTER/DROP in appropriate missions', () => {
      // These should be safe in missions designed for them
      const createResult = isSafeQuery('CREATE TABLE temp (id INT)', 'level2-mission16');
      const alterResult = isSafeQuery('ALTER TABLE users ADD COLUMN email VARCHAR(255)', 'level2-mission17');
      const dropResult = isSafeQuery('DROP TABLE users', 'level2-mission20');
      
      // They should be allowed in those missions
      expect(createResult.safe).toBe(true);
      expect(alterResult.safe).toBe(true);
      expect(dropResult.safe).toBe(true);
    });

    it('should reject CREATE/ALTER/DROP in non-appropriate missions', () => {
      const result = isSafeQuery('CREATE TABLE users (id INT)', 'level1-mission1');
      expect(result.safe).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle case-insensitive keywords', () => {
      const result1 = isSafeQuery('delete FROM users', 'level1-mission1');
      const result2 = isSafeQuery('DELETE from users where 1=1', 'level1-mission1');
      
      // Both should be rejected at Level 1
      expect(result1.safe).toBe(false);
      expect(result2.safe).toBe(false);
    });

    it('should handle extra whitespace', () => {
      const result = isSafeQuery('DELETE  FROM   users   WHERE   id = 1', 'level2-mission5');
      expect(result.safe).toBe(true);
    });

    it('should reject WITH DELETE in subquery', () => {
      const result = isSafeQuery('WITH cte AS (SELECT * FROM users) DELETE FROM cte', 'level2-mission5');
      expect(result.safe).toBe(false);
    });
  });
});
