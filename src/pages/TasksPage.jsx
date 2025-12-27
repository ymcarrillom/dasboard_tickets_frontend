import React, { useMemo, useState } from "react";
import AppShell from "../components/layout/AppShell";
import TaskDetailModal from "../components/tasks/TaskDetailModal";

import { useTasks } from "../hooks/useTasks";
import { useClients } from "../hooks/useClients";
import { useCollaborators } from "../hooks/useCollaborators";

function Badge({ children, variant = "neutral" }) {
  const styles =
    variant === "success"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
      : variant === "warning"
      ? "bg-orange-50 text-orange-700 border-orange-200/60"
      : "bg-slate-100 text-slate-700 border-slate-200/70";

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold ${styles}`}
    >
      {children}
    </span>
  );
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default function TasksPage() {
  // filtros (igual a lo que venías usando)
  const [q, setQ] = useState("");
  const [finished, setFinished] = useState(""); // "", "true", "false"
  const [clientId, setClientId] = useState("");
  const [collaboratorId, setCollaboratorId] = useState("");
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);

  // modal
  const [selectedTask, setSelectedTask] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  // queries
  const tasksQuery = useTasks({
    q,
    finished,
    clientId,
    collaboratorId,
    limit,
    offset,
  });

  const clientsQuery = useClients({ q: "", limit: 200 });
  const collaboratorsQuery = useCollaborators({ q: "", limit: 200 });

  const items = tasksQuery.data?.items ?? [];
  const paging = tasksQuery.data?.paging ?? { limit, offset };
  const total = tasksQuery.data?.total ?? tasksQuery.data?.meta?.total ?? null; // por si tu backend no lo envía
  const showingText = useMemo(() => {
    if (typeof total === "number") {
      const from = Math.min(offset + 1, total);
      const to = Math.min(offset + limit, total);
      return `Mostrando ${from}-${to} de ${total}`;
    }
    return `Mostrando ${items.length}`;
  }, [total, offset, limit, items.length]);

  const canPrev = offset > 0;
  const canNext =
    typeof total === "number" ? offset + limit < total : items.length === limit;

  function openTask(task) {
    setSelectedTask(task);
    setOpenModal(true);
  }

  return (
    <AppShell>
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Tareas</h2>
          <p className="text-sm text-slate-500">
            Operación diaria • filtros y listado
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => {
              setQ("");
              setFinished("");
              setClientId("");
              setCollaboratorId("");
              setLimit(20);
              setOffset(0);
            }}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Limpiar
          </button>

          <button
            onClick={() => tasksQuery.refetch()}
            className="rounded-xl bg-[#1177B6] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
          >
            Refrescar
          </button>
        </div>
      </div>

      {/* FILTROS */}
      <div className="mb-5 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200/70 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">Filtros</div>
            <div className="text-xs text-slate-500">Filtra el listado de tickets</div>
          </div>
          <div className="text-xs font-medium text-slate-500">{showingText}</div>
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

            {/* Colaborador (✅ SOLO DROPDOWN como pediste) */}
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

          {/* Footer filtros */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-slate-500">
              {tasksQuery.isFetching ? "Actualizando…" : "Listo"}
            </div>

            <div className="flex gap-2">
              <button
                disabled={!canPrev}
                onClick={() => setOffset((v) => Math.max(0, v - limit))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ← Anterior
              </button>

              <button
                disabled={!canNext}
                onClick={() => setOffset((v) => v + limit)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Siguiente →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TABLA */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200/70 bg-slate-50 px-4 py-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">Lista de tickets</div>
            <div className="text-xs text-slate-500">
              Haz click en una fila para ver el detalle
            </div>
          </div>

          <div className="text-xs text-slate-500">
            offset <span className="font-semibold">{offset}</span> • limit{" "}
            <span className="font-semibold">{limit}</span>
            {typeof total === "number" ? (
              <>
                {" "}
                • total <span className="font-semibold">{total}</span>
              </>
            ) : null}
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead className="bg-slate-50">
              <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 text-left">Ticket</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Colaborador</th>

                {/* ✅ Texto cambiado */}
                <th className="px-4 py-3 text-left">Fecha de respuesta</th>

                {/* ✅ Texto cambiado + centrado */}
                <th className="px-4 py-3 text-center">Estado</th>

                <th className="px-4 py-3 text-center">Tiempo</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {tasksQuery.isLoading ? (
                <tr>
                  <td className="px-4 py-6 text-sm text-slate-500" colSpan={7}>
                    Cargando tareas…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-sm text-slate-500" colSpan={7}>
                    No hay resultados con los filtros actuales.
                  </td>
                </tr>
              ) : (
                items.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => openTask(task)}
                    className="group cursor-pointer transition hover:bg-slate-50"
                  >
                    {/* Ticket */}
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                      {task.ticket ?? task.id}
                    </td>

                    {/* Tipo */}
                    <td className="px-4 py-4">
                      <div className="text-sm font-semibold text-slate-900">
                        {task.typeName ?? `Tipo ${task.typeId ?? "—"}`}
                      </div>
                      <div className="text-xs text-slate-500">
                        ID: {task.typeId ?? "—"}
                      </div>
                    </td>

                    {/* Cliente */}
                    <td className="px-4 py-4 text-sm text-slate-700">
                      {task.clientName ?? task.clientId ?? "—"}
                    </td>

                    {/* Colaborador */}
                    <td className="px-4 py-4 text-sm text-slate-700">
                      {task.collaboratorName ?? task.collaboratorId ?? "—"}
                    </td>

                    {/* Fecha de respuesta (usa task.date como venías) */}
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {formatDate(task.date)}
                    </td>

                    {/* Estado (centrado) */}
                    <td className="px-4 py-4 text-center">
                      <Badge variant={task.finished ? "success" : "warning"}>
                        {task.finished ? "Finalizada" : "Pendiente"}
                      </Badge>
                    </td>

                    {/* Tiempo */}
                    <td className="px-4 py-4 text-center text-sm text-slate-500">
                      {task.duration ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      <TaskDetailModal
        open={openModal}
        task={selectedTask}
        onClose={() => setOpenModal(false)}
      />
    </AppShell>
  );
}
