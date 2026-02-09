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

const STATUS_LABELS: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export default function Dashboard() {
  const [statusData, setStatusData] = useState<StatusCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard(): Promise<void> {
      try {
        setLoading(true);
        setError(null);

        const res = await getOverview();

        if (!res?.by_status || !Array.isArray(res.by_status)) {
          throw new Error("Invalid analytics response");
        }

        if (!cancelled) {
          setStatusData(res.by_status);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Failed to load dashboard data");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalTasks = statusData.reduce(
    (sum, item) => sum + item.count,
    0
  );

  if (loading) {
    return <div className="page loading">Loading dashboard…</div>;
  }

  if (error) {
    return <div className="page error">{error}</div>;
  }

  if (statusData.length === 0) {
    return (
      <div className="page">
        <h1>Dashboard</h1>
        <div className="card">
          <p className="empty">
            No tasks yet. Create your first task to see analytics here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Dashboard</h1>

      {/* Summary */}
      <div className="grid-fixed">
        <div className="card">
          <h3>Total Tasks</h3>
          <p className="big">{totalTasks}</p>
        </div>

        {statusData.map((item) => (
          <div className="card" key={item.status}>
            <h3>{STATUS_LABELS[item.status] ?? item.status}</h3>
            <p className="big">{item.count}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card">
        <h3>Tasks by Status</h3>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={statusData}>
            <XAxis
              dataKey="status"
              tickFormatter={(v) =>
                STATUS_LABELS[v] ?? v
              }
            />
            <YAxis allowDecimals={false} />
            <Tooltip
              labelFormatter={(label: React.ReactNode) =>
                typeof label === "string"
                  ? STATUS_LABELS[label] ?? label
                  : label
              }
            />
            <Bar
              dataKey="count"
              fill="#2563eb"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
