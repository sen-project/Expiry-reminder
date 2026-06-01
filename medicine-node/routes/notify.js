const express = require('express');
const router = express.Router();
const NotifyController = require('../controllers/notifyController');
const { authMiddleware } = require('../config/jwt');

// 获取通知列表
router.get('/list', authMiddleware, NotifyController.list);

// 标记通知已读
router.put('/read', authMiddleware, NotifyController.markAsRead);

// 批量标记通知已读
router.put('/batch-read', authMiddleware, NotifyController.batchMarkAsRead);

// 手动触发过期检查
router.post('/check', authMiddleware, NotifyController.checkExpiry);

module.exports = router;