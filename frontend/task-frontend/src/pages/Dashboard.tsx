import { useEffect, useState } from "react";
import { getOverview } from "../api/analytics";

type Stat = {
  count: number;
  status?: string;
  priority?: string;
};

export default function Dashboard() {
  const [data, setData] = useState<{
    by_status: Stat[];
    by_priority: Stat[];
  } | null>(null);

  useEffect(() => {
    getOverview().then(setData);
  }, []);

  if (!data) {
    return <div className="page">Loading dashboard...</div>;
  }

  return (
    <div className="page">
      <h2>Dashboard</h2>

      <h3>Tasks by Status</h3>
      <ul>
        {data.by_status.map((s, idx) => (
          <li key={idx}>
            {s.status}: {s.count}
          </li>
        ))}
      </ul>

      <h3>Tasks by Priority</h3>
      <ul>
        {data.by_priority.map((p, idx) => (
          <li key={idx}>
            {p.priority}: {p.count}
          </li>
        ))}
      </ul>
    </div>
  );
}
