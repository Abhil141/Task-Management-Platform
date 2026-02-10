import { useRef, useState } from "react";
import { uploadFile, deleteFile, type FileItem } from "../api/files";

type ToastType = "success" | "error" | "info";

type Props = {
  taskId: number;
  files: FileItem[];
  refresh: () => Promise<void>;
  notify: (message: string, type?: ToastType) => void;
};

export default function FileUpload({
  taskId,
  files,
  refresh,
  notify,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  function resetFileInput(): void {
    setFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function handleUpload(): Promise<void> {
    if (!file) {
      notify("Please select a file before uploading.", "error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      notify("File size must be under 10 MB.", "error");
      return;
    }

    try {
      setUploading(true);

      await uploadFile(taskId, file);
      resetFileInput();

      await refresh(); // 🔑 ensures UI updates
      notify("File uploaded successfully.", "success");
    } catch (err) {
      if (err instanceof Error) {
        notify(err.message, "error");
      } else {
        notify("Failed to upload file.", "error");
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(fileId: number): Promise<void> {
    try {
      await deleteFile(fileId);
      await refresh();
      notify("File deleted successfully.", "success");
    } catch {
      notify("Failed to delete file. Please try again.", "error");
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>): void {
    e.preventDefault();
    setDragOver(false);

    const droppedFile: File | undefined = e.dataTransfer.files?.[0];
    if (!droppedFile) {
      notify("No file detected. Try again.", "error");
      return;
    }

    setFile(droppedFile);
  }

  function openFilePicker(): void {
    inputRef.current?.click();
  }

  return (
    <div>
      {/* Upload zone */}
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
        disabled={uploading}
        onChange={(e) => {
          const selectedFile: File | undefined = e.target.files?.[0];
          if (!selectedFile) {
            notify("No file selected.", "error");
            return;
          }
          setFile(selectedFile);
        }}
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
