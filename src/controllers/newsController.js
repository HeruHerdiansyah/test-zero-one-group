import NewsModel from '../models/newsModel.js';

class NewsController {  // GET /api/news - Mendapatkan semua berita dengan filter opsional dan pagination
  static async getAllNews(request, reply) {
    try {
      const { status, topic, page, limit, order_by, sort_type } = request.query;
      
      const filters = {};
      if (status) filters.status = status;
      if (topic) filters.topic = topic;
      
      const pagination = {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
        order_by: order_by || 'created_at',
        sort_type: sort_type || 'DESC'
      };
      
      // Validasi pagination parameters
      if (pagination.page < 1) {
        return reply.code(400).send({
          success: false,
          message: 'Parameter page harus lebih besar dari 0'
        });
      }
      
      if (pagination.limit < 1 || pagination.limit > 100) {
        return reply.code(400).send({
          success: false,
          message: 'Parameter limit harus antara 1-100'
        });
      }
        const result = await NewsModel.getAll(filters, pagination);
      
      return reply.code(200).send({
        success: true,
        message: 'Berhasil mengambil data berita',
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data berita',
        error: error.message
      });
    }
  }
  
  // GET /api/news/:id - Mendapatkan berita berdasarkan ID
  static async getNewsById(request, reply) {
    try {
      const { id } = request.params;
      
      if (!id || isNaN(id)) {
        return reply.code(400).send({
          success: false,
          message: 'ID berita tidak valid'
        });
      }
      
      const news = await NewsModel.getById(parseInt(id));
      
      if (!news) {
        return reply.code(404).send({
          success: false,
          message: 'Berita tidak ditemukan'
        });
      }
      
      return reply.code(200).send({
        success: true,
        message: 'Berhasil mengambil data berita',
        data: news
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data berita',
        error: error.message
      });
    }
  }
  
  // POST /api/news - Membuat berita baru
  static async createNews(request, reply) {
    try {
      const { title, content, status, topic_ids } = request.body;
      
      // Validasi input
      if (!title || !content) {
        return reply.code(400).send({
          success: false,
          message: 'Title dan content wajib diisi'
        });
      }
      
      if (status && !['draft', 'published', 'deleted'].includes(status)) {
        return reply.code(400).send({
          success: false,
          message: 'Status harus berupa draft, published, atau deleted'
        });
      }
      
      const newsData = {
        title,
        content,
        status: status || 'draft',
        topic_ids: topic_ids || []
      };
      
      const news = await NewsModel.create(newsData);
      
      return reply.code(201).send({
        success: true,
        message: 'Berita berhasil dibuat',
        data: news
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: 'Terjadi kesalahan saat membuat berita',
        error: error.message
      });
    }
  }
  
  // PUT /api/news/:id - Update berita
  static async updateNews(request, reply) {
    try {
      const { id } = request.params;
      const { title, content, status, topic_ids } = request.body;
      
      if (!id || isNaN(id)) {
        return reply.code(400).send({
          success: false,
          message: 'ID berita tidak valid'
        });
      }
      
      if (status && !['draft', 'published', 'deleted'].includes(status)) {
        return reply.code(400).send({
          success: false,
          message: 'Status harus berupa draft, published, atau deleted'
        });
      }
      
      const newsData = {};
      if (title) newsData.title = title;
      if (content) newsData.content = content;
      if (status) newsData.status = status;
      if (topic_ids !== undefined) newsData.topic_ids = topic_ids;
      
      const news = await NewsModel.update(parseInt(id), newsData);
      
      return reply.code(200).send({
        success: true,
        message: 'Berita berhasil diupdate',
        data: news
      });
    } catch (error) {
      request.log.error(error);
      
      if (error.message === 'Berita tidak ditemukan') {
        return reply.code(404).send({
          success: false,
          message: error.message
        });
      }
      
      return reply.code(500).send({
        success: false,
        message: 'Terjadi kesalahan saat mengupdate berita',
        error: error.message
      });
    }
  }
  
  // DELETE /api/news/:id - Soft delete berita (ubah status menjadi deleted)
  static async deleteNews(request, reply) {
    try {
      const { id } = request.params;
      const { hard } = request.query; // ?hard=true untuk hard delete
      
      if (!id || isNaN(id)) {
        return reply.code(400).send({
          success: false,
          message: 'ID berita tidak valid'
        });
      }
      
      let news;
      if (hard === 'true') {
        news = await NewsModel.hardDelete(parseInt(id));
      } else {
        news = await NewsModel.delete(parseInt(id));
      }
      
      return reply.code(200).send({
        success: true,
        message: hard === 'true' ? 'Berita berhasil dihapus permanen' : 'Berita berhasil dihapus',
        data: news
      });
    } catch (error) {
      request.log.error(error);
      
      if (error.message === 'Berita tidak ditemukan') {
        return reply.code(404).send({
          success: false,
          message: error.message
        });
      }
      
      return reply.code(500).send({
        success: false,
        message: 'Terjadi kesalahan saat menghapus berita',
        error: error.message
      });
    }
  }
}

export default NewsController;
