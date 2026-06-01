const LogModel = require('../models/logModel');

// 操作日志控制器
class LogController {
  // 查询操作日志列表
  static async list(req, res) {
    try {
      const userId = req.userId;
      const { page = 1, pageSize = 10, operation = '' } = req.query;
      
      const result = await LogModel.list(userId, parseInt(page), parseInt(pageSize), operation);
      
      res.status(200).json({ code: 200, msg: '查询成功', data: result });
    } catch (error) {
      console.error('查询操作日志失败:', error.message);
      res.status(500).json({ code: 500, msg: '查询操作日志失败', data: {} });
    }
  }

  // 清除操作日志
  static async clear(req, res) {
    try {
      const userId = req.userId;
      
      const count = await LogModel.clear(userId);
      
      res.status(200).json({ code: 200, msg: `清除成功，共清除 ${count} 条日志`, data: { count } });
    } catch (error) {
      console.error('清除操作日志失败:', error.message);
      res.status(500).json({ code: 500, msg: '清除操作日志失败', data: {} });
    }
  }
}

module.exports = LogController;