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

// Function untuk membangun aplikasi Fastify untuk testing
export async function build(opts = {}) {
  const fastify = Fastify({
    logger: false, // Disable logging untuk testing
    ...opts
  });
  // Intercept schema validation errors before they're sent
  fastify.setSchemaErrorFormatter((errors, dataVar) => {
    // Create a formatted error object
    const firstError = errors[0];
    let customMessage = 'Data tidak valid';
    
    if (firstError.keyword === 'required') {
      if (firstError.params.missingProperty === 'title' || firstError.params.missingProperty === 'content') {
        customMessage = 'Title dan content wajib diisi';
      } else if (firstError.params.missingProperty === 'name') {
        customMessage = 'Nama topic wajib diisi';
      }
    } else if (firstError.keyword === 'enum') {
      if (firstError.instancePath.includes('status')) {
        customMessage = 'Status harus berupa draft, published, atau deleted';
      }
    } else if (firstError.keyword === 'maxLength') {
      customMessage = 'Nama topic maksimal 100 karakter';    } else if (firstError.keyword === 'type' && firstError.instancePath.includes('id')) {
      // Use a special marker that the onError hook will replace with URL-specific message
      customMessage = '__ID_VALIDATION_ERROR__';
    }else if (firstError.keyword === 'minimum' && (firstError.instancePath.includes('page') || firstError.instancePath.includes('limit'))) {
      customMessage = 'Parameter pagination tidak valid';
    }
    
    // Return the formatted error that will be used by Fastify
    return new Error(JSON.stringify({
      success: false,
      message: customMessage
    }));
  });  // Use onError hook to intercept validation errors before they're sent
  fastify.addHook('onError', async (request, reply, error) => {
    if (error.code === 'FST_ERR_VALIDATION') {
      // Hijack the reply to prevent Fastify from sending the default error
      reply.hijack();
        // Check if the message contains our custom JSON format
      try {
        const customError = JSON.parse(error.message);
        if (customError.success === false) {
          // Handle special ID validation marker
          if (customError.message === '__ID_VALIDATION_ERROR__') {
            if (request.url && request.url.includes('/news/')) {
              customError.message = 'ID berita tidak valid';
            } else {
              customError.message = 'ID topic tidak valid';
            }
          }
          
          reply.raw.writeHead(400, { 'Content-Type': 'application/json' });
          reply.raw.end(JSON.stringify(customError));
          return;
        }
      }catch (e) {
        // If parsing fails, fall back to old message mapping
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
          customMessage = 'Nama topic maksimal 100 karakter';        } else if (error.message.includes('must NOT have fewer than 1 characters') || 
                  error.message.includes("must have required property 'q'")) {
          customMessage = 'Parameter pencarian (q) wajib diisi';
        } else if (error.message.includes('querystring') && (error.message.includes('page') || error.message.includes('limit'))) {
          customMessage = 'Parameter pagination tidak valid';
        }
        
        const responseBody = {
          success: false,
          message: customMessage,
        };
        
        reply.raw.writeHead(400, { 'Content-Type': 'application/json' });
        reply.raw.end(JSON.stringify(responseBody));
        return;
      }
    }
  });

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
    },  });
    // Register routes
  await fastify.register(newsRoutes, { prefix: '/api' });
  await fastify.register(topicRoutes, { prefix: '/api' });

  return fastify;
}
