import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
} from "recharts";

import {
  getOverview,
  getTrends,
  getUserPerformance,
  getCompletionTrends,
} from "../api/analytics";
import { exportTasks, type ExportFormat } from "../api/tasks";

import "../layout/layout.css";

/* =======================
   Types
======================= */
type StatusStat = { status: string; count: number };
type PriorityStat = { priority: string; count: number };
type TrendStat = { date: string; count: number };

type UserPerformance = {
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
};

type CompletionTrend = {
  date: string;
  created: number;
  completed: number;
};

export default function Analytics() {
  const [statusData, setStatusData] = useState<StatusStat[]>([]);
  const [priorityData, setPriorityData] = useState<PriorityStat[]>([]);
  const [trendData, setTrendData] = useState<TrendStat[]>([]);
  const [completionTrendData, setCompletionTrendData] =
    useState<CompletionTrend[]>([]);
  const [performance, setPerformance] =
    useState<UserPerformance | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  /* =======================
     Load analytics
  ======================= */
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [
          overview,
          trends,
          perf,
          completionTrends,
        ] = await Promise.all([
          getOverview(),
          getTrends(),
          getUserPerformance(),
          getCompletionTrends(),
        ]);

        if (!mounted) return;

        setStatusData(overview.by_status);
        setPriorityData(overview.by_priority);
        setTrendData(trends);
        setPerformance(perf);
        setCompletionTrendData(completionTrends);
      } catch {
        if (mounted) setError("Failed to load analytics");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  /* =======================
     Derived Metrics
  ======================= */
  const pendingTasks = useMemo(() => {
    if (!performance) return 0;
    return performance.total_tasks - performance.completed_tasks;
  }, [performance]);

  const statusPercentage = useMemo(() => {
    const total = statusData.reduce((a, b) => a + b.count, 0);
    return statusData.map((s) => ({
      ...s,
      percent: total ? Math.round((s.count / total) * 100) : 0,
    }));
  }, [statusData]);

  const avgPerDay = useMemo(() => {
    if (trendData.length === 0) return 0;

    const total = trendData.reduce((a, b) => a + b.count, 0);
    return Math.round(total / trendData.length);
  }, [trendData]);

  const flatAverageData = useMemo(() => {
    return trendData.map((t) => ({
      ...t,
      avg: avgPerDay,
    }));
  }, [trendData, avgPerDay]);

  /* =======================
     Export
  ======================= */
  async function handleExport(format: ExportFormat) {
    try {
      setExporting(true);
      setExportError("");

      const blob = await exportTasks({ format });
      const downloadBlob =
        format === "json"
          ? new Blob([await blob.text()], {
              type: "application/json",
            })
          : blob;

      const url = URL.createObjectURL(downloadBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tasks.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setExportError("Failed to export");
    } finally {
      setExporting(false);
    }
  }

  if (loading) return <div className="page loading">Loading…</div>;
  if (error) return <div className="page error">{error}</div>;

  return (
    <div className="page">
      <h1>Analytics</h1>

      {/* =====================
          KPI CARDS
      ===================== */}
      {performance && (
        <div className="grid-fixed">
          <div className="card">
            <h3>Total Tasks</h3>
            <div className="big">{performance.total_tasks}</div>
          </div>

          <div className="card">
            <h3>Completed Tasks</h3>
            <div className="big">{performance.completed_tasks}</div>
          </div>

          <div className="card">
            <h3>Pending Tasks</h3>
            <div className="big">{pendingTasks}</div>
          </div>

          <div className="card">
            <h3 title="Completed ÷ Total × 100">
              Completion Rate
            </h3>
            <div className="big">
              {performance.completion_rate}%
            </div>
          </div>
        </div>
      )}

      {/* =====================
          DISTRIBUTION
      ===================== */}
      <div className="grid-fixed">
        <div className="card">
          <h3>Status Distribution (%)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={statusPercentage}>
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip
                formatter={(value) =>
                  value != null ? `${value}%` : ""
                }
              />
              <Bar dataKey="percent" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Completion vs Pending</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={[
                {
                  label: "Tasks",
                  completed: performance?.completed_tasks,
                  pending: pendingTasks,
                },
              ]}
            >
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#16a34a" />
              <Bar dataKey="pending" fill="#dc2626" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Tasks by Priority</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={priorityData}>
              <XAxis dataKey="priority" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Created vs Completed</h3>
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={completionTrendData}>
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip
                labelFormatter={(l) => `Date: ${l}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="created"
                stroke="#2563eb"
                strokeWidth={3}
                name="Tasks Created"
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#16a34a"
                strokeWidth={3}
                name="Tasks Completed"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* =====================
          TRENDS
      ===================== */}
      <div className="card">
        <h3>Task Creation Trend (vs Avg)</h3>
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={flatAverageData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              formatter={(value, name) => {
                if (value == null) return "";

                if (name === "avg") {
                  return [`${value}`, "Overall Avg"];
                }

                return [`${value}`, "Tasks Created"];
              }}
            />
            <Legend />
            <Line
              dataKey="count"
              stroke="#2563eb"
              strokeWidth={2}
              name="Tasks Created"
            />
            <Line
              dataKey="avg"
              stroke="#dc2626"
              strokeDasharray="5 5"
              name="Overall Avg"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* =====================
          EXPORT
      ===================== */}
      <div className="card section">
        <h3>Export Tasks Data</h3>
        {exportError && <p className="error">{exportError}</p>}

        <button
          onClick={() => handleExport("csv")}
          disabled={exporting}
        >
          Export CSV
        </button>
        <button
          className="secondary"
          onClick={() => handleExport("json")}
          disabled={exporting}
        >
          Export JSON
        </button>
      </div>
    </div>
  );
}
