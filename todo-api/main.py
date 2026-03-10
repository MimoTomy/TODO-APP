from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db, engine
from models import Base, User, Todo
from auth import hash_password, verify_password, create_access_token, verify_token
from pydantic import BaseModel
from typing import Optional
from datetime import date

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# ── Schemas ───────────────────────────────────────────

class UserCreate(BaseModel):
    username: str
    password: str

class TodoCreate(BaseModel):
    task: str
    priority: str = "medium"
    due_date: Optional[date] = None          # ← new: optional due date (e.g. "2025-12-31")

class TodoUpdate(BaseModel):                 # ← new: for editing a todo
    task: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[date] = None

# ── Helper ────────────────────────────────────────────

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.username == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# ── Auth routes ───────────────────────────────────────

@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == user.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    new_user = User(username=user.username, hashed_password=hash_password(user.password))
    db.add(new_user)
    db.commit()
    return {"message": "User created successfully!"}

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Wrong username or password")
    token = create_access_token(data={"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}

# ── Todo routes ───────────────────────────────────────

@app.get("/todos")
def get_todos(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Todo).filter(Todo.owner_id == current_user.id).all()

@app.post("/todos")
def add_todo(todo: TodoCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_todo = Todo(
        task=todo.task,
        priority=todo.priority,
        due_date=todo.due_date,              # ← new
        owner_id=current_user.id
    )
    db.add(new_todo)
    db.commit()
    db.refresh(new_todo)
    return new_todo

@app.put("/todos/{id}")                      # ← new: edit task, priority, or due_date
def update_todo(id: int, updates: TodoUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    todo = db.query(Todo).filter(Todo.id == id, Todo.owner_id == current_user.id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    if updates.task is not None:
        todo.task = updates.task
    if updates.priority is not None:
        todo.priority = updates.priority
    if updates.due_date is not None:
        todo.due_date = updates.due_date
    db.commit()
    db.refresh(todo)
    return todo

@app.patch("/todos/{id}/complete")           # ← new: toggle completed on/off
def toggle_complete(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    todo = db.query(Todo).filter(Todo.id == id, Todo.owner_id == current_user.id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    todo.completed = not todo.completed      # flip true ↔ false
    db.commit()
    db.refresh(todo)
    return todo

@app.delete("/todos/{id}")
def delete_todo(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    todo = db.query(Todo).filter(Todo.id == id, Todo.owner_id == current_user.id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    db.delete(todo)
    db.commit()
    return {"message": "Todo deleted!"}