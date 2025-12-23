import React, { useMemo, useState } from "react";
import { useTasks } from "../hooks/useTasks";
import { useClients } from "../hooks/useClients";
import { useCollaborators } from "../hooks/useCollaborators";
import { useDashboardSummary } from "../hooks/useDashboardSummary";

function StatCard({ title, value }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">
        {value}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  // filtros
  const [q, setQ] = useState("");
  const [finished, setFinished] = useState("");
  const [clientId, setClientId] = useState("");
  const [collaboratorId, setCollaboratorId] = useState("");

  // paginación
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);

  // queries
  const tasksQuery = useTasks({
    q,
    finished,
    clientId,
    collaboratorId,
    limit,
    offset,
  });

  const summaryQuery = useDashboardSummary();
  const clientsQuery = useClients();
  const collaboratorsQuery = useCollaborators();

  const items = tasksQuery.data?.items ?? [];
  const pagination = tasksQuery.data?.pagination ?? { total: 0 };

  const summary = summaryQuery.data ?? {
    total: 0,
    pending: 0,
    finished: 0,
  };

  const canPrev = offset > 0;
  const canNext = offset + limit < (pagination.total ?? 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Dashboard de Tickets
            </h1>
            <p className="text-sm text-slate-500">
              Backend + Webhooks{" "}
              {tasksQuery.isFetching || summaryQuery.isFetching
                ? "• actualizando..."
                : "• en línea"}
            </p>
          </div>
          <button
            onClick={() => {
              tasksQuery.refetch();
              summaryQuery.refetch();
            }}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Refrescar
          </button>
        </div>

        {/* KPIs */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="Total"
            value={summaryQuery.isLoading ? "…" : summary.total}
          />
          <StatCard
            title="Pendientes"
            value={summaryQuery.isLoading ? "…" : summary.pending}
          />
          <StatCard
            title="Finalizadas"
            value={summaryQuery.isLoading ? "…" : summary.finished}
          />
        </div>

        {/* Filtros */}
        <div className="mb-4 rounded-2xl border bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
            {/* Buscar */}
            <div>
              <label className="text-xs font-medium text-slate-600">
                Buscar
              </label>
              <input
                value={q}
                onChange={(e) => {
                  setOffset(0);
                  setQ(e.target.value);
                }}
                placeholder="Descripción..."
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              />
            </div>

            {/* Estado */}
            <div>
              <label className="text-xs font-medium text-slate-600">
                Estado
              </label>
              <select
                value={finished}
                onChange={(e) => {
                  setOffset(0);
                  setFinished(e.target.value);
                }}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              >
                <option value="">Todos</option>
                <option value="false">Pendientes</option>
                <option value="true">Finalizadas</option>
              </select>
            </div>

            {/* Cliente */}
            <div>
              <label className="text-xs font-medium text-slate-600">
                Cliente
              </label>
              <select
                disabled={clientsQuery.isLoading}
                value={clientId}
                onChange={(e) => {
                  setOffset(0);
                  setClientId(e.target.value);
                }}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm disabled:opacity-60"
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
              <label className="text-xs font-medium text-slate-600">
                Colaborador
              </label>
              <select
                disabled={collaboratorsQuery.isLoading}
                value={collaboratorId}
                onChange={(e) => {
                  setOffset(0);
                  setCollaboratorId(e.target.value);
                }}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm disabled:opacity-60"
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
              <label className="text-xs font-medium text-slate-600">
                Tamaño
              </label>
              <select
                value={limit}
                onChange={(e) => {
                  setOffset(0);
                  setLimit(Number(e.target.value));
                }}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Limpiar filtros */}
          <button
            onClick={() => {
              setQ("");
              setFinished("");
              setClientId("");
              setCollaboratorId("");
              setLimit(20);
              setOffset(0);
            }}
            className="mt-3 rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
          >
            Limpiar filtros
          </button>
        </div>

        {/* Tabla */}
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b p-4">
            <span className="text-sm font-medium text-slate-700">
              Tareas
            </span>
            <span className="text-xs text-slate-500">
              offset {offset} • limit {limit} • total{" "}
              {pagination.total ?? "?"}
            </span>
          </div>

          {tasksQuery.isLoading ? (
            <div className="p-6 text-sm text-slate-500">Cargando…</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">
              No hay resultados
            </div>
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
                    <th className="px-4 py-3">Finalizada</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((t) => (
                    <tr key={t.id} className="border-t hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{t.id}</td>
                      <td className="px-4 py-3">{t.description ?? "-"}</td>
                      <td className="px-4 py-3">
                        {t.clientName ?? t.clientId ?? "-"}
                      </td>
                      <td className="px-4 py-3">
                        {t.collaboratorName ?? t.collaboratorId ?? "-"}
                      </td>
                      <td className="px-4 py-3">
                        {t.typeName ?? t.typeId ?? "-"}
                      </td>
                      <td className="px-4 py-3">
                        {t.date
                          ? new Date(t.date).toLocaleString()
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            "rounded-full px-2 py-1 text-xs " +
                            (t.finished
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700")
                          }
                        >
                          {t.finished ? "Sí" : "No"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          <div className="flex justify-between border-t p-4">
            <button
              disabled={!canPrev}
              onClick={() =>
                setOffset((v) => Math.max(0, v - limit))
              }
              className="rounded-xl border px-3 py-2 text-sm disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              disabled={!canNext}
              onClick={() => setOffset((v) => v + limit)}
              className="rounded-xl border px-3 py-2 text-sm disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
