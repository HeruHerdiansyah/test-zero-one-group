# System Design Documentation

Dokumentasi desain sistem untuk **News & Topics Management API** menggunakan diagram Mermaid untuk visualisasi arsitektur, database, dan flow aplikasi.

## 🏗️ High-Level Architecture

```mermaid
graph TB
    Client[Client Applications<br/>Web/Mobile/API Consumers]
    
    subgraph "API Layer"
        LB[Load Balancer<br/>NGINX/AWS ALB]
        API1[Fastify API Server 1<br/>Port 3000]
        API2[Fastify API Server 2<br/>Port 3001]
        API3[Fastify API Server N<br/>Port 300N]
    end
    
    subgraph "Business Logic Layer"
        Controller[Controllers<br/>newsController.js<br/>topicController.js]
        Model[Models<br/>newsModel.js<br/>topicModel.js]
        Routes[Routes<br/>newsRoutes.js<br/>topicRoutes.js]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL<br/>Primary Database)]
        DBReplica[(PostgreSQL<br/>Read Replica)]
        Cache[(Redis Cache<br/>Optional)]
    end
    
    subgraph "External Services"
        Monitoring[Monitoring<br/>Prometheus/Grafana]
        Logging[Logging<br/>ELK Stack]
        Docs[API Documentation<br/>Swagger UI]
    end
    
    Client --> LB
    LB --> API1
    LB --> API2
    LB --> API3
    
    API1 --> Controller
    API2 --> Controller
    API3 --> Controller
    
    Controller --> Model
    Model --> Routes
    
    Model --> DB
    Model --> DBReplica
    Model --> Cache
    
    API1 --> Monitoring
    API1 --> Logging
    API1 --> Docs
    
    style Client fill:#e1f5fe
    style DB fill:#f3e5f5
    style Cache fill:#fff3e0
    style Monitoring fill:#e8f5e8
```

## 🗂️ Database Entity Relationship Diagram

```mermaid
erDiagram
    NEWS {
        int id PK "Primary Key, Auto Increment"
        varchar title "NOT NULL, Max 255 chars"
        text content "NOT NULL"
        varchar status "NOT NULL, CHECK (draft|published|deleted)"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
        timestamp updated_at "DEFAULT CURRENT_TIMESTAMP"
    }
    
    TOPICS {
        int id PK "Primary Key, Auto Increment"
        varchar name "NOT NULL, UNIQUE, Max 100 chars"
        text description "Optional description"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
        timestamp updated_at "DEFAULT CURRENT_TIMESTAMP"
    }
    
    NEWS_TOPICS {
        int id PK "Primary Key, Auto Increment"
        int news_id FK "Foreign Key to NEWS.id"
        int topic_id FK "Foreign Key to TOPICS.id"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
    }
    
    NEWS ||--o{ NEWS_TOPICS : "has many"
    TOPICS ||--o{ NEWS_TOPICS : "belongs to many"
    NEWS_TOPICS }o--|| NEWS : "references"
    NEWS_TOPICS }o--|| TOPICS : "references"
```

## 🔄 API Request Flow

```mermaid
sequenceDiagram
    participant Client
    participant Fastify as Fastify Server
    participant Controller
    participant Model
    participant Database as PostgreSQL
    participant Swagger as Swagger Docs
    
    Note over Client, Swagger: News Creation Flow
    
    Client->>+Fastify: POST /api/news
    Fastify->>Fastify: Validate CORS
    Fastify->>Fastify: Parse Request Body
    Fastify->>+Controller: newsController.createNews()
    
    Controller->>Controller: Validate Input Data
    alt Input Validation Fails
        Controller->>Client: 400 Bad Request
    else Input Valid
        Controller->>+Model: NewsModel.create(newsData)
        Model->>Model: Begin Transaction
        Model->>+Database: INSERT INTO news (...)
        Database-->>-Model: Return news record
        
        alt Has topic_ids
            loop For each topic_id
                Model->>+Database: INSERT INTO news_topics (...)
                Database-->>-Model: Success
            end
        end
        
        Model->>Model: Commit Transaction
        Model->>+Database: SELECT news with topics
        Database-->>-Model: Complete news data
        Model-->>-Controller: Return news object
        Controller-->>-Client: 201 Created + news data
    end
    
    Fastify->>Swagger: Update API Documentation
```

