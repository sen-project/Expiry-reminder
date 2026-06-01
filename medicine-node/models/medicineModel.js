const { pool } = require('../config/db');
const TimeUtil = require('../utils/timeUtil');

// 药品模型
class MedicineModel {
  // 新增药品
  static async add(userId, name, type, purchaseDate, expiryDate, image, note, location = '', remainNum = '', unit = '') {
    try {
      const [result] = await pool.execute(
        'INSERT INTO medicine (user_id, name, type, purchase_date, expiry_date, image, note, location, remain_num, unit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, name, type, purchaseDate, expiryDate, image, note, location, remainNum, unit]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // 查询药品列表（支持按类型筛选、按过期状态筛选，不分页）
  static async list(userId, type = '', expiryStatus = '') {
    try {
      // 构建查询条件
      let whereClause = `user_id = ${parseInt(userId)}`;
      
      // 类型筛选
      if (type) {
        whereClause += ` AND type = '${type}'`;
      }
      
      // 过期状态筛选
      if (expiryStatus) {
        const now = new Date().toISOString().split('T')[0];
        if (expiryStatus === 'expired') {
          whereClause += ` AND expiry_date < '${now}'`;
        } else if (expiryStatus === 'expiring') {
          // 近30天过期
          const thirtyDaysLater = new Date();
          thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
          const thirtyDaysLaterStr = thirtyDaysLater.toISOString().split('T')[0];
          whereClause += ` AND expiry_date >= '${now}' AND expiry_date <= '${thirtyDaysLaterStr}'`;
        } else if (expiryStatus === 'valid') {
          whereClause += ` AND expiry_date > '${now}'`;
        }
      }
      
      // 按过期日期排序，快过期的排在前面
      const query = `SELECT * FROM medicine WHERE ${whereClause} ORDER BY 
        CASE 
          WHEN expiry_date < CURRENT_DATE THEN 0 
          WHEN expiry_date BETWEEN CURRENT_DATE AND DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY) THEN 1 
          ELSE 2 
        END, 
        expiry_date ASC`;
      
      console.log('SQL语句:', query);
      
      const [rows] = await pool.execute(query);
      
      // 格式化时间
      const formattedList = TimeUtil.formatMedicineList(rows);
      
      return formattedList;
    } catch (error) {
      throw error;
    }
  }

  // 根据ID查询药品
  static async findById(id, userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM medicine WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      
      if (rows[0]) {
        return {
          ...rows[0],
          purchase_date: TimeUtil.formatTime(rows[0].purchase_date),
          expiry_date: TimeUtil.formatTime(rows[0].expiry_date),
          // 确保 image 字段存在
          image: rows[0].image || ''
        };
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // 修改药品
  static async update(id, userId, name, type, purchaseDate, expiryDate, image, note, location = '', remainNum = '', unit = '') {
    try {
      const [result] = await pool.execute(
        'UPDATE medicine SET name = ?, type = ?, purchase_date = ?, expiry_date = ?, image = ?, note = ?, location = ?, remain_num = ?, unit = ? WHERE id = ? AND user_id = ?',
        [name, type, purchaseDate, expiryDate, image, note, location, remainNum, unit, id, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // 删除药品
  static async delete(id, userId) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM medicine WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // 批量导入药品
  static async batchAdd(userId, medicines) {
    try {
      const values = medicines.map(med => [
        userId,
        med.name,
        med.type,
        med.purchaseDate,
        med.expiryDate,
        med.image || '',
        med.note || '',
        med.location || '',
        med.remainNum || '',
        med.unit || ''
      ]);
      
      const [result] = await pool.execute(
        'INSERT INTO medicine (user_id, name, type, purchase_date, expiry_date, image, note, location, remain_num, unit) VALUES ?',
        [values]
      );
      
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  // 获取所有药品（用于导出）
  static async getAll(userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM medicine WHERE user_id = ? ORDER BY id DESC',
        [userId]
      );
      
      // 格式化时间
      return TimeUtil.formatMedicineList(rows);
    } catch (error) {
      throw error;
    }
  }

  // 获取即将过期和已过期的药品（用于定时任务）
  static async getExpiringMedicines() {
    try {
      const now = new Date().toISOString().split('T')[0];
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
      const thirtyDaysLaterStr = thirtyDaysLater.toISOString().split('T')[0];
      
      const [rows] = await pool.execute(
        'SELECT * FROM medicine WHERE expiry_date <= ?',
        [thirtyDaysLaterStr]
      );
      
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = MedicineModel;