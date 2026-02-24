import pool from '../config/database';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { sendVerificationEmail, sendPasswordResetEmail } from './emailService';

export interface User {
  id: string;
  email: string;
  username: string;
  is_verified: boolean;
  created_at: Date;
  firebase_uid?: string | null;
}

export interface PlayerProgress {
  user_id: string;
  current_level: number;
  current_xp: number;
  xp_to_next_level: number;
}

const SALT_ROUNDS = 10;
const XP_PER_LEVEL = 500;
const MAX_LEVEL = 30;

export async function createUser(email: string, password: string, username: string): Promise<User> {
  const client = await pool.connect();
  
  try {
    // Check if email already exists
    const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Generate verification token
    const verificationToken = uuidv4();

    // Create user
    const result = await client.query(
      `INSERT INTO users (email, password_hash, username, verification_token) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, username, is_verified, created_at`,
      [email, passwordHash, username, verificationToken]
    );

    const user = result.rows[0];

    // Create player progress
    await client.query(
      `INSERT INTO player_progress (user_id, current_level, current_xp, xp_to_next_level) 
       VALUES ($1, 1, 0, $2)`,
      [user.id, XP_PER_LEVEL]
    );

    // Unlock first mission
    await client.query(
      `INSERT INTO unlocked_missions (user_id, mission_id) VALUES ($1, 'level1-mission1')`,
      [user.id]
    );

    // Send verification email
    await sendVerificationEmail(email, verificationToken, username);

    return user;
  } finally {
    client.release();
  }
}

export async function getUserByFirebaseUid(firebaseUid: string): Promise<User | null> {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT id, email, username, is_verified, created_at, firebase_uid
       FROM users WHERE firebase_uid = $1`,
      [firebaseUid]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  } finally {
    client.release();
  }
}

export async function createUserFromFirebase(
  firebaseUid: string,
  email: string,
  username: string,
  isVerified: boolean
): Promise<User> {
  const client = await pool.connect();

  try {
    const existingByEmail = await client.query(
      `SELECT id, email, username, is_verified, created_at, firebase_uid
       FROM users WHERE email = $1`,
      [email]
    );

    if (existingByEmail.rows.length > 0) {
      const existing = existingByEmail.rows[0] as User;
      if (existing.firebase_uid && existing.firebase_uid !== firebaseUid) {
        throw new Error('Email already linked to another account');
      }

      const updated = await client.query(
        `UPDATE users
         SET firebase_uid = $1, is_verified = $2, updated_at = NOW()
         WHERE id = $3
         RETURNING id, email, username, is_verified, created_at, firebase_uid`,
        [firebaseUid, isVerified || existing.is_verified, existing.id]
      );

      return updated.rows[0];
    }

    const result = await client.query(
      `INSERT INTO users (email, password_hash, username, is_verified, firebase_uid)
       VALUES ($1, NULL, $2, $3, $4)
       RETURNING id, email, username, is_verified, created_at, firebase_uid`,
      [email, username, isVerified, firebaseUid]
    );

    const user = result.rows[0];

    await client.query(
      `INSERT INTO player_progress (user_id, current_level, current_xp, xp_to_next_level)
       VALUES ($1, 1, 0, $2)`,
      [user.id, XP_PER_LEVEL]
    );

    await client.query(
      `INSERT INTO unlocked_missions (user_id, mission_id) VALUES ($1, 'level1-mission1')`,
      [user.id]
    );

    return user;
  } finally {
    client.release();
  }
}

export async function updateUserVerification(userId: string, isVerified: boolean): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query(
      `UPDATE users SET is_verified = $1, updated_at = NOW() WHERE id = $2`,
      [isVerified, userId]
    );
  } finally {
    client.release();
  }
}

export async function verifyEmail(token: string): Promise<boolean> {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `UPDATE users SET is_verified = true, verification_token = NULL 
       WHERE verification_token = $1 AND is_verified = false
       RETURNING id`,
      [token]
    );

    return result.rows.length > 0;
  } finally {
    client.release();
  }
}

export async function loginUser(email: string, password: string): Promise<User | null> {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `SELECT id, email, username, password_hash, is_verified, created_at 
       FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    if (!user.password_hash) {
      return null;
    }
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return null;
    }

    // Remove password_hash from returned object
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } finally {
    client.release();
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `SELECT id, email, username, is_verified, created_at 
       FROM users WHERE id = $1`,
      [userId]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  } finally {
    client.release();
  }
}

