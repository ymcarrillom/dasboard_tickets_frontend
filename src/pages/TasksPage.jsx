import React, { useMemo, useState } from "react";
import AppShell from "../components/layout/AppShell";
import TaskDetailModal from "../components/tasks/TaskDetailModal";

import { useTasks } from "../hooks/useTasks";
import { useClients } from "../hooks/useClients";
import { useCollaborators } from "../hooks/useCollaborators";

function Badge({ children, variant = "neutral" }) {
  const styles =
    variant === "success"
      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
      : variant === "warning"
      ? "bg-[#D17745]/15 text-[#D17745] border border-[#D17745]/30"
      : "bg-slate-100 text-slate-700 border border-slate-200/70";

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${styles}`}>
      {children}
    </span>
  );
}

export default function TasksPage() {
  // filtros
  const [q, setQ] = useState("");
  const [finished, setFinished] = useState("");
  const [clientId, setClientId] = useState("");
  const [collaboratorId, setCollaboratorId] = useState("");

  // paginación
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);

  // modal
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // queries
  const tasksQuery = useTasks({ q, finished, clientId, collaboratorId, limit, offset });
  const clientsQuery = useClients();
  const collaboratorsQuery = useCollaborators();

  const items = tasksQuery.data?.items ?? [];
  const pagination = tasksQuery.data?.pagination ?? { total: 0, limit, offset };

  const canPrev = offset > 0;
  const canNext = offset + limit < (pagination.total ?? 0);

  const showingText = useMemo(() => {
    const total = pagination.total ?? 0;
    if (total === 0) return "Mostrando 0";
    const from = Math.min(offset + 1, total);
    const to = Math.min(offset + limit, total);
    return `Mostrando ${from}-${to} de ${total}`;
  }, [offset, limit, pagination.total]);

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Tareas</h2>
          <p className="text-sm text-slate-500">Operación diaria • filtros y listado</p>
        </div>

        <button
          onClick={() => tasksQuery.refetch()}
          className="w-full rounded-xl bg-[#1177B6] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 sm:w-auto"
        >
          Refrescar
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        <div className="border-b border-slate-200/70 bg-slate-50 p-4">
          <div className="text-sm font-semibold text-slate-900">Filtros</div>
          <div className="text-xs text-slate-500">Filtra el listado de tickets</div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
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

          <div className="mt-4 flex flex-wrap items-center gap-2">
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
              {tasksQuery.isFetching ? "Actualizando…" : showingText}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200/70 p-4">
          <span className="text-sm font-semibold text-slate-900">Lista de tickets</span>
          <span className="text-xs text-slate-500">
            offset {pagination.offset ?? offset} • limit {pagination.limit ?? limit} • total {pagination.total ?? 0}
          </span>
        </div>

        {tasksQuery.isLoading ? (
          <div className="p-6 text-sm text-slate-500">Cargando…</div>
        ) : tasksQuery.isError ? (
          <div className="p-6 text-sm text-red-600">
            Error: {String(tasksQuery.error?.message ?? tasksQuery.error)}
          </div>
        ) : items.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">No hay resultados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Colaborador</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>

              <tbody>
                {items.map((t) => (
                  <tr
                    key={t.id}
                    className="cursor-pointer border-t border-slate-200/60 hover:bg-slate-50"
                    onClick={() => {
                      setSelectedTask(t);
                      setIsModalOpen(true);
                    }}
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">{t.id}</td>
                    <td className="px-4 py-3">
                      <div className="max-w-[520px] truncate text-slate-700" title={t.description ?? ""}>
                        {t.description ?? "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{t.clientName ?? t.clientId ?? "-"}</td>
                    <td className="px-4 py-3 text-slate-700">{t.collaboratorName ?? t.collaboratorId ?? "-"}</td>
                    <td className="px-4 py-3">
                      <Badge variant="neutral">{t.typeName ?? t.typeId ?? "-"}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {t.date ? new Date(t.date).toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={t.finished ? "success" : "warning"}>
                        {t.finished ? "Finalizada" : "Pendiente"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-200/70 p-4">
          <button
            disabled={!canPrev}
            onClick={() => setOffset((v) => Math.max(0, v - limit))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            disabled={!canNext}
            onClick={() => setOffset((v) => v + limit)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>

      <TaskDetailModal
        open={isModalOpen}
        task={selectedTask}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
      />
    </AppShell>
  );
}
