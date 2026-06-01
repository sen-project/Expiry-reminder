# 药品管理系统前端

本项目是药品管理系统的 Vue 3 前端部分，基于 Vite 构建，使用了 Element Plus、Pinia 和 ECharts。

## ✨ 功能

-   用户登录与注册
-   药品信息管理（增删改查、导入导出）
-   用药记录管理
-   联系人管理
-   通知中心
-   操作日志

## 🛠️ 技术栈

-   **构建工具**: Vite
-   **前端框架**: Vue 3
-   **UI 框架**: Element Plus
-   **状态管理**: Pinia
-   **路由**: Vue Router
-   **HTTP 请求**: Axios
-   **图表**: ECharts
-   **Excel 处理**: xlsx

## ⚙️ 环境配置

在项目根目录下创建 `.env.development` 文件，并配置以下环境变量：

```
# 后端 API 地址
VITE_API_BASE_URL=http://localhost:3000
```

## 🚀 快速开始

**1. 克隆项目**

```bash
git clone <repository-url>
cd medicine-management-frontend
```

**2. 安装依赖**

```bash
npm install
```

**3. 启动开发服务器**

```bash
npm run dev
```

项目将会在 `http://localhost:1200` 启动。

## 📦 构建

```bash
npm run build
```

构建产物将生成在 `dist` 目录下。

## 📄 可用脚本

-   `npm run dev`: 启动开发服务器
-   `npm run build`: 构建生产版本
-   `npm run preview`: 预览生产版本
