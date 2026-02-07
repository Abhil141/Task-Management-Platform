import { apiFetch } from "./client";

export type FileItem = {
  id: number;
  filename: string;
  path: string;
};

export async function uploadFile(taskId: number, file: File) {
  const form = new FormData();
  form.append("upload", file);

  const res = await fetch(
    `http://127.0.0.1:8000/files/task/${taskId}`,
    {
      method: "POST",
      body: form,
    }
  );

  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export function getFile(fileId: number) {
  return apiFetch(`/files/${fileId}`);
}

export function deleteFile(fileId: number) {
  return apiFetch(`/files/${fileId}`, {
    method: "DELETE",
  });
}
