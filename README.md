# Team Task Manager – Full Stack MERN Application

A production-ready team task management platform built with the MERN stack. Manage projects, assign tasks, track progress, and collaborate with your team — all in one place.

![Tech Stack](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)
![Tech Stack](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![Tech Stack](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Tech Stack](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)

---

## Features

### Authentication & Authorization
- JWT-based authentication (login, register, logout)
- Role-based access control: **Admin** and **Member**
- Protected routes with auto-redirect
- Password hashing with bcrypt
- Change password from profile

### Admin Capabilities
- Create, edit, delete projects
- Add/remove team members from projects
- Create and assign tasks with priorities and due dates
- Update any task status
- View all users, change roles, deactivate/delete accounts
- Full dashboard analytics

### Member Capabilities
- View projects they belong to
- Update status of tasks assigned to them
- View dashboard with their own task summary
- Add comments to tasks
- Edit their profile

### Projects
- Create projects with title, description, status, priority, dates, and color tag
- Progress tracking (% tasks completed)
- Team member management per project
- Filter by status, priority, search

### Tasks
- Create tasks with title, description, assignee, priority, status, due date
- Overdue detection
- Status updates inline
- Task comments (add, delete)
- Activity log per task
- Filter by status, priority, assignee, overdue flag

### Dashboard
- Stats cards: total projects, tasks, completed, overdue
- Bar chart: task activity over last 6 months
- Pie chart: task priority breakdown
- Recent tasks & tasks due soon

### UI/UX
- Professional blue/white corporate theme
- Dark/light mode toggle
- Fully responsive (desktop + mobile)
- Sidebar navigation
- Toast notifications (react-hot-toast)
- Loading spinners and empty states
- Smooth transitions and hover effects

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| State | Context API (Auth + Theme) |
| HTTP | Axios |
| Charts | Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT + bcryptjs |
| Dates | date-fns |

---

## Project Structure

```
team-task-manager/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   └── auth.js             # JWT & role middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   └── dashboard.js
│   ├── .env.example
│   ├── railway.json
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Shared UI (Modal, Spinner, Badges…)
│   │   │   └── layout/         # Sidebar, Navbar, Layout
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ProjectsPage.jsx
│   │   │   ├── ProjectDetailPage.jsx
│   │   │   ├── TasksPage.jsx
│   │   │   ├── TaskDetailPage.jsx
│   │   │   ├── UsersPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── services/
│   │   │   └── api.js          # Axios instance
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── railway.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)

### 1. Clone / Extract

```bash
unzip team-task-manager.zip
cd team-task-manager
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your values
npm install
npm run dev
```

Backend runs on: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api (default)
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/teamtaskmanager` |
| `JWT_SECRET` | Secret key for JWT signing | `super_secret_change_me` |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `NODE_ENV` | Environment | `development` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |

---

## Demo Credentials

The **first registered user** is automatically assigned the `admin` role. All subsequent users become `member` by default.

To create demo accounts:

1. Register first user → becomes **Admin**
2. Register second user → becomes **Member**

Or seed with:
```
Admin: admin@demo.com / demo1234
Member: member@demo.com / demo1234
```

---

## API Documentation

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/change-password` | Change password |

### Users (Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get user |
| PUT | `/api/users/:id/role` | Change role |
| PUT | `/api/users/:id/toggle-status` | Activate/deactivate |
| DELETE | `/api/users/:id` | Delete user |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| POST | `/api/projects/:id/members` | Add member |
| DELETE | `/api/projects/:id/members/:userId` | Remove member |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (with filters) |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/project/:projectId` | Tasks for a project |
| GET | `/api/tasks/:id` | Get task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| POST | `/api/tasks/:id/comments` | Add comment |
| DELETE | `/api/tasks/:id/comments/:commentId` | Delete comment |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Full dashboard stats |
| GET | `/api/dashboard/activity` | Activity feed |

---

## Railway Deployment

### Deploy Backend

1. Create a new project on [Railway](https://railway.app)
2. Connect your GitHub repo or upload the `backend/` folder
3. Set environment variables:
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your_production_secret
   NODE_ENV=production
   CLIENT_URL=https://your-frontend.railway.app
   ```
4. Railway auto-detects Node.js and runs `npm start`
5. Note the generated backend URL (e.g. `https://taskmanager-api.railway.app`)

### Deploy Frontend

1. Create another Railway service for the frontend
2. Set environment variable:
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   ```
3. Railway runs `npm run build` and serves `dist/`
4. Install `serve` if needed: add `"serve": "^14.2.0"` to dependencies

### MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free M0 cluster
3. Add database user and whitelist `0.0.0.0/0` for Railway
4. Copy the connection string into `MONGODB_URI`

---

## Screenshots

> Add screenshots of your deployed application here.

- Dashboard overview
- Projects grid
- Project detail with tasks
- Task detail with comments
- Users management (admin)
- Profile settings

---

## License

MIT — free to use and modify for your projects.
