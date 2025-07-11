import { pool } from '../database/connection.js';

class TopicModel {
  // Mendapatkan semua topics dengan optional search dan pagination
  static async getAll(searchQuery = null, pagination = {}) {
    // Default pagination parameters
    const page = parseInt(pagination.page) || 1;
    const limit = parseInt(pagination.limit) || 10;
    const orderBy = pagination.order_by || 'name';
    const sortType = pagination.sort_type?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    // Validate order_by parameter to prevent SQL injection
    const allowedOrderFields = ['id', 'name', 'created_at', 'updated_at', 'news_count'];
    const safeOrderBy = allowedOrderFields.includes(orderBy) ? orderBy : 'name';

    let query = `
      SELECT t.*, 
             COUNT(nt.news_id) as news_count
      FROM topics t
      LEFT JOIN news_topics nt ON t.id = nt.topic_id
      LEFT JOIN news n ON nt.news_id = n.id AND n.status != 'deleted'
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (searchQuery) {
      query += ` WHERE t.name ILIKE $${paramCount}`;
      params.push(`%${searchQuery}%`);
      paramCount++;
    }
    
    query += `
      GROUP BY t.id, t.name, t.description, t.created_at, t.updated_at
      ORDER BY ${safeOrderBy === 'news_count' ? 'COUNT(nt.news_id)' : `t.${safeOrderBy}`} ${sortType}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    
    params.push(limit, offset);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT t.id) as total
      FROM topics t
    `;
    
    const countParams = [];
    if (searchQuery) {
      countQuery += ` WHERE t.name ILIKE $1`;
      countParams.push(`%${searchQuery}%`);
    }
    
    const [dataResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, countParams)
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
  }
    // Mendapatkan topic berdasarkan ID
  static async getById(id) {
    const query = `
      SELECT t.*, 
             COUNT(nt.news_id) as news_count,
             COALESCE(
               ARRAY_AGG(
                 json_build_object(
                   'id', n.id, 
                   'title', n.title, 
                   'status', n.status,
                   'created_at', n.created_at
                 )
               ) FILTER (WHERE n.id IS NOT NULL AND n.status != 'deleted'),
               '{}'::json[]
             ) as news
      FROM topics t
      LEFT JOIN news_topics nt ON t.id = nt.topic_id
      LEFT JOIN news n ON nt.news_id = n.id
      WHERE t.id = $1
      GROUP BY t.id, t.name, t.description, t.created_at, t.updated_at
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
  
  // Membuat topic baru
  static async create(topicData) {
    const query = `
      INSERT INTO topics (name, description)
      VALUES ($1, $2)
      RETURNING *
    `;
    
    try {
      const result = await pool.query(query, [
        topicData.name,
        topicData.description || null
      ]);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('Topic dengan nama ini sudah ada');
      }
      throw error;
    }
  }
  
  // Update topic
  static async update(id, topicData) {
    const updateFields = [];
    const values = [];
    let paramCount = 1;
    
    if (topicData.name) {
      updateFields.push(`name = $${paramCount}`);
      values.push(topicData.name);
      paramCount++;
    }
    
    if (topicData.description !== undefined) {
      updateFields.push(`description = $${paramCount}`);
      values.push(topicData.description);
      paramCount++;
    }
    
    if (updateFields.length === 0) {
      throw new Error('Tidak ada field yang akan diupdate');
    }
    
    values.push(id);
    const query = `UPDATE topics SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    
    try {
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Topic tidak ditemukan');
      }
      
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('Topic dengan nama ini sudah ada');
      }
      throw error;
    }
  }
  
  // Hapus topic
  static async delete(id) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Cek apakah topic masih digunakan oleh berita
      const checkQuery = `
        SELECT COUNT(*) as count 
        FROM news_topics nt 
        JOIN news n ON nt.news_id = n.id 
        WHERE nt.topic_id = $1 AND n.status != 'deleted'
      `;
      const checkResult = await client.query(checkQuery, [id]);
      
      if (parseInt(checkResult.rows[0].count) > 0) {
        throw new Error('Topic tidak dapat dihapus karena masih digunakan oleh berita');
      }
      
      // Hapus semua relasi dengan berita (untuk berita yang sudah deleted)
      await client.query('DELETE FROM news_topics WHERE topic_id = $1', [id]);
      
      // Hapus topic
      const deleteQuery = 'DELETE FROM topics WHERE id = $1 RETURNING *';
      const result = await client.query(deleteQuery, [id]);
      
      if (result.rows.length === 0) {
        throw new Error('Topic tidak ditemukan');
      }
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }  }
}

export default TopicModel;
