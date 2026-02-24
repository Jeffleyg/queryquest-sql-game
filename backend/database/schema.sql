-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255),
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Player progress table
CREATE TABLE IF NOT EXISTS player_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_level INTEGER DEFAULT 1,
  current_xp INTEGER DEFAULT 0,
  xp_to_next_level INTEGER DEFAULT 500,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Completed missions table
CREATE TABLE IF NOT EXISTS completed_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mission_id VARCHAR(50) NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW(),
  xp_earned INTEGER NOT NULL,
  UNIQUE(user_id, mission_id)
);

-- Unlocked missions table
CREATE TABLE IF NOT EXISTS unlocked_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mission_id VARCHAR(50) NOT NULL,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, mission_id)
);

-- Query history table
CREATE TABLE IF NOT EXISTS query_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mission_id VARCHAR(50),
  query TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  executed_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_player_progress_user_id ON player_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_completed_missions_user_id ON completed_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_unlocked_missions_user_id ON unlocked_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_query_history_user_id ON query_history(user_id);
