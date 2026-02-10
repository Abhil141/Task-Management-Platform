# Taskflow – Task Management Platform

Taskflow is a full-stack task management web application that allows users to create, organize, track, and analyze tasks.  
The platform supports authentication, comments, file attachments, and detailed analytics, with a focus on clean architecture and usability.

---

## Repository Structure

```text
taskflow/
├── backend/                  # FastAPI backend
│   ├── app/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Tech Stack

### Backend
- Python 3.11
- FastAPI
- SQLAlchemy ORM
- SQLite (file-based database)
- JWT-based authentication
- Pydantic for request/response validation

### Frontend
- React
- TypeScript
- Vite
- React Router
- Recharts (analytics visualizations)
- Custom CSS (no external UI frameworks)

### Infrastructure
- Docker
- Docker Compose
- OpenAPI / Swagger (API documentation)

---

## Setup Instructions

### Prerequisites

Ensure the following are installed on your system:

- **Docker** (v20+)
- **Docker Compose**
- **Required for Local Setup**  
  - Node.js (v18+)
  - Python (v3.10+)

> Docker is the recommended approach as it requires no local dependency setup.

---

## Environment Variables

### Backend

No environment variables are required to run the application for this assignment.
The backend uses safe defaults (SQLite database and a development JWT secret) to allow the project to run out-of-the-box.
> Environment variables can be introduced later for production deployments if needed.

### Frontend
No environment variables are required.

---

## How to Run the Application

### Option 1: Run Using Docker (Recommended)

#### From the project root, run:

```bash
docker compose up --build
```

#### This command will:

* Build backend and frontend images

* Start both services

* Mount volumes for live development

#### Access URLs

* Frontend: http://localhost:5173

* Backend API: http://localhost:8000

* API Docs (Swagger): http://localhost:8000/docs

---

### Option 2: Run Locally Without Docker

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate   # macOS / Linux
# venv\Scripts\activate    # Windows

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn app.main:app --reload

```

#### Frontend

```bash
cd frontend/task-frontend

# Install dependencies
npm install

# Start development server
npm run dev

```

---

## Architecture Decisions

* FastAPI was chosen for its built-in request validation, performance, and automatic OpenAPI documentation.

* JWT authentication enables stateless and scalable user sessions.

* SQLite was selected to simplify setup and reduce infrastructure overhead for the scope of the assignment.

* Strict authorization checks ensure users can only access their own tasks, comments, and attachments.

* Analytics logic is server-side, ensuring consistent metrics and preventing duplication of business logic.

* Frontend acts purely as an API consumer, keeping all business logic centralized in the backend.

* Docker Compose provides a clean, reproducible environment suitable for evaluation and demonstration.

* Minimal configuration was intentionally chosen to ensure ease of setup and clarity.

---

## Assumptions Made

* Each task belongs to exactly one user.

* No role-based access control (admin vs user) is required.

* Email verification and password reset flows are out of scope.

* Analytics are scoped per authenticated user.

* File uploads are limited in size and handled synchronously.

* SQLite is sufficient for the expected data volume.

* Real-time updates, background jobs, and notifications are not required.

---
