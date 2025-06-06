# AI Prompts Documentation

Dokumentasi ini berisi semua prompt AI yang digunakan dalam pengembangan **News & Topics Management API**. Penggunaan AI telah menjadi fundamental dalam proses development untuk meningkatkan efisiensi, kualitas kode, dan konsistensi implementasi.

## 🤖 AI Tools yang Digunakan

- **GitHub Copilot**: Code completion dan generation
- **ChatGPT/Claude**: Architecture planning dan problem solving
- **GitHub Copilot Chat**: Real-time coding assistance

## 📋 Kategori Prompts

### 1. Project Architecture & Planning

#### Initial Project Setup
```prompt
Saya perlu membuat REST API untuk News dan Topic Management dengan requirements:
- Tech stack: Node.js dengan Fastify
- Database: PostgreSQL
- Features: CRUD untuk News dan Topics dengan relasi many-to-many
- News memiliki status: draft, published, deleted
- Include API documentation, unit tests, dan CI pipeline

Buatkan:
1. Struktur folder project yang optimal
2. Package.json dengan dependencies yang diperlukan
3. Database schema design dengan DBML
4. Basic application architecture
```

#### Database Schema Design
```prompt
Desain database schema untuk aplikasi news management dengan requirements:
- Tabel news: id, title, content, status (draft/published/deleted), timestamps
- Tabel topics: id, name, description, timestamps
- Relasi many-to-many antara news dan topics
- Include indexes untuk performa optimal
- Buat dalam format DBML untuk dokumentasi

Pertimbangkan:
- Normalisasi database
- Performance optimization
- Data integrity constraints
```

### 2. Backend Development

#### Fastify Application Setup
```prompt
Buat aplikasi Fastify dengan konfigurasi production-ready:
- PostgreSQL integration dengan @fastify/postgres
- Swagger documentation dengan @fastify/swagger
- CORS configuration
- Error handling yang comprehensive
- Health check endpoints
- Logging configuration
- Environment variables support
- Graceful shutdown handling

Gunakan ES modules dan implementasi best practices untuk scalability.
```

#### Model Layer Development
```prompt
Implementasikan model layer untuk News dan Topics dengan:
- PostgreSQL raw queries (tanpa ORM)
- CRUD operations yang complete
- Complex queries untuk relasi many-to-many
- Error handling yang proper
- Transaction support untuk operasi complex
- Input validation di level model

Untuk News model:
- Filter berdasarkan status dan topic
- Soft delete dan hard delete
- Include related topics dalam response

Untuk Topic model:
- Search functionality
- Prevent deletion jika masih digunakan
- Include news count dan related news
```

#### Controller Layer
```prompt
Buat controllers untuk News dan Topics dengan:
- Proper HTTP status codes
- Consistent response format
- Input validation
- Error handling dengan descriptive messages
- Logging untuk debugging
- Support untuk query parameters filtering

Response format standar:
{
  "success": boolean,
  "message": string,
  "data": object/array,
  "total": number (untuk list endpoints)
}

Implementasikan semua operasi CRUD dengan validasi yang tepat.
```

#### API Routes & Documentation
```prompt
Implementasikan API routes dengan Fastify dan Swagger documentation:
- RESTful endpoint naming conventions
- Request/response schema validation
- Comprehensive Swagger documentation dengan descriptions
- Parameter validation
- Example requests dan responses
- Error response schemas

Endpoints yang diperlukan:
News: GET, POST, PUT, DELETE dengan filtering
Topics: GET, POST, PUT, DELETE dengan search functionality

Include tags untuk grouping di Swagger UI.
```

### 3. Testing Strategy

#### Unit Test Implementation
```prompt
Buat comprehensive unit tests menggunakan Vitest untuk:
- Semua API endpoints (News dan Topics)
- Positive dan negative test cases
- Edge cases dan error scenarios
- Database integration testing
- Input validation testing

Test structure:
- Setup dan teardown yang proper
- Test data isolation
- Cleanup after tests
- Mock data yang realistic
- Coverage untuk semua code paths

Gunakan describe/it structure dengan descriptive test names dalam bahasa Indonesia.
```

#### Test Helper dan Configuration
```prompt
Buat test utilities dan configuration:
- Helper function untuk build test application
- Database setup untuk testing environment
- Test data fixtures
- Vitest configuration dengan coverage
- Setup file untuk environment variables

Pastikan tests bisa run isolated dan tidak interfere satu sama lain.
```

