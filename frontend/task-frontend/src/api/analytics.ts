import { apiFetch } from "./client";

/* =======================
   Types
======================= */

export type OverviewResponse = {
  by_status: { status: string; count: number }[];
  by_priority: { priority: string; count: number }[];
};

export type TrendPoint = {
  date: string; 
  count: number;
};

export type UserPerformance = {
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number; 
};

/* Completion trends */
export type CompletionTrendPoint = {
  date: string;      
  created: number;     
  completed: number;   
};

/* =======================
   API calls
======================= */

export function getOverview() {
  return apiFetch("/analytics/overview") as Promise<OverviewResponse>;
}

export function getTrends() {
  return apiFetch("/analytics/trends") as Promise<TrendPoint[]>;
}

export function getUserPerformance() {
  return apiFetch(
    "/analytics/user-performance"
  ) as Promise<UserPerformance>;
}

/* Created vs Completed trend */
export function getCompletionTrends() {
  return apiFetch(
    "/analytics/completion-trends"
  ) as Promise<CompletionTrendPoint[]>;
}
