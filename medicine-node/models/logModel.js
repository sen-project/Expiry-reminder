const { pool } = require('../config/db');

// 操作日志模型
class LogModel {
  // 新增操作日志
  static async add(userId, operation, description, ip = '') {
    try {
      const [result] = await pool.execute(
        'INSERT INTO operation_log (user_id, operation, description, ip, created_at) VALUES (?, ?, ?, ?, NOW())',
        [userId, operation, description, ip]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // 查询操作日志列表
  static async list(userId, page = 1, pageSize = 10, operation = '') {
    try {
      // 构建查询条件
      let whereClause = `user_id = ${parseInt(userId)}`;
      
      if (operation) {
        whereClause += ` AND operation = '${operation}'`;
      }
      
      // 分页
      const offset = (parseInt(page) - 1) * parseInt(pageSize);
      
      // 按创建时间倒序
      const query = `SELECT * FROM operation_log WHERE ${whereClause} ORDER BY created_at DESC LIMIT ${parseInt(pageSize)} OFFSET ${offset}`;
      
      const [rows] = await pool.execute(query);
      
      // 获取总数
      const countQuery = `SELECT COUNT(*) as total FROM operation_log WHERE ${whereClause}`;
      const [countResult] = await pool.execute(countQuery);
      
      return {
        list: rows,
        total: countResult[0].total,
        page,
        pageSize
      };
    } catch (error) {
      throw error;
    }
  }

  // 清除操作日志
  static async clear(userId) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM operation_log WHERE user_id = ?',
        [userId]
      );
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = LogModel;