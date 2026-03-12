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
- ✅ Create, view, edit, and delete todos
- ✅ Mark todos as complete / incomplete (toggle)
- ✅ Todo priority (low, medium, high)
- ✅ Due dates for todos
- ✅ Filter todos by All / Active / Completed
- ✅ Progress bar showing completion status
- ✅ Dark mode and Light mode toggle (saved per user)
- ✅ Each user sees only their own todos
- ✅ Passwords hashed with bcrypt
- ✅ Database migrations with Alembic
- ✅ Fully containerized with Docker
- ✅ Pytest tests for all endpoints
- ✅ Tags & Categories (Phase 1)
- ✅ Search & Smart Filters (Phase 2)
- ✅ Subtasks (Phase 3)

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
│   ├── alembic/            # Database migrations
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
| GET | /todos | Get all your todos (supports ?tag= and ?search=) | ✅ |
| POST | /todos | Create a new todo | ✅ |
| PUT | /todos/{id} | Edit a todo | ✅ |
| PATCH | /todos/{id}/complete | Toggle todo complete/incomplete | ✅ |
| DELETE | /todos/{id} | Delete a todo | ✅ |
| POST | /todos/{id}/subtasks | Add a subtask to a todo | ✅ |
| PATCH | /todos/{id}/subtasks/{subtask_id}/complete | Toggle subtask complete | ✅ |
| DELETE | /todos/{id}/subtasks/{subtask_id} | Delete a subtask | ✅ |
| POST | /tags | Create a tag | ✅ |
| GET | /tags | Get all your tags | ✅ |
| DELETE | /tags/{id} | Delete a tag | ✅ |
| POST | /todos/{id}/tags/{tag_id} | Add a tag to a todo | ✅ |
| DELETE | /todos/{id}/tags/{tag_id} | Remove a tag from a todo | ✅ |

---

## 🗄️ Database Migrations

```bash
# Generate a new migration after changing models.py
docker compose exec backend alembic revision --autogenerate -m "your message"

# Apply all pending migrations
docker compose exec backend alembic upgrade head

# If migrations are out of sync, stamp the last known good revision
docker compose exec backend alembic stamp <revision_id>

# Or fix directly in the DB
docker compose exec db psql -U postgres -d todos -c "UPDATE alembic_version SET version_num = '<revision_id>';"
```

### Migration History
```
<base> → 213f38fd01d3   create users and todos tables
213f38fd01d3 → 5d838fc87612   add priority column to todos
5d838fc87612 → 0814d8ba6e1b   add due_date and rename done to completed
0814d8ba6e1b → 7c4d553231b8   add tags and subtasks (parent_id)
```

---

## 🧪 Running Tests

```bash
docker compose exec backend pytest test_main.py -v
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

## 📦 Phases Completed

| Phase | Feature | Status |
|-------|---------|--------|
| Phase 1 | Tags & Categories | ✅ Done |
| Phase 2 | Search & Smart Filters | ✅ Done |
| Phase 3 | Subtasks | ✅ Done |
| Phase 4 | Analytics Dashboard | 🔜 Next |
| Phase 5 | Advanced Security (refresh tokens, rate limiting) | 🔜 Planned |
| Phase 6 | Collaboration & WebSockets | 🔜 Planned |
| Phase 7 | AI Smart Suggestions | 🔜 Planned |
| Phase 8 | CI/CD & Deployment | 🔜 Planned |
| Phase 9 | Mobile App (React Native) | 🔜 Planned |

---

## 👩‍💻 Author

Built by **Mariem** — learning full stack development from scratch 🚀