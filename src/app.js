import Fastify from 'fastify';
import 'dotenv/config';

// Import plugins
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import cors from '@fastify/cors';
import postgres from '@fastify/postgres';

// Import routes
import newsRoutes from './routes/newsRoutes.js';
import topicRoutes from './routes/topicRoutes.js';

// Konfigurasi server
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Inisialisasi Fastify
const fastify = Fastify({
  logger: {
    level: 'info',
    serializers: {
      req(request) {
        return {
          method: request.method,
          url: request.url,
          hostname: request.hostname,
          remoteAddress: request.ip,
        };
      },
    },
  },
});

// Konfigurasi CORS
await fastify.register(cors, {
  origin: true, // Untuk development, sebaiknya dibatasi di production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// Konfigurasi database PostgreSQL
await fastify.register(postgres, {
  connectionString: process.env.DATABASE_URL || 
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
});

// Konfigurasi Swagger untuk dokumentasi API
await fastify.register(swagger, {
  swagger: {
    info: {
      title: 'News & Topics Management API',
      description: 'REST API untuk manajemen berita dan topik menggunakan Fastify dan PostgreSQL',
      version: '1.0.0',
      contact: {
        name: 'Zero One Group Test',
        email: 'developer@example.com',
      },
    },
    host: `localhost:${PORT}`,
    schemes: ['http', 'https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      {
        name: 'News',
        description: 'Operasi CRUD untuk manajemen berita',
      },
      {
        name: 'Topics',
        description: 'Operasi CRUD untuk manajemen topik',
      },
    ],
  },
});

// Konfigurasi Swagger UI
await fastify.register(swaggerUI, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false,
  },
  uiHooks: {
    onRequest: function (request, reply, next) { next(); },
    preHandler: function (request, reply, next) { next(); },
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  transformSpecification: (swaggerObject, request, reply) => { return swaggerObject; },
  transformSpecificationClone: true,
});

// Root endpoint
fastify.get('/', async (request, reply) => {
  return {
    success: true,
    message: 'News & Topics Management API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      documentation: '/docs',
      news: '/api/news',
      topics: '/api/topics',
    },
  };
});



// Global error handler - must be set before registering routes
fastify.setErrorHandler((error, request, reply) => {
  request.log.error(error);
  
  // Database connection errors
  if (error.code === 'ECONNREFUSED') {
    reply.code(503).send({
      success: false,
      message: 'Database tidak dapat diakses',
      error: 'Service temporarily unavailable',
    });
    return;
  }
  
  // Fastify schema validation errors
  if (error.code === 'FST_ERR_VALIDATION') {
    let customMessage = 'Data tidak valid';
    
    // Customize error messages based on the validation error
    if (error.message.includes("must have required property 'title'")) {
      customMessage = 'Title dan content wajib diisi';
    } else if (error.message.includes("must have required property 'content'")) {
      customMessage = 'Title dan content wajib diisi';
    } else if (error.message.includes("must have required property 'name'")) {
      customMessage = 'Nama topic wajib diisi';
    } else if (error.message.includes('must be equal to one of the allowed values')) {
      if (error.message.includes('status')) {
        customMessage = 'Status harus berupa draft, published, atau deleted';
      }
    } else if (error.message.includes('must NOT have more than 100 characters')) {
      customMessage = 'Nama topic maksimal 100 karakter';
    } else if (error.message.includes('must NOT have fewer than 1 characters')) {
      customMessage = 'Parameter pencarian (q) wajib diisi';
    }
    
    reply.code(400).send({
      success: false,
      message: customMessage,
    });
    return;
  }
  
  // Legacy validation errors (if any)
  if (error.validation) {
    reply.code(400).send({
      success: false,
      message: 'Data tidak valid',
      errors: error.validation,
    });
    return;
  }
  
  // Default error response
  const statusCode = error.statusCode || 500;
  reply.code(statusCode).send({
    success: false,
    message: error.message || 'Terjadi kesalahan internal server',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});

// Not found handler
fastify.setNotFoundHandler((request, reply) => {
  reply.code(404).send({
    success: false,
    message: 'Endpoint tidak ditemukan',
    path: request.url,
    method: request.method,
  });
});

// Register routes dengan prefix /api
await fastify.register(newsRoutes, { prefix: '/api' });
await fastify.register(topicRoutes, { prefix: '/api' });

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  fastify.log.info(`Menerima signal ${signal}, melakukan graceful shutdown...`);
  
  try {
    await fastify.close();
    process.exit(0);
  } catch (error) {
    fastify.log.error('Error saat shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: HOST });
      fastify.log.info(`
🚀 Server berhasil berjalan!
📍 URL: http://localhost:${PORT}
📚 Dokumentasi: http://localhost:${PORT}/docs
🌍 Environment: ${process.env.NODE_ENV || 'development'}
    `);
  } catch (error) {
    fastify.log.error('Error saat menjalankan server:', error);
    process.exit(1);
  }
};

start();
