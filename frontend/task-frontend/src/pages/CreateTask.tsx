import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTask, bulkCreateTasks, type TaskInput } from "../api/tasks";
import TaskForm from "../components/TaskForm";
import "../layout/layout.css";

export default function CreateTask() {
  const navigate = useNavigate();
  const [bulkText, setBulkText] = useState("");
  const [error, setError] = useState("");

  async function handleCreate(data: TaskInput) {
    await createTask(data);
    navigate("/tasks");
  }

  async function handleBulkCreate() {
    try {
      const lines = bulkText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      if (!lines.length) return;

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

      navigate("/tasks");
    } catch {
      setError("Bulk create failed");
    }
  }

  return (
    <div className="page">
      <div style={{ marginBottom: "24px" }}>
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
        {error && <p className="error">{error}</p>}
        <textarea
          rows={6}
          placeholder="Fix bug | todo | high"
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
        />
        <button onClick={handleBulkCreate}>Create Tasks</button>
      </div>
    </div>
  );
}
