import { useEffect, useState } from "react";
import { getOverview } from "../api/analytics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "../layout/layout.css";

type StatusCount = {
  status: string;
  count: number;
};

export default function Dashboard() {
  const [statusData, setStatusData] = useState<StatusCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await getOverview();
        setStatusData(res.by_status);
      } catch {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalTasks = statusData.reduce(
    (sum, item) => sum + item.count,
    0
  );

  if (loading) return <p className="page">Loading dashboard...</p>;
  if (error) return <p className="page error">{error}</p>;

  return (
    <div className="page">
      <h1>Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid">
        <div className="card">
          <h3>Total Tasks</h3>
          <p className="big">{totalTasks}</p>
        </div>

        {statusData.map((item) => (
          <div className="card" key={item.status}>
            <h3>{item.status}</h3>
            <p className="big">{item.count}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card">
        <h3>Tasks by Status</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={statusData}>
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
