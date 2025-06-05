/**
 * Setup untuk Jest testing
 * Konfigurasi database dan environment untuk testing
 */
import 'dotenv/config';

// Setup untuk testing environment
process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'news_api_test';

console.log('🧪 Jest test environment berhasil diinisialisasi');
console.log(`📊 Database: ${process.env.DB_NAME || 'tidak dikonfigurasi'}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
