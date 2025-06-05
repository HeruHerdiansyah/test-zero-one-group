import pg from 'pg';
import 'dotenv/config';

console.log('🚀 Migration script started...');
console.log('📦 Loading pg module...');

const { Pool } = pg;

console.log('🔧 Creating database pool...');

// Konfigurasi koneksi database
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'news_api',
  user: process.env.DB_USER || 'username',
  password: process.env.DB_PASSWORD || 'password',
});

console.log('✅ Database pool created');
console.log('📍 Connection config:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER
});

// Script migrasi untuk membuat tabel
const migrations = [
  // Migrasi 1: Membuat tabel topics
  `
  CREATE TABLE IF NOT EXISTS topics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  `,
    // Migrasi 2: Membuat tabel news
  `
  CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'deleted')),
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  `,
  
  // Migrasi 3: Membuat tabel junction news_topics
  `
  CREATE TABLE IF NOT EXISTS news_topics (
    id SERIAL PRIMARY KEY,
    news_id INTEGER NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(news_id, topic_id)
  );
  `,
    // Migrasi 4: Membuat index untuk performa
  `
  CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);
  CREATE INDEX IF NOT EXISTS idx_news_topics_news_id ON news_topics(news_id);
  CREATE INDEX IF NOT EXISTS idx_news_topics_topic_id ON news_topics(topic_id);
  `,
  
  // Migrasi 5: Menambahkan kolom deleted_at jika belum ada
  `
  DO $$ 
  BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'news' AND column_name = 'deleted_at') THEN
      ALTER TABLE news ADD COLUMN deleted_at TIMESTAMP NULL;
    END IF;
  END $$;
  `,
  // Migrasi 6: Membuat trigger untuk auto-update timestamp
  `
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
  END;
  $$ language 'plpgsql';
  
  DROP TRIGGER IF EXISTS update_topics_updated_at ON topics;
  CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
  DROP TRIGGER IF EXISTS update_news_updated_at ON news;
  CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `
];

async function runMigrations() {
  console.log('🔗 Mencoba koneksi ke database...');
  console.log(`📍 Database: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
  
  let client;
  try {
    client = await pool.connect();
    console.log('✅ Koneksi database berhasil!');
    console.log('🚀 Memulai migrasi database...');
    
    // Test connection first
    await client.query('SELECT 1');
    console.log('✅ Database test query berhasil');
    
    for (let i = 0; i < migrations.length; i++) {
      console.log(`📝 Menjalankan migrasi ${i + 1}/${migrations.length}...`);
      try {
        await client.query(migrations[i]);
        console.log(`✅ Migrasi ${i + 1} selesai`);
      } catch (migrationError) {
        console.error(`❌ Error pada migrasi ${i + 1}:`, migrationError.message);
        throw migrationError;
      }
    }
    
    // Verify tables were created
    const result = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' ORDER BY table_name
    `);
    console.log('📊 Tabel yang dibuat:', result.rows.map(r => r.table_name));
    
    console.log('🎉 Semua migrasi berhasil dijalankan!');
  } catch (error) {
    console.error('❌ Error saat menjalankan migrasi:', error.message);
    console.error('💡 Detail error:', error);
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Jalankan migrasi jika file ini dijalankan langsung
console.log('🔍 Checking if should run migrations...');
console.log('import.meta.url:', import.meta.url);
console.log('process.argv[1]:', process.argv[1]);

// Fix untuk Windows - normalize path
import { fileURLToPath } from 'url';
import { resolve } from 'path';

const currentFile = fileURLToPath(import.meta.url);
const scriptFile = resolve(process.argv[1]);

console.log('currentFile:', currentFile);
console.log('scriptFile:', scriptFile);

if (currentFile === scriptFile) {
  console.log('🎯 Starting migration process...');
  runMigrations().catch(error => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });
} else {
  console.log('📦 Module imported, not running migrations');
}

export { pool, runMigrations };
