const express = require('express');
const router = express.Router();
const MedicineUseRecordController = require('../controllers/medicineUseRecordController');
const { authMiddleware } = require('../config/jwt');

// 新增药品使用记录
router.post('/add', authMiddleware, MedicineUseRecordController.add);

// 查询药品使用记录列表
router.get('/list', authMiddleware, MedicineUseRecordController.list);

// 删除药品使用记录
router.delete('/delete/:id', authMiddleware, MedicineUseRecordController.delete);

module.exports = router;
