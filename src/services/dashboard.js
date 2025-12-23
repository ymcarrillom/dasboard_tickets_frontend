import { api } from "./api";

export async function fetchDashboardSummary() {
  const { data } = await api.get("/api/dashboard/summary");
  return data;
}

export async function fetchDashboardTimeseries(days = 30) {
  const { data } = await api.get("/api/dashboard/timeseries", {
    params: { days },
  });
  return data;
}
