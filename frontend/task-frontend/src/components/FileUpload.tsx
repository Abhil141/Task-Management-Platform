import { useRef, useState } from "react";
import { uploadFile, deleteFile, type FileItem } from "../api/files";

type Props = {
  taskId: number;
  files: FileItem[];
  refresh: () => void;
};

export default function FileUpload({ taskId, files, refresh }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function resetFileInput() {
    setFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function handleUpload(): Promise<void> {
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      await uploadFile(taskId, file);
      resetFileInput();
      refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload file"
      );
      resetFileInput();
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(fileId: number): Promise<void> {
    if (!confirm("Delete this file?")) return;

    try {
      setError(null);
      await deleteFile(fileId);
      refresh();
    } catch {
      setError("Failed to delete file");
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>): void {
    e.preventDefault();
    setDragOver(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function openFilePicker() {
    inputRef.current?.click();
  }

  return (
    <div>
      {error && <p className="error">{error}</p>}

      {/* Unified drag + click zone */}
      <div
        onClick={openFilePicker}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: "2px dashed #d1d5db",
          borderRadius: "8px",
          padding: "20px",
          textAlign: "center",
          background: dragOver ? "#f0f9ff" : "#fafafa",
          cursor: "pointer",
          marginBottom: "12px",
        }}
      >
        {!file ? (
          <span>
            Drag & drop a file here or <strong>click to choose</strong>
          </span>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <strong>{file.name}</strong>
            <button
              type="button"
              className="secondary"
              onClick={(e) => {
                e.stopPropagation();
                resetFileInput();
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        hidden
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) {
            setFile(selected);
          }
        }}
        disabled={uploading}
      />

      <button
        type="button"
        onClick={handleUpload}
        disabled={!file || uploading}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {/* Existing files */}
      {files.length === 0 ? (
        <p className="empty" style={{ marginTop: "12px" }}>
          No files attached
        </p>
      ) : (
        <ul style={{ marginTop: "16px" }}>
          {files.map((f) => (
            <li
              key={f.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "8px",
              }}
            >
              <a
                href={`http://127.0.0.1:8000/files/${f.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {f.filename}
              </a>

              <button
                type="button"
                className="danger"
                onClick={() => handleDelete(f.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
