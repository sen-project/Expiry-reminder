const schedule = require('node-schedule');
const MedicineModel = require('../models/medicineModel');
const NotifyModel = require('../models/notifyModel');

// 定时任务工具
class ScheduleUtil {
  // 启动定时任务
  static start() {
    this.init();
  }
  
  // 初始化定时任务
  static init() {
    // 每天凌晨1点执行检查
    schedule.scheduleJob('0 1 * * *', async () => {
      console.log('开始执行药品保质期检查...');
      await ScheduleUtil.checkExpiryDate();
      console.log('药品保质期检查完成');
    });
    
    console.log('定时任务已初始化');
  }

  // 检查药品保质期
  static async checkExpiryDate() {
    try {
      // 获取即将过期和已过期的药品
      const medicines = await MedicineModel.getExpiringMedicines();
      
      // 处理每个药品
      for (const medicine of medicines) {
        const now = new Date();
        const expiryDate = new Date(medicine.expiry_date);
        const daysDiff = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
        
        let message = '';
        let type = '';
        
        if (daysDiff < 0) {
          // 已过期
          message = `您的药品 "${medicine.name}" 已经过期，请及时处理！`;
          type = 'expired';
        } else if (daysDiff <= 30) {
          // 即将过期
          message = `您的药品 "${medicine.name}" 将在 ${daysDiff} 天后过期，请及时处理！`;
          type = 'expiring';
        }
        
        if (message) {
          // 创建通知
          await NotifyModel.create(
            medicine.user_id,
            medicine.id,
            medicine.name,
            type,
            message
          );
        }
      }
    } catch (error) {
      console.error('检查药品保质期失败:', error.message);
    }
  }

  // 手动触发检查
  static async manualCheck() {
    console.log('手动触发药品保质期检查...');
    await ScheduleUtil.checkExpiryDate();
    console.log('手动检查完成');
  }
}

module.exports = ScheduleUtil;