## 🔍 News Filtering Flow

```mermaid
flowchart TD
    Start([GET /api/news dengan filters]) --> ParseQuery[Parse Query Parameters]
    ParseQuery --> CheckStatus{Status filter exists?}
    
    CheckStatus -->|Yes| AddStatusFilter[Add status = ?]
    CheckStatus -->|No| CheckTopic{Topic filter exists?}
    
    AddStatusFilter --> CheckTopic
    CheckTopic -->|Yes| AddTopicFilter[Add topic ILIKE %?%]
    CheckTopic -->|No| BuildQuery[Build Final Query]
    
    AddTopicFilter --> BuildQuery
    BuildQuery --> ExecuteQuery[Execute SQL Query]
    ExecuteQuery --> FormatResponse[Format Response with Topics]
    FormatResponse --> End([Return JSON Response])
    
    style Start fill:#e3f2fd
    style End fill:#e8f5e8
    style CheckStatus fill:#fff3e0
    style CheckTopic fill:#fff3e0
```

## 🧪 Testing Architecture

```mermaid
graph TB
    subgraph "Test Environment"
        TestDB[(Test PostgreSQL<br/>Isolated Database)]
        TestApp[Test Fastify Instance<br/>In-Memory Setup]
        TestData[Test Data Fixtures<br/>Seed & Cleanup]
    end
    
    subgraph "Test Suites"
        UnitTests[Unit Tests<br/>news.test.js<br/>topics.test.js]
        IntegrationTests[Integration Tests<br/>API Endpoints]
        E2ETests[End-to-End Tests<br/>Full Workflows]
    end
    
    subgraph "Test Utilities"
        Helper[Test Helper<br/>helper.js]
        Setup[Test Setup<br/>setup.js]
        Config[Vitest Config<br/>vitest.config.js]
    end
    
    subgraph "Coverage & Reports"        Coverage[Code Coverage<br/>HTML/JSON Reports]
        CI[CI Pipeline<br/>GitHub Actions]
        Reports[Test Reports<br/>JUnit XML]
    end
    
    TestApp --> TestDB
    UnitTests --> TestApp
    IntegrationTests --> TestApp
    E2ETests --> TestApp
    
    Helper --> UnitTests
    Setup --> UnitTests
    Config --> UnitTests
    
    UnitTests --> Coverage
    IntegrationTests --> Coverage
    Coverage --> CI
    CI --> Reports
    
    style TestDB fill:#f3e5f5
    style Coverage fill:#e8f5e8
    style CI fill:#e1f5fe
```

## 🚀 Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        DevEnv[Local Development<br/>Local Setup]
        DevDB[(Local PostgreSQL)]
        DevEnv --> DevDB
    end
      subgraph "CI/CD Pipeline"
        GitHub[GitHub Repository<br/>Source Code]
        Pipeline[GitHub Actions<br/>Pipeline]
        Tests[Automated Tests<br/>PostgreSQL Service]
        Build[Build & Package<br/>Artifacts]
    end
    
    subgraph "Staging Environment"
        StagingApp[Staging API Server<br/>Node.js Application]
        StagingDB[(Staging PostgreSQL<br/>AWS RDS)]
        StagingApp --> StagingDB
    end
      subgraph "Production Environment"
        ProdLB[Load Balancer<br/>AWS ALB]
        ProdApp1[Production API 1<br/>ECS/EKS]
        ProdApp2[Production API 2<br/>ECS/EKS]
        ProdDB[(Production PostgreSQL<br/>AWS RDS Multi-AZ)]
        ProdReplica[(Read Replica<br/>AWS RDS)]
        
        ProdLB --> ProdApp1
        ProdLB --> ProdApp2
        ProdApp1 --> ProdDB
        ProdApp2 --> ProdDB
        ProdApp1 --> ProdReplica
        ProdApp2 --> ProdReplica
    end
      GitHub --> Pipeline
    Pipeline --> Tests
    Tests --> Build
    Build --> StagingApp
    StagingApp --> ProdLB
    
    style GitHub fill:#e1f5fe
    style ProdDB fill:#f3e5f5
    style ProdLB fill:#e8f5e8
