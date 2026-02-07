import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import "../layout/layout.css";

type User = {
  id: number;
  name: string;
  email: string;
};

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/auth/me")
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="page loading">Loading profile...</div>;
  }

  if (!user) {
    return <div className="page error">Failed to load profile</div>;
  }

  return (
    <div className="page">
      <h1>Profile</h1>

      <div className="card">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>
    </div>
  );
}
