/**
 * Unit tests untuk News API menggunakan Jest
 * Test CRUD operations, filtering, dan relationship dengan topics
 */
import { build } from './helper.js';

describe('News API Tests', () => {
  let app;
  let createdNews = [];
  let createdTopics = [];

  beforeAll(async () => {
    app = await build();
  });

  afterAll(async () => {
    // Cleanup: hapus data test yang dibuat
    for (const news of createdNews) {
      try {
        await app.inject({
          method: 'DELETE',
          url: `/api/news/${news.id}?hard=true`
        });
      } catch (error) {
        // Ignore errors during cleanup
      }
    }

    for (const topic of createdTopics) {
      try {
        await app.inject({
          method: 'DELETE',
          url: `/api/topics/${topic.id}`
        });
      } catch (error) {
        // Ignore errors during cleanup
      }
    }

    await app.close();
  });
  describe('GET /api/news', () => {
    it('harus mengembalikan list berita', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/news'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(typeof body.pagination).toBe('object');
      expect(typeof body.pagination.total).toBe('number');
      expect(typeof body.pagination.page).toBe('number');
      expect(typeof body.pagination.limit).toBe('number');
      expect(typeof body.pagination.totalPages).toBe('number');
      expect(typeof body.pagination.hasNext).toBe('boolean');
      expect(typeof body.pagination.hasPrev).toBe('boolean');
    });

    it('harus bisa filter berdasarkan status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/news?status=published'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      // Pastikan semua berita memiliki status published
      body.data.forEach(news => {
        expect(news.status).toBe('published');
      });
    });

    it('harus mendukung pagination dengan parameter page dan limit', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/news?page=1&limit=2'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeLessThanOrEqual(2);
      expect(body.pagination.page).toBe(1);
      expect(body.pagination.limit).toBe(2);
      expect(typeof body.pagination.total).toBe('number');
      expect(typeof body.pagination.totalPages).toBe('number');
    });

    it('harus mendukung sorting dengan order_by dan sort_type', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/news?order_by=title&sort_type=ASC&limit=5'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      
      // Verify sorting (titles should be in ascending order)
      for (let i = 1; i < body.data.length; i++) {
        expect(body.data[i].title.localeCompare(body.data[i-1].title)).toBeGreaterThanOrEqual(0);
      }
    });    it('harus menolak parameter pagination yang tidak valid', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/news?page=0&limit=101'
      });      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });
  });

  describe('POST /api/news', () => {
    it('harus bisa membuat berita baru', async () => {
      const newsData = {
        title: 'Test News Title',
        content: 'Test news content yang cukup panjang untuk memenuhi requirements',
        status: 'draft'
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/news',
        payload: newsData
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.title).toBe(newsData.title);
      expect(body.data.content).toBe(newsData.content);
      expect(body.data.status).toBe(newsData.status);
      expect(body.data.id).toBeDefined();

      // Simpan untuk cleanup
      createdNews.push(body.data);
    });

    it('harus menolak request tanpa title', async () => {
      const newsData = {
        content: 'Test news content'
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/news',
        payload: newsData
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.message).toContain('Title dan content wajib diisi');
    });

    it('harus menolak request tanpa content', async () => {
      const newsData = {
        title: 'Test Title'
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/news',
        payload: newsData
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.message).toContain('Title dan content wajib diisi');
    });

    it('harus menolak status yang tidak valid', async () => {
      const newsData = {
        title: 'Test Title',
        content: 'Test content',
        status: 'invalid_status'
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/news',
        payload: newsData
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.message).toContain('Status harus berupa draft, published, atau deleted');
    });
  });

  describe('GET /api/news/:id', () => {
    let testNewsId;

    beforeEach(async () => {
      // Buat berita test
      const newsData = {
        title: 'Test News for GET',
        content: 'Test content for GET endpoint',
        status: 'published'
      };

      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/news',
        payload: newsData
      });

      const createdData = JSON.parse(createResponse.body).data;
      testNewsId = createdData.id;
      createdNews.push(createdData);
    });

    it('harus mengembalikan berita berdasarkan ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/news/${testNewsId}`
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(testNewsId);
      expect(body.data.title).toBe('Test News for GET');
    });

    it('harus mengembalikan 404 untuk ID yang tidak ada', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/news/999999'
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.message).toContain('Berita tidak ditemukan');
    });

    it('harus mengembalikan 400 untuk ID yang tidak valid', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/news/invalid-id'
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.message).toContain('ID berita tidak valid');
    });
  });

  describe('PUT /api/news/:id', () => {
    let testNewsId;

    beforeEach(async () => {
      // Buat berita test
      const newsData = {
        title: 'Test News for PUT',
        content: 'Test content for PUT endpoint',
        status: 'draft'
      };

      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/news',
        payload: newsData
      });

      const createdData = JSON.parse(createResponse.body).data;
      testNewsId = createdData.id;
      createdNews.push(createdData);
    });

    it('harus bisa mengupdate berita', async () => {
      const updateData = {
        title: 'Updated Title',
        content: 'Updated content',
        status: 'published'
      };

      const response = await app.inject({
        method: 'PUT',
        url: `/api/news/${testNewsId}`,
        payload: updateData
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.title).toBe(updateData.title);
      expect(body.data.content).toBe(updateData.content);
      expect(body.data.status).toBe(updateData.status);
    });

    it('harus mengembalikan 404 untuk ID yang tidak ada', async () => {
      const updateData = {
        title: 'Updated Title'
      };

      const response = await app.inject({
        method: 'PUT',
        url: '/api/news/999999',
        payload: updateData
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });
  });

  describe('DELETE /api/news/:id', () => {
    let testNewsId;

    beforeEach(async () => {
      // Buat berita test
      const newsData = {
        title: 'Test News for DELETE',
        content: 'Test content for DELETE endpoint',
        status: 'published'
      };

      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/news',
        payload: newsData
      });

      const createdData = JSON.parse(createResponse.body).data;
      testNewsId = createdData.id;
      createdNews.push(createdData);
    });    it('harus bisa soft delete berita', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/news/${testNewsId}`
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('deleted');
      expect(body.data.deleted_at).not.toBeNull();
      expect(new Date(body.data.deleted_at)).toBeInstanceOf(Date);
    });

    it('harus mengatur deleted_at menjadi null ketika status diubah dari deleted', async () => {
      // Pertama soft delete
      await app.inject({
        method: 'DELETE',
        url: `/api/news/${testNewsId}`
      });

      // Kemudian ubah status kembali ke published
      const updateResponse = await app.inject({
        method: 'PUT',
        url: `/api/news/${testNewsId}`,
        payload: {
          status: 'published'
        }
      });

      expect(updateResponse.statusCode).toBe(200);
      const updateBody = JSON.parse(updateResponse.body);
      expect(updateBody.success).toBe(true);
      expect(updateBody.data.status).toBe('published');
      expect(updateBody.data.deleted_at).toBeNull();
    });

    it('harus mengatur deleted_at ketika status diubah menjadi deleted melalui PUT', async () => {
      const updateResponse = await app.inject({
        method: 'PUT',
        url: `/api/news/${testNewsId}`,
        payload: {
          status: 'deleted'
        }
      });

      expect(updateResponse.statusCode).toBe(200);
      const updateBody = JSON.parse(updateResponse.body);
      expect(updateBody.success).toBe(true);
      expect(updateBody.data.status).toBe('deleted');
      expect(updateBody.data.deleted_at).not.toBeNull();
      expect(new Date(updateBody.data.deleted_at)).toBeInstanceOf(Date);
    });

    it('harus bisa hard delete berita', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/news/${testNewsId}?hard=true`
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.message).toContain('dihapus permanen');

      // Remove from cleanup list karena sudah dihapus
      const index = createdNews.findIndex(news => news.id === testNewsId);
      if (index > -1) {
        createdNews.splice(index, 1);
      }
    });

    it('harus mengembalikan 404 untuk ID yang tidak ada', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/news/999999'
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });
  });

  describe('GET /api/news/topics', () => {
    it('harus mengembalikan list topics untuk dropdown', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/news/topics'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.message).toBe('Berhasil mengambil daftar topics');
      expect(Array.isArray(body.data)).toBe(true);
      
      // Verify data structure
      if (body.data.length > 0) {
        expect(body.data[0]).toHaveProperty('id');
        expect(body.data[0]).toHaveProperty('name');
        expect(typeof body.data[0].id).toBe('number');
        expect(typeof body.data[0].name).toBe('string');
      }
    });
  });

  describe('GET /api/news with new filters', () => {
    let testTopicId;
    let testNewsId;

    beforeAll(async () => {
      // Create test topic
      const topicResponse = await app.inject({
        method: 'POST',
        url: '/api/topics',
        payload: {
          name: 'Test Topic Filter',
          description: 'Topic untuk testing filter'
        }
      });
      const topicBody = JSON.parse(topicResponse.body);
      testTopicId = topicBody.data.id;
      createdTopics.push(topicBody.data);

      // Create test news with the topic
      const newsResponse = await app.inject({
        method: 'POST',
        url: '/api/news',
        payload: {
          title: 'Test News Filter Title',
          content: 'Content untuk testing filter berdasarkan topic dan title',
          status: 'published',
          topic_ids: [testTopicId]
        }
      });
      const newsBody = JSON.parse(newsResponse.body);
      testNewsId = newsBody.data.id;
      createdNews.push(newsBody.data);
    });

    it('harus bisa filter berdasarkan topic_id', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/news?topic_id=${testTopicId}`
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      
      // Verify that returned news has the specified topic
      const foundNews = body.data.find(news => news.id === testNewsId);
      expect(foundNews).toBeDefined();
      expect(foundNews.topics.some(topic => topic.id === testTopicId)).toBe(true);
    });

    it('harus bisa search berdasarkan title', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/news?q=Test News Filter'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.message).toContain('Berhasil mencari berita dengan kata kunci');
      expect(Array.isArray(body.data)).toBe(true);
      
      // Verify that returned news contains the search term
      const foundNews = body.data.find(news => news.id === testNewsId);
      expect(foundNews).toBeDefined();
      expect(foundNews.title.toLowerCase()).toContain('test news filter');
    });

    it('harus bisa kombinasi filter topic_id dan search title', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/news?topic_id=${testTopicId}&q=Filter`
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.message).toContain('Berhasil mencari berita dengan kata kunci');
      expect(Array.isArray(body.data)).toBe(true);
      
      // Verify that returned news matches both criteria
      const foundNews = body.data.find(news => news.id === testNewsId);
      expect(foundNews).toBeDefined();
      expect(foundNews.title.toLowerCase()).toContain('filter');
      expect(foundNews.topics.some(topic => topic.id === testTopicId)).toBe(true);
    });

    it('harus mengembalikan array kosong jika tidak ada hasil search', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/news?q=NonExistentSearchTerm12345'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.message).toContain('Berhasil mencari berita dengan kata kunci');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBe(0);
      expect(body.pagination.total).toBe(0);
    });

    it('harus mengembalikan array kosong jika topic_id tidak ada', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/news?topic_id=99999'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBe(0);
    });
  });
});
