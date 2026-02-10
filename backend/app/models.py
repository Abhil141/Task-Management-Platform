from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Boolean,
    ForeignKey
)
from sqlalchemy.orm import relationship
from datetime import datetime

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)

    # Relationships 
    created_tasks = relationship(
        "Task",
        foreign_keys="Task.created_by",
        back_populates="creator"
    )
    assigned_tasks = relationship(
        "Task",
        foreign_keys="Task.assigned_to",
        back_populates="assignee"
    )
    comments = relationship("Comment", back_populates="user")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text)
    status = Column(String, index=True, nullable=False)
    priority = Column(String, index=True, nullable=False)
    due_date = Column(DateTime)
    tags = Column(String)

    assigned_to = Column(Integer, ForeignKey("users.id"))
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    creator = relationship(
        "User",
        foreign_keys=[created_by],
        back_populates="created_tasks"
    )
    assignee = relationship(
        "User",
        foreign_keys=[assigned_to],
        back_populates="assigned_tasks"
    )
    comments = relationship(
        "Comment",
        back_populates="task",
        cascade="all, delete-orphan"
    )
    files = relationship(
        "File",
        back_populates="task",
        cascade="all, delete-orphan"
    )


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True)
    content = Column(Text, nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    task = relationship("Task", back_populates="comments")
    user = relationship("User", back_populates="comments")


class File(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True)
    filename = Column(String, nullable=False)
    path = Column(String, nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)

    # Relationships
    task = relationship("Task", back_populates="files")
