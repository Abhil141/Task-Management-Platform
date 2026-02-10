import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/useAuth";
import Toast from "../components/Toast";

type ToastType = "success" | "error" | "info";

type NavLinkProps = {
  to: string;
  label: string;
  pathname: string;
};

function NavLink({ to, label, pathname }: NavLinkProps) {
  const active = pathname === to;

  return (
    <Link
      to={to}
      style={{
        fontWeight: active ? 600 : 500,
        color: active ? "#2563eb" : "#1f2937",
        textDecoration: "none",
        padding: "6px 10px",
        borderRadius: "6px",
        background: active ? "#eff6ff" : "transparent",
      }}
    >
      {label}
    </Link>
  );
}

export default function Navbar() {
  const { pathname } = useLocation();
  const { setToken } = useAuth();

  // TOAST STATE
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  function logout(): void {
    setToast({
      message: "Logged out successfully.",
      type: "info",
    });

    setTimeout(() => {
      setToken(null); 
    }, 600);
  }

  return (
    <>
      {/* TOAST */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <nav
        className="navbar"
        style={{
          display: "flex",
          alignItems: "center",
          padding: "12px 20px",
          borderBottom: "1px solid #e5e7eb",
          background: "#ffffff",
        }}
      >
        {/* =====================
            BRAND
        ===================== */}
        <Link
          to="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0px",
            textDecoration: "none",
            marginRight: "28px",
          }}
        >
          <img
            src="/favicon.png"
            alt="Taskflow logo"
            style={{
              width: "72px",
              height: "48px",
            }}
          />
          <span
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#111827",
              letterSpacing: "0.2px",
            }}
          >
            Taskflow
          </span>
        </Link>

        {/* =====================
            NAV LINKS
        ===================== */}
        <div style={{ display: "flex", gap: "16px" }}>
          <NavLink to="/dashboard" label="Dashboard" pathname={pathname} />
          <NavLink to="/tasks" label="Tasks" pathname={pathname} />
          <NavLink to="/analytics" label="Analytics" pathname={pathname} />
          <NavLink to="/profile" label="Profile" pathname={pathname} />
        </div>

        {/* =====================
            ACTIONS
        ===================== */}
        <div style={{ marginLeft: "auto" }}>
          <button className="secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>
    </>
  );
}
