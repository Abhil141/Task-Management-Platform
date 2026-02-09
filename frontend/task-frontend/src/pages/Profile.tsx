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

  return (
    <div className="page">
      <h1>Profile</h1>

      <div
        className="card"
        style={{
          maxWidth: "520px",
        }}
      >
        {/* Avatar Placeholder */}
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "#e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            fontWeight: 600,
            color: "#374151",
            marginBottom: "16px",
          }}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>

        {/* User Info */}
        <div style={{ marginBottom: "12px" }}>
          <p style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>
            {user.name}
          </p>
          <p style={{ color: "#6b7280", margin: "4px 0 0 0" }}>
            {user.email}
          </p>
        </div>

        <hr
          style={{
            border: "none",
            borderTop: "1px solid #e5e7eb",
            margin: "16px 0",
          }}
        />

        {/* Meta */}
        <div>
          <p style={{ fontSize: "14px", color: "#6b7280" }}>
            Account ID: <strong>{user.id}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
