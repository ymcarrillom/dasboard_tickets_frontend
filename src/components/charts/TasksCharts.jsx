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

function toDayKey(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  // YYYY-MM-DD
  return d.toISOString().slice(0, 10);
}

export default function TasksCharts({ items }) {
  const { statusBars, byDay } = useMemo(() => {
    const pending = items.filter((t) => !t.finished).length;
    const finished = items.filter((t) => t.finished).length;

    const map = new Map();
    for (const t of items) {
      const key = t.date ? toDayKey(t.date) : null;
      if (!key) continue;
      map.set(key, (map.get(key) ?? 0) + 1);
    }

    const byDayArr = Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14) // últimos 14 días con data
      .map(([day, count]) => ({ day, count }));

    return {
      statusBars: [
        { name: "Pendientes", value: pending },
        { name: "Finalizadas", value: finished },
      ],
      byDay: byDayArr,
    };
  }, [items]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Pendientes vs Finalizadas */}
      <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
        <div className="mb-3">
          <div className="text-sm font-semibold text-slate-900">
            Estado de tareas
          </div>
          <div className="text-xs text-slate-500">Pendientes vs Finalizadas</div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusBars}>
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

      {/* Tareas por día */}
      <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
        <div className="mb-3">
          <div className="text-sm font-semibold text-slate-900">
            Tareas por día
          </div>
          <div className="text-xs text-slate-500">Últimos días (según datos cargados)</div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={byDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                name="Tareas"
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
