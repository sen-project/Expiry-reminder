const UserModel = require('../models/userModel');
const { generateToken } = require('../config/jwt');

// 用户控制器
class UserController {
  // 注册
  static async register(req, res) {
    try {
      const { username, password, phone } = req.body;
      
      // 参数校验
      if (!username || !password || !phone) {
        return res.status(400).json({ code: 400, msg: '邮箱、密码和手机号不能为空', data: {} });
      }
      
      // 检查邮箱是否已存在
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser) {
        return res.status(400).json({ code: 400, msg: '邮箱已存在', data: {} });
      }
      
      // 注册用户
      const userId = await UserModel.register(username, password, phone);
      
      // 查询用户信息
      const user = await UserModel.findById(userId);
      
      // 生成token
      const token = generateToken(userId);
      
      res.status(200).json({ 
        code: 200, 
        msg: '注册成功', 
        data: { 
          id: user.id,
          username: user.username,
          phone: user.phone,
          token 
        } 
      });
    } catch (error) {
      console.error('注册失败:', error.message);
      res.status(500).json({ code: 500, msg: '注册失败', data: {} });
    }
  }

  // 登录
  static async login(req, res) {
    try {
      const { username, password } = req.body;
      
      // 参数校验
      if (!username || !password) {
        return res.status(400).json({ code: 400, msg: '邮箱和密码不能为空', data: {} });
      }
      
      // 查找用户
      const user = await UserModel.findByUsername(username);
      if (!user) {
        return res.status(400).json({ code: 400, msg: '邮箱或密码错误', data: {} });
      }
      
      // 验证密码（实际项目中应该使用加密密码）
      if (user.password !== password) {
        return res.status(400).json({ code: 400, msg: '邮箱或密码错误', data: {} });
      }
      
      // 生成token
      const token = generateToken(user.id);
      
      res.status(200).json({ 
        code: 200, 
        msg: '登录成功', 
        data: { 
          id: user.id,
          username: user.username,
          phone: user.phone,
          token 
        } 
      });
    } catch (error) {
      console.error('登录失败:', error.message);
      res.status(500).json({ code: 500, msg: '登录失败', data: {} });
    }
  }

  // 获取当前用户信息
  static async getInfo(req, res) {
    try {
      const userId = req.userId;
      
      // 查找用户
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ code: 404, msg: '用户不存在', data: {} });
      }
      
      res.status(200).json({ code: 200, msg: '获取成功', data: user });
    } catch (error) {
      console.error('获取用户信息失败:', error.message);
      res.status(500).json({ code: 500, msg: '获取用户信息失败', data: {} });
    }
  }

  // 添加亲友
  static async addContact(req, res) {
    try {
      const userId = req.userId;
      const { contactEmail, relationType, isNotify = 1 } = req.body;
      
      // 参数校验
      if (!contactEmail || !relationType) {
        return res.status(400).json({ code: 400, msg: '亲友邮箱和关系类型不能为空', data: {} });
      }
      
      // 避免添加自己为亲友
      const user = await UserModel.findById(userId);
      if (contactEmail === user.username) {
        return res.status(400).json({ code: 400, msg: '不能添加自己为亲友', data: {} });
      }
      
      // 添加亲友
      await UserModel.addContact(userId, contactEmail, relationType, isNotify);
      
      res.status(200).json({ code: 200, msg: '添加亲友成功', data: {} });
    } catch (error) {
      console.error('添加亲友失败:', error.message);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ code: 400, msg: '亲友关系已存在', data: {} });
      }
      res.status(500).json({ code: 500, msg: '添加亲友失败', data: {} });
    }
  }

  // 删除亲友
  static async deleteContact(req, res) {
    try {
      const userId = req.userId;
      const { contactEmail } = req.body;
      
      // 参数校验
      if (!contactEmail) {
        return res.status(400).json({ code: 400, msg: '亲友邮箱不能为空', data: {} });
      }
      
      // 删除亲友
      const success = await UserModel.deleteContact(userId, contactEmail);
      if (!success) {
        return res.status(404).json({ code: 404, msg: '亲友关系不存在', data: {} });
      }
      
      res.status(200).json({ code: 200, msg: '删除亲友成功', data: {} });
    } catch (error) {
      console.error('删除亲友失败:', error.message);
      res.status(500).json({ code: 500, msg: '删除亲友失败', data: {} });
    }
  }

  // 更新亲友信息
  static async updateContact(req, res) {
    try {
      const userId = req.userId;
      const { contactEmail, relationType, isNotify } = req.body;
      
      // 参数校验
      if (!contactEmail) {
        return res.status(400).json({ code: 400, msg: '亲友邮箱不能为空', data: {} });
      }
      
      // 构建更新数据
      const updates = {};
      if (relationType) {
        updates.relationType = relationType;
      }
      if (isNotify !== undefined) {
        updates.isNotify = isNotify;
      }
      
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ code: 400, msg: '请提供要更新的信息', data: {} });
      }
      
      // 更新亲友信息
      const success = await UserModel.updateContact(userId, contactEmail, updates);
      if (!success) {
        return res.status(404).json({ code: 404, msg: '亲友关系不存在', data: {} });
      }
      
      res.status(200).json({ code: 200, msg: '更新亲友信息成功', data: {} });
    } catch (error) {
      console.error('更新亲友信息失败:', error.message);
      res.status(500).json({ code: 500, msg: '更新亲友信息失败', data: {} });
    }
  }

  // 获取亲友列表
  static async getContacts(req, res) {
    try {
      const userId = req.userId;
      
      // 查询亲友列表
      const contacts = await UserModel.getContacts(userId);
      
      res.status(200).json({ code: 200, msg: '获取亲友列表成功', data: contacts });
    } catch (error) {
      console.error('获取亲友列表失败:', error.message);
      res.status(500).json({ code: 500, msg: '获取亲友列表失败', data: {} });
    }
  }
}

module.exports = UserController;