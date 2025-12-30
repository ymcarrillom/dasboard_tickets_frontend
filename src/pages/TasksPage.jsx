import React, { useMemo, useState } from "react";
import AppShell from "../components/layout/AppShell";
import TaskDetailModal from "../components/tasks/TaskDetailModal";

import { useTasks } from "../hooks/useTasks";
import { useClients } from "../hooks/useClients";
import { useCollaborators } from "../hooks/useCollaborators";

function StatusBadge({ finished }) {
  const base =
    "inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold";
  if (finished) {
    return (
      <span className={`${base} border-emerald-200/60 bg-emerald-50 text-emerald-700`}>
        Finalizada
      </span>
    );
  }
  return (
    <span className={`${base} border-lira-orange/30 bg-lira-orange/15 text-lira-orange`}>
      Pendiente
    </span>
  );
}

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function minutesDiff(a, b) {
  const da = new Date(a);
  const db = new Date(b);
  if (Number.isNaN(da.getTime()) || Number.isNaN(db.getTime())) return null;
  return Math.round((db.getTime() - da.getTime()) / 60000);
}

function formatDurationFromMinutes(mins) {
  if (mins == null) return "—";
  if (mins < 0) return "—"; // por si vienen datos invertidos
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
}

/**
 * ✅ Tiempo “real” de ejecución:
 * - Si hay checkIn y checkOut => duración = checkOut - checkIn
 * - Si falta alguno => "—" (igual que venías mostrando)
 */
function getTaskDurationLabel(task) {
  const checkIn = task?.checkIn ?? task?.check_in ?? null;
  const checkOut = task?.checkOut ?? task?.check_out ?? null;

  if (!checkIn || !checkOut) return "—";

  const mins = minutesDiff(checkIn, checkOut);
  return formatDurationFromMinutes(mins);
}

