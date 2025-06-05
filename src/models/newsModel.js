import { pool } from '../database/connection.js';

class NewsModel {
  // Mendapatkan semua berita dengan filter opsional dan pagination
  static async getAll(filters = {}, pagination = {}) {
    // Default pagination parameters
    const page = parseInt(pagination.page) || 1;
    const limit = parseInt(pagination.limit) || 10;
    const orderBy = pagination.order_by || 'created_at';
    const sortType = pagination.sort_type?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    // Validate order_by parameter to prevent SQL injection
    const allowedOrderFields = ['id', 'title', 'status', 'created_at', 'updated_at'];
    const safeOrderBy = allowedOrderFields.includes(orderBy) ? orderBy : 'created_at';

    let query = `
      SELECT n.*, 
             COALESCE(
               ARRAY_AGG(
                 json_build_object('id', t.id, 'name', t.name, 'description', t.description)
               ) FILTER (WHERE t.id IS NOT NULL),
               '{}'::json[]
             ) as topics
      FROM news n
      LEFT JOIN news_topics nt ON n.id = nt.news_id
      LEFT JOIN topics t ON nt.topic_id = t.id
    `;
    
    const conditions = [];
    const values = [];
    let paramCount = 1;
    
    // Filter berdasarkan status
    if (filters.status) {
      conditions.push(`n.status = $${paramCount}`);
      values.push(filters.status);
      paramCount++;
    }
    
    // Filter berdasarkan topic
    if (filters.topic) {
      conditions.push(`t.name ILIKE $${paramCount}`);
      values.push(`%${filters.topic}%`);
      paramCount++;
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ` GROUP BY n.id, n.title, n.content, n.status, n.deleted_at, n.created_at, n.updated_at 
               ORDER BY n.${safeOrderBy} ${sortType} 
               LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    
    values.push(limit, offset);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT n.id) as total
      FROM news n
      LEFT JOIN news_topics nt ON n.id = nt.news_id
      LEFT JOIN topics t ON nt.topic_id = t.id
    `;
    
    const countConditions = [];
    const countValues = [];
    let countParamCount = 1;
    
    if (filters.status) {
      countConditions.push(`n.status = $${countParamCount}`);
      countValues.push(filters.status);
      countParamCount++;
    }
    
    if (filters.topic) {
      countConditions.push(`t.name ILIKE $${countParamCount}`);
      countValues.push(`%${filters.topic}%`);
      countParamCount++;
    }
    
    if (countConditions.length > 0) {
      countQuery += ' WHERE ' + countConditions.join(' AND ');
    }
    
    const [dataResult, countResult] = await Promise.all([
      pool.query(query, values),
      pool.query(countQuery, countValues)
    ]);
    
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }    // Mendapatkan berita berdasarkan ID
  static async getById(id) {
    const query = `
      SELECT n.*, 
             COALESCE(
               ARRAY_AGG(
                 json_build_object('id', t.id, 'name', t.name, 'description', t.description)
               ) FILTER (WHERE t.id IS NOT NULL),
               '{}'::json[]
             ) as topics
      FROM news n
      LEFT JOIN news_topics nt ON n.id = nt.news_id
      LEFT JOIN topics t ON nt.topic_id = t.id
      WHERE n.id = $1
      GROUP BY n.id, n.title, n.content, n.status, n.deleted_at, n.created_at, n.updated_at
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
  
  // Membuat berita baru
  static async create(newsData) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Insert berita
      const newsQuery = `
        INSERT INTO news (title, content, status)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const newsResult = await client.query(newsQuery, [
        newsData.title,
        newsData.content,
        newsData.status || 'draft'
      ]);
      
      const news = newsResult.rows[0];
      
      // Insert relasi dengan topics jika ada
      if (newsData.topic_ids && newsData.topic_ids.length > 0) {
        for (const topicId of newsData.topic_ids) {
          await client.query(
            'INSERT INTO news_topics (news_id, topic_id) VALUES ($1, $2)',
            [news.id, topicId]
          );
        }
      }
      
      await client.query('COMMIT');
      
      // Return berita dengan topics
      return await this.getById(news.id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
    // Update berita
  static async update(id, newsData) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update berita
      const updateFields = [];
      const values = [];
      let paramCount = 1;
      
      if (newsData.title) {
        updateFields.push(`title = $${paramCount}`);
        values.push(newsData.title);
        paramCount++;
      }
      
      if (newsData.content) {
        updateFields.push(`content = $${paramCount}`);
        values.push(newsData.content);
        paramCount++;
      }
        if (newsData.status) {
        updateFields.push(`status = $${paramCount}`);
        values.push(newsData.status);
        paramCount++;
        
        // Handle soft delete logic
        if (newsData.status === 'deleted') {
          updateFields.push(`deleted_at = $${paramCount}`);
          values.push(new Date());
          paramCount++;
        } else {
          // If status changed from deleted to something else, clear deleted_at
          updateFields.push(`deleted_at = $${paramCount}`);
          values.push(null);
          paramCount++;
        }
      }
      
      if (updateFields.length === 0) {
        throw new Error('Tidak ada field yang akan diupdate');
      }
      
      values.push(id);
      const query = `UPDATE news SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
      
      const result = await client.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Berita tidak ditemukan');
      }
      
      // Update topics jika ada
      if (newsData.topic_ids !== undefined) {
        // Hapus relasi lama
        await client.query('DELETE FROM news_topics WHERE news_id = $1', [id]);
        
        // Tambah relasi baru
        if (newsData.topic_ids.length > 0) {
          for (const topicId of newsData.topic_ids) {
            await client.query(
              'INSERT INTO news_topics (news_id, topic_id) VALUES ($1, $2)',
              [id, topicId]
            );
          }
        }
      }
      
      await client.query('COMMIT');
      
      return await this.getById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  // Hapus berita (soft delete dengan mengubah status dan set deleted_at)
  static async delete(id) {
    const query = 'UPDATE news SET status = $1, deleted_at = $2 WHERE id = $3 RETURNING *';
    const result = await pool.query(query, ['deleted', new Date(), id]);
    
    if (result.rows.length === 0) {
      throw new Error('Berita tidak ditemukan');
    }
    
    return result.rows[0];
  }
  
  // Hard delete berita
  static async hardDelete(id) {
    const query = 'DELETE FROM news WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      throw new Error('Berita tidak ditemukan');
    }
    
    return result.rows[0];
  }
}

export default NewsModel;
