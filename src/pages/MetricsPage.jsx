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
  // Data histórica (2025) → rango amplio
  const summaryQuery = useDashboardSummary();
  const timeseriesQuery = useDashboardTimeseries(3650);
  const byTypeQuery = useDashboardByType(3650);
  const byCollaboratorQuery = useDashboardByCollaborator(3650, 10);

  const summary = summaryQuery.data ?? { total: 0, pending: 0, finished: 0 };

  const series = timeseriesQuery.data?.items ?? [];
  const byType = byTypeQuery.data?.items ?? [];
  const byCollab = byCollaboratorQuery.data?.items ?? [];

  const chartsLoading =
    timeseriesQuery.isLoading || byTypeQuery.isLoading || byCollaboratorQuery.isLoading;

  const chartsError =
    timeseriesQuery.isError || byTypeQuery.isError || byCollaboratorQuery.isError;

  // ✅ métricas derivadas (sin tocar backend)
  const completionRate =
    summary.total > 0 ? Math.round((summary.finished / summary.total) * 100) : 0;

  const pendingRate =
    summary.total > 0 ? Math.round((summary.pending / summary.total) * 100) : 0;

  return (
    <AppShell>
      {/* Header */}
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

      {/* ✅ KPIs (5 métricas) */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
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

        {/* 🆕 Métrica diferente */}
        <KPI
          title="% Pendientes"
          value={summaryQuery.isLoading ? "…" : `${pendingRate}%`}
          accent="orange"
        />

        {/* 🆕 Métrica diferente */}
        <KPI
          title="% Finalización"
          value={summaryQuery.isLoading ? "…" : `${completionRate}%`}
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
           summary={summary}
           timeseries={timeseriesQuery.data}
           byType={byTypeQuery.data}
            byCollaborator={byCollaboratorQuery.data}
        />
        )}
      </div>
    </AppShell>
  );
}
