import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#1177B6", "#D17745", "#8B8B90", "#22C55E", "#F59E0B", "#A855F7", "#06B6D4"];

function Card({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="text-xs text-slate-500">{subtitle}</div>
      </div>
      {children}
    </div>
  );
}

function formatDayLabel(day) {
  if (!day) return "";
  const s = String(day);
  return s.length >= 10 ? s.slice(5, 10) : s; // "MM-DD"
}

export default function DashboardCharts({
  timeseriesItems = [],
  byTypeItems = [],
  byCollaboratorItems = [],
}) {
  const statusTotals = useMemo(() => {
    const pending = timeseriesItems.reduce((acc, x) => acc + (x.pending || 0), 0);
    const finished = timeseriesItems.reduce((acc, x) => acc + (x.finished || 0), 0);
    return [
      { name: "Pendientes", value: pending },
      { name: "Finalizadas", value: finished },
    ];
  }, [timeseriesItems]);

  const donutData = useMemo(() => {
    const sorted = [...byTypeItems].sort((a, b) => (b.total || 0) - (a.total || 0));
    const top = sorted.slice(0, 6);
    const rest = sorted.slice(6);
    const restTotal = rest.reduce((acc, x) => acc + (x.total || 0), 0);
    const merged = restTotal > 0 ? [...top, { typeName: "Otros", total: restTotal }] : top;

    return merged.map((x) => ({
      name: x.typeName ?? "N/A",
      value: Number(x.total ?? 0),
    }));
  }, [byTypeItems]);

  const topCollab = useMemo(() => {
    return [...byCollaboratorItems]
      .sort((a, b) => (b.total || 0) - (a.total || 0))
      .slice(0, 10)
      .map((x) => ({
        name: x.collaboratorName ?? "N/A",
        total: Number(x.total ?? 0),
      }));
  }, [byCollaboratorItems]);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <Card title="Estado" subtitle="Pendientes vs Finalizadas">
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusTotals}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Total" fill="#1177B6" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Tendencia" subtitle="Total por día">
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeseriesItems}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tickFormatter={formatDayLabel} tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                name="Total"
                stroke="#D17745"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Distribución por tipo" subtitle="Top tipos + otros">
        <div className="h-44">
          {donutData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              Sin datos
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Legend />
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                >
                  {donutData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Card title="Carga por colaborador" subtitle="Top 10 por volumen">
        <div className="h-44">
          {topCollab.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              Sin datos
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCollab}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  interval={0}
                  angle={-12}
                  textAnchor="end"
                  height={55}
                  tick={{ fontSize: 11 }}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Total" fill="#1177B6" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  );
}
