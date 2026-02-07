import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  getOverview,
  getTrends,
} from "../api/analytics";

type StatusStat = {
  status: string;
  count: number;
};

type PriorityStat = {
  priority: string;
  count: number;
};

type TrendStat = {
  date: string;
  count: number;
};

export default function Analytics() {
  const [statusData, setStatusData] = useState<StatusStat[]>([]);
  const [priorityData, setPriorityData] = useState<PriorityStat[]>([]);
  const [trendData, setTrendData] = useState<TrendStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      try {
        const overview = await getOverview();
        const trends = await getTrends();

        if (!isMounted) return;

        setStatusData(overview.by_status);
        setPriorityData(overview.by_priority);
        setTrendData(trends);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load analytics", err);
      }
    };

    loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <div className="page">Loading analytics...</div>;
  }

  return (
    <div className="page">
      <h2>Analytics</h2>

      {/* Tasks by Status */}
      <h3>Tasks by Status</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={statusData}>
          <XAxis dataKey="status" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#1976d2" />
        </BarChart>
      </ResponsiveContainer>

      {/* Tasks by Priority */}
      <h3 style={{ marginTop: "40px" }}>Tasks by Priority</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={priorityData}>
          <XAxis dataKey="priority" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#388e3c" />
        </BarChart>
      </ResponsiveContainer>

      {/* Task Trends */}
      <h3 style={{ marginTop: "40px" }}>Task Trends Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trendData}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#d32f2f"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
