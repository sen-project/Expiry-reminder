const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

// 配置multer，用于处理form-data格式
const upload = multer();

// 导入数据库配置
const { testConnection, pool } = require('./config/db');

// 导入用户模型
const UserModel = require('./models/userModel');

// 导入JWT工具
const { generateToken } = require('./config/jwt');

// 导入路由
const userRoutes = require('./routes/user');
const medicineRoutes = require('./routes/medicine');
const notifyRoutes = require('./routes/notify');
const medicineUseRecordRoutes = require('./routes/medicineUseRecord');
const logRoutes = require('./routes/log');

// 导入定时任务
const ScheduleUtil = require('./utils/schedule');

const app = express();
const PORT = 3000;

// 配置CORS
app.use(cors({
  origin: function (origin, callback) {
    // 允许所有跨域请求，同时支持credentials
    callback(null, origin || '*');
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  exposedHeaders: ['Content-Disposition', 'Content-Type']
}));

// 处理OPTIONS请求
app.options('*', cors());

// 配置中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 配置静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 配置路由
app.use('/api/user', userRoutes);
app.use('/api/medicine', medicineRoutes);
app.use('/api/notify', notifyRoutes);
app.use('/api/medicine-use-record', medicineUseRecordRoutes);
app.use('/api/log', logRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.status(200).json({ code: 200, msg: '服务正常，连接成功了', data: {} });
});

// 注册接口处理函数
const registerHandler = async (req, res) => {
  try {
    // 打印请求头和请求体
    console.log('注册请求头:', req.headers);
    console.log('注册请求体:', req.body);
    
    // 获取参数
    const { username, password, phone } = req.body;
    console.log('注册请求:', { username, password, phone });
    
    // 参数验证
    if (!username) {
      return res.status(400).json({ code: 400, msg: '邮箱不能为空', data: {} });
    }
    if (!password) {
      return res.status(400).json({ code: 400, msg: '密码不能为空', data: {} });
    }
    if (!phone) {
      return res.status(400).json({ code: 400, msg: '手机号不能为空', data: {} });
    }
    
    // 检查用户是否已存在
    console.log('开始检查用户是否已存在:', username);
    const existingUser = await UserModel.findByUsername(username);
    console.log('用户检查结果:', existingUser);
    
    if (existingUser) {
      return res.status(400).json({ code: 400, msg: '邮箱已存在', data: {} });
    }
    
    // 注册用户
    console.log('开始注册用户');
    const userId = await UserModel.register(username, password, phone);
    console.log('注册成功，用户ID:', userId);
    
    // 生成token
    const token = generateToken(userId);
    
    // 注册成功
    return res.status(200).json({
      code: 200,
      msg: '注册成功',
      data: {
        userId: userId,
        username: username,
        phone: phone,
        token: token
      }
    });
  } catch (error) {
    console.error('注册失败:', error.message);
    console.error('错误堆栈:', error.stack);
    return res.status(500).json({ code: 500, msg: '注册失败', data: {} });
  }
};

// 注册接口 - 支持 /register 路径
app.post('/register', upload.none(), registerHandler);

// 注册接口 - 支持 /api/register 路径
app.post('/api/register', upload.none(), registerHandler);

// 登录失败记录和账号锁定机制
const loginAttempts = new Map(); // 存储登录失败次数和锁定状态
const MAX_ATTEMPTS = 5; // 最大失败次数
const LOCK_DURATION = 300000; // 锁定时间（5分钟，单位：毫秒）

// 登录接口
app.post('/login', upload.none(), async (req, res) => {
  try {
    // 打印请求头和请求体
    console.log('请求头:', req.headers);
    console.log('请求体:', req.body);
    
    // 尝试从不同位置获取参数
    let username = req.body.username || req.body.phone; // 兼容旧的phone参数
    let password = req.body.password;
    
    console.log('登录请求:', { username, password });
    
    if (!username || !password) {
      return res.status(400).json({ code: 400, msg: '邮箱和密码不能为空', data: {} });
    }
    
    // 检查账号是否被锁定
    const attempt = loginAttempts.get(username);
    if (attempt && attempt.lockedUntil && attempt.lockedUntil > Date.now()) {
      const remainingTime = Math.ceil((attempt.lockedUntil - Date.now()) / 1000);
      return res.status(423).json({ code: 423, msg: `账号已被锁定，请${remainingTime}秒后再试`, data: {} });
    }
    
    // 如果账号已解锁，重置失败次数
    if (attempt && attempt.lockedUntil && attempt.lockedUntil <= Date.now()) {
      loginAttempts.set(username, { count: 0, lockedUntil: null });
    }
    
    // 查询用户
    console.log('开始查询用户:', username);
    const user = await UserModel.findByUsername(username);
    console.log('查询结果:', user);
    
    let loginUser = user;
    // 如果用户不存在，提示
    if (!user) {
      // 记录失败次数
      recordFailedAttempt(username);
      return res.status(404).json({ code: 404, msg: '用户不存在', data: {} });
    } else {
      // 验证密码（这里简化处理，实际项目中应该使用密码哈希）
      if (loginUser.password !== password) {
        // 记录失败次数
        recordFailedAttempt(username);
        return res.status(401).json({ code: 401, msg: '邮箱或密码错误', data: {} });
      }
    }
    
    // 登录成功，重置失败次数
    loginAttempts.delete(username);
    
    // 生成token
    const token = generateToken(loginUser.id);
    
    // 登录成功
    return res.status(200).json({
      code: 200,
      msg: '登录成功',
      data: {
        userId: loginUser.id,
        username: loginUser.username,
        phone: loginUser.phone,
        token: token
      }
    });
  } catch (error) {
    console.error('登录失败:', error.message);
    console.error('错误堆栈:', error.stack);
    return res.status(500).json({ code: 500, msg: '登录失败', data: {} });
  }
});

// 记录登录失败次数的函数
function recordFailedAttempt(username) {
  const attempt = loginAttempts.get(username) || { count: 0, lockedUntil: null };
  attempt.count += 1;
  
  // 检查是否达到最大失败次数
  if (attempt.count >= MAX_ATTEMPTS) {
    attempt.lockedUntil = Date.now() + LOCK_DURATION;
    console.log(`账号 ${username} 已被锁定，锁定时间：${new Date(attempt.lockedUntil).toLocaleString()}`);
  }
  
  loginAttempts.set(username, attempt);
  console.log(`账号 ${username} 登录失败次数：${attempt.count}`);
}

// 404处理
app.use((req, res) => {
  res.status(404).json({ code: 404, msg: `接口不存在: ${req.originalUrl}`, data: { url: req.originalUrl } });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('错误:', err.message);
  res.status(500).json({ code: 500, msg: '服务器内部错误', data: {} });
});

// 启动服务器
async function startServer() {
  // 测试数据库连接
  await testConnection();
  
  // 启动定时任务
  ScheduleUtil.start();
  
  // 启动服务器
  app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    console.log('✅ 服务已启动，数据库连接已启用');
  });
}

// 启动服务器
startServer();