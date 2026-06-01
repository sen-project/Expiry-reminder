-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS medicine_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE medicine_management;

-- 用户表
CREATE TABLE IF NOT EXISTS user (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
  username VARCHAR(50) NOT NULL UNIQUE COMMENT '邮箱',
  password VARCHAR(255) NOT NULL COMMENT '密码',
  phone VARCHAR(20) NOT NULL COMMENT '手机号',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT='用户表';

-- 药品表
CREATE TABLE IF NOT EXISTS medicine (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '药品ID',
  user_id INT NOT NULL COMMENT '用户ID',
  name VARCHAR(100) NOT NULL COMMENT '药品名称',
  type VARCHAR(20) NOT NULL COMMENT '类型（人药/宠物药）',
  purchase_date DATE NOT NULL COMMENT '购买日期',
  expiry_date DATE NOT NULL COMMENT '保质期',
  image VARCHAR(255) COMMENT '图片',
  note TEXT COMMENT '备注',
  location VARCHAR(255) COMMENT '存放位置',
  remain_num VARCHAR(50) COMMENT '剩余数量',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
) COMMENT='药品表';

-- 通知表
CREATE TABLE IF NOT EXISTS notify (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '通知ID',
  user_id INT NOT NULL COMMENT '用户ID',
  medicine_id INT NOT NULL COMMENT '药品ID',
  medicine_name VARCHAR(100) NOT NULL COMMENT '药品名称',
  type VARCHAR(20) NOT NULL COMMENT '通知类型（expired/expiring）',
  message TEXT NOT NULL COMMENT '通知内容',
  is_read TINYINT(1) DEFAULT 0 COMMENT '是否已读（0：未读，1：已读）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (medicine_id) REFERENCES medicine(id) ON DELETE CASCADE
) COMMENT='通知表';

-- 操作日志表
CREATE TABLE IF NOT EXISTS operation_log (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
  user_id INT NOT NULL COMMENT '用户ID',
  operation VARCHAR(20) NOT NULL COMMENT '操作类型（import/export）',
  description TEXT COMMENT '操作描述',
  ip VARCHAR(50) COMMENT 'IP地址',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
) COMMENT='操作日志表';

-- 创建索引
CREATE INDEX idx_medicine_user_id ON medicine(user_id);
CREATE INDEX idx_medicine_expiry_date ON medicine(expiry_date);
CREATE INDEX idx_notify_user_id ON notify(user_id);
CREATE INDEX idx_notify_is_read ON notify(is_read);
CREATE INDEX idx_operation_log_user_id ON operation_log(user_id);
CREATE INDEX idx_operation_log_operation ON operation_log(operation);