const MedicineModel = require('../models/medicineModel');
const ExcelUtil = require('../utils/excel');
const path = require('path');
const fs = require('fs');
const UserModel = require('../models/userModel');
const axios = require('axios');
const nodemailer = require('nodemailer');
const { pool } = require('../config/db');

// 药品控制器
class MedicineController {
  // 新增药品
  static async add(req, res) {
    try {
      const userId = req.userId;
      const { name, type, purchaseDate, expiryDate, note, location, remainNum, unit, image } = req.body;
      
      // 参数校验
      if (!name || !type || !purchaseDate || !expiryDate) {
        return res.status(400).json({ code: 400, msg: '药品名称、类型、购买日期和保质期不能为空', data: {} });
      }
      
      // 去除 image 值中的额外空格和反引号
      const cleanImage = image ? image.trim().replace(/`/g, '') : '';
      
      // 新增药品
      const medicineId = await MedicineModel.add(userId, name, type, purchaseDate, expiryDate, cleanImage, note, location, remainNum, unit);
      
      res.status(200).json({ code: 200, msg: '新增成功', data: { id: medicineId } });
    } catch (error) {
      console.error('新增药品失败:', error.message);
      res.status(500).json({ code: 500, msg: '新增药品失败', data: {} });
    }
  }

  // 查询药品列表
  static async list(req, res) {
    try {
      const userId = req.userId;
      const { type = '', expiryStatus = '' } = req.query;
      
      console.log('查询药品列表参数:', {
        userId,
        type,
        expiryStatus
      });
      
      // 查询药品列表（不分页，返回全部数据）
      const result = await MedicineModel.list(userId, type, expiryStatus);
      
      res.status(200).json({ code: 200, msg: '查询成功', data: result });
    } catch (error) {
      console.error('查询药品列表失败:', error);
      res.status(500).json({ code: 500, msg: '查询药品列表失败', data: {} });
    }
  }

  // 修改药品
  static async update(req, res) {
    try {
      const userId = req.userId;
      const { id, name, type, purchaseDate, expiryDate, note, location, remainNum, unit, image } = req.body;
      
      // 参数校验
      if (!id || !name || !type || !purchaseDate || !expiryDate) {
        return res.status(400).json({ code: 400, msg: '药品ID、名称、类型、购买日期和保质期不能为空', data: {} });
      }
      
      // 检查药品是否存在
      const existingMedicine = await MedicineModel.findById(id, userId);
      if (!existingMedicine) {
        return res.status(404).json({ code: 404, msg: '药品不存在', data: {} });
      }
      
      // 去除 image 值中的额外空格和反引号
      const cleanImage = image ? image.trim().replace(/`/g, '') : existingMedicine.image || '';
      
      // 修改药品
      const success = await MedicineModel.update(id, userId, name, type, purchaseDate, expiryDate, cleanImage, note, location, remainNum, unit);
      
      if (success) {
        res.status(200).json({ code: 200, msg: '修改成功', data: {} });
      } else {
        res.status(400).json({ code: 400, msg: '修改失败', data: {} });
      }
    } catch (error) {
      console.error('修改药品失败:', error.message);
      res.status(500).json({ code: 500, msg: '修改药品失败', data: {} });
    }
  }

