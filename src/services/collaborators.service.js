import { api } from "./api";

export async function fetchCollaborators(params) {
  const { data } = await api.get("/api/collaborators", { params });
  return data;
}