### 4. Database Operations

#### Migration Scripts
```prompt
Buat database migration scripts dengan:
- Create tables dengan proper constraints
- Indexes untuk performance optimization
- Foreign key relationships
- Check constraints untuk data validation
- Triggers untuk auto-update timestamps
- Rollback capability

Include error handling dan informative logging.
```

#### Seeding Scripts
```prompt
Implementasikan database seeding dengan:
- Sample data yang realistic
- Proper relationships antara News dan Topics
- Different status examples untuk testing
- Error handling untuk duplicate data
- Configurable data amount

Data harus representative untuk development dan testing.
```

### 5. DevOps & CI/CD

#### GitHub Actions CI/CD Pipeline
```prompt
Buat CI/CD pipeline dengan GitHub Actions untuk:
- Automated testing pada push/pull request
- PostgreSQL service untuk integration testing
- Multi-stage pipeline (test, security, build, deploy)
- Environment setup dengan variables
- Coverage reporting dengan artifacts
- Security audit dengan npm audit
- Build verification dan artifacts
- Multi-environment support (staging, production)

Include:
- Matrix testing untuk multiple Node versions
- Caching untuk dependencies
- Manual deployment approval
- Environment-specific configurations
```

### 6. Code Quality & Documentation

#### Code Comments & Documentation
```prompt
Tambahkan comprehensive documentation berupa:
- Inline comments dalam bahasa Indonesia untuk business logic
- JSDoc comments untuk functions
- API endpoint descriptions
- Database schema documentation
- Environment variables documentation
- Deployment instructions

Focus pada clarity dan maintainability.
```

#### README Documentation
```prompt
Buat README.md yang comprehensive dengan:
- Project overview dan tech stack
- Installation dan setup instructions
- API documentation links
- Testing instructions
- Deployment guidelines
- Project structure explanation
- Contributing guidelines
- Troubleshooting section

Include badges untuk build status, coverage, dll.
```

### 7. Performance & Security

#### Performance Optimization
```prompt
Optimize aplikasi untuk performance:
- Database query optimization
- Index strategy
- Connection pooling configuration
- Caching strategy (jika diperlukan)
- Response compression
- Rate limiting implementation
- Memory usage optimization

Analisis bottlenecks dan provide solutions.
```

#### Security Implementation
```prompt
Implementasikan security best practices:
- Input validation dan sanitization
- SQL injection prevention
- CORS configuration yang proper
- Error message yang tidak expose sensitive info
- Environment variables untuk secrets
- Request size limiting
- Security headers

Review code untuk potential vulnerabilities.
```

### 6. API Enhancement & Feature Updates

#### Topic ID Filter Implementation
```prompt
Update API News endpoint untuk menggunakan topic_id filter instead of text-based topic filter:

Requirements:
1. Ganti parameter 'topic' dengan 'topic_id' (integer)
2. Tambah endpoint GET /api/news/topics untuk mendapatkan dropdown data
3. Implementasi exact match filtering berdasarkan topic ID
4. Pertahankan semua topics yang dimiliki news item dalam response (bukan hanya filtered topic)

Technical considerations:
- Update query di newsModel untuk menggunakan subquery approach
- Maintain backward compatibility selama masa transisi
- Update schema validation untuk topic_id parameter
- Add comprehensive test coverage untuk perubahan ini
```

#### Title Search Functionality
```prompt
Implementasikan search functionality untuk news berdasarkan title:

Requirements:
1. Tambah parameter 'q' untuk search query pada GET /api/news
2. Search menggunakan case-insensitive partial match (ILIKE)
3. Kombinasikan dengan filter topic_id jika ada
4. Update response message untuk menunjukkan search context

Implementation:
- Gunakan PostgreSQL ILIKE operator untuk case-insensitive search
- Trim whitespace dari search query
- Handle empty search gracefully
- Optimize query performance dengan proper indexing
- Update API documentation dengan examples
```

#### Enhanced Response Format
```prompt
Tingkatkan format response untuk memberikan context yang lebih baik:

1. Dynamic messages berdasarkan filter yang digunakan:
   - Default: "Berhasil mengambil data berita"
   - With search: "Berhasil mencari berita dengan kata kunci '{query}'"
   - With filters: Context-aware messages

2. Maintain consistent response structure:
   - success: boolean
   - message: string (contextual)
   - data: array/object
   - pagination: object (untuk list endpoints)

3. Error handling improvements:
   - More descriptive error messages
   - Proper HTTP status codes
   - Include validation details when applicable
```

