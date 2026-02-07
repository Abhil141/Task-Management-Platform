import { useState } from "react";
import { type Comment, addComment, deleteComment } from "../api/comments";

type Props = {
  taskId: number;
  comments: Comment[];
  refresh: () => void;
};

export default function CommentList({ taskId, comments, refresh }: Props) {
  const [content, setContent] = useState("");

  async function submit() {
    if (!content.trim()) return;
    await addComment(taskId, content);
    setContent("");
    refresh();
  }

  async function remove(id: number) {
    if (!confirm("Delete this comment?")) return;
    await deleteComment(id);
    refresh();
  }

  return (
    <div>
      <h3>Comments</h3>

      <textarea
        placeholder="Add a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button onClick={submit}>Post</button>

      {comments.length === 0 ? (
        <p className="empty">No comments yet</p>
      ) : (
        comments.map((c) => (
          <div key={c.id} className="card">
            <p>{c.content}</p>
            <button className="danger" onClick={() => remove(c.id)}>
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}
