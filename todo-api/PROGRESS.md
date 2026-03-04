# Todo API — Learning Project

## 👩‍💻 About
A full-stack Todo application built to learn FastAPI and Docker from scratch.
Built by: mariem (mimotomy)

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

---

## 📍 Where I stopped
Step 1 Authentication ✅ Done
Step 2 Database migrations with Alembic ← NEXT

---

## 🗺️ Full Roadmap — What's coming next

### Step 2 — Better Database with Alembic ⏳
- [ ] Install and setup Alembic
- [ ] Create first database migration
- [ ] Learn how to update database without losing data
- [ ] Add relationships between users and todos properly

### Step 3 — Frontend Polish ⏳
- [ ] Connect Next.js to FastAPI properly
- [ ] Add Tailwind CSS for styling
- [ ] Build login and register pages
- [ ] Build todo list page
- [ ] Add loading states and error messages
- [ ] Make it mobile friendly

### Step 4 — Testing ⏳
- [ ] Install pytest
- [ ] Write tests for register endpoint
- [ ] Write tests for login endpoint
- [ ] Write tests for todo endpoints
- [ ] Make sure nothing breaks when adding new features

### Step 5 — Deploy Live ⏳
- [ ] Create account on Railway or Render
- [ ] Set up environment variables for production
- [ ] Deploy backend API live
- [ ] Deploy frontend live
- [ ] Get a real URL anyone can visit
- [ ] Set up HTTPS secure connection

### Step 6 — GitHub Polish ⏳
- [ ] Write a professional README
- [ ] Add project screenshots
- [ ] Add clear description and tech stack
- [ ] Add instructions on how to run the project
- [ ] Clean up commit history

---

## 📁 Project Structure
todo-api/
├── main.py          ← all API routes
├── auth.py          ← JWT authentication logic
├── models.py        ← database tables
├── database.py      ← database connection
├── requirements.txt ← Python packages
└── Dockerfile       ← Docker image recipe

todo-frontend/
├── app/             ← Next.js pages
└── Dockerfile       ← Docker image recipe

docker-compose.yml   ← runs everything together

---

## 🚀 How to run
cd ~
docker compose up --build

---

## 🔗 Links
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Frontend: http://localhost:3000
- Docker Hub: https://hub.docker.com/r/mimotomy/todo-api

---

## 💡 How to continue with Claude
Next time you open a new Claude session just say:
"I am building a Todo API with FastAPI and Docker.
Here is my progress file: [paste this file]
Please continue from Step 2 — Alembic migrations"