#### Database Query Optimization
```prompt
Optimasi query untuk menampilkan semua topics ketika filtering berdasarkan topic_id:

Challenge: Ketika filter berdasarkan topic_id, hanya topic yang di-filter yang muncul dalam response, padahal seharusnya menampilkan semua topics yang dimiliki news item tersebut.

Solution approach:
1. Gunakan subquery untuk filtering: WHERE n.id IN (SELECT news_id FROM news_topics WHERE topic_id = ?)
2. Maintain main JOIN untuk mengambil semua topics
3. Ensure performance tidak terdegradasi dengan indexing yang proper
4. Test dengan data volume yang besar

Hasil: News dengan multiple topics akan menampilkan semua topics-nya, bukan hanya yang di-filter.
```

#### API Documentation Updates
```prompt
Update dokumentasi API untuk mencerminkan perubahan terbaru:

1. OpenAPI Specification Updates:
   - Update parameter schema (topic_id vs topic)
   - Add new endpoint /api/news/topics
   - Update example requests dan responses
   - Add description untuk new search functionality

2. README.md Updates:
   - Update API endpoints section
   - Update filter parameters documentation
   - Add examples untuk new features
   - Update feature list dengan enhancements

3. System Design Updates:
   - Update flow diagrams jika diperlukan
   - Document new query patterns
   - Update database interaction flow
```

## 📝 Recent Implementation Prompts

### Implementation of Pagination and Soft Delete

#### Final Implementation Request
```prompt
tolong ubah dengan ketentuan sebagai berikut:
- buat pagination pada setiap api get all dengan query params (page, limit, order_by, sort_type)
- tambahkan kolom deleted_at ketika news di delete secara soft atau berubah status menjadi deleted. namun ketika setelah di soft delete lalu status diubah selain deleted, maka deleted_at akan menjadi null kembali
```

#### Pagination Implementation
```prompt
Implementasikan pagination pada semua GET endpoints dengan:
- Query parameters: page, limit, order_by, sort_type
- Validation: page > 0, limit antara 1-100
- Response format standardized dengan pagination object:
  {
    data: [...],
    pagination: {
      page, limit, total, totalPages, hasNext, hasPrev
    }
  }
- SQL query optimization dengan OFFSET/LIMIT
- Order validation untuk prevent SQL injection
- Consistent implementation across News dan Topics endpoints
```

#### Soft Delete with deleted_at Column
```prompt
Implementasikan soft delete logic dengan kolom deleted_at:
- Database migration untuk menambah column deleted_at TIMESTAMP NULL
- Logic dalam NewsModel.update():
  - Set deleted_at = current timestamp ketika status berubah ke 'deleted'
  - Set deleted_at = null ketika status berubah dari 'deleted' ke status lain
- Update NewsModel.delete() untuk set status='deleted' dan deleted_at
- Maintain hard delete functionality dengan query parameter ?hard=true
- Update response schemas untuk include deleted_at field
- Comprehensive testing untuk semua scenarios
```

#### Database Schema Updates
```prompt
Update database schema documentation untuk reflect perubahan:
- docs/database.dbml: tambah deleted_at column
- docs/SYSTEM_DESIGN.md: update ERD diagram
- README.md: update database schema section
- Ensure consistency across all documentation files
```

#### Testing Implementation
```prompt
Update test suite untuk cover new functionality:
- Pagination testing: validate response structure, parameter validation
- Soft delete testing: verify deleted_at behavior
- Status transition testing: deleted → other status clears deleted_at
- Edge cases: invalid pagination parameters, boundary conditions
- Integration testing untuk full workflow
- Maintain 100% test coverage
```

### 3. Advanced Features Implementation

