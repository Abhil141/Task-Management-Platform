from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .auth import router as auth_router
from .tasks import router as task_router
from .comments import router as comment_router
from .files import router as file_router
from .analytics import router as analytics_router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Task Management System",
    description="A full-stack task management API built with FastAPI",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(auth_router)
app.include_router(task_router)
app.include_router(comment_router)
app.include_router(file_router)
app.include_router(analytics_router)


@app.get("/", tags=["Health"])
def health():
    return {"status": "ok"}
