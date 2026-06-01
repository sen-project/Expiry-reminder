const express = require('express');
const router = express.Router();
const MedicineController = require('../controllers/medicineController');
const { authMiddleware } = require('../config/jwt');
const upload = require('../utils/upload');

// 新增药品
router.post('/add', authMiddleware, MedicineController.add);

// 查询药品列表
router.get('/list', authMiddleware, MedicineController.list);

// 修改药品
router.put('/update', authMiddleware, MedicineController.update);

// 删除药品
router.delete('/delete/:id', authMiddleware, MedicineController.delete);

// 批量导入药品（支持Excel文件上传）
router.post('/import', authMiddleware, upload.single('file'), MedicineController.import);

// 导出药品列表
router.get('/export', authMiddleware, MedicineController.export);

// 发送药品过期提醒邮件（无需token，使用pushplus）
router.get('/send-expiry-email', MedicineController.sendExpiryEmail);

// 发送药品过期提醒邮件（无需token，使用网易163）
router.get('/send-expiry-email-163', MedicineController.sendExpiryEmail163);

// 查询药品信息
router.get('/info', authMiddleware, MedicineController.getMedicineInfo);

module.exports = router;