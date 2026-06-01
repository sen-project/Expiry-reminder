const jwt = require('jsonwebtoken');
require('dotenv').config();

// JWT配置
const jwtConfig = {
  secret: process.env.JWT_SECRET || 'medicine_management_secret_key_change_this_in_production',
  expiresIn: '24h'
};

// 生成JWT令牌
function generateToken(userId) {
  return jwt.sign({ userId }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
}

// 验证JWT令牌
function verifyToken(token) {
  try {
    return jwt.verify(token, jwtConfig.secret);
  } catch (error) {
    return null;
  }
}

// 中间件：验证JWT令牌
function authMiddleware(req, res, next) {
  // 对OPTIONS请求放行，让CORS中间件处理
  if (req.method === 'OPTIONS') {
    return next();
  }
  
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ code: 401, msg: '未提供令牌', data: {} });
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ code: 401, msg: '令牌无效或已过期', data: {} });
  }
  
  req.userId = decoded.userId;
  next();
}

module.exports = {
  generateToken,
  verifyToken,
  authMiddleware
};