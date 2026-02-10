import { useEffect } from "react";

type ToastType = "success" | "error" | "info";

type Props = {
  message: string;
  type?: ToastType;
  onClose: () => void;
};

export default function Toast({
  message,
  type = "info",
  onClose,
}: Props) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles: Record<ToastType, { bg: string; border: string }> = {
    success: {
      bg: "#ecfdf5",
      border: "#10b981",
    },
    error: {
      bg: "#fef2f2",
      border: "#ef4444",
    },
    info: {
      bg: "#eff6ff",
      border: "#3b82f6",
    },
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 9999,
        minWidth: "280px",
        maxWidth: "360px",
        padding: "12px 14px",
        borderRadius: "10px",
        background: styles[type].bg,
        borderLeft: `4px solid ${styles[type].border}`,
        boxShadow:
          "0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04)",
        color: "#111827",
        fontSize: "14px",
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        animation: "toast-slide-in 0.25s ease-out",
      }}
    >
      <span style={{ lineHeight: 1.4 }}>{message}</span>

      <button
        onClick={onClose}
        aria-label="Close notification"
        style={{
          marginLeft: "auto",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
          color: "#6b7280",
        }}
      >
        ✕
      </button>
    </div>
  );
}
