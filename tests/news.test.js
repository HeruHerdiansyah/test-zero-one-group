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
      expect(typeof body.total).toBe('number');
    });

    it('harus bisa filter berdasarkan status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/news?status=published'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      
      // Semua berita harus memiliki status 'published'
      body.data.forEach(news => {
        expect(news.status).toBe('published');
      });
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
    });

    it('harus bisa soft delete berita', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/news/${testNewsId}`
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('deleted');
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
});
