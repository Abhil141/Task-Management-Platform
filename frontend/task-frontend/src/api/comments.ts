import { apiFetch } from "./client";

export type Comment = {
  id: number;
  content: string;
  created_at: string;
  user_id: number;
};

export function getComments(taskId: number) {
  return apiFetch(`/comments/task/${taskId}`);
}

export function addComment(taskId: number, content: string) {
  return apiFetch(`/comments/task/${taskId}`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export function deleteComment(commentId: number) {
  return apiFetch(`/comments/${commentId}`, {
    method: "DELETE",
  });
}
