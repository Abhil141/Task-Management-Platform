from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from .deps import get_db, get_current_user
from .models import Task, User
from .schemas import TaskCreate, TaskUpdate, TaskOut

router = APIRouter(prefix="/tasks", tags=["Tasks"])


# --------------------
# Create Task
# --------------------
@router.post("/", response_model=TaskOut)
def create_task(
    task: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_task = Task(
        **task.dict(),
        created_by=current_user.id
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


# --------------------
# Bulk Create Tasks
# --------------------
@router.post("/bulk", response_model=List[TaskOut])
def bulk_create_tasks(
    tasks: List[TaskCreate],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_tasks = [
        Task(**task.dict(), created_by=current_user.id)
        for task in tasks
    ]
    db.add_all(db_tasks)
    db.commit()
    return db_tasks


# --------------------
# Get All Tasks (filter + search + pagination)
# --------------------
@router.get("/", response_model=List[TaskOut])
def get_tasks(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    query = db.query(Task).filter(Task.is_deleted == False)

    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    if search:
        query = query.filter(Task.title.ilike(f"%{search}%"))

    query = query.offset((page - 1) * limit).limit(limit)
    return query.all()


# --------------------
# Get Single Task
# --------------------
@router.get("/{task_id}", response_model=TaskOut)
def get_task(
    task_id: int,
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.is_deleted == False
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


# --------------------
# Update Task
# --------------------
@router.put("/{task_id}", response_model=TaskOut)
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).get(task_id)

    if not task or task.is_deleted:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    for key, value in task_update.dict(exclude_unset=True).items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)
    return task


# --------------------
# Soft Delete Task
# --------------------
@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).get(task_id)

    if not task or task.is_deleted:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    task.is_deleted = True
    db.commit()

    return {"message": "Task deleted successfully"}
