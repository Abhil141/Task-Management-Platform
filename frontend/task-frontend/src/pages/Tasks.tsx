import { useEffect, useState } from "react";
import { getTasks, createTask, deleteTask } from "../api/tasks";
import { Link } from "react-router-dom";

type Task = {
  id: number;
  title: string;
  status: string;
};

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchTasks = async () => {
      setLoading(true);
      const data = await getTasks();
      if (isMounted) {
        setTasks(data);
        setLoading(false);
      }
    };

    fetchTasks();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreate = async () => {
    if (!title.trim()) return;

    await createTask({
      title,
      status: "todo",
      priority: "medium",
    });

    setTitle("");
    const data = await getTasks();
    setTasks(data);
  };

  const handleDelete = async (id: number) => {
    await deleteTask(id);
    const data = await getTasks();
    setTasks(data);
  };

  if (loading) {
    return <div className="page">Loading tasks...</div>;
  }

  return (
    <div className="page">
      <h2>Tasks</h2>

      <input
        placeholder="New task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button onClick={handleCreate}>Add Task</button>

      {tasks.length === 0 && <p>No tasks found</p>}

      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <Link to={`/tasks/${task.id}`}>{task.title}</Link> ({task.status})
            <button
              style={{ marginLeft: "10px" }}
              onClick={() => handleDelete(task.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
