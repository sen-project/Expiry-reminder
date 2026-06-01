const XLSX = require('xlsx');
const fs = require('fs');

// Excel工具
class ExcelUtil {
  // 导入Excel文件
  static importExcel(filePath) {
    try {
      // 读取Excel文件
      const workbook = XLSX.readFile(filePath);
      
      // 获取第一个工作表
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      
      // 转换为JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      // 处理数据格式
      const medicines = jsonData.map(item => {
        return {
          name: item['药品名称'] || item['name'] || '',
          type: item['类型'] || item['type'] || 'human',
          purchaseDate: item['购买日期'] || item['purchaseDate'] || '',
          expiryDate: item['保质期'] || item['expiryDate'] || '',
          note: item['备注'] || item['note'] || '',
          location: item['位置'] || item['location'] || '',
          remainNum: item['剩余数量'] || item['remainNum'] || '',
          unit: item['单位'] || item['unit'] || '',
          image: item['图片'] || item['image'] || ''
        };
      }).filter(item => item.name); // 过滤掉空数据
      
      return medicines;
    } catch (error) {
      throw error;
    } finally {
      // 清理临时文件
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  // 导出Excel文件
  static exportExcel(data, filePath) {
    try {
      // 转换数据格式
      const exportData = data.map(item => {
        return {
          '药品名称': item.name,
          '类型': item.type,
          '购买日期': item.purchase_date,
          '保质期': item.expiry_date,
          '位置': item.location,
          '剩余数量': item.remain_num,
          '单位': item.unit,
          '图片': item.image,
          '备注': item.note
        };
      });
      
      // 创建工作簿
      const workbook = XLSX.utils.book_new();
      
      // 创建工作表
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // 添加工作表到工作簿
      XLSX.utils.book_append_sheet(workbook, worksheet, '药品列表');
      
      // 写入文件
      XLSX.writeFile(workbook, filePath);
      
      return filePath;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ExcelUtil;