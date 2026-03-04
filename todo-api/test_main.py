import pytest
import os

# set test database BEFORE importing anything else
os.environ["DATABASE_URL"] = "sqlite:///./test.db"

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, get_db
from main import app

# test database setup
engine = create_engine(
    "sqlite:///./test.db",
    connect_args={"check_same_thread": False}
)

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

# ── Tests ────────────────────────────────────────────

def test_register():
    res = client.post("/register", json={
        "username": "testuser",
        "password": "testpass"
    })
    assert res.status_code == 200
    assert res.json() == {"message": "User created successfully!"}

def test_register_duplicate():
    client.post("/register", json={
        "username": "duplicate",
        "password": "testpass"
    })
    res = client.post("/register", json={
        "username": "duplicate",
        "password": "testpass"
    })
    assert res.status_code == 400
    assert res.json()["detail"] == "Username already exists"

def test_login():
    client.post("/register", json={
        "username": "loginuser",
        "password": "testpass"
    })
    res = client.post("/login", data={
        "username": "loginuser",
        "password": "testpass"
    })
    assert res.status_code == 200
    assert "access_token" in res.json()

def test_login_wrong_password():
    client.post("/register", json={
        "username": "wrongpass",
        "password": "testpass"
    })
    res = client.post("/login", data={
        "username": "wrongpass",
        "password": "wrongpassword"
    })
    assert res.status_code == 401

def test_add_and_get_todo():
    client.post("/register", json={
        "username": "todouser",
        "password": "testpass"
    })
    login_res = client.post("/login", data={
        "username": "todouser",
        "password": "testpass"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post("/todos", json={
        "task": "Learn pytest",
        "priority": "high"
    }, headers=headers)
    assert res.status_code == 200
    assert res.json()["task"] == "Learn pytest"
    assert res.json()["priority"] == "high"

    res = client.get("/todos", headers=headers)
    assert res.status_code == 200
    assert len(res.json()) > 0

def test_delete_todo():
    client.post("/register", json={
        "username": "deleteuser",
        "password": "testpass"
    })
    login_res = client.post("/login", data={
        "username": "deleteuser",
        "password": "testpass"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    add_res = client.post("/todos", json={
        "task": "Delete me",
        "priority": "low"
    }, headers=headers)
    todo_id = add_res.json()["id"]

    res = client.delete(f"/todos/{todo_id}", headers=headers)
    assert res.status_code == 200
    assert res.json() == {"message": "Todo deleted!"}