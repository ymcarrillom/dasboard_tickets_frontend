// src/services/clients.service.js
import { api } from "./api";

export async function fetchClients({ q = "", limit = 200, offset = 0 } = {}) {
  const params = { limit, offset };
  if (q) params.q = q;

  const { data } = await api.get("/clients", { params });

  return {
    items: Array.isArray(data?.items) ? data.items : [],
    paging: data?.paging ?? { limit, offset },
  };
}
