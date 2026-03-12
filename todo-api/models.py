from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, Table
from sqlalchemy.orm import relationship
from database import Base

# ── Association table for many-to-many todos <-> tags ──
todo_tags = Table(
    "todo_tags",
    Base.metadata,
    Column("todo_id", Integer, ForeignKey("todos.id"), primary_key=True),
    Column("tag_id",  Integer, ForeignKey("tags.id"),  primary_key=True),
)

# ── Users ──────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"
    id              = Column(Integer, primary_key=True, index=True)
    username        = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    todos           = relationship("Todo", back_populates="owner")
    tags            = relationship("Tag", back_populates="owner")

# ── Todos ──────────────────────────────────────────────
class Todo(Base):
    __tablename__ = "todos"
    id        = Column(Integer, primary_key=True, index=True)
    task      = Column(String, nullable=False)
    completed = Column(Boolean, default=False)
    priority  = Column(String, default="medium")
    due_date  = Column(Date, nullable=True)
    owner_id  = Column(Integer, ForeignKey("users.id"))
    parent_id = Column(Integer, ForeignKey("todos.id"), nullable=True)

    owner = relationship("User", back_populates="todos")

    # Many-to-many with tags using explicit back_populates on both sides
    tags = relationship("Tag", secondary=todo_tags, back_populates="todos")

    # Self-referencing: one todo has many subtasks
    subtasks = relationship(
        "Todo",
        backref="parent",
        foreign_keys=[parent_id],
        remote_side="Todo.id",
    )

# ── Tags ───────────────────────────────────────────────
class Tag(Base):
    __tablename__ = "tags"
    id       = Column(Integer, primary_key=True, index=True)
    name     = Column(String, nullable=False)
    color    = Column(String, default="#6366f1")
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner    = relationship("User", back_populates="tags")

    # ← back_populates="tags" matches Todo.tags — this is correct
    todos = relationship("Todo", secondary=todo_tags, back_populates="tags")