const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authMiddleware } = require('../config/jwt');

// 注册
router.post('/register', UserController.register);

// 登录
router.post('/login', UserController.login);

// 获取当前用户信息（需要token验证）
router.get('/info', authMiddleware, UserController.getInfo);

// 亲友管理接口（需要token验证）
router.post('/contacts', authMiddleware, UserController.addContact); // 添加亲友
router.delete('/contacts', authMiddleware, UserController.deleteContact); // 删除亲友
router.put('/contacts', authMiddleware, UserController.updateContact); // 更新亲友信息
router.get('/contacts', authMiddleware, UserController.getContacts); // 获取亲友列表

module.exports = router;