#### Pagination Implementation
```prompt
Implementasikan pagination untuk semua GET list endpoints dengan:
- Query parameters: page, limit, order_by, sort_type
- Validation: page >= 1, limit 1-100, order_by whitelist, sort_type ASC/DESC
- Response format dengan pagination object yang berisi:
  * page: nomor halaman saat ini
  * limit: jumlah item per halaman
  * total: total item keseluruhan
  * totalPages: total halaman
  * hasNext: boolean ada halaman selanjutnya
  * hasPrev: boolean ada halaman sebelumnya

SQL Implementation:
- Gunakan COUNT(*) query terpisah untuk total
- OFFSET/LIMIT untuk pagination
- ORDER BY dengan validation field yang diizinkan
- Optimasi performa dengan proper indexing

Test semua edge cases termasuk parameter invalid.
```

#### Soft Delete Feature
```prompt
Implementasikan soft delete untuk News dengan requirements:
- Tambah kolom deleted_at TIMESTAMP NULL ke tabel news
- DELETE endpoint default soft delete (update status='deleted' + deleted_at)
- Hard delete dengan query parameter ?hard=true untuk permanent delete
- Status transition logic:
  * Ketika status berubah ke 'deleted' → set deleted_at = current_timestamp
  * Ketika status berubah dari 'deleted' ke status lain → set deleted_at = NULL

Business Rules:
- Soft deleted news tetap tersimpan untuk audit trail
- GET endpoints secara default tidak mengembalikan soft deleted data
- Include deleted_at field di semua response news

Testing:
- Test soft delete via DELETE endpoint
- Test status transition via PUT endpoint
- Test hard delete functionality
- Test response format consistency
```

#### API Documentation Enhancement
```prompt
Update OpenAPI/Swagger documentation untuk include:
1. Pagination parameters di semua GET list endpoints:
   - page (integer, min: 1, default: 1)
   - limit (integer, min: 1, max: 100, default: 10)
   - order_by (enum dengan field yang valid)
   - sort_type (enum: ASC/DESC)

2. Soft Delete documentation:
   - deleted_at field di news response schema
   - hard query parameter untuk DELETE endpoint
   - Status transition behavior explanation

3. Response schema update:
   - Pagination object schema dengan semua field
   - Error response format yang konsisten
   - Example responses untuk setiap endpoint

Pastikan dokumentasi accurate dan mudah dipahami oleh API consumers.
```

#### Comprehensive Testing Strategy
```prompt
Buat comprehensive test suite untuk pagination dan soft delete dengan coverage:

Pagination Tests:
- Response structure validation (data + pagination object)
- Parameter validation (page, limit, order_by, sort_type)
- Edge cases: page=0, limit=101, invalid order_by
- Sorting functionality verification
- Multiple pages navigation testing

Soft Delete Tests:
- Soft delete via DELETE endpoint
- Hard delete dengan ?hard=true parameter
- Status transition logic (PUT endpoint)
- deleted_at field management
- Data integrity setelah soft delete

Integration Tests:
- End-to-end workflow testing
- Error scenarios dan edge cases
- Performance testing untuk large datasets
- Database cleanup setelah tests

Mock realistic data dan test scenarios yang comprehensive.
```

### 4. Database & Performance

#### Database Migration Scripts
```prompt
Buat migration scripts yang safe dan reversible untuk:
1. Menambah kolom deleted_at ke tabel news
2. Create indexes untuk performance optimization:
   - Index pada news.status untuk filtering
   - Index pada news.deleted_at untuk soft delete queries
   - Composite index untuk pagination ordering

Migration harus:
- Idempotent (safe untuk dijalankan multiple kali)
- Include rollback scripts
- Handle existing data dengan grace
- Minimize downtime untuk production

Test migration di environment yang berbeda untuk memastikan compatibility.
```

#### Performance Optimization
```prompt
Optimasi performa untuk pagination dan filtering dengan:
1. Database Indexing Strategy:
   - Single column indexes untuk filtering
   - Composite indexes untuk sorting + pagination
   - Partial indexes untuk soft delete scenarios

2. Query Optimization:
   - Avoid SELECT * untuk large datasets
   - Use EXPLAIN ANALYZE untuk query planning
   - Implement query result caching strategy
   - Optimize JOIN queries untuk news-topics relation

3. Application Level:
   - Connection pooling configuration
   - Response caching untuk static data
   - Lazy loading untuk related data
   - Rate limiting untuk API protection

Benchmark performance sebelum dan sesudah optimization.
```

---

**Note**: Semua prompt di atas telah digunakan dalam pengembangan project ini dengan adaptasi sesuai context dan requirements specific. AI assistance telah significantly meningkatkan development velocity dan code quality.
