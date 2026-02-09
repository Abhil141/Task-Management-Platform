from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from .deps import get_db, get_current_user
from .models import Task, User

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


# --------------------
# Overview Statistics
# --------------------
@router.get(
    "/overview",
    status_code=status.HTTP_200_OK,
)
def overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    status_data = (
        db.query(
            Task.status,
            func.count(Task.id).label("count"),
        )
        .filter(Task.is_deleted == False)
        .group_by(Task.status)
        .order_by(Task.status)
        .all()
    )

    priority_data = (
        db.query(
            Task.priority,
            func.count(Task.id).label("count"),
        )
        .filter(Task.is_deleted == False)
        .group_by(Task.priority)
        .order_by(Task.priority)
        .all()
    )

    return {
        "by_status": [
            {"status": status, "count": count}
            for status, count in status_data
        ],
        "by_priority": [
            {"priority": priority, "count": count}
            for priority, count in priority_data
        ],
    }


# --------------------
# User Performance
# --------------------
@router.get(
    "/user-performance",
    status_code=status.HTTP_200_OK,
)
def user_performance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = (
        db.query(
            Task.created_by.label("user_id"),
            func.count(Task.id).label("task_count"),
        )
        .filter(Task.is_deleted == False)
        .group_by(Task.created_by)
        .order_by(func.count(Task.id).desc())
        .all()
    )

    return [
        {"user_id": user_id, "task_count": task_count}
        for user_id, task_count in data
    ]


# --------------------
# Task Trends Over Time
# --------------------
@router.get(
    "/trends",
    status_code=status.HTTP_200_OK,
)
def task_trends(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = (
        db.query(
            func.date(Task.created_at).label("date"),
            func.count(Task.id).label("count"),
        )
        .filter(Task.is_deleted == False)
        .group_by(func.date(Task.created_at))
        .order_by(func.date(Task.created_at))
        .all()
    )

    return [
        {
            "date": str(date),  # SQLite returns string → safe
            "count": count,
        }
        for date, count in data
    ]
