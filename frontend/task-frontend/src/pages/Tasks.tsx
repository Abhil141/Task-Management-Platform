import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getTasks,
  deleteTask,
  updateTask,
  exportTasks,
  type Task,
  type TaskInput,
  type TaskSortBy,
  type SortOrder,
  type ExportFormat,
} from "../api/tasks";
import TaskForm from "../components/TaskForm";
import "../layout/layout.css";

type StatusFilter = "" | Task["status"];
type PriorityFilter = "" | Task["priority"];

export default function Tasks() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔑 SEARCH FIX
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

  // export
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  async function loadTasks() {
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
      setError("Failed to load tasks");
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

  async function handleUpdate(data: TaskInput) {
    if (!editingTask) return;
    await updateTask(editingTask.id, data);
    setEditingTask(null);
    await loadTasks();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this task?")) return;
    await deleteTask(id);
    await loadTasks();
  }

  async function handleExport(format: ExportFormat) {
    try {
      setExporting(true);
      setExportError("");

      const blob = await exportTasks({
        format,
        search: search || undefined,
        status: status || undefined,
        priority: priority || undefined,
      });

      // 🔑 FIX: force JSON download
      const downloadBlob =
        format === "json"
          ? new Blob([await blob.text()], {
              type: "application/json",
            })
          : blob;

      const url = URL.createObjectURL(downloadBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tasks.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setExportError("Failed to export tasks");
    } finally {
      setExporting(false);
    }
  }

  if (loading) return <div className="page loading">Loading tasks…</div>;
  if (error) return <div className="page error">{error}</div>;

  return (
    <div className="page">
      <div
        style={{
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

        {/* ✅ FIXED SEARCH */}
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

        <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <select value={priority} onChange={(e) => setPriority(e.target.value as PriorityFilter)}>
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as TaskSortBy)}>
          <option value="created_at">Created At</option>
          <option value="priority">Priority</option>
          <option value="status">Status</option>
          <option value="due_date">Due Date</option>
          <option value="title">Title</option>
        </select>

        <select value={order} onChange={(e) => setOrder(e.target.value as SortOrder)}>
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
                        onClick={() => navigate(`/tasks/${task.id}`)}
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
                      <button className="secondary" onClick={() => setEditingTask(task)}>
                        Edit
                      </button>
                      <button className="danger" onClick={() => handleDelete(task.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                Previous
              </button>
              <span>Page {page}</span>
              <button disabled={tasks.length < limit} onClick={() => setPage(page + 1)}>
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* Export */}
      <div className="card section">
        <h3>Export Tasks</h3>
        {exportError && <p className="error">{exportError}</p>}
        <button onClick={() => handleExport("csv")} disabled={exporting}>
          Export CSV
        </button>
        <button className="secondary" onClick={() => handleExport("json")} disabled={exporting}>
          Export JSON
        </button>
      </div>

      {/* EDIT MODAL */}
      {editingTask && (
        <div className="modal-backdrop">
          <div className="modal" role="dialog" aria-modal="true">
            <div className="modal-header">
              <h3>Edit Task</h3>
              <button className="secondary" onClick={() => setEditingTask(null)}>
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
