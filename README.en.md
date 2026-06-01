# Medicine Inventory Alert System

![License](https://img.shields.io/badge/license-ISC-blue)
![Node Version](https://img.shields.io/badge/node-%3E%3D16-green)
![Vue Version](https://img.shields.io/badge/vue-3.4-brightgreen)

A comprehensive home medicine inventory management system providing medicine information management, expiration alerts, medication records, and more.

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Configuration](#configuration)
  - [Backend Environment Variables](#backend-environment-variables)
  - [Frontend Environment Variables](#frontend-environment-variables)
- [Database Setup](#database-setup)
- [Deployment Guide](#deployment-guide)
- [License](#license)

## About the Project

This project is a home medicine inventory alert system that helps users manage household medications, promptly identify expiring or expired medicines, and avoid medicine waste and safety hazards.

## 🖼️ Preview

### System Architecture
![System Architecture](screenshots/architecture.png)

### Database Design
![Database ER Diagram](screenshots/database-er.png)

### Login Page
![Login Page](screenshots/login-page.png)

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Medicine Management
![Medicine List](screenshots/medicine-list.png)

### Add Medicine
![Add Medicine](screenshots/add-medicine.png)

### Medicine Detail
![Medicine Detail](screenshots/medicine-detail.png)

## Features

### User Features
- User registration and login
- Account security (login failure locking)
- Personal information management

### Medicine Management
- Medicine CRUD operations
- Medicine photo upload
- Medicine import/export (Excel)
- Medicine inventory management
- Medicine storage location tracking

### Alert Features
- Automatic medicine expiration check
- Expiring medicine reminders
- Expired medicine notifications
- Notification center (read/unread)

### Other Features
- Medication record management
- Contact management
- Operation logs
- Data visualization (dashboard)

## Tech Stack

### Backend
- **Framework**: Express.js
- **Database**: MySQL
- **ORM**: mysql2
- **Authentication**: JSON Web Token (JWT)
- **File Upload**: Multer
- **Scheduled Tasks**: node-schedule
- **Email Service**: Nodemailer

### Frontend
- **Build Tool**: Vite
- **Framework**: Vue 3
- **UI Component Library**: Element Plus
- **State Management**: Pinia
- **Routing**: Vue Router
- **HTTP Client**: Axios
- **Charts**: ECharts
- **Excel Handling**: xlsx

## Project Structure

```
.
├── medicine-node/          # Backend project directory
│   ├── config/             # Configuration files
│   ├── controllers/        # Controllers
│   ├── models/             # Data models
│   ├── routes/             # Routes
│   ├── utils/              # Utility functions
│   ├── .env.example        # Environment variable example
│   ├── app.js              # Entry file
│   └── db.sql              # Database initialization script
├── medicine-web/           # Frontend project directory
│   ├── src/
│   │   ├── api/            # API interfaces
│   │   ├── components/     # Common components
│   │   ├── config/         # Configuration files
│   │   ├── router/         # Routing
│   │   ├── stores/         # State management
│   │   ├── styles/         # Styles
│   │   └── views/          # Pages
│   ├── .env.development.example
│   └── .env.production.example
└── README.md               # Project documentation
```

## Quick Start

### Prerequisites

Ensure the following software is installed in your development environment:

- **Node.js** (>= 16.x)
- **MySQL** (>= 8.0)
- **Git**

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd medicine-node
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:

   Copy `.env.example` to `.env` and modify according to your environment:

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file and fill in your database and other configuration:

   ```env
   # Database configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password_here
   DB_DATABASE=medicine_management
   
   # JWT secret key (please change to a secure key)
   JWT_SECRET=your_jwt_secret_key_here
   ```

4. Initialize the database:

   Create the database in MySQL and execute the initialization script:

   ```bash
   mysql -u root -p
   ```

   Execute in the MySQL command line:

   ```sql
   source d:/y/medicine-node/db.sql;
   ```

5. Start the backend service:

   ```bash
   npm run dev
   ```

   The backend service will start at `http://localhost:3000`

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:

   ```bash
   cd medicine-web
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables (optional, defaults are configured):

   To modify, copy `.env.development.example` to `.env.development`:

   ```bash
   cp .env.development.example .env.development
   ```

4. Start the frontend development server:

   ```bash
   npm run dev
   ```

   The frontend will start at `http://localhost:5173` (default port)

## Configuration

### Backend Environment Variables

Configure in `medicine-node/.env`:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| DB_HOST | Database host | No | localhost |
| DB_PORT | Database port | No | 3306 |
| DB_USER | Database username | No | root |
| DB_PASSWORD | Database password | Yes | - |
| DB_DATABASE | Database name | No | medicine_management |
| JWT_SECRET | JWT signing key | Yes | - |
| EMAIL_HOST | SMTP server address (optional) | No | - |
| EMAIL_PORT | SMTP port (optional) | No | 587 |
| EMAIL_USER | Email account (optional) | No | - |
| EMAIL_PASS | Email password (optional) | No | - |

### Frontend Environment Variables

Configure in `medicine-web/.env.development` or `.env.production`:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| VITE_API_BASE_URL | Backend API address | No | http://localhost:3000 |

## Database Setup

1. Ensure MySQL service is running
2. Create database (automatically created if using db.sql script)
3. Execute `medicine-node/db.sql` script to initialize table structure
4. Confirm database connection configuration is correct

## Deployment Guide

### Backend Deployment

1. Install Node.js and MySQL on the server
2. Upload code to the server
3. Install dependencies: `npm install`
4. Configure production environment variables
5. Start the service: `npm start`

Recommended to use PM2 for process management:

```bash
npm install -g pm2
pm2 start app.js --name medicine-backend
```

### Frontend Deployment

1. Build for production:

   ```bash
   npm run build
   ```

2. Deploy the contents of the `dist` directory to Nginx, Apache, or another static file server

## License

This project is licensed under the ISC License - see the LICENSE file for details

---

**Important**: Be sure to change the default JWT_SECRET and database password in production!
