const MedicineUseRecordModel = require('../models/medicineUseRecordModel');
const MedicineModel = require('../models/medicineModel');

// 药品使用记录控制器
class MedicineUseRecordController {
  // 新增药品使用记录
  static async add(req, res) {
    try {
      const userId = req.userId;
      const { medicineId, useDate, useNum, useRemark, unit } = req.body;
      
      if (!medicineId || !useDate || !useNum) {
        return res.status(400).json({ code: 400, msg: '药品ID、使用日期和使用数量不能为空', data: {} });
      }
      
      const medicine = await MedicineModel.findById(medicineId, userId);
      if (!medicine) {
        return res.status(404).json({ code: 404, msg: '药品不存在', data: {} });
      }
      
      // 保存药品名称、类型和单位
      const recordId = await MedicineUseRecordModel.add(userId, medicineId, medicine.name, medicine.type, useDate, useNum, useRemark || '', unit || medicine.unit || '');
      
      await MedicineUseRecordModel.updateRemainNum(medicineId, userId);
      
      res.status(200).json({ code: 200, msg: '记录成功', data: { id: recordId } });
    } catch (error) {
      console.error('新增药品使用记录失败:', error.message);
      res.status(500).json({ code: 500, msg: '新增药品使用记录失败', data: {} });
    }
  }

  // 查询药品使用记录列表
  static async list(req, res) {
    try {
      const userId = req.userId;
      const { page = 1, pageSize = 10, medicineName = '', medicineType = '', useDate = '' } = req.query;
      
      const result = await MedicineUseRecordModel.list(userId, parseInt(page), parseInt(pageSize), medicineName, medicineType, useDate);
      
      res.status(200).json({ code: 200, msg: '查询成功', data: result });
    } catch (error) {
      console.error('查询药品使用记录列表失败:', error);
      res.status(500).json({ code: 500, msg: '查询药品使用记录列表失败', data: {} });
    }
  }

  // 删除药品使用记录
  static async delete(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ code: 400, msg: '记录ID不能为空', data: {} });
      }
      
      const success = await MedicineUseRecordModel.delete(id, userId);
      
      if (success) {
        res.status(200).json({ code: 200, msg: '删除成功', data: {} });
      } else {
        res.status(400).json({ code: 400, msg: '删除失败', data: {} });
      }
    } catch (error) {
      console.error('删除药品使用记录失败:', error.message);
      res.status(500).json({ code: 500, msg: '删除药品使用记录失败', data: {} });
    }
  }
}

module.exports = MedicineUseRecordController;
