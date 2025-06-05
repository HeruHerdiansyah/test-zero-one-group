import Fastify from 'fastify';
import 'dotenv/config';

// Import plugins
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import cors from '@fastify/cors';
import postgres from '@fastify/postgres';

// Import routes
import newsRoutes from '../src/routes/newsRoutes.js';
import topicRoutes from '../src/routes/topicRoutes.js';
import { testHooks } from './hooks.js';

// Function untuk membangun aplikasi Fastify untuk testing
export async function build(opts = {}) {
  const fastify = Fastify({
    logger: false, // Disable logging untuk testing
    ...opts
  });
    // Skip schema validation to allow controller to validate
  fastify.addHook('onRoute', testHooks.onRoute);
  
  // Add hook to modify responses for validation errors
  fastify.addHook('preHandler', testHooks.preHandler);

  // Register CORS
  await fastify.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Register database dengan connection khusus untuk testing
  await fastify.register(postgres, {
    connectionString: process.env.DATABASE_URL || 
      `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  });

  // Register Swagger untuk dokumentasi (opsional untuk testing)
  await fastify.register(swagger, {
    swagger: {
      info: {
        title: 'Test API',
        description: 'API untuk testing',
        version: '1.0.0',
      },
      host: 'localhost:3000',
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
    },
  });
  // Register routes
  await fastify.register(newsRoutes, { prefix: '/api' });
  await fastify.register(topicRoutes, { prefix: '/api' });
  // Error handler
  fastify.setErrorHandler((error, request, reply) => {
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
      } else if (error.message.includes('must NOT have fewer than 1 characters') || 
                error.message.includes("must have required property 'q'")) {
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

    const statusCode = error.statusCode || 500;
    reply.code(statusCode).send({
      success: false,
      message: error.message || 'Internal server error',
    });
  });

  return fastify;
}
