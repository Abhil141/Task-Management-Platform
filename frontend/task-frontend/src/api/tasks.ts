import { apiFetch } from "./client";

/* =======================
   Types
======================= */

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export type TaskSortBy =
  | "created_at"
  | "priority"
  | "status"
  | "due_date"
  | "title";

export type SortOrder = "asc" | "desc";

export type PaginationParams = {
  page?: number;
  limit?: number;
};

export type Task = {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
};

export type TaskInput = {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
};

export type ExportFormat = "csv" | "json";

/* =======================
   API calls
======================= */

export const getTasks = (params?: {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  sort_by?: TaskSortBy;
  order?: SortOrder;
} & PaginationParams) => {
  const query = new URLSearchParams();

  if (params?.status) query.append("status", params.status);
  if (params?.priority) query.append("priority", params.priority);
  if (params?.search) query.append("search", params.search);
  if (params?.sort_by) query.append("sort_by", params.sort_by);
  if (params?.order) query.append("order", params.order);

  query.append("page", String(params?.page ?? 1));
  query.append("limit", String(params?.limit ?? 10));

  return apiFetch(`/tasks?${query.toString()}`) as Promise<Task[]>;
};

export const getTask = (id: number) =>
  apiFetch(`/tasks/${id}`) as Promise<Task>;

export const createTask = (data: TaskInput) =>
  apiFetch("/tasks", {
    method: "POST",
    body: JSON.stringify(data),
  }) as Promise<Task>;

export const updateTask = (id: number, data: Partial<TaskInput>) =>
  apiFetch(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }) as Promise<Task>;

export const deleteTask = (id: number) =>
  apiFetch(`/tasks/${id}`, {
    method: "DELETE",
  });

/* =======================
   BULK CREATE
======================= */

export const bulkCreateTasks = (tasks: TaskInput[]) =>
  apiFetch("/tasks/bulk", {
    method: "POST",
    body: JSON.stringify({ tasks }),
  }) as Promise<Task[]>;

/* =======================
   EXPORT TASKS 
======================= */

export async function exportTasks(params: {
  format: ExportFormat;
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
}): Promise<Blob> {
  const query = new URLSearchParams();
  query.append("format", params.format);

  if (params.status) query.append("status", params.status);
  if (params.priority) query.append("priority", params.priority);
  if (params.search) query.append("search", params.search);

  const res = await fetch(
    `http://127.0.0.1:8000/tasks/export?${query.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
        Accept: "*/*",
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Export failed");
  }

  return res.blob();
}

