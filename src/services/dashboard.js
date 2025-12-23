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

export async function fetchDashboardByType(days = 30) {
  const { data } = await api.get("/api/dashboard/by-type", {
    params: { days },
  });
  return data;
}

export async function fetchDashboardByCollaborator(days = 30, limit = 10) {
  const { data } = await api.get("/api/dashboard/by-collaborator", {
    params: { days, limit },
  });
  return data;
}
