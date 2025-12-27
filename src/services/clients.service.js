import { api } from "./api";

export async function fetchClients({ q = "", limit = 200 } = {}) {
  const { data } = await api.get("/clients", { params: { q, limit } });
  return data; // { items: [...] }
}
