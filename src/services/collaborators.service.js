import { api } from "./api";

export async function fetchCollaborators({ q = "", limit = 200 } = {}) {
  const params = { limit };
  if (q) params.q = q;
  const { data } = await api.get("/api/collaborators", { params });
  return data; // { items }
}
