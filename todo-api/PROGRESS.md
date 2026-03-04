# Todo APP — Learning Project

## 👩‍💻 About
A full-stack Todo application built to learn FastAPI and Docker from scratch.
Built by: Mariem (MimoTomy)
GitHub: https://github.com/MimoTomy/TODO-APP

## ✅ What I built so far

### Phase 1 — FastAPI ✅
- Built a basic Todo API with GET, POST, DELETE routes
- Learned about routes, Pydantic validation, auto docs at /docs

### Phase 2 — Docker ✅
- Wrote a Dockerfile for the FastAPI app
- Built and ran a Docker image
- Pushed image to Docker Hub (mimotomy/todo-api)

### Phase 3 — Database ✅
- Added PostgreSQL with Docker Compose
- Connected FastAPI to PostgreSQL using SQLAlchemy
- Todos now saved permanently in the database

### Phase 4 — Frontend ✅
- Next.js frontend running in Docker
- Connected to the backend API

### Phase 5 — GitHub ✅
- Pushed code to GitHub

### Phase 6 — Docker Hub ✅
- Pushed Docker image to Docker Hub

### Phase 7 — Full Docker Compose ✅
- One command runs everything together
- docker compose up --build

### Step 1 — Authentication ✅
- Added JWT token authentication
- User register and login
- Each user sees only their own todos
- Passwords are hashed with bcrypt
- Auto login after register

### Step 2 — Database Migrations with Alembic ✅
- Installed and configured Alembic
- Created first migration for users and todos tables
- Added priority column to todos using migration
- Learned how to update database without losing data
- Flow: edit models.py → alembic revision --autogenerate → alembic upgrade head

### Step 3 — Frontend Polish ✅
- Built login page with JWT token saved in localStorage
- Built register page with auto login after register
- Updated todos page with JWT authentication
- Added priority selector (low, medium, high)
- Added logout button
- Auto redirect to login if not logged in

### Step 4 — Testing with Pytest ✅
- Installed pytest and httpx
- Created test_main.py with 6 tests
- Used SQLite as separate test database
- Tests: register, duplicate register, login, wrong password, add todo, delete todo
- Fixed database.py to use fallback URL for local testing
- All 6 tests passing ✅

### Step 5 — GitHub ✅
- Created monorepo TODO-APP with both frontend and backend
- Pushed everything to github.com/MimoTomy/TODO-APP
- Fixed submodule issue with todo-api

### Step 6 — README ✅
- Written professional README with badges
- Includes project structure, how to run, API endpoints, tech stack

---

## 📍 Where I stopped
Step 6 README ✅ Done
Step 7 — Deploy Live ← NEXT

---

## 🗺️ Full Roadmap — What's coming next

### Step 7 — Deploy Live ⏳
- [ ] Create account on Railway or Render
- [ ] Set up environment variables for production
- [ ] Deploy backend API live
- [ ] Deploy frontend live
- [ ] Get a real URL anyone can visit
- [ ] Set up HTTPS secure connection

### Step 8 — Improve the App ⏳
- [ ] Mark todo as complete (click to check off)
- [ ] Edit a todo (change the task text)
- [ ] Due date for each todo
- [ ] Filter todos (all / active / completed)
- [ ] Categories/tags (work, personal, shopping)
- [ ] Search todos
- [ ] Sort by priority or date
- [ ] Dark mode 🌙

---

## 📁 Project Structure
TODO-APP/
├── todo-api/
│   ├── main.py          ← all API routes
│   ├── auth.py          ← JWT authentication logic
│   ├── models.py        ← database tables
│   ├── database.py      ← database connection
│   ├── test_main.py     ← pytest tests
│   ├── requirements.txt ← Python packages
│   ├── alembic/         ← database migrations
│   └── Dockerfile       ← Docker image recipe
├── todo-frontend/
│   ├── app/
│   │   ├── page.js          ← todos page
│   │   ├── login/page.js    ← login page
│   │   └── register/page.js ← register page
│   └── Dockerfile
└── docker-compose.yml   ← runs everything together

---

## 🚀 How to run
cd ~/TODO-APP
docker compose up --build

---

## 🔗 Links
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Frontend: http://localhost:3000
- GitHub: https://github.com/MimoTomy/TODO-APP
- Docker Hub: https://hub.docker.com/r/mimotomy/todo-api

---

## 💡 How to continue with Claude
Next time you open a new Claude session just say:
"I am building a full stack Todo App with FastAPI, Next.js, PostgreSQL and Docker.
Here is my progress file: [paste this file]
Please continue from Step 7 — Deploy Live"