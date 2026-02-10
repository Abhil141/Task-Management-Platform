import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  getTask,
  updateTask,
  type Task,
  type TaskInput,
} from "../api/tasks";
import { getComments, type Comment } from "../api/comments";
import { getFiles, type FileItem } from "../api/files";

import TaskForm from "../components/TaskForm";
import CommentList from "../components/CommentList";
import FileUpload from "../components/FileUpload";
import Toast from "../components/Toast";

import "../layout/layout.css";

type ToastType = "success" | "error" | "info";

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const taskId = Number(id);
  const navigate = useNavigate();

  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const notify = (message: string, type: ToastType = "info") => {
    setToast({ message, type });
  };

  const loadTaskDetail = useCallback(async () => {
    if (!taskId || Number.isNaN(taskId)) {
      setError("Invalid task id");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [taskData, commentData, fileData] = await Promise.all([
        getTask(taskId),
        getComments(taskId),
        getFiles(taskId),
      ]);

      setTask(taskData);
      setComments(commentData);
      setFiles(fileData);
    } catch (err) {
      console.error(err);
      setError("Failed to load task details");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    loadTaskDetail();
  }, [loadTaskDetail]);

  async function handleUpdate(data: TaskInput) {
    try {
      await updateTask(taskId, data);
      setEditing(false);
      await loadTaskDetail();
      notify("Task updated successfully.", "success");
    } catch {
      notify("Failed to update task.", "error");
    }
  }

  if (loading) {
    return <div className="page loading">Loading task…</div>;
  }

  if (error || !task) {
    return <div className="page error">{error ?? "Task not found"}</div>;
  }

  return (
    <div className="page">
      {/* TOAST */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div style={{ marginBottom: 24 }}>
        <button onClick={() => navigate("/tasks")}>
          ← Back to Tasks
        </button>
      </div>

      {/* ======================
          TASK HEADER
      ====================== */}
      <div className="card">
        {!editing ? (
          <>
            <h1>{task.title}</h1>

            <div style={{ display: "flex", gap: 12 }}>
              <span className={`status ${task.status}`}>
                {task.status.replace("_", " ")}
              </span>
              <span className="status">
                Priority: {task.priority}
              </span>
            </div>

            {task.description && (
              <p style={{ marginTop: 12 }}>
                {task.description}
              </p>
            )}
            <div style={{ marginTop: 20 }}>
              <button onClick={() => setEditing(true)}>
                Edit Task
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>Edit Task</h2>

            <TaskForm
              initialData={task}
              submitLabel="Save Changes"
              onSubmit={handleUpdate}
            />

            <button
              className="secondary"
              style={{ marginTop: 12 }}
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </>
        )}
      </div>

      {/* ======================
          COMMENTS
      ====================== */}
      <div className="card">
        <h2>Comments</h2>
        <CommentList
          taskId={taskId}
          comments={comments}
          refresh={async () => {
            await getComments(taskId).then(setComments);
          }}
          notify={notify}
        />
      </div>

      {/* ======================
          FILES
      ====================== */}
      <div className="card">
        <h2>Attachments</h2>
        <FileUpload
          taskId={taskId}
          files={files}
          refresh={async () => {
            await getFiles(taskId).then(setFiles);
          }}
          notify={notify}
        />
      </div>
    </div>
  );
}
