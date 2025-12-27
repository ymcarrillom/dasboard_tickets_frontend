import { api } from "./api";

export async function fetchCollaborators({ q = "", limit = 200 } = {}) {
  const { data } = await api.get("/collaborators", { params: { q, limit } });
  return data; // { items: [...] }
}
