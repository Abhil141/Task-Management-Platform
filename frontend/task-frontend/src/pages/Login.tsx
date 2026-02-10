import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { login } from "../api/auth";
import { useAuth } from "../context/useAuth";
import Toast from "../components/Toast";

import "../layout/layout.css";

type ToastType = "success" | "error" | "info";

export default function Login() {
  const { setToken } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const notify = (message: string, type: ToastType = "info") => {
    setToast({ message, type });
  };

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();

    if (!email || !password) {
      notify("Please enter both email and password.", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await login(email, password);

      notify("Signed in successfully.", "success");

      setTimeout(() => {
        setToken(res.access_token);
        navigate("/dashboard");
      }, 600);
    } catch {
      notify("Invalid email or password.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage:
          "linear-gradient(rgba(15,23,42,0.6), rgba(15,23,42,0.6)), url('bg.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      {/* TOAST */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "28px",
        }}
      >
        {/* =====================
            BRAND
        ===================== */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <img
            src="/favicon.png"
            alt="Taskflow"
            style={{
              width: 180,
              height: "auto",
              marginBottom: 6,
            }}
          />
          <h2 style={{ margin: 0 }}>Taskflow</h2>
          <p
            style={{
              marginTop: 6,
              color: "#6b7280",
              fontSize: 14,
            }}
          >
            Organize tasks. Track progress. Stay focused.
          </p>
        </div>

        {/* =====================
            FORM
        ===================== */}
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            style={{ marginTop: 12, width: "100%" }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* =====================
            FOOTER
        ===================== */}
        <p
          style={{
            marginTop: 18,
            fontSize: 14,
            textAlign: "center",
            color: "#6b7280",
          }}
        >
          Don’t have an account?{" "}
          <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
