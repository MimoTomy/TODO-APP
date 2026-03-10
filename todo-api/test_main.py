import pytest
import os
os.environ["DATABASE_URL"] = "sqlite:///./test.db"

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, get_db
from main import app

engine = create_engine("sqlite:///./test.db", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

# ── Helpers ───────────────────────────────────────────

def register_and_login(username):
    client.post("/register", json={"username": username, "password": "testpass"})
    res = client.post("/login", data={"username": username, "password": "testpass"})
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

# ── Auth tests ────────────────────────────────────────

def test_register():
    res = client.post("/register", json={"username": "testuser", "password": "testpass"})
    assert res.status_code == 200
    assert res.json() == {"message": "User created successfully!"}

def test_register_duplicate():
    client.post("/register", json={"username": "duplicate", "password": "testpass"})
    res = client.post("/register", json={"username": "duplicate", "password": "testpass"})
    assert res.status_code == 400
    assert res.json()["detail"] == "Username already exists"

def test_login():
    client.post("/register", json={"username": "loginuser", "password": "testpass"})
    res = client.post("/login", data={"username": "loginuser", "password": "testpass"})
    assert res.status_code == 200
    assert "access_token" in res.json()

def test_login_wrong_password():
    client.post("/register", json={"username": "wrongpass", "password": "testpass"})
    res = client.post("/login", data={"username": "wrongpass", "password": "wrongpassword"})
    assert res.status_code == 401

# ── Todo tests ────────────────────────────────────────

def test_add_and_get_todo():
    headers = register_and_login("todouser")
    res = client.post("/todos", json={"task": "Learn pytest", "priority": "high"}, headers=headers)
    assert res.status_code == 200
    assert res.json()["task"] == "Learn pytest"
    assert res.json()["priority"] == "high"
    assert res.json()["completed"] == False       # renamed from done

    res = client.get("/todos", headers=headers)
    assert res.status_code == 200
    assert len(res.json()) > 0

def test_add_todo_with_due_date():             # ← new
    headers = register_and_login("duedateuser")
    res = client.post("/todos", json={
        "task": "Finish project",
        "priority": "high",
        "due_date": "2025-12-31"
    }, headers=headers)
    assert res.status_code == 200
    assert res.json()["due_date"] == "2025-12-31"

def test_update_todo():                        # ← new
    headers = register_and_login("updateuser")
    add_res = client.post("/todos", json={"task": "Old task", "priority": "low"}, headers=headers)
    todo_id = add_res.json()["id"]

    res = client.put(f"/todos/{todo_id}", json={"task": "Updated task", "priority": "high"}, headers=headers)
    assert res.status_code == 200
    assert res.json()["task"] == "Updated task"
    assert res.json()["priority"] == "high"

def test_toggle_complete():                    # ← new
    headers = register_and_login("completeuser")
    add_res = client.post("/todos", json={"task": "Toggle me", "priority": "medium"}, headers=headers)
    todo_id = add_res.json()["id"]

    res = client.patch(f"/todos/{todo_id}/complete", headers=headers)
    assert res.status_code == 200
    assert res.json()["completed"] == True     # was False, now True

    res = client.patch(f"/todos/{todo_id}/complete", headers=headers)
    assert res.json()["completed"] == False    # toggled back

def test_delete_todo():
    headers = register_and_login("deleteuser")
    add_res = client.post("/todos", json={"task": "Delete me", "priority": "low"}, headers=headers)
    todo_id = add_res.json()["id"]

    res = client.delete(f"/todos/{todo_id}", headers=headers)
    assert res.status_code == 200
    assert res.json() == {"message": "Todo deleted!"}


# ── Tag tests ─────────────────────────────────────────

def test_create_and_get_tags():
    headers = register_and_login("taguser")
    res = client.post("/tags", json={"name": "Work", "color": "#FF5733"}, headers=headers)
    assert res.status_code == 200
    assert res.json()["name"] == "Work"
    assert res.json()["color"] == "#FF5733"

    res = client.get("/tags", headers=headers)
    assert res.status_code == 200
    assert len(res.json()) == 1

def test_add_and_remove_tag_from_todo():
    headers = register_and_login("taguser2")
    todo = client.post("/todos", json={"task": "Tagged todo", "priority": "low"}, headers=headers).json()
    tag  = client.post("/tags",  json={"name": "Personal", "color": "#52B788"}, headers=headers).json()

    res = client.post(f"/todos/{todo['id']}/tags/{tag['id']}", headers=headers)
    assert res.status_code == 200

    todos = client.get("/todos", headers=headers).json()
    assert any(t["name"] == "Personal" for t in todos[0]["tags"])

    res = client.delete(f"/todos/{todo['id']}/tags/{tag['id']}", headers=headers)
    assert res.status_code == 200

def test_filter_todos_by_tag():
    headers = register_and_login("filteruser")
    todo = client.post("/todos", json={"task": "Work task", "priority": "high"}, headers=headers).json()
    tag  = client.post("/tags",  json={"name": "Work", "color": "#333"}, headers=headers).json()
    client.post(f"/todos/{todo['id']}/tags/{tag['id']}", headers=headers)

    res = client.get("/todos?tag=Work", headers=headers)
    assert res.status_code == 200
    assert len(res.json()) == 1
    assert res.json()[0]["task"] == "Work task"

def test_delete_tag():
    headers = register_and_login("deltaguser")
    tag = client.post("/tags", json={"name": "ToDelete", "color": "#000"}, headers=headers).json()
    res = client.delete(f"/tags/{tag['id']}", headers=headers)
    assert res.status_code == 200
    assert res.json() == {"message": "Tag deleted!"}