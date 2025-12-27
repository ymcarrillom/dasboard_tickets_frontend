import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#1177B6", "#F08A24", "#6B7280", "#22C55E", "#A855F7", "#06B6D4", "#EF4444"];

function Card({ title, subtitle, children, right }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200/70 bg-slate-50 p-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
        </div>
        {right}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function DashboardCharts({ summary, timeseries, byType, byCollaborator }) {
  const statusBars = useMemo(() => {
    const pending = Number(summary?.pending ?? 0);
    const finished = Number(summary?.finished ?? 0);
    return [
      { name: "Pendientes", value: pending },
      { name: "Finalizadas", value: finished },
    ];
  }, [summary]);

  const trend = useMemo(() => {
    const items = timeseries?.items ?? [];
    // Normaliza day (puede venir como "2025-06-26T00:00:00.000Z")
    return items.map((i) => {
      const d = typeof i.day === "string" ? i.day.slice(0, 10) : String(i.day);
      return { ...i, day: d };
    });
  }, [timeseries]);

  const typePie = useMemo(() => {
    const items = byType?.items ?? [];
    if (!items.length) return [];
    // Top 6 y el resto "Otros"
    const top = items.slice(0, 6);
    const rest = items.slice(6);
    const restTotal = rest.reduce((acc, it) => acc + Number(it.total ?? 0), 0);
    const out = top.map((t) => ({ name: t.typeName, value: Number(t.total ?? 0) }));
    if (restTotal > 0) out.push({ name: "Otros", value: restTotal });
    return out;
  }, [byType]);

  const collaboratorBars = useMemo(() => {
    const items = byCollaborator?.items ?? [];
    return items.map((c) => ({
      name: c.collaboratorName,
      total: Number(c.total ?? 0),
    }));
  }, [byCollaborator]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Estado */}
      <Card title="Estado" subtitle="Pendientes vs Finalizadas">
        <div className="h-72 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusBars} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: "#334155", fontSize: 12 }} />
              <YAxis tick={{ fill: "#334155", fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" name="Total" fill="#1177B6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Tendencia */}
      <Card title="Tendencia" subtitle="Total de tareas por día">
        <div className="h-72 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fill: "#334155", fontSize: 12 }} />
              <YAxis tick={{ fill: "#334155", fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="total" name="Total" stroke="#F08A24" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="pending" name="Pendientes" stroke="#1177B6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="finished" name="Finalizadas" stroke="#22C55E" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Por tipo (dona) */}
      <Card title="Distribución por tipo" subtitle="Top tipos + otros">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[240px_1fr] items-center">
          <div className="h-56 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typePie}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {typePie.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Leyenda vertical al lado, compacta */}
          <div className="min-w-0">
            <div className="grid grid-cols-1 gap-2 text-xs text-slate-700">
              {typePie.map((it, idx) => (
                <div key={it.name} className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="truncate">{it.name}</span>
                  <span className="ml-auto tabular-nums text-slate-500">{it.value}</span>
                </div>
              ))}
              {!typePie.length && <div className="text-slate-500">Sin datos</div>}
            </div>
          </div>
        </div>
      </Card>

      {/* Por colaborador */}
      <Card title="Tickets por colaborador" subtitle="Top 10">
        <div className="h-72 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={collaboratorBars} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                interval={0}
                angle={-25}
                textAnchor="end"
                height={70}
                tick={{ fill: "#334155", fontSize: 11 }}
              />
              <YAxis tick={{ fill: "#334155", fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="total" name="Total" fill="#1177B6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
