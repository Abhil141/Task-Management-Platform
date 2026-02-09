import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

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

import "../layout/layout.css";

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const taskId = Number(id);

  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();

  const loadTaskDetail = useCallback(async (): Promise<void> => {
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

  async function handleUpdate(data: TaskInput): Promise<void> {
    await updateTask(taskId, data);
    setEditing(false);
    await loadTaskDetail();
  }

  if (loading) {
    return <div className="page loading">Loading task…</div>;
  }

  if (error || !task) {
    return <div className="page error">{error ?? "Task not found"}</div>;
  }

  return (
    <div className="page">
      <div style={{ marginBottom: "24px" }}>
        <button onClick={() => navigate("/tasks")}>
          ← Back to Tasks
        </button>
      </div>
      {/* ======================
          Task Header
      ====================== */}
      <div className="card">
        {!editing ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <h1 style={{ marginBottom: 8 }}>{task.title}</h1>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <span className={`status ${task.status}`}>
                  {task.status.replace("_", " ")}
                </span>
                <span className="status">
                  Priority: {task.priority}
                </span>
              </div>
            </div>

            {task.description && (
              <p style={{ marginBottom: 16, color: "#374151" }}>
                {task.description}
              </p>
            )}

            <button onClick={() => setEditing(true)}>Edit Task</button>
          </>
        ) : (
          <>
            <h2 style={{ marginBottom: 12 }}>Edit Task</h2>

            <TaskForm
              initialData={{
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                due_date: task.due_date,
              }}
              submitLabel="Save Changes"
              onSubmit={handleUpdate}
            />

            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              <button
                type="button"
                className="secondary"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>

      {/* ======================
          Comments
      ====================== */}
      <div className="card">
        <h2 style={{ marginBottom: 12 }}>Comments</h2>
        <CommentList
          taskId={taskId}
          comments={comments}
          refresh={() => getComments(taskId).then(setComments)}
        />
      </div>

      {/* ======================
          Files
      ====================== */}
      <div className="card">
        <h2 style={{ marginBottom: 12 }}>Attachments</h2>
        <FileUpload
          taskId={taskId}
          files={files}
          refresh={() => getFiles(taskId).then(setFiles)}
        />
      </div>
    </div>
  );
}
