/**
 * Unit tests untuk Topics API menggunakan Jest
 * Test CRUD operations dan relationship dengan news
 */
import { build } from './helper.js';

describe('Topics API Tests', () => {
  let app;
  let createdTopics = [];

  beforeAll(async () => {
    app = await build();
  });

  afterAll(async () => {
    // Cleanup: hapus data test yang dibuat
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

  describe('GET /api/topics', () => {
    it('harus mengembalikan list topics', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/topics'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(typeof body.total).toBe('number');
    });

    it('setiap topic harus memiliki field yang diperlukan', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/topics'
      });

      const body = JSON.parse(response.body);
      if (body.data.length > 0) {
        const topic = body.data[0];
        expect(topic).toHaveProperty('id');
        expect(topic).toHaveProperty('name');
        expect(topic).toHaveProperty('news_count');
        expect(topic).toHaveProperty('created_at');
        expect(topic).toHaveProperty('updated_at');
      }
    });
  });

  describe('POST /api/topics', () => {
    it('harus bisa membuat topic baru', async () => {
      const topicData = {
        name: 'Test Topic',
        description: 'Test topic description'
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/topics',
        payload: topicData
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.name).toBe(topicData.name);
      expect(body.data.description).toBe(topicData.description);
      expect(body.data.id).toBeDefined();

      // Simpan untuk cleanup
      createdTopics.push(body.data);
    });    it('harus bisa membuat topic tanpa description', async () => {
      const uniqueName = `Test Topic Without Description ${Date.now()}`;
      const topicData = {
        name: uniqueName
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/topics',
        payload: topicData
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);      expect(body.success).toBe(true);
      expect(body.data.name).toBe(topicData.name);
      // Accept either null or empty string
      expect([null, ""].includes(body.data.description)).toBe(true);

      // Simpan untuk cleanup
      createdTopics.push(body.data);
    });

    it('harus menolak request tanpa nama', async () => {
      const topicData = {
        description: 'Test description without name'
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/topics',
        payload: topicData
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.message).toContain('Nama topic wajib diisi');
    });

    it('harus menolak nama topic yang terlalu panjang', async () => {
      const topicData = {
        name: 'A'.repeat(101), // 101 karakter
        description: 'Test description'
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/topics',
        payload: topicData
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.message).toContain('maksimal 100 karakter');
    });

    it('harus menolak duplikasi nama topic', async () => {
      const topicData = {
        name: 'Duplicate Topic Test',
        description: 'First topic'
      };

      // Buat topic pertama
      const firstResponse = await app.inject({
        method: 'POST',
        url: '/api/topics',
        payload: topicData
      });

      expect(firstResponse.statusCode).toBe(201);
      const firstBody = JSON.parse(firstResponse.body);
      createdTopics.push(firstBody.data);

      // Coba buat topic dengan nama yang sama
      const secondResponse = await app.inject({
        method: 'POST',
        url: '/api/topics',
        payload: {
          name: 'Duplicate Topic Test',
          description: 'Second topic with same name'
        }
      });

      expect(secondResponse.statusCode).toBe(409);
      const secondBody = JSON.parse(secondResponse.body);
      expect(secondBody.success).toBe(false);
      expect(secondBody.message).toContain('sudah ada');
    });
  });

  describe('GET /api/topics/:id', () => {
    let testTopicId;    beforeEach(async () => {
      // Buat topic test dengan nama yang unik
      const uniqueName = `Test Topic for GET ${Date.now()}`;
      const topicData = {
        name: uniqueName,
        description: 'Test description for GET endpoint'
      };

      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/topics',
        payload: topicData
      });

      const createdData = JSON.parse(createResponse.body).data;
      testTopicId = createdData.id;
      createdTopics.push(createdData);
    });    it('harus mengembalikan topic berdasarkan ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/topics/${testTopicId}`
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(testTopicId);
      // Don't check for specific name since we're using timestamp-based unique names
      expect(body.data.name).toContain('Test Topic for GET');
      expect(body.data).toHaveProperty('news'); // Harus ada field news
    });

    it('harus mengembalikan 404 untuk ID yang tidak ada', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/topics/999999'
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.message).toContain('Topic tidak ditemukan');
    });

    it('harus mengembalikan 400 untuk ID yang tidak valid', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/topics/invalid-id'
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.message).toContain('ID topic tidak valid');
    });
  });

  describe('PUT /api/topics/:id', () => {
    let testTopicId;    beforeEach(async () => {
      // Buat topic test dengan nama yang unik
      const uniqueName = `Test Topic for PUT ${Date.now()}`;
      const topicData = {
        name: uniqueName,
        description: 'Test description for PUT endpoint'
      };

      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/topics',
        payload: topicData
      });

      const createdData = JSON.parse(createResponse.body).data;
      testTopicId = createdData.id;
      createdTopics.push(createdData);
    });

    it('harus bisa mengupdate topic', async () => {
      const updateData = {
        name: 'Updated Topic Name',
        description: 'Updated description'
      };

      const response = await app.inject({
        method: 'PUT',
        url: `/api/topics/${testTopicId}`,
        payload: updateData
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.name).toBe(updateData.name);
      expect(body.data.description).toBe(updateData.description);
    });

    it('harus bisa mengupdate hanya nama', async () => {
      const updateData = {
        name: 'Updated Name Only'
      };

      const response = await app.inject({
        method: 'PUT',
        url: `/api/topics/${testTopicId}`,
        payload: updateData
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.name).toBe(updateData.name);
      expect(body.data.description).toBe('Test description for PUT endpoint'); // Unchanged
    });

    it('harus mengembalikan 404 untuk ID yang tidak ada', async () => {
      const updateData = {
        name: 'Updated Name'
      };

      const response = await app.inject({
        method: 'PUT',
        url: '/api/topics/999999',
        payload: updateData
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });
    });

  describe('GET /api/topics with search', () => {
    beforeEach(async () => {
      // Buat beberapa topic untuk search test
      const topics = [
        { name: 'JavaScript Programming', description: 'JS topics' },
        { name: 'Python Development', description: 'Python topics' },
        { name: 'Web Development', description: 'Web dev topics' }
      ];

      for (const topic of topics) {
        const response = await app.inject({
          method: 'POST',
          url: '/api/topics',
          payload: topic
        });
        const createdData = JSON.parse(response.body).data;
        createdTopics.push(createdData);
      }
    });

    it('harus bisa mencari topic berdasarkan nama menggunakan query parameter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/topics?q=JavaScript'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
      
      // Semua hasil harus mengandung kata 'JavaScript'
      body.data.forEach(topic => {
        expect(topic.name.toLowerCase()).toContain('javascript');
      });
      
      // Message harus menunjukkan bahwa ini adalah hasil pencarian
      expect(body.message).toContain('Berhasil mencari topics dengan kata kunci');
    });

    it('harus mengembalikan semua topics jika tidak ada query parameter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/topics'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.message).toBe('Berhasil mengambil data topics');
    });

    it('harus mengembalikan array kosong untuk pencarian yang tidak ditemukan', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/topics?q=NonExistentTopic12345'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(0);
    });

    it('harus mengabaikan query kosong dan mengembalikan semua topics', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/topics?q='
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.message).toBe('Berhasil mengambil data topics');
    });
  });

  describe('DELETE /api/topics/:id', () => {
    let testTopicId;    beforeEach(async () => {
      // Buat topic test dengan nama yang unik
      const uniqueName = `Test Topic for DELETE ${Date.now()}`;
      const topicData = {
        name: uniqueName,
        description: 'Test description for DELETE endpoint'
      };

      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/topics',
        payload: topicData
      });

      const createdData = JSON.parse(createResponse.body).data;
      testTopicId = createdData.id;
      createdTopics.push(createdData);
    });    it('harus bisa menghapus topic yang tidak digunakan', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/topics/${testTopicId}`
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(testTopicId);

      // Remove from cleanup list karena sudah dihapus
      // Make sure topic id is a number for comparison
      const topicIdNum = parseInt(testTopicId);
      const index = createdTopics.findIndex(topic => {
        // Handle potential undefined objects in array
        return topic && topic.id === topicIdNum;
      });
      
      if (index > -1) {
        createdTopics.splice(index, 1);
      }
    });

    it('harus mengembalikan 404 untuk ID yang tidak ada', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/topics/999999'
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });
  });
});
