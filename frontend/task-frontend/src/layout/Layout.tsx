import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import "./layout.css";

export default function Layout() {
  return (
    <div className="app-shell">
      <Navbar />
      <Outlet />
    </div>
  );
}
