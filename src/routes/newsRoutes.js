import NewsController from '../controllers/newsController.js';

// Schema untuk validasi dan dokumentasi Swagger
const newsSchemas = {  // Schema untuk response berita
  newsResponse: {
    type: 'object',
    properties: {
      id: { type: 'integer', description: 'ID unik berita' },
      title: { type: 'string', description: 'Judul berita' },
      content: { type: 'string', description: 'Konten berita' },
      status: { 
        type: 'string', 
        enum: ['draft', 'published', 'deleted'],
        description: 'Status berita' 
      },
      topics: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string' }
          }
        },
        description: 'Daftar topics yang terkait dengan berita'
      },      deleted_at: { 
        type: 'string', 
        format: 'date-time', 
        nullable: true,
        description: 'Waktu ketika berita dihapus (soft delete)' 
      },
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time' }
    }
  },
  
  // Schema untuk request membuat berita
  createNewsRequest: {
    type: 'object',
    required: ['title', 'content'],
    properties: {
      title: { 
        type: 'string', 
        minLength: 1,
        maxLength: 255,
        description: 'Judul berita' 
      },
      content: { 
        type: 'string',
        minLength: 1,
        description: 'Konten berita' 
      },
      status: { 
        type: 'string', 
        enum: ['draft', 'published', 'deleted'],
        description: 'Status berita (default: draft)' 
      },
      topic_ids: {
        type: 'array',
        items: { type: 'integer' },
        description: 'Array ID topics yang terkait'
      }
    }
  },
  
  // Schema untuk request update berita
  updateNewsRequest: {
    type: 'object',
    properties: {
      title: { 
        type: 'string', 
        minLength: 1,
        maxLength: 255,
        description: 'Judul berita' 
      },
      content: { 
        type: 'string',
        minLength: 1,
        description: 'Konten berita' 
      },
      status: { 
        type: 'string', 
        enum: ['draft', 'published', 'deleted'],
        description: 'Status berita' 
      },
      topic_ids: {
        type: 'array',
        items: { type: 'integer' },
        description: 'Array ID topics yang terkait'
      }
    }
  }
};

async function newsRoutes(fastify, options) {
  // GET /api/news/topics - Mendapatkan daftar topics untuk dropdown
  fastify.get('/news/topics', {
    schema: {
      description: 'Mendapatkan daftar topics untuk dropdown',
      tags: ['News'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  name: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  }, NewsController.getTopicsForDropdown);

  // GET /api/news - Mendapatkan semua berita dengan filter
  fastify.get('/news', {
    schema: {
      description: 'Mendapatkan semua berita dengan filter opsional dan pagination',
      tags: ['News'],
      query: {
        type: 'object',
        properties: {
          status: { 
            type: 'string', 
            enum: ['draft', 'published', 'deleted'],
            description: 'Filter berdasarkan status' 
          },
          topic_id: { 
            type: 'integer',
            description: 'Filter berdasarkan ID topic' 
          },
          q: { 
            type: 'string',
            description: 'Pencarian berdasarkan judul berita' 
          },
          page: {
            type: 'integer',
            minimum: 1,
            default: 1,
            description: 'Nomor halaman untuk pagination'
          },
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10,
            description: 'Jumlah item per halaman (maksimal 100)'
          },
          order_by: {
            type: 'string',
            enum: ['id', 'title', 'status', 'created_at', 'updated_at'],
            default: 'created_at',
            description: 'Field untuk sorting'
          },
          sort_type: {
            type: 'string',
            enum: ['ASC', 'DESC'],
            default: 'DESC',
            description: 'Tipe sorting (ASC atau DESC)'
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
              items: newsSchemas.newsResponse
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer', description: 'Halaman saat ini' },
                limit: { type: 'integer', description: 'Jumlah item per halaman' },
                total: { type: 'integer', description: 'Total jumlah item' },
                totalPages: { type: 'integer', description: 'Total jumlah halaman' },
                hasNext: { type: 'boolean', description: 'Apakah ada halaman selanjutnya' },
                hasPrev: { type: 'boolean', description: 'Apakah ada halaman sebelumnya' }
              }
            }
          }
        }
      }
    }
  }, NewsController.getAllNews);
  
  // GET /api/news/:id - Mendapatkan berita berdasarkan ID
  fastify.get('/news/:id', {
    schema: {
      description: 'Mendapatkan berita berdasarkan ID',
      tags: ['News'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID berita' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: newsSchemas.newsResponse
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
  }, NewsController.getNewsById);
  
  // POST /api/news - Membuat berita baru
  fastify.post('/news', {
    schema: {
      description: 'Membuat berita baru',
      tags: ['News'],
      body: newsSchemas.createNewsRequest,
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: newsSchemas.newsResponse
          }
        }
      }
    }
  }, NewsController.createNews);
  
  // PUT /api/news/:id - Update berita
  fastify.put('/news/:id', {
    schema: {
      description: 'Update berita berdasarkan ID',
      tags: ['News'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID berita' }
        },
        required: ['id']
      },
      body: newsSchemas.updateNewsRequest,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: newsSchemas.newsResponse
          }
        }
      }
    }
  }, NewsController.updateNews);
  
  // DELETE /api/news/:id - Hapus berita
  fastify.delete('/news/:id', {
    schema: {
      description: 'Hapus berita (soft delete kecuali menggunakan query ?hard=true)',
      tags: ['News'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID berita' }
        },
        required: ['id']
      },
      query: {
        type: 'object',
        properties: {
          hard: { 
            type: 'string',
            enum: ['true', 'false'],
            description: 'Hard delete jika bernilai true' 
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: newsSchemas.newsResponse
          }
        }
      }
    }
  }, NewsController.deleteNews);
}

export default newsRoutes;