export async function requestPasswordReset(email: string): Promise<boolean> {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `SELECT id, username FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return false;
    }

    const user = result.rows[0];
    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await client.query(
      `UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3`,
      [resetToken, expiresAt, user.id]
    );

    await sendPasswordResetEmail(email, resetToken, user.username);
    return true;
  } finally {
    client.release();
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `SELECT id FROM users 
       WHERE reset_token = $1 AND reset_token_expires > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      return false;
    }

    const userId = result.rows[0].id;
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await client.query(
      `UPDATE users 
       SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL 
       WHERE id = $2`,
      [passwordHash, userId]
    );

    return true;
  } finally {
    client.release();
  }
}

export async function getUserProgress(userId: string): Promise<PlayerProgress | null> {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `SELECT user_id, current_level, current_xp, xp_to_next_level 
       FROM player_progress WHERE user_id = $1`,
      [userId]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  } finally {
    client.release();
  }
}

export async function addXP(userId: string, xp: number): Promise<PlayerProgress> {
  const client = await pool.connect();
  
  try {
    const progress = await getUserProgress(userId);
    if (!progress) {
      throw new Error('Progress not found');
    }

    let { current_level, current_xp, xp_to_next_level } = progress;
    current_xp += xp;

    // Level up logic
    while (current_xp >= xp_to_next_level && current_level < MAX_LEVEL) {
      current_xp -= xp_to_next_level;
      current_level++;
      xp_to_next_level = XP_PER_LEVEL * current_level;
    }

    // Cap XP at max level
    if (current_level >= MAX_LEVEL) {
      current_xp = Math.min(current_xp, xp_to_next_level);
    }

    await client.query(
      `UPDATE player_progress 
       SET current_level = $1, current_xp = $2, xp_to_next_level = $3, updated_at = NOW() 
       WHERE user_id = $4`,
      [current_level, current_xp, xp_to_next_level, userId]
    );

    return {
      user_id: userId,
      current_level,
      current_xp,
      xp_to_next_level,
    };
  } finally {
    client.release();
  }
}

export async function completeMission(userId: string, missionId: string, xpEarned: number): Promise<void> {
  const client = await pool.connect();
  
  try {
    // Check if already completed
    const existing = await client.query(
      `SELECT id FROM completed_missions WHERE user_id = $1 AND mission_id = $2`,
      [userId, missionId]
    );

    if (existing.rows.length > 0) {
      return;
    }

    // Add to completed missions
    await client.query(
      `INSERT INTO completed_missions (user_id, mission_id, xp_earned) 
       VALUES ($1, $2, $3)`,
      [userId, missionId, xpEarned]
    );

    // Unlock next mission
    const missionMatch = missionId.match(/level(\d+)-mission(\d+)/);
    if (missionMatch) {
      const level = parseInt(missionMatch[1], 10);
      const missionNumber = parseInt(missionMatch[2], 10);
      
      let nextMissionId: string | null = null;
      
      if (missionNumber === 10 && level < 3) {
        nextMissionId = `level${level + 1}-mission1`;
      } else if (missionNumber < 10) {
        nextMissionId = `level${level}-mission${missionNumber + 1}`;
      }

      if (nextMissionId) {
        await client.query(
          `INSERT INTO unlocked_missions (user_id, mission_id) 
           VALUES ($1, $2) 
           ON CONFLICT (user_id, mission_id) DO NOTHING`,
          [userId, nextMissionId]
        );
      }
    }
  } finally {
    client.release();
  }
}

export async function getCompletedMissions(userId: string): Promise<string[]> {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `SELECT mission_id FROM completed_missions WHERE user_id = $1 ORDER BY completed_at`,
      [userId]
    );

    return result.rows.map(row => row.mission_id);
  } finally {
    client.release();
  }
}

export async function getUnlockedMissions(userId: string): Promise<string[]> {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `SELECT mission_id FROM unlocked_missions WHERE user_id = $1 ORDER BY unlocked_at`,
      [userId]
    );

    return result.rows.map(row => row.mission_id);
  } finally {
    client.release();
  }
}

export async function saveQueryHistory(userId: string, missionId: string | null, query: string, success: boolean): Promise<void> {
  const client = await pool.connect();
  
  try {
    await client.query(
      `INSERT INTO query_history (user_id, mission_id, query, success) 
       VALUES ($1, $2, $3, $4)`,
      [userId, missionId, query, success]
    );
  } finally {
    client.release();
  }
}
