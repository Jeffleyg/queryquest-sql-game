import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'queryquest',
  user: process.env.DB_USER || 'queryquest',
  password: process.env.DB_PASSWORD || 'queryquest_pass',
});

export default pool;
