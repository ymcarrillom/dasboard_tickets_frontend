import React from "react";
import AppShell from "../components/layout/AppShell";
import DashboardCharts from "../components/charts/DashboardCharts";

import { useDashboardSummary } from "../hooks/useDashboardSummary";
import { useDashboardTimeseries } from "../hooks/useDashboardTimeseries";
import { useDashboardByType } from "../hooks/useDashboardByType";
import { useDashboardByCollaborator } from "../hooks/useDashboardByCollaborator";

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

export default function MetricsPage() {
  const summaryQuery = useDashboardSummary();
  const timeseriesQuery = useDashboardTimeseries(3650);
  const byTypeQuery = useDashboardByType(3650);
  const byCollaboratorQuery = useDashboardByCollaborator(3650, 10);

  const summary = summaryQuery.data ?? {
    total: 0,
    pending: 0,
    finished: 0,
    pendingNotStarted: 0,
    inProgress: 0,
    avgResponseMin: null,
    avgHandleMin: null,
  };

  const series = timeseriesQuery.data?.items ?? [];
  const byType = byTypeQuery.data?.items ?? [];
  const byCollab = byCollaboratorQuery.data?.items ?? [];

  const chartsLoading =
    timeseriesQuery.isLoading || byTypeQuery.isLoading || byCollaboratorQuery.isLoading;

  const chartsError =
    timeseriesQuery.isError || byTypeQuery.isError || byCollaboratorQuery.isError;

  const completionRate =
    summary.total > 0 ? Math.round((summary.finished / summary.total) * 100) : 0;

  const pendingRate =
    summary.total > 0 ? Math.round((summary.pending / summary.total) * 100) : 0;

  const fmtHM = (minutes) => {
    if (minutes === null || minutes === undefined) return "—";
    const m = Math.round(Number(minutes));
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return h > 0 ? `${h}h ${mm}m` : `${mm}m`;
  };

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Métricas</h2>
          <p className="text-sm text-slate-500">KPIs y gráficas agregadas</p>
        </div>

        <button
          onClick={() => {
            summaryQuery.refetch();
            timeseriesQuery.refetch();
            byTypeQuery.refetch();
            byCollaboratorQuery.refetch();
          }}
          className="w-full rounded-xl bg-[#1177B6] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 sm:w-auto"
        >
          Refrescar
        </button>
      </div>

      {/* KPIs */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          title="% Finalización"
          value={summaryQuery.isLoading ? "…" : `${completionRate}%`}
          accent="green"
        />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPI
          title="Pendientes sin iniciar"
          value={summaryQuery.isLoading ? "…" : summary.pendingNotStarted ?? "—"}
          accent="orange"
        />
        <KPI
          title="En atención"
          value={summaryQuery.isLoading ? "…" : summary.inProgress ?? "—"}
          accent="blue"
        />
        <KPI
          title="Prom. tiempo respuesta"
          value={summaryQuery.isLoading ? "…" : fmtHM(summary.avgResponseMin)}
          accent="blue"
        />
        <KPI
          title="Prom. tiempo atención"
          value={summaryQuery.isLoading ? "…" : fmtHM(summary.avgHandleMin)}
          accent="green"
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
            summary={summary}              // ✅ para “Estado”
            timeseriesItems={series}
            byTypeItems={byType}
            byCollaboratorItems={byCollab}
          />
        )}
      </div>
    </AppShell>
  );
}
