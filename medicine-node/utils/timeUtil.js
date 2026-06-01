// 时间处理工具
class TimeUtil {
  // 格式化时间
  static formatTime(date) {
    if (!date) return null;
    
    const d = new Date(date);
    
    // 检查是否是有效日期
    if (isNaN(d.getTime())) return null;
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    // 检查是否有时间部分
    if (hours === '00' && minutes === '00' && seconds === '00') {
      // 无小时分钟秒，返回 yyyy-mm-dd 格式
      return `${year}-${month}-${day}`;
    } else {
      // 有小时分钟秒，返回 yyyy-mm-dd hh:mm:ss 格式
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
  }
  
  // 格式化药品列表中的时间字段
  static formatMedicineList(medicines) {
    if (!Array.isArray(medicines)) return medicines;
    
    return medicines.map(medicine => {
      return {
        ...medicine,
        purchase_date: this.formatTime(medicine.purchase_date),
        expiry_date: this.formatTime(medicine.expiry_date),
        // 确保 image 字段存在
        image: medicine.image || ''
      };
    });
  }
}

module.exports = TimeUtil;