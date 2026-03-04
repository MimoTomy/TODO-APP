from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware  # allows browser requests
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db, engine
from models import Base, User, Todo
from auth import hash_password, verify_password, create_access_token, verify_token
from pydantic import BaseModel

# creates all tables in the database on startup
Base.metadata.create_all(bind=engine)

app = FastAPI()

# this fixes CORS — allows the browser to talk to the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # accept requests from any origin
    allow_methods=["*"],   # accept GET, POST, DELETE etc
    allow_headers=["*"],   # accept any headers
)

# tells FastAPI to expect a JWT token in requests
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# ── Schemas ──────────────────────────────────────────

class UserCreate(BaseModel):
    username: str  # must be a string
    password: str  # must be a string

class TodoCreate(BaseModel):
    task: str
    priority: str = "medium"  # ← add this line

# ── Helper ───────────────────────────────────────────

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # runs on every protected route — checks if token is valid
    payload = verify_token(token)  # decode the token
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")  # reject if invalid
    user = db.query(User).filter(User.username == payload.get("sub")).first()  # find user in db
    if not user:
        raise HTTPException(status_code=401, detail="User not found")  # reject if not found
    return user  # return the logged in user

# ── Auth routes ──────────────────────────────────────

@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == user.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")  # reject if taken
    new_user = User(username=user.username, hashed_password=hash_password(user.password))
    db.add(new_user)   # add to database
    db.commit()        # save changes
    return {"message": "User created successfully!"}

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Wrong username or password")  # reject if wrong
    token = create_access_token(data={"sub": user.username})  # create JWT token
    return {"access_token": token, "token_type": "bearer"}  # return token to user

# ── Todo routes ──────────────────────────────────────

@app.get("/todos")
def get_todos(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # only returns todos that belong to the logged in user
    return db.query(Todo).filter(Todo.owner_id == current_user.id).all()


    
@app.post("/todos")
def add_todo(todo: TodoCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_todo = Todo(task=todo.task, owner_id=current_user.id, priority=todo.priority)  # link todo to logged in user
    db.add(new_todo)   # add to database
    db.commit()        # save changes
    db.refresh(new_todo)  # refresh to get the new id
    return new_todo    # ← must have 4 spaces before it!


@app.delete("/todos/{id}")
def delete_todo(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    todo = db.query(Todo).filter(Todo.id == id, Todo.owner_id == current_user.id).first()  # find todo by id AND user
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")  # reject if not found
    db.delete(todo)   # delete from database
    db.commit()       # save changes
    return {"message": "Todo deleted!"}