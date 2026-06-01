# 药品管理系统后端

本项目是药品管理系统的 Node.js 后端部分，基于 Express 构建，提供了 API 接口服务。

## ✨ 功能

-   提供用户认证与授权
-   提供药品信息管理的 API
-   提供用药记录管理的 API
-   提供联系人管理的 API
-   提供通知中心的 API
-   提供操作日志的 API

## 🛠️ 技术栈

-   **框架**: Express
-   **数据库**: MySQL
-   **ORM**: mysql2
-   **认证**: JSON Web Token (JWT)
-   **文件上传**: Multer
-   **定时任务**: node-schedule
-   **邮件服务**: Nodemailer

## ⚙️ 环境配置

在项目根目录下创建 `.env` 文件，并配置以下环境变量：

```
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=medicine_management

# JWT 密钥
JWT_SECRET=your_jwt_secret

# 邮箱配置 (可选)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_password
```

## 🗄️ 数据库设置

1.  确保你已经安装并运行了 MySQL 数据库。
2.  创建一个名为 `medicine_management` 的数据库。
3.  导入 `db.sql` 文件以初始化数据库表结构和数据。

```bash
mysql -u your_user -p medicine_management < db.sql
```

## 🚀 快速开始

**1. 克隆项目**

```bash
git clone <repository-url>
cd medicine-management-backend
```

**2. 安装依赖**

```bash
npm install
```

**3. 启动服务器**

```bash
npm run dev
```

服务器将会在 `http://localhost:3000` 启动。

## 📄 可用脚本

-   `npm run dev`: 启动开发服务器
-   `npm run start`: 启动生产服务器
