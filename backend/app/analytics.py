from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import func, case

from .deps import get_db, get_current_user
from .models import Task, User

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)

# =========================================================
# OVERVIEW STATISTICS (Status + Priority)
# =========================================================
@router.get("/overview", status_code=status.HTTP_200_OK)
def overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    status_data = (
        db.query(Task.status, func.count(Task.id))
        .filter(
            Task.created_by == current_user.id,
            Task.is_deleted == False,
        )
        .group_by(Task.status)
        .all()
    )

    priority_data = (
        db.query(Task.priority, func.count(Task.id))
        .filter(
            Task.created_by == current_user.id,
            Task.is_deleted == False,
        )
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
        ],
    }


# =========================================================
# USER PERFORMANCE METRICS
# =========================================================
@router.get("/user-performance", status_code=status.HTTP_200_OK)
def user_performance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total_tasks = (
        db.query(func.count(Task.id))
        .filter(
            Task.created_by == current_user.id,
            Task.is_deleted == False,
        )
        .scalar()
    )

    completed_tasks = (
        db.query(func.count(Task.id))
        .filter(
            Task.created_by == current_user.id,
            Task.status == "done",
            Task.is_deleted == False,
        )
        .scalar()
    )

    overdue_tasks = (
        db.query(func.count(Task.id))
        .filter(
            Task.created_by == current_user.id,
            Task.is_deleted == False,
            Task.due_date != None,
            Task.due_date < func.current_date(),
            Task.status != "done",
        )
        .scalar()
    )

    completion_rate = (
        round((completed_tasks / total_tasks) * 100, 2)
        if total_tasks > 0
        else 0
    )

    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "completion_rate": completion_rate,
        "overdue_tasks": overdue_tasks,
    }


# =========================================================
# TASK TRENDS OVER TIME (CREATED)
# =========================================================
@router.get("/trends", status_code=status.HTTP_200_OK)
def task_trends(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = (
        db.query(
            func.date(Task.created_at).label("date"),
            func.count(Task.id).label("count"),
        )
        .filter(
            Task.created_by == current_user.id,
            Task.is_deleted == False,
        )
        .group_by(func.date(Task.created_at))
        .order_by(func.date(Task.created_at))
        .all()
    )

    return [
        {"date": str(date), "count": count}
        for date, count in data
    ]


# =========================================================
# COMPLETION TRENDS (CREATED vs COMPLETED)
# =========================================================
@router.get("/completion-trends", status_code=status.HTTP_200_OK)
def completion_trends(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = (
        db.query(
            func.date(Task.created_at).label("date"),
            func.count(Task.id).label("created"),
            func.sum(
                case(
                    (Task.status == "done", 1),
                    else_=0,
                )
            ).label("completed"),
        )
        .filter(
            Task.created_by == current_user.id,
            Task.is_deleted == False,
        )
        .group_by(func.date(Task.created_at))
        .order_by(func.date(Task.created_at))
        .all()
    )

    return [
        {
            "date": str(date),
            "created": created,
            "completed": completed,
        }
        for date, created, completed in data
    ]
