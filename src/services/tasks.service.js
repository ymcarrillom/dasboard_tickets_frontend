import { api } from "./api";

/**
 * GET /api/tasks
 */
export async function fetchTasks(params = {}) {
  const { data } = await api.get("/tasks", { params });
  return data; // { items, paging }
}

/**
 * PATCH /api/tasks/:id/check-in
 */
export async function patchTaskCheckIn(id) {
  const { data } = await api.patch(`/tasks/${id}/check-in`);
  return data; // { ok, id, checkIn, checkOut, finished }
}

/**
 * PATCH /api/tasks/:id/check-out
 */
export async function patchTaskCheckOut(id) {
  const { data } = await api.patch(`/tasks/${id}/check-out`);
  return data; // { ok, id, checkIn, checkOut, finished }
}
