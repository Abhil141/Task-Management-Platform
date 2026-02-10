import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { register } from "../api/auth";
import Toast from "../components/Toast";

import "../layout/layout.css";

type ToastType = "success" | "error" | "info";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
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

    if (!name || !email || !password || !confirm) {
      notify("Please fill in all fields.", "error");
      return;
    }

    if (password !== confirm) {
      notify("Passwords do not match.", "error");
      return;
    }

    setLoading(true);

    try {
      await register({ name, email, password });

      notify("Account created successfully. Please sign in.", "success");

      setTimeout(() => {
        navigate("/login");
      }, 700);
    } catch {
      notify("Registration failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage:
          "linear-gradient(rgba(15,23,42,0.6), rgba(15,23,42,0.6)), url('/bg.jpeg')",
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
            BRAND HEADER
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
          <h2 style={{ margin: 0 }}>Create your Taskflow account</h2>
          <p
            style={{
              marginTop: 6,
              color: "#6b7280",
              fontSize: 14,
            }}
          >
            Start organizing tasks and tracking progress.
          </p>
        </div>

        {/* =====================
            FORM
        ===================== */}
        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input
            placeholder="Your name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />

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

          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="••••••••"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            style={{ marginTop: 12, width: "100%" }}
          >
            {loading ? "Creating account…" : "Create Account"}
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
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
