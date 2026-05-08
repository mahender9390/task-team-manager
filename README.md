# Task Team Manager

A modern full-stack team collaboration and task management platform built with a modern React frontend and Node.js backend.

## Live Demo

### Frontend

[https://task-team-manager.vennapureddymahender.workers.dev](https://task-team-manager.vennapureddymahender.workers.dev)

### Backend API

[https://task-team-manager-production-df88.up.railway.app](https://task-team-manager-production-df88.up.railway.app)

---

# Features

* User Authentication
* Team Workspace Management
* Task Creation & Assignment
* Dashboard Analytics
* Responsive Modern UI
* API Integration
* Full Stack Architecture
* Cloud Deployment
* Real-time Team Workflow Management

---

# Tech Stack

## Frontend

* React
* TypeScript
* Vite
* TanStack Start
* Tailwind CSS
* Axios
* React Hook Form
* Zod
* Radix UI
* Lucide React

## Backend

* Node.js
* Express.js
* MySQL
* JWT Authentication
* REST APIs

## Deployment

* Frontend: Cloudflare Workers/Pages
* Backend: Railway

---

# Project Structure

```bash
Task-Team-Manager/
│
├── Backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── config/
│   └── server.js
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── routes/
│   │   ├── styles.css
│   │   └── server.ts
│   │
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/mahender9390/task-team-manager.git
cd task-team-manager
```

---

# Backend Setup

```bash
cd Backend
npm install
```

## Create .env File

```env
PORT=5000
DB_HOST=your_host
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=your_database
JWT_SECRET=your_secret
FRONTEND_URL=http://localhost:5173
```

## Run Backend

```bash
node server.js
```

---

# Frontend Setup

```bash
cd Frontend
npm install
```

## Create .env File

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Run Frontend

```bash
npm run dev
```

---

# Deployment

## Frontend Deployment (Cloudflare)

The frontend is deployed using Cloudflare Workers/Pages.

### Build Settings

```bash
Root Directory: Frontend
Build Command: npm run build
```
###Varables

```bash
key: VITE_API_BASE_URL
Value: https://task-team-manager-production-df88.up.railway.app/api
```

## Backend Deployment (Railway)

The backend API is deployed on Railway.

### Railway Configuration

```bash
Root Directory: Backend
```
###Varables

 based on you databse provided by Railways set all the varables
 
```bash
DB_HOST=your_host
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=your_database
JWT_SECRET=your_secret
```

---

# API Configuration

Frontend uses environment variables to connect with backend APIs.

```env
VITE_API_BASE_URL=https://task-team-manager-production-df88.up.railway.app/api
```

---

# CORS Configuration

Backend CORS configuration allows:

```js
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',
  'https://task-team-manager.vennapureddymahender.workers.dev'
];
```

---

# Available Scripts

## Frontend

```bash
npm run dev
npm run build
npm run start
```

## Backend

```bash
node server.js
npm run dev
```

---

# Screenshots

<table align="center">
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/ede783d0-9a2b-44f4-98fa-72810cf87953" width="500"/><br/>
      <b>Signup page</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/192a33da-7e38-4a66-a39c-e35fa929a27e" width="500"/><br/>
      <b>Login page</b>
    </td>
  </tr>
</table>

<table align="center">
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/1716b3a4-a4d7-4275-943c-745b6b0ac71a" width="500"/><br/>
      <b>Admin Dashboard</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/14d0b5f1-724d-42fd-b6c5-9e178c400e76" width="500"/><br/>
      <b>Member Dashboard</b>
    </td>
  </tr>
</table>

---

# Future Improvements

* Real-time notifications
* Team chat system
* File uploads
* Calendar integration
* Activity tracking
* Email notifications
* Docker deployment

---

# Learning Outcomes

This project helped in understanding:

* Full-stack application architecture
* API integration
* Authentication systems
* Deployment workflows
* Cloudflare deployment
* Railway backend hosting
* Environment variable management
* CORS handling
* Modern React development

---

# Author

Mahender V

GitHub:
[https://github.com/mahender9390](https://github.com/mahender9390)

---

# License

This project is created for educational and portfolio purposes.
