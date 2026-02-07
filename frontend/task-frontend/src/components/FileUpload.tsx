import { useState } from "react";
import { uploadFile, deleteFile, type FileItem } from "../api/files";

type Props = {
  taskId: number;
  files: FileItem[];
  refresh: () => void;
};

export default function FileUpload({ taskId, files, refresh }: Props) {
  const [file, setFile] = useState<File | null>(null);

  async function submit() {
    if (!file) return;
    await uploadFile(taskId, file);
    setFile(null);
    refresh();
  }

  async function remove(id: number) {
    if (!confirm("Delete this file?")) return;
    await deleteFile(id);
    refresh();
  }

  return (
    <div>
      <h3>Attachments</h3>

      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button onClick={submit}>Upload</button>

      {files.length === 0 ? (
        <p className="empty">No files attached</p>
      ) : (
        <ul>
          {files.map((f) => (
            <li key={f.id}>
              {f.filename}
              <button className="danger" onClick={() => remove(f.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
