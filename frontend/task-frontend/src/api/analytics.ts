import { apiFetch } from "./client";

export function getOverview() {
  return apiFetch("/analytics/overview");
}

export function getTrends() {
  return apiFetch("/analytics/trends");
}
