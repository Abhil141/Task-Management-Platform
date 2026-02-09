import { apiFetch } from "./client";

/* ======================
   Types
====================== */

export type Comment = {
  id: number;
  content: string;
  created_at: string;
  user_id: number;
};

/* ======================
   API calls
====================== */

/* Get all comments for a task */
export const getComments = (
  taskId: number
): Promise<Comment[]> => {
  return apiFetch(`/comments/task/${taskId}`);
};

/* Add comment to task */
export const addComment = (
  taskId: number,
  content: string
): Promise<Comment> => {
  return apiFetch(`/comments/task/${taskId}`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
};

/* Update comment ✅ NEW */
export const updateComment = (
  commentId: number,
  content: string
): Promise<Comment> => {
  return apiFetch(`/comments/${commentId}`, {
    method: "PUT",
    body: JSON.stringify({ content }),
  });
};

/* Delete comment */
export const deleteComment = (
  commentId: number
): Promise<{ message: string }> => {
  return apiFetch(`/comments/${commentId}`, {
    method: "DELETE",
  });
};

