from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

# Users table
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)       # unique ID for each user
    username = Column(String, unique=True, index=True)        # username must be unique
    hashed_password = Column(String)                          # never store plain passwords!
    todos = relationship("Todo", back_populates="owner")      # one user has many todos

# Todos table
class Todo(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)        # unique ID for each todo
    task = Column(String, nullable=False)                     # the todo text
    done = Column(Boolean, default=False)                     # is it done or not
    owner_id = Column(Integer, ForeignKey("users.id"))        # links todo to a user
    priority = Column(String, default="medium")               # priority of the todo ← new!
    owner = relationship("User", back_populates="todos")      # todo belongs to one user