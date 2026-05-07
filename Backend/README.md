# Team Task Manager — Backend API

Node.js · Express · MySQL · Sequelize · JWT

---

## Folder Structure

```
team-task-manager/
├── config/
│   └── database.js          # Sequelize + MySQL connection
├── controllers/
│   ├── authController.js    # register / login / me
│   ├── projectController.js # CRUD projects
│   └── taskController.js    # CRUD tasks
├── middleware/
│   └── auth.js              # protect (JWT) + restrictTo (RBAC)
├── models/
│   ├── index.js             # associations + exports
│   ├── User.js
│   ├── Project.js
│   └── Task.js
├── routes/
│   ├── auth.js
│   ├── projects.js
│   └── tasks.js
├── .env.example
├── .gitignore
├── package.json
└── server.js
```

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill in environment variables
cp .env.example .env

# 3. Start dev server (auto-restarts)
npm run dev

# 4. Start production server
npm start
```

---

## Environment Variables

| Variable        | Description                          | Example                    |
|----------------|--------------------------------------|----------------------------|
| `PORT`          | Server port                          | `5000`                     |
| `FRONTEND_URL`  | Your frontend origin (CORS)          | `https://myapp.vercel.app` |
| `DB_HOST`       | MySQL host                           | `containers-us-west-1...`  |
| `DB_PORT`       | MySQL port                           | `3306`                     |
| `DB_NAME`       | Database name                        | `railway`                  |
| `DB_USER`       | Database user                        | `root`                     |
| `DB_PASSWORD`   | Database password                    | `secret`                   |
| `JWT_SECRET`    | Long random string for JWT signing   | `change_me_in_production`  |
| `JWT_EXPIRES_IN`| Token expiry                         | `7d`                       |

---

## API Reference

All protected routes require:
```
Authorization: Bearer <token>
```

### Auth — `/api/auth`

| Method | Endpoint             | Access  | Body                              |
|--------|----------------------|---------|-----------------------------------|
| POST   | `/register`          | Public  | `name, email, password, role?`    |
| POST   | `/login`             | Public  | `email, password`                 |
| GET    | `/me`                | Any     | —                                 |

### Projects — `/api/projects`

| Method | Endpoint        | Access        | Body / Notes                            |
|--------|-----------------|---------------|-----------------------------------------|
| GET    | `/`             | Any           | Admins → all; Members → their projects  |
| GET    | `/:id`          | Any           | Members restricted to member projects   |
| POST   | `/`             | Admin only    | `name, description?, memberIds[]`       |
| PUT    | `/:id`          | Admin only    | `name?, description?, memberIds[]?`     |
| DELETE | `/:id`          | Admin only    | Cascades tasks                          |

### Tasks — `/api/tasks`

| Method | Endpoint  | Access              | Body / Notes                                         |
|--------|-----------|---------------------|------------------------------------------------------|
| GET    | `/`       | Any                 | Query: `?projectId=&status=&assignedTo=`             |
| GET    | `/:id`    | Any                 | Members restricted to their project's tasks          |
| POST   | `/`       | Admin only          | `title, projectId, description?, status?, dueDate?, assignedTo?` |
| PUT    | `/:id`    | Admin / Assignee    | Admin: all fields; Member: `status` only             |
| DELETE | `/:id`    | Admin only          | —                                                    |

---

## RBAC Summary

| Action                          | Admin | Member                          |
|---------------------------------|-------|---------------------------------|
| View all projects               | ✅    | ❌ (own projects only)          |
| Create / Edit / Delete projects | ✅    | ❌                              |
| Add members to project          | ✅    | ❌                              |
| View all tasks                  | ✅    | ❌ (project-scoped only)        |
| Create / Delete tasks           | ✅    | ❌                              |
| Update any task field           | ✅    | ❌                              |
| Update own task `status`        | ✅    | ✅ (assigned tasks only)        |

---

## Railway Deployment

1. Create a **MySQL** service in Railway → copy connection variables into your app's environment.
2. Set all env vars in the Railway dashboard (Variables tab).
3. Railway auto-detects `npm start` from `package.json` — no Procfile needed.
4. The `sequelize.sync({ alter: true })` call in `server.js` handles schema migrations on boot.
