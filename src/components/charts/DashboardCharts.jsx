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
} from "recharts";

export default function DashboardCharts({ timeseriesItems }) {
  const statusTotals = useMemo(() => {
    const totalPending = timeseriesItems.reduce((acc, x) => acc + (x.pending || 0), 0);
    const totalFinished = timeseriesItems.reduce((acc, x) => acc + (x.finished || 0), 0);

    return [
      { name: "Pendientes", value: totalPending },
      { name: "Finalizadas", value: totalFinished },
    ];
  }, [timeseriesItems]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Pendientes vs Finalizadas */}
      <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
        <div className="mb-3">
          <div className="text-sm font-semibold text-slate-900">
            Estado (últimos días)
          </div>
          <div className="text-xs text-slate-500">Pendientes vs Finalizadas</div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusTotals}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Total" fill="#1177B6" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Serie por día */}
      <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
        <div className="mb-3">
          <div className="text-sm font-semibold text-slate-900">
            Tareas por día
          </div>
          <div className="text-xs text-slate-500">Totales diarios</div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeseriesItems}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
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
      </div>
    </div>
  );
}
