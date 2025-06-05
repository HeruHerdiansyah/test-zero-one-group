/**
 * Konfigurasi Jest untuk testing dengan ES modules
 */
module.exports = {
  // Menggunakan node sebagai test environment
  testEnvironment: 'node',
  
  // Pattern untuk mencari file test
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  
  // Verbose output
  verbose: true,
  
  // Timeout untuk async tests
  testTimeout: 30000,
  
  // Clear mocks setelah setiap test
  clearMocks: true,
  
  // Transform files menggunakan babel-jest
  transform: {
    '^.+\\.js$': 'babel-jest'
  }
};
