import { api } from "./api";

/**
 * Obtener lista de tareas con filtros y paginación
 */
export async function fetchTasks(params) {
  const { data } = await api.get("/api/tasks", { params });
  return data;
}
