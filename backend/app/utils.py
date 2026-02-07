import os
from fastapi import UploadFile, HTTPException

# Allowed MIME types for uploaded files
ALLOWED_FILE_TYPES = [
    "image/png",
    "image/jpeg",
    "application/pdf",
]

# Maximum allowed file size (5 MB)
MAX_FILE_SIZE = 5 * 1024 * 1024


def validate_file(file: UploadFile) -> None:
    """
    Validates uploaded files for type and size.
    Raises HTTPException if validation fails.
    """
    if file.content_type not in ALLOWED_FILE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type"
        )

    # Move cursor to end of file to calculate size
    file.file.seek(0, os.SEEK_END)
    size = file.file.tell()
    file.file.seek(0)

    if size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds 5MB limit"
        )