```

## 📊 Data Flow Diagram

```mermaid
flowchart LR
    subgraph "Client Layer"
        WebApp[Web Application]
        MobileApp[Mobile App]
        APIClient[API Client]
    end
    
    subgraph "API Gateway Layer"
        Gateway[API Gateway<br/>Rate Limiting<br/>Authentication]
    end
    
    subgraph "Application Layer"
        FastifyApp[Fastify Application<br/>Business Logic]
        Validation[Input Validation<br/>Schema Checking]
        Authorization[Authorization<br/>Permission Checking]
    end
    
    subgraph "Data Access Layer"
        NewsModel[News Model<br/>CRUD Operations]
        TopicModel[Topic Model<br/>CRUD Operations]
        DBConnection[Database Connection<br/>Connection Pooling]
    end
    
    subgraph "Data Storage Layer"
        PostgreSQL[(PostgreSQL Database<br/>ACID Compliance)]
        Indexes[Database Indexes<br/>Performance Optimization]
    end
    
    WebApp --> Gateway
    MobileApp --> Gateway
    APIClient --> Gateway
    
    Gateway --> FastifyApp
    FastifyApp --> Validation
    Validation --> Authorization
    Authorization --> NewsModel
    Authorization --> TopicModel
    
    NewsModel --> DBConnection
    TopicModel --> DBConnection
    DBConnection --> PostgreSQL
    PostgreSQL --> Indexes
    
    style WebApp fill:#e3f2fd
    style PostgreSQL fill:#f3e5f5
    style FastifyApp fill:#e8f5e8
```

## 🔐 Security Architecture

```mermaid
graph TB
    subgraph "External Threats"
        DDoS[DDoS Attacks]
        SQLInj[SQL Injection]
        XSS[XSS Attacks]
        CSRF[CSRF Attacks]
    end
    
    subgraph "Security Layers"
        WAF[Web Application Firewall<br/>AWS WAF/Cloudflare]
        RateLimit[Rate Limiting<br/>Per IP/User]
        CORS[CORS Configuration<br/>Origin Validation]
        InputVal[Input Validation<br/>Schema Validation]
        SQLPrev[SQL Injection Prevention<br/>Parameterized Queries]
        ErrorHand[Error Handling<br/>No Sensitive Data Exposure]
    end
    
    subgraph "Application Security"
        EnvVars[Environment Variables<br/>Secret Management]
        Logging[Security Logging<br/>Audit Trail]
        HealthCheck[Health Checks<br/>System Monitoring]
    end
    
    DDoS --> WAF
    SQLInj --> SQLPrev
    XSS --> InputVal
    CSRF --> CORS
    
    WAF --> RateLimit
    RateLimit --> CORS
    CORS --> InputVal
    InputVal --> SQLPrev
    SQLPrev --> ErrorHand
    
    ErrorHand --> EnvVars
    EnvVars --> Logging
    Logging --> HealthCheck
    
    style DDoS fill:#ffebee
    style SQLInj fill:#ffebee
    style WAF fill:#e8f5e8
    style HealthCheck fill:#e8f5e8
```

## 🔧 Technology Stack Diagram

```mermaid
mindmap
  root((News & Topics API))
    Backend Framework
      Node.js
        v20+
        ES Modules
        Event Loop
      Fastify
        High Performance
        Schema Validation
        Plugin System
        Swagger Integration
    Database
      PostgreSQL
        ACID Compliance
        JSON Support
        Full Text Search
        Advanced Indexing
      Connection Pooling
        pg Pool
        Connection Limits
        Health Checks
    Testing
      Vitest
        Fast Execution
        Coverage Reports
        Mocking
      Integration Tests
        Database Testing
        API Testing
        E2E Workflows
    DevOps
      GitHub Actions
        CI/CD Pipeline
        Automated Testing
        Deployment
    Documentation
      Swagger/OpenAPI
        Interactive UI
        Schema Validation
        Auto Generation
      Mermaid Diagrams
        System Design
        Database ERD
        Flow Charts
```

---

**System Design ini menggunakan pattern dan best practices modern untuk memastikan scalability, maintainability, dan performance yang optimal.**
