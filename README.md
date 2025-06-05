# News & Topics Management API

REST API untuk manajemen berita dan topik menggunakan **Fastify** dan **PostgreSQL**. API ini dikembangkan sebagai bagian dari test backend Zero One Group dengan implementasi penuh fitur CRUD, dokumentasi Swagger, unit testing, dan CI/CD pipeline.

**🔗 GitHub Repository**: https://github.com/HeruHerdiansyah/test-zero-one-group

## 🚀 Tech Stack

- **Backend Framework**: Node.js dengan Fastify
- **Database**: PostgreSQL
- **Testing**: Jest
- **Documentation**: Swagger/OpenAPI
- **CI/CD**: GitHub Actions
- **AI Integration**: Digunakan untuk optimasi query, code review, dan dokumentasi

## 📋 Features

### Core Features
- ✅ CRUD endpoints untuk entitas News dan Topics
- ✅ Relasi many-to-many antara News dan Topics
- ✅ Status management untuk News (draft, published, deleted)
- ✅ Filter endpoints berdasarkan status dan topic
- ✅ Soft delete dan hard delete untuk News
- ✅ Validasi data input yang komprehensif

### Technical Features
- ✅ API Documentation dengan Swagger UI
- ✅ Unit testing suite lengkap dengan Jest
- ✅ CI/CD pipeline dengan GitHub Actions
- ✅ Database migration dan seeding
- ✅ Error handling yang robust
- ✅ CORS support

## 🛠️ Quick Start

### Prerequisites
- Node.js (v18 atau lebih baru)
- PostgreSQL (v12 atau lebih baru)
- npm atau yarn

### Installation

1. **Clone repository**
```bash
git clone https://github.com/HeruHerdiansyah/test-zero-one-group.git
cd test-zero-one-group
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment**
```bash
cp .env.example .env
# Edit .env file dengan konfigurasi PostgreSQL Anda
```

4. **Setup database**
```bash
# Jalankan migrasi
npm run migrate

# Seed data sample
npm run seed
```

5. **Start development server**
```bash
npm run dev
```

Server akan berjalan di: http://localhost:3000

## 🧪 Testing

### Run Unit Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

## 📖 API Documentation

Setelah server berjalan, akses dokumentasi API di:
- **Swagger UI**: http://localhost:3000/docs
- **OpenAPI JSON**: http://localhost:3000/docs/json

## 📊 System Design & Database Schema

### Melihat System Design (Mermaid.js)
System design dalam format Mermaid.js tersedia di file `SYSTEM_DESIGN.md`. Untuk melihat diagram secara visual:

1. **VS Code dengan Mermaid Preview Extension:**
   ```bash
   # Install Mermaid Preview extension
   code --install-extension bierner.markdown-mermaid
   
   # Buka file dan preview
   code SYSTEM_DESIGN.md
   # Kemudian tekan Ctrl+Shift+V untuk preview
   ```

2. **Online Mermaid Editor:**
   - Buka https://mermaid.live/
   - Copy kode mermaid dari `SYSTEM_DESIGN.md`
   - Paste di editor untuk melihat diagram

3. **GitHub (jika di repository):**
   - GitHub secara otomatis merender diagram Mermaid.js dalam file .md

### Melihat ERD (DBML)
Entity Relationship Diagram dalam format DBML tersedia di file `docs/database.dbml`. Untuk melihat ERD secara visual:

1. **Online DBML Editor:**
   - Buka https://dbdiagram.io/
   - Copy konten dari file `docs/database.dbml`
   - Paste di editor untuk melihat ERD

2. **VS Code dengan DBML Extension:**
   ```bash
   # Install DBML extension
   code --install-extension matt-meyers.vscode-dbml
   
   # Buka file DBML
   code docs/database.dbml
   ```

3. **Export ke gambar:**
   - Di dbdiagram.io, klik "Export" → "PNG/PDF" untuk download diagram

## 🗃️ Database Schema

```dbml
// ERD menggunakan DBML
Table topics {
  id integer [primary key, increment]
  name varchar(100) [not null, unique]
  description text
  created_at timestamp [default: now()]
  updated_at timestamp [default: now()]
}

Table news {
  id integer [primary key, increment]
  title varchar(255) [not null]
  content text [not null]
  status varchar(20) [not null, default: 'draft']
  deleted_at timestamp [null]
  created_at timestamp [default: now()]
  updated_at timestamp [default: now()]
}

Table news_topics {
  id integer [primary key, increment]
  news_id integer [not null, ref: > news.id]
  topic_id integer [not null, ref: > topics.id]
  created_at timestamp [default: now()]
}
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v12+)
- npm atau yarn

### 1. Clone Repository
```bash
git clone https://github.com/HeruHerdiansyah/test-zero-one-group.git
cd test-zero-one-group
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
# Copy file example dan edit sesuai konfigurasi Anda
cp .env.example .env
```

Edit file `.env`:
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/news_api
DB_HOST=localhost
DB_PORT=5432
DB_NAME=news_api
DB_USER=username
DB_PASSWORD=password

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 4. Setup Database
```bash
# Jalankan migrasi untuk membuat tabel
npm run migrate

# Jalankan seeding untuk data awal (opsional)
npm run seed
```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Server akan berjalan di: `http://localhost:3000`

