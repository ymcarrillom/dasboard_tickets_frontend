import { api } from "./api";

export async function fetchDashboardSummary() {
  const { data } = await api.get("/api/dashboard/summary");
  return data; // { total, pending, finished }
}
