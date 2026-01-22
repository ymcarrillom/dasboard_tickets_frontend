import { api } from "./api";

/**
 * Helpers
 */
async function get(path, params) {
  const res = await api.get(path, { params });
  return res.data; // body
}

// Normaliza: si viene { ok:true, data: X } => devuelve X
function unwrap(payload) {
  if (
    payload &&
    typeof payload === "object" &&
    Object.prototype.hasOwnProperty.call(payload, "ok") &&
    Object.prototype.hasOwnProperty.call(payload, "data")
  ) {
    return payload.data;
  }
  return payload;
}

async function getWithFallback(primaryPath, fallbackPath, params) {
  try {
    const primary = await get(primaryPath, params);
    return unwrap(primary);
  } catch (err) {
    const status = err?.response?.status;
    if (status === 404 && fallbackPath) {
      const fallback = await get(fallbackPath, params);
      return unwrap(fallback);
    }
    throw err;
  }
}

/**
 * ✅ Summary (KPIs)
 * Old: /api/dashboard/summary
 * New: /api/assistant-data/kpis  => { ok:true, data:{...} }
 * Return: { total, pending, finished, ... }
 */
export async function fetchSummary() {
  return await getWithFallback("/dashboard/summary", "/assistant-data/kpis");
}

/**
 * ✅ Timeseries
 * Old: /api/dashboard/timeseries?days=
 * New: (aún no existe en assistant-data)
 * Return: array (para que Recharts no reviente)
 */
export async function fetchTimeseries({ days = 3650 } = {}) {
  try {
    const payload = await get("/dashboard/timeseries", { days });
    return unwrap(payload);
  } catch (err) {
    const status = err?.response?.status;
    if (status === 404) return []; // importante: array directo
    throw err;
  }
}

/**
 * ✅ By Type
 * Old: /api/dashboard/by-type?days=
 * New: /api/assistant-data/top/types?days=&limit=
 * Return: array de items
 */
export async function fetchByType({ days = 3650, limit = 10 } = {}) {
  const data = await getWithFallback(
    "/dashboard/by-type",
    "/assistant-data/top/types",
    { days, limit }
  );

  // Si tu UI usa "name/value" para charts, descomenta este mapeo:
  // return (Array.isArray(data) ? data : []).map((x) => ({
  //   name: x.typeName ?? x.name ?? "Sin tipo",
  //   value: Number(x.total ?? x.value ?? 0),
  // }));

  return data;
}

/**
 * ✅ By Collaborator
 * Old: /api/dashboard/by-collaborator?days=&limit=
 * New: /api/assistant-data/top/collaborators?days=&limit=&offset=
 * Return: array de items
 */
export async function fetchByCollaborator({
  days = 3650,
  limit = 10,
  offset = 0,
} = {}) {
  const data = await getWithFallback(
    "/dashboard/by-collaborator",
    "/assistant-data/top/collaborators",
    { days, limit, offset }
  );

  // Si tu UI usa "name/value" para charts, descomenta este mapeo:
  // return (Array.isArray(data) ? data : []).map((x) => ({
  //   name: x.collaboratorName ?? x.name ?? "Sin colaborador",
  //   value: Number(x.total ?? x.value ?? 0),
  // }));

  return data;
}
