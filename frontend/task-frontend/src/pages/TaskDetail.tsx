import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getTask, type Task } from "../api/tasks";
import { getComments, type Comment } from "../api/comments";
import { getFile, type FileItem } from "../api/files";

import CommentList from "../components/CommentList";
import FileUpload from "../components/FileUpload";

import "../layout/layout.css";

export default function TaskDetail() {
  const params = useParams();
  const taskId = Number(params.id);

  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!taskId || Number.isNaN(taskId)) return;

    let cancelled = false;

    async function loadTaskDetail() {
      try {
        setLoading(true);

        const [taskData, commentData, fileData] = await Promise.all([
          getTask(taskId),
          getComments(taskId),
          getFile(taskId).catch(() => []), // files may not exist
        ]);

        if (cancelled) return;

        setTask(taskData);
        setComments(commentData);
        setFiles(fileData);
      } catch (err) {
        console.error(err);
        setError("Failed to load task details");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTaskDetail();

    return () => {
      cancelled = true;
    };
  }, [taskId]);

  if (loading) {
    return <div className="page loading">Loading task…</div>;
  }

  if (error || !task) {
    return <div className="page error">{error || "Task not found"}</div>;
  }

  return (
    <div className="page">
      <div className="card">
        <h1>{task.title}</h1>
        {task.description && <p>{task.description}</p>}
      </div>

      {/* Comments */}
      <div className="card">
        <CommentList
          taskId={taskId}
          comments={comments}
          refresh={() => getComments(taskId).then(setComments)}
        />
      </div>

      {/* Files */}
      <div className="card">
        <FileUpload
          taskId={taskId}
          files={files}
          refresh={() =>
            getFile(taskId).catch(() => []).then(setFiles)
          }
        />
      </div>
    </div>
  );
}
