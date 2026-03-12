from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db, engine
from models import Base, User, Todo, Tag
from auth import hash_password, verify_password, create_access_token, verify_token
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
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
    due_date: Optional[date] = None

class TodoUpdate(BaseModel):
    task: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[date] = None

class TagCreate(BaseModel):
    name: str
    color: str = "#6366f1"

class TagOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    color: str

class SubtaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    task: str
    completed: bool
    priority: str
    due_date: Optional[date]

class TodoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    task: str
    completed: bool
    priority: str
    due_date: Optional[date]
    tags: List[TagOut] = []
    subtasks: List[SubtaskOut] = []


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

@app.get("/todos", response_model=List[TodoOut])
def get_todos(
    tag: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Todo).filter(
        Todo.owner_id == current_user.id,
        Todo.parent_id == None
    )
    if tag:
        query = query.filter(Todo.tags.any(Tag.name == tag))
    if search:
        query = query.filter(Todo.task.ilike(f"%{search}%"))
    todos = query.all()
    # ← manually load subtasks to avoid lazy loading issues
    for todo in todos:
        todo.__dict__["subtasks"] = db.query(Todo).filter(Todo.parent_id == todo.id).all()
    return todos

@app.post("/todos")
def add_todo(todo: TodoCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_todo = Todo(
        task=todo.task,
        priority=todo.priority,
        due_date=todo.due_date,
        owner_id=current_user.id
    )
    db.add(new_todo)
    db.commit()
    db.refresh(new_todo)
    return new_todo

@app.put("/todos/{id}")
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

@app.patch("/todos/{id}/complete")
def toggle_complete(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    todo = db.query(Todo).filter(Todo.id == id, Todo.owner_id == current_user.id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    todo.completed = not todo.completed
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

# ── Subtask routes ────────────────────────────────────

@app.post("/todos/{id}/subtasks", response_model=SubtaskOut)
def add_subtask(
    id: int,
    subtask: TodoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    parent = db.query(Todo).filter(Todo.id == id, Todo.owner_id == current_user.id).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Todo not found")
    new_subtask = Todo(
        task=subtask.task,
        priority=subtask.priority,
        due_date=subtask.due_date,
        owner_id=current_user.id,
        parent_id=id
    )
    db.add(new_subtask)
    db.commit()
    db.refresh(new_subtask)
    return new_subtask

@app.patch("/todos/{id}/subtasks/{subtask_id}/complete")
def toggle_subtask_complete(
    id: int,
    subtask_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    subtask = db.query(Todo).filter(
        Todo.id == subtask_id,
        Todo.parent_id == id,
        Todo.owner_id == current_user.id
    ).first()
    if not subtask:
        raise HTTPException(status_code=404, detail="Subtask not found")
    subtask.completed = not subtask.completed
    db.commit()
    db.refresh(subtask)
    return subtask

@app.delete("/todos/{id}/subtasks/{subtask_id}")
def delete_subtask(
    id: int,
    subtask_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    subtask = db.query(Todo).filter(
        Todo.id == subtask_id,
        Todo.parent_id == id,
        Todo.owner_id == current_user.id
    ).first()
    if not subtask:
        raise HTTPException(status_code=404, detail="Subtask not found")
    db.delete(subtask)
    db.commit()
    return {"message": "Subtask deleted!"}

# ── Tag routes ────────────────────────────────────────

@app.post("/tags", response_model=TagOut)
def create_tag(tag: TagCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_tag = Tag(name=tag.name, color=tag.color, owner_id=current_user.id)
    db.add(new_tag)
    db.commit()
    db.refresh(new_tag)
    return new_tag

@app.get("/tags", response_model=List[TagOut])
def get_tags(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Tag).filter(Tag.owner_id == current_user.id).all()

@app.delete("/tags/{id}")
def delete_tag(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tag = db.query(Tag).filter(Tag.id == id, Tag.owner_id == current_user.id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    db.delete(tag)
    db.commit()
    return {"message": "Tag deleted!"}

@app.post("/todos/{id}/tags/{tag_id}")
def add_tag_to_todo(id: int, tag_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    todo = db.query(Todo).filter(Todo.id == id, Todo.owner_id == current_user.id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    tag = db.query(Tag).filter(Tag.id == tag_id, Tag.owner_id == current_user.id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    if tag in todo.tags:
        raise HTTPException(status_code=400, detail="Tag already added")
    todo.tags.append(tag)
    db.commit()
    return {"message": "Tag added to todo!"}

@app.delete("/todos/{id}/tags/{tag_id}")
def remove_tag_from_todo(id: int, tag_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    todo = db.query(Todo).filter(Todo.id == id, Todo.owner_id == current_user.id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    tag = db.query(Tag).filter(Tag.id == tag_id, Tag.owner_id == current_user.id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    if tag not in todo.tags:
        raise HTTPException(status_code=400, detail="Tag not on this todo")
    todo.tags.remove(tag)
    db.commit()
    return {"message": "Tag removed from todo!"}