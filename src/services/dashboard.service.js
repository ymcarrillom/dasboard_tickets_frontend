import { api } from "./api";

export async function fetchSummary() {
  // ✅ OJO: tu baseURL ya es http://localhost:3000/api
  // por eso aquí va /dashboard/summary (queda /api/dashboard/summary)
  const { data } = await api.get("/dashboard/summary");
  return data;
}

export async function fetchTimeseries({ days = 3650 } = {}) {
  const { data } = await api.get("/dashboard/timeseries", { params: { days } });
  return data;
}

export async function fetchByType({ days = 3650 } = {}) {
  const { data } = await api.get("/dashboard/by-type", { params: { days } });
  return data;
}

export async function fetchByCollaborator({ days = 3650, limit = 10 } = {}) {
  const { data } = await api.get("/dashboard/by-collaborator", {
    params: { days, limit },
  });
  return data;
}