  // 删除药品
  static async delete(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      
      // 参数校验
      if (!id) {
        return res.status(400).json({ code: 400, msg: '药品ID不能为空', data: {} });
      }
      
      // 检查药品是否存在
      const existingMedicine = await MedicineModel.findById(id, userId);
      if (!existingMedicine) {
        return res.status(404).json({ code: 404, msg: '药品不存在', data: {} });
      }
      
      // 删除药品
      const success = await MedicineModel.delete(id, userId);
      
      if (success) {
        res.status(200).json({ code: 200, msg: '删除成功', data: {} });
      } else {
        res.status(400).json({ code: 400, msg: '删除失败', data: {} });
      }
    } catch (error) {
      console.error('删除药品失败:', error.message);
      res.status(500).json({ code: 500, msg: '删除药品失败', data: {} });
    }
  }

  // 批量导入药品
  static async import(req, res) {
    try {
      const userId = req.userId;
      const ip = req.ip || req.connection.remoteAddress || '';
      
      // 检查文件是否上传
      if (!req.file) {
        return res.status(400).json({ code: 400, msg: '请上传Excel文件', data: {} });
      }
      
      // 导入Excel文件
      const medicines = ExcelUtil.importExcel(req.file.path);
      
      // 批量添加药品
      const count = await MedicineModel.batchAdd(userId, medicines);
      
      // 记录操作日志
      const LogModel = require('../models/logModel');
      await LogModel.add(userId, 'import', `导入药品 ${count} 条`, ip);
      
      res.status(200).json({ code: 200, msg: `导入成功，共导入 ${count} 条数据`, data: { count } });
    } catch (error) {
      console.error('导入药品失败:', error.message);
      res.status(500).json({ code: 500, msg: '导入药品失败', data: {} });
    }
  }

  // 导出药品列表
  static async export(req, res) {
    try {
      const userId = req.userId;
      const ip = req.ip || req.connection.remoteAddress || '';
      
      // 获取所有药品
      const medicines = await MedicineModel.getAll(userId);
      
      // 生成导出文件路径
      const exportPath = path.join(__dirname, '../exports');
      if (!fs.existsSync(exportPath)) {
        fs.mkdirSync(exportPath, { recursive: true });
      }
      
      const fileName = `药品列表_${Date.now()}.xlsx`;
      const filePath = path.join(exportPath, fileName);
      
      // 导出Excel文件
      ExcelUtil.exportExcel(medicines, filePath);
      
      // 记录操作日志
      const LogModel = require('../models/logModel');
      await LogModel.add(userId, 'export', `导出药品 ${medicines.length} 条`, ip);
      
      // 设置CORS响应头
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Expose-Headers', 'Content-Disposition, Content-Type');
      
      // 设置响应头
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
      
      // 下载文件
      res.sendFile(filePath, (err) => {
        if (err) {
          console.error('下载文件失败:', err.message);
        }
        
        // 清理临时文件
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkErr) {
          console.error('清理临时文件失败:', unlinkErr.message);
        }
      });
    } catch (error) {
      console.error('导出药品失败:', error.message);
      res.status(500).json({ code: 500, msg: '导出药品失败', data: {} });
    }
  }

  // 发送药品过期提醒邮件（无需token）
  static async sendExpiryEmail(req, res) {
    try {
      // 查询所有用户
      const [users] = await pool.execute('SELECT id, username FROM user');
      
      // 对每个用户发送邮件
      for (const user of users) {
        const userId = user.id;
        const email = user.username; // username就是邮箱
        
        // 查询该用户的药品
        const [medicines] = await pool.execute('SELECT * FROM medicine WHERE user_id = ?', [userId]);
        
        // 分类药品
        const now = new Date();
        const oneMonthLater = new Date();
        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
        
        const expiredMedicines = [];
        const expiringMedicines = [];
        const otherMedicines = [];
        
        // 日期格式化函数
        const formatDate = (date) => {
          const d = new Date(date);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        medicines.forEach(med => {
          const expiryDate = new Date(med.expiry_date);
          if (expiryDate < now) {
            expiredMedicines.push({ ...med, expiry_date: formatDate(med.expiry_date) });
          } else if (expiryDate <= oneMonthLater) {
            expiringMedicines.push({ ...med, expiry_date: formatDate(med.expiry_date) });
          } else {
            otherMedicines.push({ ...med, expiry_date: formatDate(med.expiry_date) });
          }
        });
        
        // 构建邮件内容
        let content = `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>药品过期提醒</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
              margin: 0;
              padding: 20px;
              color: #333;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
              padding: 30px;
            }
            h1 {
              color: #2c3e50;
              text-align: center;
              margin-bottom: 30px;
              font-size: 24px;
            }
            .summary {
              display: flex;
              justify-content: space-around;
              margin-bottom: 30px;
              flex-wrap: wrap;
            }
            .summary-item {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
              flex: 1;
              margin: 5px;
              min-width: 120px;
            }
            .summary-item h3 {
              margin: 0 0 10px 0;
              font-size: 14px;
              color: #666;
            }
            .summary-item .count {
              font-size: 24px;
              font-weight: bold;
              color: #3498db;
            }
            .section {
              margin-bottom: 30px;
              padding: 20px;
              border-radius: 8px;
              background: #f8f9fa;
            }
            .section h2 {
              margin-top: 0;
              margin-bottom: 20px;
              color: #2c3e50;
              font-size: 18px;
              border-bottom: 2px solid #3498db;
              padding-bottom: 10px;
            }
            .medicine-list {
              list-style: none;
              padding: 0;
              margin: 0;
            }
            .medicine-item {
              background: white;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 10px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
              transition: transform 0.2s ease;
            }
            .medicine-item:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .medicine-name {
              font-weight: bold;
              color: #2c3e50;
            }
            .medicine-type {
              color: #666;
              font-size: 14px;
              margin-left: 10px;
            }
            .medicine-expiry {
              margin-top: 5px;
              font-size: 14px;
              color: #7f8c8d;
            }
            .expiring-soon {
              border-left: 4px solid #f39c12;
            }
            .expired {
              border-left: 4px solid #e74c3c;
            }
            .valid {
              border-left: 4px solid #27ae60;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 14px;
              color: #7f8c8d;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>药品过期提醒</h1>
            
            <!-- 药品数量汇总 -->
            <div class="summary">
              <div class="summary-item">
                <h3>一个月内过期</h3>
                <div class="count">${expiringMedicines.length}</div>
              </div>
              <div class="summary-item">
                <h3>已过期</h3>
                <div class="count">${expiredMedicines.length}</div>
              </div>
              <div class="summary-item">
                <h3>其他药品</h3>
                <div class="count">${otherMedicines.length}</div>
              </div>
              <div class="summary-item">
                <h3>总药品数</h3>
                <div class="count">${medicines.length}</div>
              </div>
            </div>
            
            <!-- 一个月内过期药品 -->
            ${expiringMedicines.length > 0 ? `
            <div class="section">
              <h2>⚠️ 一个月内过期药品</h2>
              <ul class="medicine-list">
                ${expiringMedicines.map(med => `
                <li class="medicine-item expiring-soon">
                  <span class="medicine-name">${med.name}</span>
                  <span class="medicine-type">${med.type}</span>
                  <div class="medicine-expiry">过期日期: ${med.expiry_date}</div>
                </li>
                `).join('')}
              </ul>
            </div>
            ` : ''}
            
            <!-- 已过期药品 -->
            ${expiredMedicines.length > 0 ? `
            <div class="section">
              <h2>❌ 已过期药品</h2>
              <ul class="medicine-list">
                ${expiredMedicines.map(med => `
                <li class="medicine-item expired">
                  <span class="medicine-name">${med.name}</span>
                  <span class="medicine-type">${med.type}</span>
                  <div class="medicine-expiry">过期日期: ${med.expiry_date}</div>
                </li>
                `).join('')}
              </ul>
            </div>
            ` : ''}
            
            <!-- 其他药品 -->
            ${otherMedicines.length > 0 ? `
            <div class="section">
              <h2>✅ 其他药品</h2>
              <ul class="medicine-list">
                ${otherMedicines.map(med => `
                <li class="medicine-item valid">
                  <span class="medicine-name">${med.name}</span>
                  <span class="medicine-type">${med.type}</span>
                  <div class="medicine-expiry">过期日期: ${med.expiry_date}</div>
                </li>
                `).join('')}
              </ul>
            </div>
            ` : ''}
            
            <div class="footer">
              <p>此邮件由系统自动发送，请勿直接回复</p>
              <p>发送时间: ${new Date().toLocaleString('zh-CN')}</p>
            </div>
          </div>
        </body>
        </html>
        `;
        
        // 通过pushplus发送邮件
        const pushplusToken = 'b6576513fad34652855281ea6653a0e6';
        const pushplusUrl = 'https://www.pushplus.plus/send';
        
        await axios.post(pushplusUrl, {
          token: pushplusToken,
          title: '药品过期提醒',
          content: content,
          template: 'html',
          channel: 'mail',
          // option: email
          pre:''
        });
        
        console.log(`已发送邮件到 ${email}`);
      }
      
      res.status(200).json({ code: 200, msg: '邮件发送成功', data: {} });
    } catch (error) {
      console.error('发送邮件失败:', error.message);
      res.status(500).json({ code: 500, msg: '发送邮件失败', data: {} });
    }
  }

  // 发送药品过期提醒邮件（无需token，使用网易163）
  static async sendExpiryEmail163(req, res) {
    try {
      // 创建网易163邮件传输器
      const transporter = nodemailer.createTransport({
        host: 'smtp.163.com',
        port: 465,
        secure: true, // 使用SSL
        auth: {
          user: 'sen18830993367@163.com',
          pass: 'LSParraSsca64ve4' // 授权码
        }
      });
      
      // 查询所有用户
      const [users] = await pool.execute('SELECT id, username FROM user');
      
      // 邮箱去重集合
      const sentEmails = new Set();
      
      // 对每个用户发送邮件
      for (const user of users) {
        const userId = user.id;
        const email = user.username; // username就是邮箱
        
        // 查询该用户的药品
        const [medicines] = await pool.execute('SELECT * FROM medicine WHERE user_id = ?', [userId]);
        
        // 分类药品
        const now = new Date();
        const sevenDaysLater = new Date();
        sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
        const fifteenDaysLater = new Date();
        fifteenDaysLater.setDate(fifteenDaysLater.getDate() + 15);
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
        
        const expiredMedicines = [];
        const expiring7DaysMedicines = [];
        const expiring15DaysMedicines = [];
        const expiring30DaysMedicines = [];
        const normalMedicines = [];
        
        // 日期格式化函数
        const formatDate = (date) => {
          const d = new Date(date);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        medicines.forEach(med => {
          const expiryDate = new Date(med.expiry_date);
          const formattedDate = formatDate(med.expiry_date);
          if (expiryDate < now) {
            expiredMedicines.push({ name: med.name, expiry_date: formattedDate });
          } else if (expiryDate <= sevenDaysLater) {
            expiring7DaysMedicines.push({ name: med.name, expiry_date: formattedDate });
          } else if (expiryDate <= fifteenDaysLater) {
            expiring15DaysMedicines.push({ name: med.name, expiry_date: formattedDate });
          } else if (expiryDate <= thirtyDaysLater) {
            expiring30DaysMedicines.push({ name: med.name, expiry_date: formattedDate });
          } else {
            normalMedicines.push(med);
          }
        });
        
        // 计算统计数据
        const totalMedicines = medicines.length;
        const normalCount = normalMedicines.length;
        const abnormalCount = expiredMedicines.length + expiring7DaysMedicines.length + expiring15DaysMedicines.length + expiring30DaysMedicines.length;
        
        // 构建邮件内容
        let htmlContent = `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>药品过期提醒</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
              margin: 0;
              padding: 20px;
              color: #333;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border-radius: 16px;
              box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
              padding: 40px;
            }
            h1 {
              color: #2c3e50;
              text-align: center;
              margin-bottom: 30px;
              font-size: 28px;
              font-weight: 600;
            }
            h2 {
              color: #2c3e50;
              font-size: 20px;
              font-weight: 600;
              margin-top: 30px;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #3498db;
            }
            h3 {
              color: #34495e;
              font-size: 16px;
              font-weight: 500;
              margin-top: 20px;
              margin-bottom: 15px;
            }
            ul {
              list-style: none;
              padding: 0;
              margin: 0;
            }
            li {
              margin-bottom: 12px;
              padding-left: 20px;
              position: relative;
            }
            li:before {
              content: "•";
              color: #3498db;
              font-weight: bold;
              position: absolute;
              left: 0;
            }
            .section {
              margin-bottom: 30px;
              padding: 25px;
              border-radius: 12px;
              background: #f8f9fa;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            }
            .expired-section {
              border-left: 4px solid #e74c3c;
            }
            .expiring-section {
              border-left: 4px solid #f39c12;
            }
            .health-section {
              border-left: 4px solid #27ae60;
            }
            .status-item {
              margin-bottom: 10px;
              display: flex;
              align-items: center;
            }
            .status-item:before {
              content: "-";
              color: #3498db;
              font-weight: bold;
              margin-right: 10px;
            }
            .no-data {
              color: #7f8c8d;
              font-style: italic;
              padding-left: 20px;
            }
            .action-link {
              display: inline-block;
              margin-top: 30px;
              padding: 12px 24px;
              background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 500;
              transition: all 0.3s ease;
              box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
            }
            .action-link:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 16px rgba(52, 152, 219, 0.4);
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 14px;
              color: #7f8c8d;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
            }
            @media (max-width: 600px) {
              .container {
                padding: 20px;
              }
              h1 {
                font-size: 24px;
              }
              h2 {
                font-size: 18px;
              }
              .section {
                padding: 15px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>药品过期提醒</h1>
            
            <!-- 已过期药品 -->
            <div class="section expired-section">
              <h2>一、已过期药品（请立即清理）</h2>
              ${expiredMedicines.length > 0 ? `
              <ul>
                ${expiredMedicines.map((med, index) => `
                <li>${index + 1}. ${med.name} — 过期日期：${med.expiry_date}</li>
                `).join('')}
              </ul>
              ` : '<div class="no-data">无</div>'}
            </div>
            
            <!-- 即将过期药品 -->
            <div class="section expiring-section">
              <h2>二、即将过期药品（建议尽快使用或处理）</h2>
              <h3>【7天内过期】</h3>
              ${expiring7DaysMedicines.length > 0 ? `
              <ul>
                ${expiring7DaysMedicines.map((med, index) => `
                <li>${index + 1}. ${med.name} — ${med.expiry_date}</li>
                `).join('')}
              </ul>
              ` : '<div class="no-data">无</div>'}
              
              <h3>【15天内过期】</h3>
              ${expiring15DaysMedicines.length > 0 ? `
              <ul>
                ${expiring15DaysMedicines.map((med, index) => `
                <li>${index + 1}. ${med.name} — ${med.expiry_date}</li>
                `).join('')}
              </ul>
              ` : '<div class="no-data">无</div>'}
              
              <h3>【30天内过期】</h3>
              ${expiring30DaysMedicines.length > 0 ? `
              <ul>
                ${expiring30DaysMedicines.map((med, index) => `
                <li>${index + 1}. ${med.name} — ${med.expiry_date}</li>
                `).join('')}
              </ul>
              ` : '<div class="no-data">无</div>'}
            </div>
            
            <!-- 药箱健康状态 -->
            <div class="section health-section">
              <h2>三、本周药箱健康状态</h2>
              <div class="status-item">总药品数：${totalMedicines} 种</div>
              <div class="status-item">正常药品：${normalCount} 种</div>
              <div class="status-item">异常药品：${abnormalCount} 种（已过期+即将过期）</div>
            </div>
            
            <!-- 操作链接 -->
            <div style="text-align: center;">
              <a href="https://yao.yaos.top" class="action-link" target="_blank">点击可去设置药品</a>
            </div>
            
            <div class="footer">
              <p>此邮件由系统自动发送，请勿直接回复</p>
              <p>发送时间: ${new Date().toLocaleString('zh-CN')}</p>
            </div>
          </div>
        </body>
        </html>
        `;
        
        // 发送邮件给用户本人（去重）
        if (!sentEmails.has(email)) {
          await transporter.sendMail({
            from: 'sen18830993367@163.com',
            to: email,
            subject: '药品过期提醒',
            html: htmlContent
          });
          
          console.log(`已通过网易163发送邮件到 ${email}`);
          sentEmails.add(email);
        }
        
        // 查询用户的亲友
        const [contacts] = await pool.execute(
          'SELECT relation_email FROM user_contacts WHERE user_id = ? AND is_notify = 1',
          [userId]
        );
        
        // 发送邮件给亲友（去重）
        for (const contact of contacts) {
          const contactEmail = contact.relation_email;
          if (!sentEmails.has(contactEmail)) {
            await transporter.sendMail({
              from: 'sen18830993367@163.com',
              to: contactEmail,
              subject: '药品过期提醒',
              html: htmlContent
            });
            
            console.log(`已通过网易163发送邮件到亲友 ${contactEmail}`);
            sentEmails.add(contactEmail);
          }
        }
      }
      
      res.status(200).json({ code: 200, msg: '邮件发送成功', data: {} });
    } catch (error) {
      console.error('发送邮件失败:', error.message);
      res.status(500).json({ code: 500, msg: '发送邮件失败', data: {} });
    }
  }

  // 查询药品信息
  static async getMedicineInfo(req, res) {
    try {
      const { name } = req.query;
      
      if (!name) {
        return res.status(400).json({ code: 400, msg: '药品名称不能为空', data: {} });
      }

      // 调用SiliconFlow API查询药品信息
      const siliconFlowUrl = 'https://api.siliconflow.cn/v1/chat/completions';
      const apiKey = 'sk-gddwxotjopcmpplurbaqgkccwnyxepeqilexjsazkivvsdez';

      const payload = {
        model: 'deepseek-ai/DeepSeek-V2.5',
        messages: [
          {
            role: 'user',
            content: `请告诉我"${name}"这种药品的主治症状，只返回核心的主治症状，不要其他内容`
          }
        ],
        stream: false
      };

      const headers = {
        'accept': 'application/json',
        'content-type': 'application/json',
        'authorization': `Bearer ${apiKey}`
      };

      const response = await axios.post(siliconFlowUrl, payload, { headers });
      const content = response.data.choices[0].message.content;

      res.status(200).json({ code: 200, msg: '查询成功', data: { symptoms: content } });
    } catch (error) {
      console.error('查询药品信息失败:', error.message);
      res.status(500).json({ code: 500, msg: '查询药品信息失败', data: {} });
    }
  }
}

module.exports = MedicineController;