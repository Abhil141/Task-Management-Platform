import { useState } from "react";
import type { TaskInput } from "../api/tasks";

type Props = {
  onSubmit: (data: TaskInput) => Promise<void> | void;
  initialData?: TaskInput;
  submitLabel?: string;
};

export default function TaskForm({
  onSubmit,
  initialData,
  submitLabel = "Create Task",
}: Props) {
  const [title, setTitle] = useState(() => initialData?.title ?? "");
  const [description, setDescription] = useState(
    () => initialData?.description ?? ""
  );
  const [status, setStatus] = useState<TaskInput["status"]>(
    () => initialData?.status ?? "todo"
  );
  const [priority, setPriority] = useState<TaskInput["priority"]>(
    () => initialData?.priority ?? "medium"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await onSubmit({
      title,
      description,
      status,
      priority,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>Title</label>
      <input
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label>Description</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <label>Status</label>
      <select
        value={status}
        onChange={(e) =>
          setStatus(e.target.value as TaskInput["status"])
        }
      >
        <option value="todo">To Do</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
      </select>

      <label>Priority</label>
      <select
        value={priority}
        onChange={(e) =>
          setPriority(e.target.value as TaskInput["priority"])
        }
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <button type="submit">{submitLabel}</button>
    </form>
  );
}
