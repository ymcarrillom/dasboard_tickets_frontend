import React, { useMemo, useState } from "react";
import AppShell from "../components/layout/AppShell";

import { useTasks } from "../hooks/useTasks";
import { useClients } from "../hooks/useClients";
import { useCollaborators } from "../hooks/useCollaborators";

/** Modal simple (sin librerías) */
function TaskModal({ open, task, onClose }) {
  if (!open || !task) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200/70 bg-slate-50 p-4">
          <div>
            <div className="text-sm font-semibold text-slate-900">
              Detalle de tarea #{task.id}
            </div>
            <div className="mt-0.5 text-xs text-slate-500">
              Cliente: {task.clientName ?? "N/A"} · Colaborador:{" "}
              {task.collaboratorName ?? "N/A"}
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Cerrar
          </button>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Info label="Descripción" value={task.description ?? ""} wide />
            <Info label="Estado" value={task.finished ? "Finalizada" : "Pendiente"} />
            <Info label="Fecha" value={formatDate(task.date)} />
            <Info label="Tipo" value={task.typeName ?? String(task.typeId ?? "")} />
            <Info label="Check-in" value={formatDate(task.checkIn) || "—"} />
            <Info label="Check-out" value={formatDate(task.checkOut) || "—"} />
            <Info label="Cliente ID" value={String(task.clientId ?? "—")} />
            <Info label="Colaborador ID" value={String(task.collaboratorId ?? "—")} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, wide = false }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className="mt-1 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800">
        {value}
      </div>
    </div>
  );
}

function formatDate(v) {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleString();
}

export default function TasksPage() {
  // --------------------
  // Estados de filtros
  // --------------------
  const [q, setQ] = useState("");
  const [finished, setFinished] = useState("");
  const [clientId, setClientId] = useState("");
  const [collaboratorId, setCollaboratorId] = useState("");

  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);

  // --------------------
  // Modal
  // --------------------
  const [selectedTask, setSelectedTask] = useState(null);

  // --------------------
  // Queries
  // --------------------
  const tasksQuery = useTasks({
    q,
    finished,
    clientId,
    collaboratorId,
    limit,
    offset,
  });

  const clientsQuery = useClients({ limit: 200 });
  const collaboratorsQuery = useCollaborators({ q: "", limit: 200 });

  const tasks = tasksQuery.data?.items ?? [];
  const total = tasksQuery.data?.total ?? 0;

  const rangeText = useMemo(() => {
    if (!total) return "0";
    const from = offset + 1;
    const to = Math.min(offset + limit, total);
    return `${from}–${to}`;
  }, [total, offset, limit]);

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Tareas</h2>
        <p className="text-sm text-slate-500">Gestión y seguimiento de tickets</p>
      </div>

      {/* ================= Filtros ================= */}
      <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        <div className="border-b border-slate-200/70 bg-slate-50 p-4">
          <div className="text-sm font-semibold text-slate-900">Filtros</div>
          <div className="text-xs text-slate-500">Filtra el listado de tickets</div>
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
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ✅ Colaborador (solo dropdown) */}
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
                  <option key={c.id} value={String(c.id)}>
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

          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => {
                setQ("");
                setFinished("");
                setClientId("");
                setCollaboratorId("");
                setLimit(20);
                setOffset(0);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Limpiar filtros
            </button>

            <div className="text-xs text-slate-500">
              {tasksQuery.isFetching ? "Actualizando…" : null}
            </div>
          </div>
        </div>
      </div>

      {/* ================= Tabla ================= */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Descripción</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Colaborador</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Fecha</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {tasks.map((t) => (
                <tr
                  key={t.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => setSelectedTask(t)}
                >
                  <td className="px-4 py-3 font-medium text-slate-900">{t.id}</td>
                  <td className="px-4 py-3">{t.description}</td>
                  <td className="px-4 py-3">{t.clientName}</td>
                  <td className="px-4 py-3">{t.collaboratorName}</td>
                  <td className="px-4 py-3">
                    {t.finished ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                        Finalizada
                      </span>
                    ) : (
                      <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">
                        Pendiente
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(t.date)}</td>
                </tr>
              ))}

              {!tasks.length && !tasksQuery.isLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No hay resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200/70 p-4 text-sm">
          <div className="text-slate-500">
            Mostrando {rangeText} de {total}
          </div>

          <div className="flex gap-2">
            <button
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - limit))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 font-medium disabled:opacity-50"
            >
              Anterior
            </button>

            <button
              disabled={offset + limit >= total}
              onClick={() => setOffset(offset + limit)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 font-medium disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <TaskModal
        open={Boolean(selectedTask)}
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </AppShell>
  );
}
