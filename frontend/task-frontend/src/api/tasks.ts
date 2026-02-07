import { apiFetch } from "./client";

export function getTasks() {
  return apiFetch("/tasks");
}

export function createTask(task: unknown) {
  return apiFetch("/tasks", {
    method: "POST",
    body: JSON.stringify(task),
  });
}

export function deleteTask(taskId: number) {
  return apiFetch(`/tasks/${taskId}`, {
    method: "DELETE",
  });
}
