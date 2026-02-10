import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getTasks,
  deleteTask,
  updateTask,
  type Task,
  type TaskInput,
  type TaskSortBy,
  type SortOrder,
} from "../api/tasks";

import TaskForm from "../components/TaskForm";
import Toast from "../components/Toast";

import "../layout/layout.css";

type StatusFilter = "" | Task["status"];
type PriorityFilter = "" | Task["priority"];
type ToastType = "success" | "error" | "info";

export default function Tasks() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const notify = (message: string, type: ToastType = "info") => {
    setToast({ message, type });
  };

  // SEARCH
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // filters
  const [status, setStatus] = useState<StatusFilter>("");
  const [priority, setPriority] = useState<PriorityFilter>("");

  // sorting
  const [sortBy, setSortBy] = useState<TaskSortBy>("created_at");
  const [order, setOrder] = useState<SortOrder>("desc");

  // pagination
  const [page, setPage] = useState(1);
  const limit = 10;

  // edit modal
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  async function loadTasks(): Promise<void> {
    try {
      setLoading(true);

      const data = await getTasks({
        search: search || undefined,
        status: status || undefined,
        priority: priority || undefined,
        sort_by: sortBy,
        order,
        page,
        limit,
      });

      setTasks(data);
    } catch {
      notify("Failed to load tasks.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, [search, status, priority, sortBy, order, page]);

  useEffect(() => {
    setPage(1);
  }, [search, status, priority, sortBy, order]);

  // lock scroll when modal open
  useEffect(() => {
    document.body.classList.toggle("modal-open", !!editingTask);
    return () => document.body.classList.remove("modal-open");
  }, [editingTask]);

  // close modal on ESC
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setEditingTask(null);
    }
    if (editingTask) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editingTask]);

  async function handleUpdate(data: TaskInput): Promise<void> {
    if (!editingTask) return;

    try {
      await updateTask(editingTask.id, data);
      setEditingTask(null);
      await loadTasks();
      notify("Task updated successfully.", "success");
    } catch {
      notify("Failed to update task.", "error");
    }
  }

  async function handleDelete(id: number): Promise<void> {
    try {
      await deleteTask(id);
      await loadTasks();
      notify("Task deleted successfully.", "success");
    } catch {
      notify("Failed to delete task.", "error");
    }
  }

  if (loading) {
    return <div className="page loading">Loading tasks…</div>;
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

      <div
        style={{
          marginTop: -48,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <h1 style={{ margin: 0 }}>Tasks</h1>
        <button onClick={() => navigate("/tasks/create")}>
          + Create Task
        </button>
      </div>

      {/* Filters */}
      <div className="card section">
        <h3>Filters & Sorting</h3>

        <input
          placeholder="Search by title"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setSearch(searchInput.trim());
            }
          }}
        />

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as StatusFilter)
          }
        >
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <select
          value={priority}
          onChange={(e) =>
            setPriority(e.target.value as PriorityFilter)
          }
        >
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value as TaskSortBy)
          }
        >
          <option value="created_at">Created At</option>
          <option value="priority">Priority</option>
          <option value="status">Status</option>
          <option value="due_date">Due Date</option>
          <option value="title">Title</option>
        </select>

        <select
          value={order}
          onChange={(e) =>
            setOrder(e.target.value as SortOrder)
          }
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      {/* Table */}
      <div className="card section">
        <h3>All Tasks</h3>

        {tasks.length === 0 ? (
          <p className="empty">No tasks found</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <button
                        className="link"
                        onClick={() =>
                          navigate(`/tasks/${task.id}`)
                        }
                      >
                        <strong>{task.title}</strong>
                      </button>

                      {task.description && (
                        <div className="task-description">
                          {task.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`status ${task.status}`}>
                        {task.status.replace("_", " ")}
                      </span>
                    </td>
                    <td>{task.priority}</td>
                    <td>
                      <button
                        className="secondary"
                        onClick={() => setEditingTask(task)}
                      >
                        Edit
                      </button>
                      <button
                        className="danger"
                        onClick={() => handleDelete(task.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <span>Page {page}</span>
              <button
                disabled={tasks.length < limit}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* EDIT MODAL */}
      {editingTask && (
        <div className="modal-backdrop">
          <div className="modal" role="dialog" aria-modal="true">
            <div className="modal-header">
              <h3>Edit Task</h3>
              <button
                className="secondary"
                onClick={() => setEditingTask(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <TaskForm
                initialData={editingTask}
                onSubmit={handleUpdate}
                submitLabel="Save Changes"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
