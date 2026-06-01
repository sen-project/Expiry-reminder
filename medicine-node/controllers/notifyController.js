const NotifyModel = require('../models/notifyModel');
const ScheduleUtil = require('../utils/schedule');

// 通知控制器
class NotifyController {
  // 获取通知列表
  static async list(req, res) {
    try {
      const userId = req.userId;
      const { page = 1, pageSize = 10 } = req.query;
      
      // 获取通知列表
      const result = await NotifyModel.list(userId, parseInt(page), parseInt(pageSize));
      
      res.status(200).json({ code: 200, msg: '获取成功', data: result });
    } catch (error) {
      console.error('获取通知列表失败:', error.message);
      res.status(500).json({ code: 500, msg: '获取通知列表失败', data: {} });
    }
  }

  // 标记通知已读
  static async markAsRead(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.body;
      
      // 参数校验
      if (!id) {
        return res.status(400).json({ code: 400, msg: '通知ID不能为空', data: {} });
      }
      
      // 标记已读
      const success = await NotifyModel.markAsRead(id, userId);
      
      if (success) {
        res.status(200).json({ code: 200, msg: '标记成功', data: {} });
      } else {
        res.status(400).json({ code: 400, msg: '标记失败', data: {} });
      }
    } catch (error) {
      console.error('标记通知已读失败:', error.message);
      res.status(500).json({ code: 500, msg: '标记通知已读失败', data: {} });
    }
  }

  // 批量标记通知已读
  static async batchMarkAsRead(req, res) {
    try {
      const userId = req.userId;
      const { ids } = req.body;
      
      // 参数校验
      if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({ code: 400, msg: '请提供通知ID数组', data: {} });
      }
      
      // 批量标记已读
      const count = await NotifyModel.batchMarkAsRead(ids, userId);
      
      res.status(200).json({ code: 200, msg: `标记成功，共标记 ${count} 条通知`, data: { count } });
    } catch (error) {
      console.error('批量标记通知已读失败:', error.message);
      res.status(500).json({ code: 500, msg: '批量标记通知已读失败', data: {} });
    }
  }

  // 手动触发过期检查
  static async checkExpiry(req, res) {
    try {
      // 手动触发检查
      await ScheduleUtil.manualCheck();
      
      res.status(200).json({ code: 200, msg: '检查完成', data: {} });
    } catch (error) {
      console.error('手动触发过期检查失败:', error.message);
      res.status(500).json({ code: 500, msg: '手动触发过期检查失败', data: {} });
    }
  }
}

module.exports = NotifyController;