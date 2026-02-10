import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createTask,
  bulkCreateTasks,
  type TaskInput,
} from "../api/tasks";

import TaskForm from "../components/TaskForm";
import Toast from "../components/Toast";

import "../layout/layout.css";

type ToastType = "success" | "error" | "info";

export default function CreateTask() {
  const navigate = useNavigate();

  const [bulkText, setBulkText] = useState("");

  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const notify = (message: string, type: ToastType = "info") => {
    setToast({ message, type });
  };

  function navigateWithDelay(path: string): void {
    setTimeout(() => {
      navigate(path);
    }, 600); 
  }

  async function handleCreate(data: TaskInput): Promise<void> {
    try {
      await createTask(data);
      notify("Task created successfully.", "success");
      navigateWithDelay("/tasks");
    } catch {
      notify("Failed to create task.", "error");
    }
  }

  async function handleBulkCreate(): Promise<void> {
    const lines = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (!lines.length) {
      notify("Please enter at least one task.", "error");
      return;
    }

    try {
      await bulkCreateTasks(
        lines.map((line) => {
          const [title, status = "todo", priority = "medium"] =
            line.split("|").map((s) => s.trim());

          return {
            title,
            status: status as TaskInput["status"],
            priority: priority as TaskInput["priority"],
          };
        })
      );

      notify("Tasks created successfully.", "success");
      navigateWithDelay("/tasks");
    } catch {
      notify("Bulk create failed. Please check the format.", "error");
    }
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

      <div className="card section">
        <h3>Create Task</h3>
        <TaskForm onSubmit={handleCreate} />
      </div>

      <div className="card section">
        <h3>Bulk Create Tasks</h3>

        <textarea
          rows={6}
          placeholder="Fix bug | todo | high"
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
        />

        <button onClick={handleBulkCreate}>
          Create Tasks
        </button>
      </div>
    </div>
  );
}
