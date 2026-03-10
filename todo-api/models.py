from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date , Table
from sqlalchemy.orm import relationship
from database import Base

# tags 
todo_tags = Table(
    "todo_tags",
    Base.metadata,
    Column("todo_id", Integer, ForeignKey("todos.id"), primary_key=True),
    Column("tag_id",  Integer, ForeignKey("tags.id"),  primary_key=True),
)


# Users table
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    todos = relationship("Todo", back_populates="owner")
    tags = relationship("Tag", back_populates="owner")

# Todos table
class Todo(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)
    task = Column(String, nullable=False)
    completed = Column(Boolean, default=False)       # renamed from done → completed
    priority = Column(String, default="medium")
    due_date = Column(Date, nullable=True)           # ← new: optional due date
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="todos")
    tags = relationship("Tag", secondary=todo_tags, back_populates="todos")


class Tag(Base):
    __tablename__ = "tags"
    id       = Column(Integer, primary_key=True, index=True)
    name     = Column(String, nullable=False)
    color    = Column(String, default="#6366f1")
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner    = relationship("User", back_populates="tags")
    todos    = relationship("Todo", secondary=todo_tags, back_populates="tags")