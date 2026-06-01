const { pool } = require('../config/db');

// 药品使用记录模型
class MedicineUseRecordModel {
  // 新增药品使用记录
  static async add(userId, medicineId, medicineName, medicineType, useDate, useNum, useRemark, unit = '') {
    try {
      const [result] = await pool.execute(
        'INSERT INTO medicine_use_record (user_id, medicine_id, medicine_name, medicine_type, use_date, use_num, use_remark, unit) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, medicineId, medicineName, medicineType, useDate, useNum, useRemark, unit]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // 更新药品剩余数量
  static async updateRemainNum(medicineId, userId) {
    try {
      // 查询该药品的初始购买数量（从使用记录中获取第一次的数量作为参考）
      const [medicineRows] = await pool.execute(
        'SELECT remain_num, unit FROM medicine WHERE id = ? AND user_id = ?',
        [medicineId, userId]
      );
      
      if (medicineRows.length === 0) {
        return false;
      }
      
      const originalNum = parseInt(medicineRows[0].remain_num) || 0;
      const unit = medicineRows[0].unit || '';
      
      // 查询累计使用数量
      const [useRows] = await pool.execute(
        'SELECT SUM(use_num) as total_used FROM medicine_use_record WHERE medicine_id = ? AND user_id = ?',
        [medicineId, userId]
      );
      
      const totalUsed = parseInt(useRows[0].total_used) || 0;
      
      // 计算剩余数量 = 初始数量 - 累计使用数量
      const remainNum = originalNum - totalUsed;
      
      // 更新药品的剩余数量和单位
      const [result] = await pool.execute(
        'UPDATE medicine SET remain_num = ?, unit = ? WHERE id = ? AND user_id = ?',
        [remainNum, unit, medicineId, userId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // 查询药品使用记录列表
  static async list(userId, page = 1, pageSize = 10, medicineName = '', medicineType = '', useDate = '') {
    try {
      let whereClause = `user_id = ${parseInt(userId)}`;
      
      if (medicineName) {
        whereClause += ` AND medicine_name LIKE '%${medicineName}%'`;
      }
      
      if (medicineType) {
        whereClause += ` AND medicine_type = '${medicineType}'`;
      }
      
      if (useDate) {
        whereClause += ` AND use_date = '${useDate}'`;
      }
      
      const offset = (parseInt(page) - 1) * parseInt(pageSize);
      const query = `SELECT * FROM medicine_use_record WHERE ${whereClause} ORDER BY use_date DESC, created_at DESC LIMIT ${parseInt(pageSize)} OFFSET ${offset}`;
      
      const [rows] = await pool.execute(query);
      
      const countQuery = `SELECT COUNT(*) as total FROM medicine_use_record WHERE ${whereClause}`;
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

  // 删除药品使用记录
  static async delete(id, userId) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM medicine_use_record WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = MedicineUseRecordModel;
