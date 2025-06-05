import pg from 'pg';
import 'dotenv/config';

console.log('🌱 Starting seed script...');

const { Pool } = pg;

// Konfigurasi koneksi database untuk seeding
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'news_api',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

console.log('✅ Database pool created for seeding');

// Data seed untuk testing dan development
const seedData = {
  topics: [
    { name: 'Teknologi', description: 'Berita seputar teknologi dan inovasi' },
    { name: 'Olahraga', description: 'Berita seputar dunia olahraga' },
    { name: 'Politik', description: 'Berita seputar politik dan pemerintahan' },
    { name: 'Ekonomi', description: 'Berita seputar ekonomi dan bisnis' },
    { name: 'Kesehatan', description: 'Berita seputar kesehatan dan medis' }
  ],
  
  news: [
    {
      title: 'Perkembangan AI di Indonesia Tahun 2025',
      content: 'Indonesia mengalami perkembangan pesat dalam bidang kecerdasan buatan. Berbagai startup dan perusahaan teknologi mulai mengadopsi AI untuk meningkatkan efisiensi bisnis mereka.',
      status: 'published'
    },
    {
      title: 'Piala Dunia 2026: Persiapan Tim Nasional',
      content: 'Tim nasional Indonesia mulai mempersiapkan diri untuk Piala Dunia 2026. Pelatih baru telah ditunjuk dan program latihan intensif akan dimulai bulan depan.',
      status: 'draft'
    },
    {
      title: 'Kebijakan Ekonomi Baru Pemerintah',
      content: 'Pemerintah mengumumkan kebijakan ekonomi baru yang bertujuan untuk meningkatkan daya beli masyarakat dan mendorong pertumbuhan UMKM.',
      status: 'published'
    }
  ]
};

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Memulai seeding database...');
    
    // Seed topics
    console.log('📝 Menambahkan data topics...');
    for (const topic of seedData.topics) {
      await client.query(
        'INSERT INTO topics (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
        [topic.name, topic.description]
      );
    }
    
    // Seed news
    console.log('📝 Menambahkan data news...');
    for (const news of seedData.news) {
      const result = await client.query(
        'INSERT INTO news (title, content, status) VALUES ($1, $2, $3) RETURNING id',
        [news.title, news.content, news.status]
      );
      
      // Assign random topics to news
      const newsId = result.rows[0].id;
      const randomTopicIds = await client.query('SELECT id FROM topics ORDER BY RANDOM() LIMIT 2');
      
      for (const topic of randomTopicIds.rows) {
        await client.query(
          'INSERT INTO news_topics (news_id, topic_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [newsId, topic.id]
        );
      }
    }
    
    console.log('✅ Seeding database berhasil!');
  } catch (error) {
    console.error('❌ Error saat seeding database:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Jalankan seeding jika file ini dijalankan langsung
console.log('🔍 Checking if should run seeding...');
console.log('import.meta.url:', import.meta.url);
console.log('process.argv[1]:', process.argv[1]);

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🎯 Starting seeding process...');
  seedDatabase().catch(error => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });
} else {
  console.log('📦 Module imported, running seeding anyway...');
  seedDatabase().catch(error => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });
}

export { seedDatabase };
