from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc
from typing import List, Optional
from pydantic import BaseModel
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.encoders import jsonable_encoder
import csv
import io

from .deps import get_db, get_current_user
from .models import Task, User
from .schemas import TaskCreate, TaskUpdate, TaskOut

router = APIRouter(prefix="/tasks", tags=["Tasks"])


# --------------------
# Schemas
# --------------------
class BulkTaskCreate(BaseModel):
    tasks: List[TaskCreate]


# --------------------
# Create Task
# --------------------
@router.post("/", response_model=TaskOut)
def create_task(
    task: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_task = Task(
        **task.dict(),
        created_by=current_user.id,
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
    payload: BulkTaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_tasks = [
        Task(**task.dict(), created_by=current_user.id)
        for task in payload.tasks
    ]
    db.add_all(db_tasks)
    db.commit()
    return db_tasks


# --------------------
# Get All Tasks (filter + search + sort + pagination)
# --------------------
@router.get("/", response_model=List[TaskOut])
def get_tasks(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("created_at"),
    order: str = Query("desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Task).filter(
        Task.is_deleted == False,
        Task.created_by == current_user.id,
    )

    # -------- Filters --------
    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    if search:
        query = query.filter(Task.title.ilike(f"%{search}%"))

    # -------- Sorting (SAFE) --------
    SORTABLE_FIELDS = {
        "created_at": Task.created_at,
        "priority": Task.priority,
        "status": Task.status,
        "due_date": Task.due_date,
        "title": Task.title,
    }

    sort_column = SORTABLE_FIELDS.get(sort_by)
    if not sort_column:
        raise HTTPException(status_code=400, detail="Invalid sort field")

    if order == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))

    # -------- Pagination --------
    return (
        query
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )


# --------------------
# EXPORT TASKS
# --------------------
@router.get("/export")
def export_tasks(
    format: str = Query("csv", pattern="^(csv|json)$"),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Task).filter(
        Task.is_deleted == False,
        Task.created_by == current_user.id,
    )

    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    if search:
        query = query.filter(Task.title.ilike(f"%{search}%"))

    tasks = query.all()

    if format == "json":
        return JSONResponse(
            content=jsonable_encoder(tasks),
            media_type="application/json"
)


    buffer = io.StringIO()
    writer = csv.writer(buffer)

    writer.writerow([
        "id",
        "title",
        "description",
        "status",
        "priority",
        "due_date",
        "tags",
        "assigned_to",
        "created_at",
    ])

    for task in tasks:
        writer.writerow([
            task.id,
            task.title,
            task.description or "",
            task.status,
            task.priority,
            task.due_date.isoformat() if task.due_date else "",
            task.tags or "",
            task.assigned_to or "",
            task.created_at.isoformat(),
        ])

    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=tasks.csv"},
    )


# --------------------
# Get Single Task
# --------------------
@router.get("/{task_id}", response_model=TaskOut)
def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.is_deleted == False,
        Task.created_by == current_user.id,
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
    db: Session = Depends(get_db),
):
    task = db.get(Task, task_id)

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
    db: Session = Depends(get_db),
):
    task = db.get(Task, task_id)

    if not task or task.is_deleted:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    task.is_deleted = True
    db.commit()

    return {"message": "Task deleted successfully"}
