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
import { getOverview, getTrends } from "../api/analytics";
import "../layout/layout.css";

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
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadAnalytics() {
      try {
        const overview = await getOverview();
        const trends = await getTrends();

        if (!isMounted) return;

        setStatusData(overview.by_status);
        setPriorityData(overview.by_priority);
        setTrendData(trends);
      } catch (err) {
        console.error(err);
        if (isMounted) setError("Failed to load analytics data");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAnalytics();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <div className="page loading">Loading analytics…</div>;
  }

  if (error) {
    return <div className="page error">{error}</div>;
  }

  return (
    <div className="page">
      <h1>Analytics</h1>

      {/* Overview charts */}
      <div className="-fixed">
        <div className="card">
          <h3>Tasks by Status</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statusData}>
              <XAxis dataKey="status" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Tasks by Priority</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={priorityData}>
              <XAxis dataKey="priority" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#16a34a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend chart */}
      <div className="card">
        <h3>Task Trends Over Time</h3>
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={trendData}>
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#dc2626"
              strokeWidth={3}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
