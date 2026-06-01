const { pool } = require('../config/db');

// 通知模型
class NotifyModel {
  // 创建通知
  static async create(userId, medicineId, medicineName, type, message) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO notify (user_id, medicine_id, medicine_name, type, message, is_read) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, medicineId, medicineName, type, message, 0]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // 获取用户通知列表
  static async list(userId, page = 1, pageSize = 10) {
    try {
      const offset = (page - 1) * pageSize;
      
      const [rows] = await pool.execute(
        'SELECT * FROM notify WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [userId, pageSize, offset]
      );
      
      const [countResult] = await pool.execute(
        'SELECT COUNT(*) as total FROM notify WHERE user_id = ?',
        [userId]
      );
      
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

  // 标记通知已读
  static async markAsRead(id, userId) {
    try {
      const [result] = await pool.execute(
        'UPDATE notify SET is_read = 1 WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // 批量标记通知已读
  static async batchMarkAsRead(ids, userId) {
    try {
      const [result] = await pool.execute(
        'UPDATE notify SET is_read = 1 WHERE id IN (?) AND user_id = ?',
        [ids, userId]
      );
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = NotifyModel;