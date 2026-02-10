from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from uuid import uuid4
from typing import List
import os
import shutil
from pydantic import BaseModel

from .deps import get_db, get_current_user
from .models import File as FileModel, Task, User
from .utils import validate_file

router = APIRouter(prefix="/files", tags=["Files"])

UPLOAD_DIR = "uploads"


# --------------------
# Schemas
# --------------------
class FileOut(BaseModel):
    id: int
    filename: str
    task_id: int

    class Config:
        from_attributes = True


# --------------------
# Upload file to task
# --------------------
@router.post("/task/{task_id}", response_model=FileOut)
def upload_file(
    task_id: int,
    upload: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    validate_file(upload)

    task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.is_deleted == False,
            Task.created_by == current_user.id,
        )
        .first()
    )

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    stored_filename = f"{uuid4()}_{upload.filename}"
    file_path = os.path.join(UPLOAD_DIR, stored_filename)

    try:
        with open(file_path, "wb") as f:
            shutil.copyfileobj(upload.file, f)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to save file")

    file_db = FileModel(
        filename=upload.filename,
        path=file_path,
        task_id=task_id,
    )

    db.add(file_db)
    db.commit()
    db.refresh(file_db)

    return file_db


# --------------------
# List files for task
# --------------------
@router.get("/task/{task_id}", response_model=List[FileOut])
def get_files_for_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.is_deleted == False,
            Task.created_by == current_user.id,
        )
        .first()
    )

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    files = (
        db.query(FileModel)
        .filter(FileModel.task_id == task_id)
        .order_by(FileModel.id.desc())
        .all()
    )

    return files


# --------------------
# Download file
# --------------------
@router.get("/{file_id}")
def download_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    file = db.get(FileModel, file_id)

    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    task = (
        db.query(Task)
        .filter(
            Task.id == file.task_id,
            Task.created_by == current_user.id,
            Task.is_deleted == False,
        )
        .first()
    )

    if not task:
        raise HTTPException(status_code=403, detail="Not allowed")

    if not os.path.exists(file.path):
        raise HTTPException(status_code=404, detail="File missing on server")

    return FileResponse(
        path=file.path,
        filename=file.filename,
        media_type="application/octet-stream",
    )


# --------------------
# Delete file
# --------------------
@router.delete("/{file_id}")
def delete_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    file = db.get(FileModel, file_id)

    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    task = (
        db.query(Task)
        .filter(
            Task.id == file.task_id,
            Task.created_by == current_user.id,
            Task.is_deleted == False,
        )
        .first()
    )

    if not task:
        raise HTTPException(status_code=403, detail="Not allowed")

    if os.path.exists(file.path):
        os.remove(file.path)

    db.delete(file)
    db.commit()

    return {"message": "File deleted successfully"}
