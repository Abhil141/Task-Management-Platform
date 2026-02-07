from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
import os
from uuid import uuid4

from .deps import get_db, get_current_user
from .models import File as FileModel, User
from .utils import validate_file

router = APIRouter(prefix="/files", tags=["Files"])

UPLOAD_DIR = "uploads"


@router.post("/task/{task_id}")
def upload_file(
    task_id: int,
    upload: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    validate_file(upload)

    filename = f"{uuid4()}_{upload.filename}"
    path = os.path.join(UPLOAD_DIR, filename)

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    with open(path, "wb") as f:
        f.write(upload.file.read())

    file_db = FileModel(
        filename=upload.filename,
        path=path,
        task_id=task_id
    )
    db.add(file_db)
    db.commit()
    db.refresh(file_db)

    return {
        "id": file_db.id,
        "filename": file_db.filename
    }


@router.get("/{file_id}")
def download_file(
    file_id: int,
    db: Session = Depends(get_db)
):
    file = db.query(FileModel).get(file_id)
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    return {
        "id": file.id,
        "filename": file.filename,
        "path": file.path
    }


@router.delete("/{file_id}")
def delete_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file = db.query(FileModel).get(file_id)
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    if os.path.exists(file.path):
        os.remove(file.path)

    db.delete(file)
    db.commit()

    return {"message": "File deleted successfully"}
