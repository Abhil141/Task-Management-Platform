import { apiFetch } from "./client";

export type Task = {
  id: number;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  due_date?: string;
};

export type TaskInput = Omit<Task, "id">;

export const getTasks = () => apiFetch("/tasks");
export const getTask = (id: number) => apiFetch(`/tasks/${id}`);

export const createTask = (data: TaskInput) =>
  apiFetch("/tasks", { method: "POST", body: JSON.stringify(data) });

export const updateTask = (id: number, data: Partial<TaskInput>) =>
  apiFetch(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteTask = (id: number) =>
  apiFetch(`/tasks/${id}`, { method: "DELETE" });
