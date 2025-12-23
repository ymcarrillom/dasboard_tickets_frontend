import React, { useState } from "react";
import AppShell from "../components/layout/AppShell";

import { useTasks } from "../hooks/useTasks";
import { useClients } from "../hooks/useClients";
import { useCollaborators } from "../hooks/useCollaborators";
import { useDashboardSummary } from "../hooks/useDashboardSummary";
import { useDashboardTimeseries } from "../hooks/useDashboardTimeseries";

import DashboardCharts from "../components/charts/DashboardCharts";
import TaskDetailModal from "../components/tasks/TaskDetailModal";

/* ---------- UI ---------- */

function KPI({ title, value, accent = "blue", subtitle }) {
  const bar =
    accent === "orange"
      ? "bg-lira-orange"
      : accent === "green"
      ? "bg-emerald-500"
      : "bg-lira-blue";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
      <div className={`h-1.5 ${bar}`} />
      <div className="p-4">
        <div className="text-sm text-slate-500">{title}</div>
        <div className="mt-1 flex items-end justify-between">
          <div className="text-3xl font-semibold text-slate-900">{value}</div>
          {subtitle && (
            <span className="rounded-xl bg-slate-50 px-2 py-1 text-xs text-slate-600">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Badge({ children, variant = "neutral" }) {
  const styles =
    variant === "success"
      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
      : variant === "warning"
      ? "bg-lira-orange/15 text-lira-orange border border-lira-orange/30"
      : "bg-slate-100 text-slate-700 border border-slate-200/70";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${styles}`}
    >
      {children}
    </span>
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

  // modal
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // 👇 NUEVO: timeseries para gráficas (bien hecho)
  const timeseriesQuery = useDashboardTimeseries(30);
  const series = timeseriesQuery.data?.items ?? [];

  const items = tasksQuery.data?.items ?? [];
  const pagination = tasksQuery.data?.pagination ?? { total: 0 };
  const summary = summaryQuery.data ?? { total: 0, pending: 0, finished: 0 };

  const canPrev = offset > 0;
  const canNext = offset + limit < (pagination.total ?? 0);

  return (
    <AppShell>
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Tareas</h2>
          <p className="text-sm text-slate-500">
            Operación en tiempo real{" "}
            {tasksQuery.isFetching || summaryQuery.isFetching || timeseriesQuery.isFetching
              ? "• actualizando..."
              : "• en línea"}
          </p>
        </div>

        <button
          onClick={() => {
            tasksQuery.refetch();
            summaryQuery.refetch();
            timeseriesQuery.refetch();
          }}
          className="w-full rounded-xl bg-lira-blue px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 sm:w-auto"
        >
          Refrescar
        </button>
      </div>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPI
          title="Total"
          value={summaryQuery.isLoading ? "…" : summary.total}
          accent="blue"
          subtitle="Todos"
        />
        <KPI
          title="Pendientes"
          value={summaryQuery.isLoading ? "…" : summary.pending}
          accent="orange"
          subtitle="Requiere acción"
        />
        <KPI
          title="Finalizadas"
          value={summaryQuery.isLoading ? "…" : summary.finished}
          accent="green"
          subtitle="Completadas"
        />
      </div>

      {/* 👇 GRÁFICAS (NUEVO) */}
      <div className="mb-6">
        {timeseriesQuery.isLoading ? (
          <div className="rounded-2xl border border-slate-200/70 bg-white p-4 text-sm text-slate-500 shadow-sm">
            Cargando gráficas…
          </div>
        ) : timeseriesQuery.isError ? (
          <div className="rounded-2xl border border-slate-200/70 bg-white p-4 text-sm text-red-600 shadow-sm">
            Error cargando gráficas
          </div>
        ) : (
          <DashboardCharts timeseriesItems={series} />
        )}
      </div>

      {/* FILTROS (panel pro) */}
      <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70 shadow-sm backdrop-blur">
        <div className="border-b border-slate-200/70 bg-gradient-to-r from-white to-slate-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Filtros</div>
              <div className="text-xs text-slate-500">
                Filtra por estado, cliente o colaborador
              </div>
            </div>

            <div className="text-xs text-slate-500">
              Mostrando{" "}
              <span className="font-semibold text-slate-800">{items.length}</span>{" "}
              de{" "}
              <span className="font-semibold text-slate-800">
                {pagination.total ?? "?"}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
            {/* Buscar */}
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-600">Buscar</label>
              <div className="mt-1">
                <input
                  value={q}
                  onChange={(e) => {
                    setOffset(0);
                    setQ(e.target.value);
                  }}
                  placeholder="Buscar en descripción…"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-lira-blue focus:ring-4 focus:ring-lira-blue/10"
                />
                <div className="mt-1 text-[11px] text-slate-400">
                  Tip: escribe parte del texto
                </div>
              </div>
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
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-lira-blue focus:ring-4 focus:ring-lira-blue/10"
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
                disabled={clientsQuery.isLoading}
                value={clientId}
                onChange={(e) => {
                  setOffset(0);
                  setClientId(e.target.value);
                }}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-lira-blue focus:ring-4 focus:ring-lira-blue/10 disabled:opacity-60"
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
                disabled={collaboratorsQuery.isLoading}
                value={collaboratorId}
                onChange={(e) => {
                  setOffset(0);
                  setCollaboratorId(e.target.value);
                }}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-lira-blue focus:ring-4 focus:ring-lira-blue/10 disabled:opacity-60"
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
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-lira-blue focus:ring-4 focus:ring-lira-blue/10"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={() => {
                setQ("");
                setFinished("");
                setClientId("");
                setCollaboratorId("");
                setLimit(20);
                setOffset(0);
              }}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Limpiar filtros
            </button>

            <button
              onClick={() => {
                tasksQuery.refetch();
                summaryQuery.refetch();
                timeseriesQuery.refetch();
              }}
              className="inline-flex items-center justify-center rounded-xl bg-lira-blue px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
            >
              Aplicar / Refrescar
            </button>
          </div>
        </div>
      </div>

      {/* TABLA */}
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b p-4">
          <span className="text-sm font-medium text-slate-700">Listado</span>
          <span className="text-xs text-slate-500">
            offset {offset} • limit {limit} • total {pagination.total ?? "?"}
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
                    className="cursor-pointer border-t hover:bg-slate-50"
                    onClick={() => {
                      setSelectedTask(t);
                      setIsModalOpen(true);
                    }}
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">{t.id}</td>

                    <td className="px-4 py-3">
                      <div
                        className="max-w-[520px] truncate text-slate-700"
                        title={t.description ?? ""}
                      >
                        {t.description ?? "-"}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {t.clientName ?? t.clientId ?? "-"}
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {t.collaboratorName ?? t.collaboratorId ?? "-"}
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

        {/* PAGINACIÓN */}
        <div className="flex items-center justify-between border-t p-4">
          <button
            disabled={!canPrev}
            onClick={() => setOffset((v) => Math.max(0, v - limit))}
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

      {/* MODAL */}
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
