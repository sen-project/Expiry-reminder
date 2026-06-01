const express = require('express');
const router = express.Router();
const LogController = require('../controllers/logController');
const { authMiddleware } = require('../config/jwt');

// 查询操作日志列表
router.get('/list', authMiddleware, LogController.list);

// 清除操作日志
router.delete('/clear', authMiddleware, LogController.clear);

module.exports = router;