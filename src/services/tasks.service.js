// src/services/tasks.service.js
import { api } from "./api";

/**
 * ✅ OJO: finished debe viajar como string: "true" | "false"
 * Nunca lo conviertas a boolean con Boolean("false") porque da true.
 */
export async function fetchTasks(params = {}) {
  const clean = { ...params };

  // Borra vacíos para no mandar finished=""
  Object.keys(clean).forEach((k) => {
    if (clean[k] === "" || clean[k] === null || clean[k] === undefined) {
      delete clean[k];
    }
  });

  const { data } = await api.get("/tasks", { params: clean });
  return data; // { items, paging }
}

export async function checkInTask(id) {
  const { data } = await api.patch(`/tasks/${id}/check-in`);
  return data;
}

export async function checkOutTask(id) {
  const { data } = await api.patch(`/tasks/${id}/check-out`);
  return data;
}
