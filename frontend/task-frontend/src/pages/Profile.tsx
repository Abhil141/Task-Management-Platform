import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import "../layout/layout.css";

type User = {
  id: number;
  name: string;
  email: string;
};

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch("/auth/me")
      .then(setUser)
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="page loading">Loading profile…</div>;
  }

  if (error || !user) {
    return <div className="page error">{error ?? "Profile not found"}</div>;
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="page">
      <h1>Profile</h1>

      {/* =====================
          PROFILE HEADER
      ===================== */}
      <div
        className="card"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            width: "96px",
            height: "96px",
            borderRadius: "50%",
            background: "#2563eb",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "32px",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {initials}
        </div>

        <div>
          <h2 style={{ margin: 0 }}>{user.name}</h2>
          <p style={{ margin: "6px 0", color: "#6b7280" }}>
            {user.email}
          </p>
          <span
            style={{
              display: "inline-block",
              marginTop: "6px",
              padding: "4px 10px",
              fontSize: "12px",
              background: "#e0e7ff",
              color: "#3730a3",
              borderRadius: "999px",
            }}
          >
            Active
          </span>
        </div>
      </div>

      {/* =====================
          DETAILS GRID
      ===================== */}
      <div className="grid-fixed">
        {/* Account Info */}
        <div className="card">
          <h3>Account</h3>
          <p style={{ margin: "8px 0" }}>
            <strong>User ID:</strong> {user.id}
          </p>
          <p style={{ margin: "6px 0" }}>
            <strong>Email:</strong> {user.email}
          </p>
          <p style={{ margin: "6px 0" }}>
            <strong>Type:</strong> Standard
          </p>
        </div>

        {/* Activity */}
        <div className="card">
          <h3>Activity</h3>
          <p style={{ margin: "8px 0", color: "#6b7280" }}>
            Your task activity is tracked automatically.
          </p>
          <ul style={{ margin: "8px 0", paddingLeft: "18px" }}>
            <li>Task completion trends</li>
            <li>Status & priority breakdowns</li>
            <li>Data export support</li>
          </ul>
        </div>

        {/* System Info */}
        <div className="card">
          <h3>Platform</h3>
          <p style={{ margin: "8px 0", color: "#6b7280" }}>
            Task management platform with analytics support.
          </p>
          <ul style={{ margin: "8px 0", paddingLeft: "18px" }}>
            <li>Tasks, comments & attachments</li>
            <li>Analytics & reports</li>
            <li>CSV / JSON exports</li>
          </ul>
        </div>
        
        {/* Security */}
        <div className="card">
          <h3>Security</h3>
          <p style={{ margin: "8px 0" }}>
            <strong>Login:</strong> Token-based authentication
          </p>
          <p style={{ margin: "6px 0" }}>
            <strong>Password:</strong> Securely stored
          </p>
          <p
            style={{
              margin: "6px 0",
              fontSize: "14px",
              color: "#6b7280",
            }}
          >
            Sensitive account settings are protected.
          </p>
        </div>
      </div>

      {/* =====================
          FOOTER NOTE
      ===================== */}
      <div
        className="card"
        style={{
          marginTop: "24px",
          background: "#f9fafb",
          borderLeft: "4px solid #2563eb",
        }}
      >
        <p style={{ margin: 0, color: "#374151" }}>
          ℹ️ Profile details are read-only, cannot be changed after registration. Task insights are available
          in the Analytics section.
        </p>
      </div>
    </div>
  );
}
