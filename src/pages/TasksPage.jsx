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
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${styles}`}>
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
}

function Button({ children, onClick, disabled, variant = "primary" }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold shadow-sm transition";
  const styles =
    variant === "ghost"
      ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      : "bg-[#1177B6] text-white hover:brightness-110";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

export default function TasksPage() {
  // filtros
  const [q, setQ] = useState("");
  const [finished, setFinished] = useState(""); // "" | "true" | "false"
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

  const clearFilters = () => {
    setQ("");
    setFinished("");
    setClientId("");
    setCollaboratorId("");
    setLimit(20);
    setOffset(0);
  };

  return (
    <AppShell wide>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Tareas</h2>
          <p className="text-sm text-slate-500">Operación diaria • filtros y listado</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="ghost" onClick={clearFilters}>
            Limpiar
          </Button>
          <Button onClick={() => tasksQuery.refetch()}>
            {tasksQuery.isFetching ? "Actualizando…" : "Refrescar"}
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        <div className="border-b border-slate-200/70 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
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
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none placeholder:text-slate-400 focus:border-[#1177B6] focus:ring-4 focus:ring-[#1177B6]/10"
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
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-[#1177B6] focus:ring-4 focus:ring-[#1177B6]/10 disabled:cursor-not-allowed disabled:opacity-60"
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
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-[#1177B6] focus:ring-4 focus:ring-[#1177B6]/10 disabled:cursor-not-allowed disabled:opacity-60"
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

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-slate-500">{tasksQuery.isFetching ? "Actualizando…" : "Listo"}</div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" disabled={!canPrev} onClick={() => setOffset((v) => Math.max(0, v - limit))}>
                ← Anterior
              </Button>
              <Button variant="ghost" disabled={!canNext} onClick={() => setOffset((v) => v + limit)}>
                Siguiente →
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200/70 bg-slate-50 p-4">
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
          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full min-w-[1200px] text-left text-sm">
              <thead className="sticky top-0 z-20 bg-white text-xs uppercase text-slate-500">
                <tr className="border-b border-slate-200/70">
                  <th className="sticky left-0 z-30 bg-white px-4 py-3">ID</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Colaborador</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200/60">
                {items.map((t) => (
                  <tr
                    key={t.id}
                    className="group cursor-pointer transition hover:bg-slate-50"
                    onClick={() => {
                      setSelectedTask(t);
                      setIsModalOpen(true);
                    }}
                  >
                    <td className="sticky left-0 z-10 bg-white px-4 py-3 font-semibold text-slate-900 group-hover:bg-slate-50">
                      {t.id}
                    </td>

                    <td className="px-4 py-3">
                      <div
                        className="max-w-[560px] truncate text-slate-700 group-hover:text-slate-900"
                        title={t.description ?? ""}
                      >
                        {t.description ?? "-"}
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        {t.typeName ?? `Tipo ${t.typeId ?? "-"}`}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      <div className="max-w-[220px] truncate" title={t.clientName ?? ""}>
                        {t.clientName ?? t.clientId ?? "-"}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      <div className="max-w-[200px] truncate" title={t.collaboratorName ?? ""}>
                        {t.collaboratorName ?? t.collaboratorId ?? "-"}
                      </div>
                    </td>

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
      </div>

      {/* Modal */}
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
