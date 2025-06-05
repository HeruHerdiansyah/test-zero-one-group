/**
 * Database connection pool untuk aplikasi
 * File terpisah untuk menghindari circular imports dan masalah migrasi
 */
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

// Konfigurasi koneksi database
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'news_api',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

export { pool };