## 📖 API Documentation

Setelah server berjalan, akses dokumentasi API di:
- **Swagger UI**: `http://localhost:3000/docs`

### API Endpoints

#### News Endpoints
```http
GET    /api/news              # Mendapatkan semua berita dengan filter dan pagination
GET    /api/news/:id          # Mendapatkan berita berdasarkan ID
POST   /api/news              # Membuat berita baru
PUT    /api/news/:id          # Update berita
DELETE /api/news/:id          # Soft delete berita
DELETE /api/news/:id?hard=true # Hard delete berita
```

#### Topics Endpoints
```http
GET    /api/topics            # Mendapatkan semua topics dengan search dan pagination
GET    /api/topics/:id        # Mendapatkan topic berdasarkan ID
POST   /api/topics            # Membuat topic baru
PUT    /api/topics/:id        # Update topic
DELETE /api/topics/:id        # Hapus topic
```

### Filter Parameters

#### News Filters
- `status`: Filter berdasarkan status (draft, published, deleted)
- `topic`: Filter berdasarkan nama topic (partial match)

#### Topics Filters
- `q`: Pencarian berdasarkan nama topic (partial match)

**Contoh:**
```http
GET /api/news?status=published&topic=teknologi&page=1&limit=5&order_by=created_at&sort_type=DESC
GET /api/topics?q=javascript&page=2&limit=10&order_by=name&sort_type=ASC
```
```

## 🧪 Testing

### Menjalankan Tests
```bash
# Jalankan semua tests
npm test

# Jalankan tests dengan coverage
npm run test:coverage

# Jalankan tests dalam watch mode
npm run test:watch
```

### Test Coverage
Test suite mencakup:
- ✅ Unit tests untuk semua endpoints
- ✅ Validation testing
- ✅ Error handling testing
- ✅ Database integration testing

## 🔄 CI/CD Pipeline

Pipeline GitHub Actions akan otomatis berjalan pada:
- Push ke branch `master` atau `develop`
- Pull request ke branch `master`

Pipeline melakukan:
1. **Test Stage**: Setup PostgreSQL test database, install dependencies, run migrations & seeding, execute unit tests dengan coverage reporting
2. **Security Stage**: Menjalankan npm audit untuk security scanning
3. **Build Stage**: Build application dan create artifacts
4. **Deploy Stage**: Deploy ke staging (branch develop) dan production (branch master) - manual approval required

### Pipeline Status
Untuk melihat status pipeline:
- Buka GitHub repository → Actions tab
- Coverage report dan artifacts tersedia setelah pipeline selesai

## 🏗️ Project Structure

```
├── .github/workflows/ci.yml   # GitHub Actions CI/CD pipeline
├── src/
│   ├── app.js                 # Main application file
│   ├── controllers/           # Request handlers
│   │   ├── newsController.js
│   │   └── topicController.js
│   ├── database/              # Database utilities
│   │   ├── connection.js      # Database connection
│   │   ├── migrate.js         # Database migrations
│   │   └── seed.js            # Database seeding
│   ├── models/                # Data models
│   │   ├── newsModel.js
│   │   └── topicModel.js
│   └── routes/                # API routes
│       ├── newsRoutes.js
│       └── topicRoutes.js
├── tests/                     # Test files
│   ├── helper.js              # Test utilities
│   ├── setup.js               # Test setup
│   ├── news.test.js           # News API tests
│   └── topics.test.js         # Topics API tests
├── docs/                      # Documentation files
│   ├── database.dbml          # Database schema (DBML)
│   ├── SYSTEM_DESIGN.md       # System design documentation
│   ├── PROMPTS.md             # AI prompts documentation
│   └── openapi.json           # OpenAPI/Swagger specification
├── jest.config.cjs            # Test configuration
└── README.md
```
```

## 🤖 AI Integration

Dalam pengembangan proyek ini, AI digunakan untuk:

### 1. Code Generation & Optimization
- **Generate boilerplate code**: Struktur controller, model, dan routes
- **SQL query optimization**: Query complex untuk relasi many-to-many
- **Error handling patterns**: Implementasi error handling yang konsisten

### 2. Testing Strategy
- **Test case generation**: Membuat comprehensive test cases
- **Edge case identification**: Mengidentifikasi skenario testing yang mungkin terlewat
- **Mock data creation**: Generate realistic test data

### 3. Documentation
- **API documentation**: Generate OpenAPI/Swagger specifications
- **Code comments**: Menambahkan komentar yang informatif dalam bahasa Indonesia
- **README structure**: Struktur dokumentasi yang user-friendly

### 4. Database Design
- **Schema optimization**: Desain relasi database yang efisien
- **Index suggestions**: Rekomendasi index untuk performa query
- **Migration scripts**: Generate migration scripts yang aman

### 5. Code Review & Quality
- **Best practices**: Implementasi patterns dan best practices
- **Security checks**: Identifikasi potential security issues
- **Performance optimization**: Optimasi performa aplikasi

Lihat file `PROMPTS.md` untuk detail prompt yang digunakan.

## 🚀 Deployment

### Environment Setup
Untuk production, pastikan environment variables berikut dikonfigurasi:
```env
NODE_ENV=production
DATABASE_URL=<production-database-url>
PORT=<production-port>
```
