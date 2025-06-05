import TopicController from '../controllers/topicController.js';

// Schema untuk validasi dan dokumentasi Swagger
const topicSchemas = {
  // Schema untuk response topic
  topicResponse: {
    type: 'object',
    properties: {
      id: { type: 'integer', description: 'ID unik topic' },
      name: { type: 'string', description: 'Nama topic' },
      description: { type: 'string', description: 'Deskripsi topic' },
      news_count: { type: 'integer', description: 'Jumlah berita yang terkait' },
      news: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            status: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        description: 'Daftar berita yang terkait (hanya untuk detail topic)'
      },
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time' }
    }
  },
  
  // Schema untuk request membuat topic
  createTopicRequest: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { 
        type: 'string', 
        minLength: 1,
        maxLength: 100,
        description: 'Nama topic (harus unik)' 
      },
      description: { 
        type: 'string',
        description: 'Deskripsi topic (opsional)' 
      }
    }
  },
  
  // Schema untuk request update topic
  updateTopicRequest: {
    type: 'object',
    properties: {
      name: { 
        type: 'string', 
        minLength: 1,
        maxLength: 100,
        description: 'Nama topic (harus unik)' 
      },
      description: { 
        type: 'string',
        description: 'Deskripsi topic' 
      }
    }
  }
};

async function topicRoutes(fastify, options) {  // GET /api/topics - Mendapatkan semua topics dengan optional search
  fastify.get('/topics', {
    schema: {
      description: 'Mendapatkan semua topics dengan jumlah berita terkait, dengan opsi pencarian',
      tags: ['Topics'],
      query: {
        type: 'object',
        properties: {
          q: { 
            type: 'string',
            description: 'Query pencarian untuk nama topic (opsional)' 
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'array',
              items: topicSchemas.topicResponse
            },
            total: { type: 'integer' }
          }
        }
      }
    }
  }, TopicController.getAllTopics);  
  // GET /api/topics/:id - Mendapatkan topic berdasarkan ID
  fastify.get('/topics/:id', {
    schema: {
      description: 'Mendapatkan topic berdasarkan ID dengan daftar berita terkait',
      tags: ['Topics'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID topic' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: topicSchemas.topicResponse
          }
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, TopicController.getTopicById);
  
  // POST /api/topics - Membuat topic baru
  fastify.post('/topics', {
    schema: {
      description: 'Membuat topic baru',
      tags: ['Topics'],
      body: topicSchemas.createTopicRequest,
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: topicSchemas.topicResponse
          }
        },
        409: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, TopicController.createTopic);
  
  // PUT /api/topics/:id - Update topic
  fastify.put('/topics/:id', {
    schema: {
      description: 'Update topic berdasarkan ID',
      tags: ['Topics'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID topic' }
        },
        required: ['id']
      },
      body: topicSchemas.updateTopicRequest,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: topicSchemas.topicResponse
          }
        }
      }
    }
  }, TopicController.updateTopic);
  
  // DELETE /api/topics/:id - Hapus topic
  fastify.delete('/topics/:id', {
    schema: {
      description: 'Hapus topic (tidak bisa dihapus jika masih digunakan oleh berita)',
      tags: ['Topics'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID topic' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: topicSchemas.topicResponse
          }
        },
        409: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, TopicController.deleteTopic);
}

export default topicRoutes;
