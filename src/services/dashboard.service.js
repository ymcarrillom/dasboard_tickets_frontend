import { api } from "./api";

export async function fetchSummary() {
  const { data } = await api.get("/dashboard/summary");
  return data; // { total, pending, finished, ... }
}

export async function fetchTimeseries({ days = 30 } = {}) {
  const { data } = await api.get("/dashboard/timeseries", { params: { days } });
  return data; // { items: [...], meta: { days } }
}

export async function fetchByType({ days = 30 } = {}) {
  const { data } = await api.get("/dashboard/by-type", { params: { days } });
  return data; // { items: [...], meta: { days } }
}

export async function fetchByCollaborator({ days = 30, limit = 10 } = {}) {
  const { data } = await api.get("/dashboard/by-collaborator", {
    params: { days, limit },
  });
  return data; // { items: [...], meta: { days, limit } }
}
