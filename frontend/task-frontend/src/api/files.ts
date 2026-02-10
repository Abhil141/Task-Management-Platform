import { apiFetch } from "./client";

export type FileItem = {
  id: number;
  filename: string;
  path: string;
  task_id: number;
};

/* =======================
   UPLOAD FILE
======================= */
export async function uploadFile(taskId: number, file: File) {
  const form = new FormData();

  form.append("upload", file);

  const res = await fetch(
    `http://127.0.0.1:8000/files/task/${taskId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
      },
      body: form,
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to upload file");
  }

  return (await res.json()) as FileItem;
}

/* =======================
   LIST FILES FOR TASK
======================= */
export function getFiles(taskId: number) {
  return apiFetch(`/files/task/${taskId}`) as Promise<FileItem[]>;
}

/* =======================
   SINGLE FILE METADATA
======================= */
export function getFile(fileId: number) {
  return apiFetch(`/files/${fileId}`) as Promise<FileItem>;
}

/* =======================
   DELETE FILE
======================= */
export function deleteFile(fileId: number) {
  return apiFetch(`/files/${fileId}`, {
    method: "DELETE",
  });
}
