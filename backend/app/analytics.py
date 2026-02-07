from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from .deps import get_db, get_current_user
from .models import Task, User

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview")
def overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    status_data = (
        db.query(Task.status, func.count(Task.id))
        .group_by(Task.status)
        .all()
    )

    priority_data = (
        db.query(Task.priority, func.count(Task.id))
        .group_by(Task.priority)
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
        ]
    }


@router.get("/user-performance")
def user_performance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    data = (
        db.query(Task.created_by, func.count(Task.id))
        .group_by(Task.created_by)
        .all()
    )

    return [
        {"user_id": user_id, "task_count": count}
        for user_id, count in data
    ]


@router.get("/trends")
def task_trends(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    data = (
        db.query(func.date(Task.created_at), func.count(Task.id))
        .group_by(func.date(Task.created_at))
        .all()
    )

    return [
        {"date": str(date), "count": count}
        for date, count in data
    ]

