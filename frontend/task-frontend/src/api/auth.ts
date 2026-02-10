import { apiFetch } from "./client";

/* ---------- TYPES ---------- */
export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

/* ---------- LOGIN ---------- */
export async function login(email: string, password: string) {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);

  const res = await fetch("http://127.0.0.1:8000/auth/login", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  return res.json();
}

/* ---------- REGISTER ---------- */
export async function register(data: RegisterPayload) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
