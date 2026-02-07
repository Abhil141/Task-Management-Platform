import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getTasks,
  createTask,
  deleteTask,
  type Task,
} from "../api/tasks";
import TaskForm from "../components/TaskForm";
import TaskTable from "../components/TaskTable";
import "../layout/layout.css";

type StatusFilter = "all" | Task["status"];

export default function Tasks() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  async function loadTasks() {
    try {
      setLoading(true);
      const data = await getTasks();
      setTasks(data);
    } catch {
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function handleCreate(task: Omit<Task, "id">) {
    await createTask(task);
    loadTasks();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this task?")) return;
    await deleteTask(id);
    loadTasks();
  }

  function handleStatusFilterChange(
    e: React.ChangeEvent<HTMLSelectElement>
  ) {
    setStatusFilter(e.target.value as StatusFilter);
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tasks, search, statusFilter]);

  if (loading) {
    return <p className="page loading">Loading tasks...</p>;
  }

  if (error) {
    return <p className="page error">{error}</p>;
  }

  return (
    <div className="page">
      <h1>Tasks</h1>

      {/* Filters */}
      <div className="card">
        <input
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={handleStatusFilterChange}
        >
          <option value="all">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      {/* Create Task */}
      <div className="card">
        <h3>Create Task</h3>
        <TaskForm onSubmit={handleCreate} />
      </div>

      {/* Task Table */}
      <div className="card">
        <h3>All Tasks</h3>
        <TaskTable
          tasks={filteredTasks}
          onDelete={handleDelete}
          onOpen={(id) => navigate(`/tasks/${id}`)}
        />
      </div>
    </div>
  );
}
