import React from "react";
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

const COLORS = ["#1177B6", "#D17745", "#9CA3AF", "#22C55E", "#A855F7", "#0EA5E9", "#F59E0B"];

function Card({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white shadow-sm">
      <div className="border-b border-slate-200/70 p-4">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function DashboardCharts({
  timeseriesItems = [],
  byTypeItems = [],
  byCollaboratorItems = [],
}) {
  // Serie temporal (línea)
  const timeseriesData = timeseriesItems.map((d) => ({
    day: new Date(d.day).toLocaleDateString(),
    total: d.total,
    pending: d.pending,
    finished: d.finished,
  }));

  // Dona por tipo (Top 5 + Otros)
  const sortedTypes = [...byTypeItems].sort((a, b) => (b.total ?? 0) - (a.total ?? 0));
  const topTypes = sortedTypes.slice(0, 5);
  const otherTypes = sortedTypes.slice(5);

  const donutData = topTypes.map((t) => ({ name: t.typeName ?? "N/A", value: Number(t.total ?? 0) }));
  if (otherTypes.length > 0) {
    donutData.push({
      name: "Otros",
      value: otherTypes.reduce((acc, t) => acc + Number(t.total ?? 0), 0),
    });
  }

  // Barras por colaborador (Top 10)
  const collaboratorData = [...byCollaboratorItems]
    .sort((a, b) => (b.total ?? 0) - (a.total ?? 0))
    .slice(0, 10)
    .map((c) => ({
      name: c.collaboratorName ?? "N/A",
      total: Number(c.total ?? 0),
    }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Estado */}
      <Card title="Estado" subtitle="Pendientes vs Finalizadas">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { name: "Pendientes", total: timeseriesItems.reduce((a, b) => a + (b.pending ?? 0), 0) },
                { name: "Finalizadas", total: timeseriesItems.reduce((a, b) => a + (b.finished ?? 0), 0) },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" fill="#1177B6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Tendencia */}
      <Card title="Tendencia" subtitle="Total de tareas por día">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeseriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#D17745" strokeWidth={2} dot={false} name="Total" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Distribución por tipo (DONA) */}
      <Card title="Distribución por tipo" subtitle="Top tipos + otros">
        <div className="h-44">
          {donutData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">Sin datos</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />

                {/* ✅ Legend más pegado a la dona */}
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconType="circle"
                  formatter={(value) => (
                    <span style={{ fontSize: 12, color: "#334155" }}>{value}</span>
                  )}
                  wrapperStyle={{
                    maxHeight: 160,
                    overflowY: "auto",
                    paddingLeft: 6, // 👈 antes 12, ahora más pegado
                    marginLeft: 0,
                  }}
                />

                {/* ✅ Dona un poquito más hacia la derecha */}
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={42}
                  outerRadius={70}
                  paddingAngle={2}
                  cx="40%"   // 👈 antes 35%, ahora más cerca del legend
                  cy="50%"
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

      {/* Tickets por colaborador */}
      <Card title="Tickets por colaborador" subtitle="Top 10">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={collaboratorData} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              {/* ✅ Mostrar nombres abajo y rotarlos para que se lean */}
              <XAxis
                dataKey="name"
                interval={0}
                angle={-25}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 11 }}
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" fill="#1177B6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
