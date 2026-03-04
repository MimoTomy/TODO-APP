# 📝 TODO APP

A full-stack Todo application built with FastAPI, Next.js, PostgreSQL, and Docker.

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker)

---

## ✨ Features

- ✅ User register and login
- ✅ JWT authentication
- ✅ Create, view, and delete todos
- ✅ Todo priority (low, medium, high)
- ✅ Each user sees only their own todos
- ✅ Passwords hashed with bcrypt
- ✅ Database migrations with Alembic
- ✅ Fully containerized with Docker

---

## 🏗️ Project Structure
```
TODO-APP/
├── todo-api/               # FastAPI backend
│   ├── main.py             # API routes
│   ├── auth.py             # JWT authentication
│   ├── models.py           # Database models
│   ├── database.py         # Database connection
│   ├── test_main.py        # Pytest tests
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile
├── todo-frontend/          # Next.js frontend
│   ├── app/
│   │   ├── page.js         # Todos page
│   │   ├── login/page.js   # Login page
│   │   └── register/page.js # Register page
│   └── Dockerfile
└── docker-compose.yml      # Runs everything together
```

---

## 🚀 How to Run

### Prerequisites
- Docker
- Docker Compose

### Steps

1. Clone the repository:
```bash
git clone https://github.com/MimoTomy/TODO-APP.git
cd TODO-APP
```

2. Run everything with one command:
```bash
docker compose up --build
```

3. Open your browser:
- Frontend → http://localhost:3000
- Backend API docs → http://localhost:8000/docs

---

## 🔗 API Endpoints

| Method | Endpoint | Description | Auth required |
|--------|----------|-------------|---------------|
| POST | /register | Create a new account | ❌ |
| POST | /login | Login and get JWT token | ❌ |
| GET | /todos | Get all your todos | ✅ |
| POST | /todos | Create a new todo | ✅ |
| DELETE | /todos/{id} | Delete a todo | ✅ |

---

## 🧪 Running Tests
```bash
cd todo-api
source venv/bin/activate
pytest test_main.py -v
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | FastAPI (Python) |
| Frontend | Next.js (React) |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |
| Migrations | Alembic |
| Container | Docker + Docker Compose |
| Testing | Pytest |

---

## 👩‍💻 Author

Built by **Mariem** — learning full stack development from scratch 🚀