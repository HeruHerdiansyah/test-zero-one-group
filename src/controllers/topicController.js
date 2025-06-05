import TopicModel from '../models/topicModel.js';

class TopicController {  // GET /api/topics - Mendapatkan semua topics dengan optional search
  static async getAllTopics(request, reply) {
    try {
      const { q } = request.query;
      const searchQuery = q ? q.trim() : null;
      
      const topics = await TopicModel.getAll(searchQuery);
      
      const message = searchQuery 
        ? `Berhasil mencari topics dengan kata kunci "${searchQuery}"`
        : 'Berhasil mengambil data topics';
      
      return reply.code(200).send({
        success: true,
        message: message,
        data: topics,
        total: topics.length
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data topics',
        error: error.message
      });
    }
  }
  
  // GET /api/topics/:id - Mendapatkan topic berdasarkan ID
  static async getTopicById(request, reply) {
    try {
      const { id } = request.params;
      
      if (!id || isNaN(id)) {
        return reply.code(400).send({
          success: false,
          message: 'ID topic tidak valid'
        });
      }
      
      const topic = await TopicModel.getById(parseInt(id));
      
      if (!topic) {
        return reply.code(404).send({
          success: false,
          message: 'Topic tidak ditemukan'
        });
      }
      
      return reply.code(200).send({
        success: true,
        message: 'Berhasil mengambil data topic',
        data: topic
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data topic',
        error: error.message
      });
    }
  }
  
  // POST /api/topics - Membuat topic baru
  static async createTopic(request, reply) {
    try {
      const { name, description } = request.body;
      
      // Validasi input
      if (!name || name.trim().length === 0) {
        return reply.code(400).send({
          success: false,
          message: 'Nama topic wajib diisi'
        });
      }
      
      if (name.length > 100) {
        return reply.code(400).send({
          success: false,
          message: 'Nama topic maksimal 100 karakter'
        });
      }
      
      const topicData = {
        name: name.trim(),
        description: description ? description.trim() : null
      };
      
      const topic = await TopicModel.create(topicData);
      
      return reply.code(201).send({
        success: true,
        message: 'Topic berhasil dibuat',
        data: topic
      });
    } catch (error) {
      request.log.error(error);
      
      if (error.message === 'Topic dengan nama ini sudah ada') {
        return reply.code(409).send({
          success: false,
          message: error.message
        });
      }
      
      return reply.code(500).send({
        success: false,
        message: 'Terjadi kesalahan saat membuat topic',
        error: error.message
      });
    }
  }
  
  // PUT /api/topics/:id - Update topic
  static async updateTopic(request, reply) {
    try {
      const { id } = request.params;
      const { name, description } = request.body;
      
      if (!id || isNaN(id)) {
        return reply.code(400).send({
          success: false,
          message: 'ID topic tidak valid'
        });
      }
      
      const topicData = {};
      if (name !== undefined) {
        if (!name || name.trim().length === 0) {
          return reply.code(400).send({
            success: false,
            message: 'Nama topic tidak boleh kosong'
          });
        }
        if (name.length > 100) {
          return reply.code(400).send({
            success: false,
            message: 'Nama topic maksimal 100 karakter'
          });
        }
        topicData.name = name.trim();
      }
      
      if (description !== undefined) {
        topicData.description = description ? description.trim() : null;
      }
      
      const topic = await TopicModel.update(parseInt(id), topicData);
      
      return reply.code(200).send({
        success: true,
        message: 'Topic berhasil diupdate',
        data: topic
      });
    } catch (error) {
      request.log.error(error);
      
      if (error.message === 'Topic tidak ditemukan') {
        return reply.code(404).send({
          success: false,
          message: error.message
        });
      }
      
      if (error.message === 'Topic dengan nama ini sudah ada') {
        return reply.code(409).send({
          success: false,
          message: error.message
        });
      }
      
      return reply.code(500).send({
        success: false,
        message: 'Terjadi kesalahan saat mengupdate topic',
        error: error.message
      });
    }
  }
  
  // DELETE /api/topics/:id - Hapus topic
  static async deleteTopic(request, reply) {
    try {
      const { id } = request.params;
      
      if (!id || isNaN(id)) {
        return reply.code(400).send({
          success: false,
          message: 'ID topic tidak valid'
        });
      }
      
      const topic = await TopicModel.delete(parseInt(id));
      
      return reply.code(200).send({
        success: true,
        message: 'Topic berhasil dihapus',
        data: topic
      });
    } catch (error) {
      request.log.error(error);
      
      if (error.message === 'Topic tidak ditemukan') {
        return reply.code(404).send({
          success: false,
          message: error.message
        });
      }
      
      if (error.message === 'Topic tidak dapat dihapus karena masih digunakan oleh berita') {
        return reply.code(409).send({
          success: false,
          message: error.message
        });
      }
      
      return reply.code(500).send({
        success: false,
        message: 'Terjadi kesalahan saat menghapus topic',
        error: error.message
      });
    }  }
}

export default TopicController;
