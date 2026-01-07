// src/services/collaborators.service.js
import { api } from "./api";

export async function fetchCollaborators({ q = "", limit = 200, offset = 0 } = {}) {
  const res = await api.get("/collaborators", {
    params: { q, limit, offset },
  });

  // backend => { ok:true, data:[...] }
  const payload = res.data;

  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;

  return [];
}
