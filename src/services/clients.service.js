import { api } from "./api";

export async function fetchClients(params) {
  const { data } = await api.get("/api/clients", { params });
  return data;
}
