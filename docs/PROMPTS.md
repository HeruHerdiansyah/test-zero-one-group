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

## 🔄 Iterative Prompts untuk Debugging

### Error Handling
```prompt
Saya mendapat error [specific error]. Analisis kemungkinan penyebab dan berikan solusi:
1. Check konfigurasi database connection
2. Verify environment variables
3. Review query syntax
4. Check data types compatibility
5. Validate input parameters

Provide step-by-step debugging approach.
```

### Performance Issues
```prompt
Aplikasi mengalami slow response pada endpoint [specific endpoint]. 
Analisis dan optimize:
1. Database query performance
2. N+1 query problems
3. Index effectiveness
4. Memory usage
5. Network latency

Suggest specific improvements dengan measurement approach.
```

### Test Failures
```prompt
Test [test name] gagal dengan error [error message].
Debug dan fix:
1. Check test environment setup
2. Verify test data isolation
3. Review async/await handling
4. Check database state
5. Validate mock data

Provide corrected test implementation.
```

## 📊 AI Impact Metrics

### Development Efficiency
- **Code Generation**: ~60% faster boilerplate creation
- **Documentation**: ~70% faster comprehensive docs
- **Testing**: ~50% faster test case creation
- **Debugging**: ~40% faster issue resolution

### Code Quality Improvements
- **Consistency**: Uniform coding patterns across project
- **Best Practices**: Automatic implementation of industry standards
- **Error Handling**: Comprehensive error scenarios coverage
- **Documentation**: Complete inline and external documentation

### Learning & Knowledge Transfer
- **Pattern Recognition**: Consistent architectural patterns
- **Best Practices**: Implementation of proven solutions
- **Code Review**: AI-assisted code quality checks
- **Knowledge Documentation**: Comprehensive project documentation

## 🚀 Future AI Integration

### Planned Enhancements
1. **Automated Code Review**: GitHub Actions integration
2. **Performance Monitoring**: AI-powered performance analysis
3. **Security Scanning**: Automated vulnerability detection
4. **Code Generation**: Template-based feature generation
5. **Documentation Sync**: Auto-update docs from code changes

### AI Tools Evaluation
- **GitHub Copilot**: ⭐⭐⭐⭐⭐ (Excellent for code completion)
- **ChatGPT/Claude**: ⭐⭐⭐⭐⭐ (Great for architecture planning)
- **GitHub Copilot Chat**: ⭐⭐⭐⭐ (Good for real-time assistance)

---

**Note**: Semua prompt di atas telah digunakan dalam pengembangan project ini dengan adaptasi sesuai context dan requirements specific. AI assistance telah significantly meningkatkan development velocity dan code quality.
