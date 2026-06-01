const { pool } = require('../config/db');

// 用户模型
class UserModel {
  // 注册用户
  static async register(username, password, phone) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO user (username, password, phone) VALUES (?, ?, ?)',
        [username, password, phone]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // 根据手机号查询用户
  static async findByPhone(phone) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM user WHERE phone = ?',
        [phone]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // 根据邮箱查询用户
  static async findByUsername(username) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM user WHERE username = ?',
        [username]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // 根据ID查询用户
  static async findById(userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT id, username, phone FROM user WHERE id = ?',
        [userId]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // 添加亲友
  static async addContact(userId, contactEmail, relationType, isNotify = 1) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO user_contacts (user_id, relation_email, relation_type, is_notify) VALUES (?, ?, ?, ?)',
        [userId, contactEmail, relationType, isNotify]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // 删除亲友
  static async deleteContact(userId, contactEmail) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM user_contacts WHERE user_id = ? AND relation_email = ?',
        [userId, contactEmail]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // 更新亲友信息
  static async updateContact(userId, contactEmail, updates) {
    try {
      const fields = [];
      const values = [];
      
      if (updates.relationType) {
        fields.push('relation_type = ?');
        values.push(updates.relationType);
      }
      if (updates.isNotify !== undefined) {
        fields.push('is_notify = ?');
        values.push(updates.isNotify);
      }
      
      if (fields.length === 0) {
        return false;
      }
      
      values.push(userId);
      values.push(contactEmail);
      
      const [result] = await pool.execute(
        `UPDATE user_contacts SET ${fields.join(', ')} WHERE user_id = ? AND relation_email = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // 查询用户的亲友列表
  static async getContacts(userId) {
    try {
      const [rows] = await pool.execute(
        `SELECT id, user_id, relation_email, relation_type, is_notify, created_at, updated_at 
         FROM user_contacts 
         WHERE user_id = ?`,
        [userId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // 根据邮箱查询用户ID
  static async findIdByUsername(username) {
    try {
      const [rows] = await pool.execute(
        'SELECT id FROM user WHERE username = ?',
        [username]
      );
      return rows[0] ? rows[0].id : null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserModel;