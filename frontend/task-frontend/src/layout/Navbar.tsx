import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

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
      }}
    >
      {label}
    </Link>
  );
}

export default function Navbar() {
  const { pathname } = useLocation();
  const { setToken } = useAuth();
  const navigate = useNavigate();

  function logout() {
    setToken(null);
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <NavLink to="/dashboard" label="Dashboard" pathname={pathname} />
      <NavLink to="/tasks" label="Tasks" pathname={pathname} />
      <NavLink to="/analytics" label="Analytics" pathname={pathname} />
      <NavLink to="/profile" label="Profile" pathname={pathname} />

      <div className="spacer" />

      <button className="secondary" onClick={logout}>
        Logout
      </button>
    </nav>
  );
}