export default function TasksPage() {
  // filtros
  const [q, setQ] = useState("");
  const [finished, setFinished] = useState(""); // "", "true", "false"
  const [clientId, setClientId] = useState("");
  const [collaboratorId, setCollaboratorId] = useState("");
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);

  // modal
  const [openModal, setOpenModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const params = useMemo(
    () => ({
      q: q || "",
      finished: finished || "",
      clientId: clientId || "",
      collaboratorId: collaboratorId || "",
      limit,
      offset,
    }),
    [q, finished, clientId, collaboratorId, limit, offset]
  );

  const tasksQuery = useTasks(params);
  const clientsQuery = useClients({ limit: 200 });
  const collaboratorsQuery = useCollaborators({ limit: 200 });

  const items = tasksQuery.data?.items ?? [];
  const paging = tasksQuery.data?.paging ?? { limit, offset };
  const total = tasksQuery.data?.total ?? tasksQuery.data?.paging?.total ?? null; // por si tu API luego expone total

  const showingText = (() => {
    const start = offset + 1;
    const end = offset + (items?.length || 0);
    if (!items?.length) return "Mostrando 0";
    if (typeof total === "number") return `Mostrando ${start}-${end} de ${total}`;
    return `Mostrando ${start}-${end}`;
  })();

  function openTask(task) {
    setSelectedTask(task);
    setOpenModal(true);
  }

  function closeTask() {
    setOpenModal(false);
    setSelectedTask(null);
  }

  const canPrev = offset > 0;
  const canNext = items.length === limit; // heurística simple

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Tareas</h2>
          <p className="text-sm text-slate-500">Operación diaria • filtros y listado</p>
        </div>

        <div className="flex w-full gap-2 sm:w-auto">
          <button
            onClick={() => {
              setQ("");
              setFinished("");
              setClientId("");
              setCollaboratorId("");
              setLimit(20);
              setOffset(0);
            }}
            className="w-1/2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 sm:w-auto"
          >
            Limpiar
          </button>

          <button
            onClick={() => tasksQuery.refetch()}
            className="w-1/2 rounded-xl bg-[#1177B6] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 sm:w-auto"
          >
            Refrescar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        <div className="border-b border-slate-200/70 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Filtros</div>
              <div className="text-xs text-slate-500">Filtra el listado de tickets</div>
            </div>
            <div className="text-xs text-slate-500">{showingText}</div>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
            {/* Buscar */}
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-slate-600">Buscar</label>
              <input
                value={q}
                onChange={(e) => {
                  setOffset(0);
                  setQ(e.target.value);
                }}
                placeholder="Buscar en descripción…"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-[#1177B6] focus:ring-4 focus:ring-[#1177B6]/10"
              />
            </div>

            {/* Estado */}
            <div>
              <label className="text-xs font-medium text-slate-600">Estado</label>
              <select
                value={finished}
                onChange={(e) => {
                  setOffset(0);
                  setFinished(e.target.value);
                }}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-[#1177B6] focus:ring-4 focus:ring-[#1177B6]/10"
              >
                <option value="">Todos</option>
                <option value="false">Pendientes</option>
                <option value="true">Finalizadas</option>
              </select>
            </div>

            {/* Cliente */}
            <div>
              <label className="text-xs font-medium text-slate-600">Cliente</label>
              <select
                value={clientId}
                disabled={clientsQuery.isLoading}
                onChange={(e) => {
                  setOffset(0);
                  setClientId(e.target.value);
                }}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-[#1177B6] focus:ring-4 focus:ring-[#1177B6]/10 disabled:opacity-60"
              >
                <option value="">Todos</option>
                {(clientsQuery.data?.items ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Colaborador */}
            <div>
              <label className="text-xs font-medium text-slate-600">Colaborador</label>
              <select
                value={collaboratorId}
                disabled={collaboratorsQuery.isLoading}
                onChange={(e) => {
                  setOffset(0);
                  setCollaboratorId(e.target.value);
                }}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-[#1177B6] focus:ring-4 focus:ring-[#1177B6]/10 disabled:opacity-60"
              >
                <option value="">Todos</option>
                {(collaboratorsQuery.data?.items ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tamaño */}
            <div>
              <label className="text-xs font-medium text-slate-600">Tamaño</label>
              <select
                value={limit}
                onChange={(e) => {
                  setOffset(0);
                  setLimit(Number(e.target.value));
                }}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-[#1177B6] focus:ring-4 focus:ring-[#1177B6]/10"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* paginación */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-slate-500">
              {tasksQuery.isFetching ? "Actualizando…" : "Listo"}
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={!canPrev}
                onClick={() => setOffset(Math.max(0, offset - limit))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
              >
                ← Anterior
              </button>
              <button
                disabled={!canNext}
                onClick={() => setOffset(offset + limit)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
              >
                Siguiente →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        <div className="border-b border-slate-200/70 bg-slate-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900">Lista de tickets</div>
            <div className="text-xs text-slate-500">
              offset {paging.offset ?? offset} • limit {paging.limit ?? limit}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead className="bg-white">
              <tr className="border-b border-slate-200/70 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Ticket</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Colaborador</th>
                <th className="px-4 py-3 text-center">Fecha de respuesta</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-center">Tiempo</th>
              </tr>
            </thead>

            <tbody>
              {tasksQuery.isLoading ? (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={7}>
                    Cargando…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={7}>
                    No hay resultados con esos filtros.
                  </td>
                </tr>
              ) : (
                items.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => openTask(t)}
                    className="cursor-pointer border-b border-slate-100 hover:bg-slate-50/60"
                  >
                    <td className="px-4 py-4 font-semibold text-slate-900">{t.id}</td>

                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-900">
                        {t.typeName ?? `Tipo ${t.typeId ?? "-"}`}
                      </div>
                      <div className="text-xs text-slate-500">ID: {t.typeId ?? "-"}</div>
                    </td>

                    <td className="px-4 py-4 text-slate-900">{t.clientName ?? t.clientId}</td>

                    <td className="px-4 py-4 text-slate-900">
                      {t.collaboratorName ?? t.collaboratorId}
                    </td>

                    {/* Fecha de respuesta: usamos checkIn como “respuesta” */}
                    <td className="px-4 py-4 text-center text-slate-700">
                      {formatDateTime(t.checkIn)}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <StatusBadge finished={Boolean(t.finished)} />
                    </td>

                    {/* ✅ AQUÍ ESTÁ EL FIX: tiempo por fila */}
                    <td className="px-4 py-4 text-center font-medium text-slate-700">
                      {getTaskDurationLabel(t)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <TaskDetailModal open={openModal} task={selectedTask} onClose={closeTask} />
    </AppShell>
  );
}
