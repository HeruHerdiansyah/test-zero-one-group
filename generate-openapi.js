import Fastify from 'fastify';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// Import plugins dan routes
import swagger from '@fastify/swagger';
import newsRoutes from './src/routes/newsRoutes.js';
import topicRoutes from './src/routes/topicRoutes.js';

async function generateOpenApiSpec() {
  const fastify = Fastify({ logger: false });

  // Register Swagger
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
      host: 'localhost:3000',
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

  // Register routes
  await fastify.register(newsRoutes, { prefix: '/api' });
  await fastify.register(topicRoutes, { prefix: '/api' });

  // Generate OpenAPI spec
  await fastify.ready();
  const spec = fastify.swagger();
  // Tulis ke file docs/openapi.json
  const specPath = path.join(process.cwd(), 'docs', 'openapi.json');
  fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));

  console.log('✅ OpenAPI specification berhasil digenerate ke docs/openapi.json');
  console.log(`📍 File location: ${specPath}`);

  await fastify.close();
  process.exit(0);
}

generateOpenApiSpec().catch((error) => {
  console.error('❌ Error generating OpenAPI spec:', error);
  process.exit(1);
});
