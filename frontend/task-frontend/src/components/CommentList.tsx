import { useState } from "react";
import {
  type Comment,
  addComment,
  deleteComment,
  updateComment,
} from "../api/comments";

type Props = {
  taskId: number;
  comments: Comment[];
  refresh: () => void;
};

export default function CommentList({
  taskId,
  comments,
  refresh,
}: Props) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  /* --------------------
     Add Comment
  -------------------- */
  async function handleSubmit(): Promise<void> {
    if (!content.trim()) return;

    try {
      setSubmitting(true);
      setError(null);

      await addComment(taskId, content.trim());
      setContent("");
      refresh();
    } catch {
      setError("Failed to post comment");
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
      setError(null);
      await deleteComment(commentId);
      refresh();
    } catch {
      setError("Failed to delete comment");
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
    if (!editContent.trim()) return;

    try {
      setSubmitting(true);
      setError(null);

      await updateComment(commentId, editContent.trim());
      setEditingId(null);
      setEditContent("");
      refresh();
    } catch {
      setError("Failed to update comment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h3>Comments</h3>

      {error && <p className="error">{error}</p>}

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
