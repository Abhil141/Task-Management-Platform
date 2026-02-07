from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .deps import get_db, get_current_user
from .models import Comment, Task, User

router = APIRouter(prefix="/comments", tags=["Comments"])


@router.post("/task/{task_id}")
def add_comment(
    task_id: int,
    content: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    comment = Comment(
        content=content,
        task_id=task_id,
        user_id=current_user.id
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return comment


@router.get("/task/{task_id}")
def get_comments(
    task_id: int,
    db: Session = Depends(get_db)
):
    return (
        db.query(Comment)
        .filter(Comment.task_id == task_id)
        .all()
    )


@router.delete("/{comment_id}")
def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    comment = db.query(Comment).get(comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    # Optional ownership check (good signal)
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    db.delete(comment)
    db.commit()
    return {"message": "comment deleted"}
