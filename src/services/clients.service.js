import { api } from "./api";

export async function fetchClients({ q = "", limit = 200 } = {}) {
  const params = { limit };
  if (q) params.q = q;
  const { data } = await api.get("/api/clients", { params });
  return data; // { items }
}
