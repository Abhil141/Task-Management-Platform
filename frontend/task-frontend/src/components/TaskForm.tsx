import { useState } from "react";
import type { TaskInput } from "../api/tasks";

type Props = {
  onSubmit: (data: TaskInput) => void;
};

export default function TaskForm({ onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskInput["status"]>("todo");
  const [priority, setPriority] = useState<TaskInput["priority"]>("medium");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit({ title, description, status, priority });
    setTitle("");
    setDescription("");
  }

  function handleStatusChange(
    e: React.ChangeEvent<HTMLSelectElement>
  ) {
    setStatus(e.target.value as TaskInput["status"]);
  }

  function handlePriorityChange(
    e: React.ChangeEvent<HTMLSelectElement>
  ) {
    setPriority(e.target.value as TaskInput["priority"]);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>Title</label>
      <input
        required
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <label>Description</label>
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
      />

      <label>Status</label>
      <select value={status} onChange={handleStatusChange}>
        <option value="todo">To Do</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
      </select>

      <label>Priority</label>
      <select value={priority} onChange={handlePriorityChange}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <button type="submit">Create Task</button>
    </form>
  );
}
