from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .deps import get_db, get_current_user
from .models import Comment, Task, User
from .schemas import CommentCreate, CommentUpdate, CommentOut

router = APIRouter(prefix="/comments", tags=["Comments"])


# --------------------
# Add Comment to Task
# --------------------
@router.post("/task/{task_id}", response_model=CommentOut)
def add_comment(
    task_id: int,
    payload: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = db.get(Task, task_id)
    if not task or task.is_deleted:
        raise HTTPException(status_code=404, detail="Task not found")

    # ensure user can comment only on own tasks
    if task.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    comment = Comment(
        content=payload.content,
        task_id=task_id,
        user_id=current_user.id,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


# --------------------
# Get Comments for Task
# --------------------
@router.get("/task/{task_id}", response_model=List[CommentOut])
def get_comments(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = db.get(Task, task_id)
    if not task or task.is_deleted:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    return (
        db.query(Comment)
        .filter(Comment.task_id == task_id)
        .order_by(Comment.created_at.asc())
        .all()
    )


# --------------------
# Update Comment
# --------------------
@router.put("/{comment_id}", response_model=CommentOut)
def update_comment(
    comment_id: int,
    payload: CommentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    comment = db.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    comment.content = payload.content
    db.commit()
    db.refresh(comment)
    return comment


# --------------------
# Delete Comment
# --------------------
@router.delete("/{comment_id}")
def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    comment = db.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    db.delete(comment)
    db.commit()
    return {"message": "Comment deleted successfully"}
