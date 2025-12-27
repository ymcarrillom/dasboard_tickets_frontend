import React, { useMemo, useState } from "react";
import AppShell from "../components/layout/AppShell";
import DashboardCharts from "../components/charts/DashboardCharts";

import { useDashboardSummary } from "../hooks/useDashboardSummary";
import { useDashboardTimeseries } from "../hooks/useDashboardTimeseries";
import { useDashboardByType } from "../hooks/useDashboardByType";
import { useDashboardByCollaborator } from "../hooks/useDashboardByCollaborator";
import { useDashboardByClientPending } from "../hooks/useDashboardByClientPending";

function KPI({ title, value, accent = "blue" }) {
  const bar =
    accent === "orange"
      ? "bg-[#D17745]"
      : accent === "green"
      ? "bg-emerald-500"
      : "bg-[#1177B6]";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
      <div className={`h-1.5 ${bar}`} />
      <div className="p-4">
        <div className="text-sm text-slate-500">{title}</div>
        <div className="mt-1 text-3xl font-semibold text-slate-900">{value}</div>
      </div>
    </div>
  );
}

const RANGE_OPTIONS = [
  { label: "30 días", value: 30 },
  { label: "90 días", value: 90 },
  { label: "180 días", value: 180 },
];

export default function MetricsPage() {
  // ✅ selector de rango (por defecto 90)
  const [days, setDays] = useState(90);

  // Summary no depende del rango (global), pero se refresca igual cada 30s
  const summaryQuery = useDashboardSummary();

  // ✅ todo lo demás usa el rango seleccionado
  const timeseriesQuery = useDashboardTimeseries(days);
  const byTypeQuery = useDashboardByType(days);
  const byCollaboratorQuery = useDashboardByCollaborator(days, 10);

  // Top clientes pendientes — usa el mismo rango, top 5
  const topClientsQuery = useDashboardByClientPending(days, 5);

  const summary = summaryQuery.data ?? {
    total: 0,
    pending: 0,
    finished: 0,
    createdToday: 0,
    finishedToday: 0,
    inProgress: 0,
    notStarted: 0,
  };

  const chartsLoading =
    timeseriesQuery.isLoading || byTypeQuery.isLoading || byCollaboratorQuery.isLoading;

  const chartsError =
    timeseriesQuery.isError || byTypeQuery.isError || byCollaboratorQuery.isError;

  const completionRate = useMemo(() => {
    return summary.total > 0 ? Math.round((summary.finished / summary.total) * 100) : 0;
  }, [summary.total, summary.finished]);

  const pendingRate = useMemo(() => {
    return summary.total > 0 ? Math.round((summary.pending / summary.total) * 100) : 0;
  }, [summary.total, summary.pending]);

  const topClients = topClientsQuery.data?.items ?? [];

  const rangeLabel = useMemo(() => {
    return RANGE_OPTIONS.find((o) => o.value === days)?.label ?? `${days} días`;
  }, [days]);

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">LIRA · Operaciones Tecnológicas</h2>
          <p className="text-sm text-slate-500">KPIs y gráficas agregadas de tickets</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Selector rango */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <span className="text-xs font-semibold text-slate-600">Rango</span>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm outline-none focus:border-[#1177B6] focus:ring-4 focus:ring-[#1177B6]/10"
            >
              {RANGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Refrescar */}
          <button
            onClick={() => {
              summaryQuery.refetch();
              timeseriesQuery.refetch();
              byTypeQuery.refetch();
              byCollaboratorQuery.refetch();
              topClientsQuery.refetch();
            }}
            className="w-full rounded-xl bg-[#1177B6] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 sm:w-auto"
          >
            Refrescar
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <KPI title="Total" value={summaryQuery.isLoading ? "…" : summary.total} accent="blue" />
        <KPI
          title="Pendientes"
          value={summaryQuery.isLoading ? "…" : summary.pending}
          accent="orange"
        />
        <KPI
          title="Finalizadas"
          value={summaryQuery.isLoading ? "…" : summary.finished}
          accent="green"
        />
        <KPI
          title="% Pendientes"
          value={summaryQuery.isLoading ? "…" : `${pendingRate}%`}
          accent="orange"
        />
        <KPI
          title="% Finalización"
          value={summaryQuery.isLoading ? "…" : `${completionRate}%`}
          accent="green"
        />

        <KPI
          title="Creados hoy"
          value={summaryQuery.isLoading ? "…" : summary.createdToday}
          accent="blue"
        />
        <KPI
          title="Finalizados hoy"
          value={summaryQuery.isLoading ? "…" : summary.finishedToday}
          accent="green"
        />
        <KPI
          title="En progreso"
          value={summaryQuery.isLoading ? "…" : summary.inProgress}
          accent="orange"
        />
        <KPI
          title="Sin iniciar"
          value={summaryQuery.isLoading ? "…" : summary.notStarted}
          accent="orange"
        />
      </div>

      {/* Gráficas */}
      <div>
        {chartsLoading ? (
          <div className="rounded-2xl border border-slate-200/70 bg-white p-4 text-sm text-slate-500 shadow-sm">
            Cargando gráficas…
          </div>
        ) : chartsError ? (
          <div className="rounded-2xl border border-slate-200/70 bg-white p-4 text-sm text-red-600 shadow-sm">
            Error cargando gráficas (revisa /api/dashboard/*)
          </div>
        ) : (
          <DashboardCharts
            summary={summary}
            timeseries={timeseriesQuery.data}
            byType={byTypeQuery.data}
            byCollaborator={byCollaboratorQuery.data}
          />
        )}
      </div>

      {/* Top clientes pendientes */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        <div className="border-b border-slate-200/70 bg-slate-50 p-4">
          <div className="text-sm font-semibold text-slate-900">Top clientes con pendientes</div>
          <div className="text-xs text-slate-500">Rango: {rangeLabel}</div>
        </div>

        <div className="p-4">
          {topClientsQuery.isLoading ? (
            <div className="text-sm text-slate-500">Cargando…</div>
          ) : topClients.length === 0 ? (
            <div className="text-sm text-slate-500">Sin datos</div>
          ) : (
            <div className="space-y-2">
              {topClients.map((c) => (
                <div key={c.clientId} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1 truncate text-sm text-slate-800">
                    {c.clientName}
                  </div>
                  <div className="rounded-full bg-[#1177B6]/10 px-2 py-1 text-xs font-semibold text-[#1177B6]">
                    {c.pending}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
