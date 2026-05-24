# 🚀 TaskFlow — Team Task Manager with Git-Style Tracking

A full-stack team task manager where users can create projects, invite team members using authorization codes, assign tasks with role-based access control, and visualize project progress on a git-style branch timeline.

## ✨ Key Features

- **🔐 Authentication** — Signup/Login with JWT tokens & bcrypt password hashing
- **📁 Project Management** — Create, list, delete projects with team dashboards
- **🎫 Invite Code System** — Generate unique codes (e.g., `TF-A3X9KP`) to invite team members
- **🛡️ Role-Based Access (RBAC)** — Three permission levels:
  - `Read` — View project & tasks
  - `Read & Write` — Create & update tasks
  - `Alter (Admin)` — Full control + invite others
- **📋 Task Board** — Kanban-style task tracking (Todo → In Progress → Review → Done)
- **🌿 Git-Style Branch Timeline** — Every task update creates a "commit" on the project's main branch
- **📊 Dashboard** — Real-time stats: total tasks, in progress, completed, overdue
- **🔗 Share** — Share projects via invite codes with permission control

## 🛠️ Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 18, Vite, Tailwind CSS, Zustand |
| Backend   | Python, FastAPI, Motor (async MongoDB) |
| Database  | MongoDB Atlas |
| Auth      | JWT (python-jose) + bcrypt (passlib) |
| Deploy    | Railway |

## 📂 Project Structure

```
taskflow/
├── backend/
│   ├── main.py              # FastAPI app entry, registers all routes
│   ├── config.py             # Environment vars (MongoDB URI, JWT secret)
│   ├── requirements.txt
│   ├── middleware/
│   │   ├── db.py             # MongoDB connection (Motor async)
│   │   ├── auth_guard.py     # JWT verification dependency
│   │   └── rbac.py           # Project-level permission checks
│   ├── models/
│   │   └── schemas.py        # Pydantic models (User, Project, Task, Invite, Branch)
│   ├── routes/
│   │   ├── auth.py           # /auth/signup, /auth/login, /auth/me
│   │   ├── projects.py       # CRUD projects + dashboard stats
│   │   ├── tasks.py          # CRUD tasks (auto-commits to branch)
│   │   ├── invites.py        # Generate & join via invite code
│   │   └── branches.py       # Git-style timeline endpoints
│   └── services/
│       ├── auth_service.py   # Password hash, JWT create, login/register logic
│       ├── project_svc.py    # Project CRUD business logic
│       ├── task_svc.py       # Task CRUD + auto branch commit
│       ├── invite_svc.py     # Code generation, join logic
│       └── branch_svc.py     # Branch timeline & feature branches
│
└── frontend/
    ├── src/
    │   ├── main.jsx          # React entry point
    │   ├── App.jsx           # Router + protected route wrapper
    │   ├── index.css         # Tailwind + custom styles
    │   ├── services/         # API layer (axios calls)
    │   │   ├── api.js        # Base axios instance + JWT interceptor
    │   │   ├── authAPI.js    # Auth endpoints
    │   │   ├── projectAPI.js # Project endpoints
    │   │   ├── taskAPI.js    # Task endpoints
    │   │   ├── inviteAPI.js  # Invite endpoints
    │   │   └── branchAPI.js  # Branch endpoints
    │   ├── store/
    │   │   └── authStore.js  # Zustand global auth state
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── TaskCard.jsx
    │   │   ├── BranchLine.jsx
    │   │   ├── InviteModal.jsx
    │   │   ├── CreateTaskModal.jsx
    │   │   └── RoleBadge.jsx
    │   └── pages/
    │       ├── Login.jsx
    │       ├── Dashboard.jsx
    │       ├── Projects.jsx
    │       ├── ProjectDetail.jsx
    │       └── JoinProject.jsx
    └── package.json
```

## 🚀 Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB Atlas account (free tier works)

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # edit with your MongoDB URI
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # edit API URL if needed
npm run dev
```

Visit `http://localhost:5173` — API docs at `http://localhost:8000/docs`

## 🌐 Deployment (Railway)

1. Push code to GitHub
2. Go to [Railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Create two services:
   - **Backend**: Set root directory to `/backend`, add env vars (MONGODB_URI, JWT_SECRET, FRONTEND_URL)
   - **Frontend**: Set root directory to `/frontend`, add env var (VITE_API_URL = backend Railway URL)
4. Both services auto-deploy on push

## 📡 API Endpoints

| Method | Endpoint | Auth | Permission | Description |
|--------|----------|------|------------|-------------|
| POST | `/auth/signup` | ❌ | — | Register user |
| POST | `/auth/login` | ❌ | — | Login, get JWT |
| GET | `/auth/me` | ✅ | — | Current user info |
| POST | `/projects` | ✅ | — | Create project |
| GET | `/projects` | ✅ | — | List my projects |
| GET | `/projects/:id` | ✅ | read | Project details |
| GET | `/projects/:id/dashboard` | ✅ | read | Task stats |
| DELETE | `/projects/:id` | ✅ | owner | Delete project |
| POST | `/projects/:id/tasks` | ✅ | read_write | Create task |
| GET | `/projects/:id/tasks` | ✅ | read | List tasks |
| PUT | `/projects/:id/tasks/:tid` | ✅ | read_write | Update task |
| POST | `/projects/:id/invites` | ✅ | alter | Generate invite |
| POST | `/invites/join` | ✅ | — | Join via code |
| GET | `/projects/:id/branches/timeline` | ✅ | read | Git timeline |

## 📹 Demo

[Link to demo video]

## 👤 Author

Built by Arun — BCA Final Year, KCC Institute of Technology and Management
