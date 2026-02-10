import { useState } from "react";
import {
  type Comment,
  addComment,
  deleteComment,
  updateComment,
} from "../api/comments";

type ToastType = "success" | "error" | "info";

type Props = {
  taskId: number;
  comments: Comment[];
  refresh: () => Promise<void>;
  notify: (message: string, type?: ToastType) => void;
};

export default function CommentList({
  taskId,
  comments,
  refresh,
  notify,
}: Props) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  /* --------------------
     Add Comment
  -------------------- */
  async function handleSubmit(): Promise<void> {
    if (!content.trim()) {
      notify("Comment cannot be empty.", "error");
      return;
    }

    try {
      setSubmitting(true);
      await addComment(taskId, content.trim());
      setContent("");
      await refresh();
      notify("Comment posted successfully.", "success");
    } catch {
      notify("Failed to post comment.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  /* --------------------
     Delete Comment
  -------------------- */
  async function handleDelete(commentId: number): Promise<void> {
    if (!confirm("Delete this comment?")) return;

    try {
      await deleteComment(commentId);
      await refresh();
      notify("Comment deleted successfully.", "success");
    } catch {
      notify("Failed to delete comment.", "error");
    }
  }

  /* --------------------
     Start Editing
  -------------------- */
  function startEdit(comment: Comment): void {
    setEditingId(comment.id);
    setEditContent(comment.content);
  }

  function cancelEdit(): void {
    setEditingId(null);
    setEditContent("");
  }

  /* --------------------
     Save Edit
  -------------------- */
  async function saveEdit(commentId: number): Promise<void> {
    if (!editContent.trim()) {
      notify("Comment cannot be empty.", "error");
      return;
    }

    try {
      setSubmitting(true);
      await updateComment(commentId, editContent.trim());
      setEditingId(null);
      setEditContent("");
      await refresh();
      notify("Comment updated successfully.", "success");
    } catch {
      notify("Failed to update comment.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Add comment */}
      <textarea
        placeholder="Add a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={submitting}
      />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || !content.trim()}
      >
        {submitting ? "Posting..." : "Post"}
      </button>

      {/* List */}
      {comments.length === 0 ? (
        <p className="empty">No comments yet</p>
      ) : (
        <div style={{ marginTop: "16px" }}>
          {comments.map((comment) => (
            <div key={comment.id} className="card">
              {editingId === comment.id ? (
                <>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    disabled={submitting}
                  />

                  <div style={{ marginTop: "8px" }}>
                    <button
                      type="button"
                      onClick={() => saveEdit(comment.id)}
                      disabled={submitting || !editContent.trim()}
                    >
                      Save
                    </button>{" "}
                    <button
                      type="button"
                      className="secondary"
                      onClick={cancelEdit}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p>{comment.content}</p>

                  <small style={{ color: "#6b7280" }}>
                    {new Date(comment.created_at).toLocaleString()}
                  </small>

                  <div style={{ marginTop: "8px" }}>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => startEdit(comment)}
                    >
                      Edit
                    </button>{" "}
                    <button
                      type="button"
                      className="danger"
                      onClick={() => handleDelete(comment.id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
