import { api } from "./api";

export async function fetchTasks({
  limit = 20,
  offset = 0,
  q = "",
  finished = "",
  clientId = "",
  collaboratorId = "",
}) {
  const params = { limit, offset };

  if (q) params.q = q;
  if (finished === "true" || finished === "false") params.finished = finished;
  if (clientId) params.clientId = clientId;
  if (collaboratorId) params.collaboratorId = collaboratorId;

  const { data } = await api.get("/api/tasks", { params });
  return data; // { items, pagination }
}
