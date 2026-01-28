// src/components/charts/DashboardCharts.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#1177B6",
  "#D17745",
  "#10B981",
  "#8B5CF6",
  "#F59E0B",
  "#06B6D4",
  "#EF4444",
  "#64748B",
  "#0EA5E9",
  "#A855F7",
];

function Card({ title, subtitle, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
      <div className="border-b border-slate-200/70 bg-slate-50 p-4">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="text-xs text-slate-500">{subtitle}</div>
      </div>
      <div className="p-4 min-w-0">{children}</div>
    </div>
  );
}

function NiceTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm">
      <div className="font-semibold text-slate-900">{label}</div>
      <div className="mt-1 space-y-1">
        {payload.map((p, idx) => (
          <div key={`${p.dataKey}-${idx}`} className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: p.color }}
            />
            <span className="text-slate-600">{p.name ?? p.dataKey}:</span>
            <span className="font-semibold text-slate-900">{p.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * ChartBox robusto:
 * - Guarda el último tamaño válido (lastGood)
 * - Ignora tamaños 0 (evita parpadeo)
 * - Fallback si ResizeObserver no existe
 * - Soporta children como función o nodo
 */
function ChartBox({ height = 260, children }) {
  const ref = useRef(null);

  const lastGood = useRef({ w: 1, h: height }); // fallback seguro (1 evita "0")
  const [size, setSize] = useState({ w: 0, h: 0 });

  const commit = (w, h) => {
    const ww = Math.floor(w);
    const hh = Math.floor(h);

    // ignorar tamaños inválidos para no desmontar
    if (ww <= 0 || hh <= 0) return;

    lastGood.current = { w: ww, h: hh };
    setSize((prev) => (prev.w === ww && prev.h === hh ? prev : { w: ww, h: hh }));
  };

  // medición inicial (sin depender del observer)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    commit(rect.width, rect.height);

    // re-medir un tick después por si el layout cambia
    const t = setTimeout(() => {
      const r2 = el.getBoundingClientRect();
      commit(r2.width, r2.height);
    }, 50);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // ✅ ResizeObserver si existe
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver((entries) => {
        const cr = entries?.[0]?.contentRect;
        if (!cr) return;
        commit(cr.width, cr.height);
      });
      ro.observe(el);
      return () => ro.disconnect();
    }

    // ✅ Fallback: window resize
    const onResize = () => {
      const rect = el.getBoundingClientRect();
      commit(rect.width, rect.height);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const effective = size.w > 0 && size.h > 0 ? size : lastGood.current;

  return (
    <div ref={ref} className="w-full min-w-0" style={{ height, minHeight: height }}>
      {typeof children === "function" ? (
        effective.w > 0 && effective.h > 0 ? (
          children(effective)
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-500">
            Cargando gráfico...
          </div>
        )
      ) : (
        children
      )}
    </div>
  );
}

export default function DashboardCharts({
  summary,
  timeseriesItems = [],
  byTypeItems = [],
  byCollaboratorItems = [],
}) {
  const statusData = useMemo(() => {
    const pending = Number(summary?.pending ?? 0);
    const finished = Number(summary?.finished ?? 0);
    return [
      { name: "Pendientes", value: pending },
      { name: "Finalizadas", value: finished },
    ];
  }, [summary]);

  const trendData = useMemo(() => {
    return (timeseriesItems ?? []).map((d) => ({
      day: typeof d.day === "string" ? d.day.slice(0, 10) : d.day,
      total: Number(d.total ?? 0),
    }));
  }, [timeseriesItems]);

  const typeTop = useMemo(() => {
    const items = (byTypeItems ?? []).map((x) => ({
      name: x.typeName ?? `Tipo ${x.typeId}`,
      total: Number(x.total ?? 0),
    }));
    return items.slice(0, 10);
  }, [byTypeItems]);

  const collabTop = useMemo(() => {
    return (byCollaboratorItems ?? []).map((x) => ({
      name: x.collaboratorName ?? `Colaborador ${x.collaboratorId}`,
      total: Number(x.total ?? 0),
    }));
  }, [byCollaboratorItems]);

  const typeLegend = useMemo(() => {
    return typeTop.map((t, idx) => ({
      ...t,
      color: COLORS[idx % COLORS.length],
    }));
  }, [typeTop]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card title="Estado" subtitle="Pendientes vs Finalizadas">
        <ChartBox height={260}>
          {({ w, h }) => (
            <BarChart width={w} height={h} data={statusData} margin={{ top: 10, right: 16, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 12 }} />
              <YAxis tick={{ fill: "#64748B", fontSize: 12 }} />
              <Tooltip content={<NiceTooltip />} />
              <Bar dataKey="value" name="Total" radius={[10, 10, 0, 0]}>
                {statusData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "#D17745" : "#1177B6"} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ChartBox>
      </Card>

      <Card title="Tendencia" subtitle="Total de tareas por día">
        <ChartBox height={260}>
          {({ w, h }) => (
            <LineChart width={w} height={h} data={trendData} margin={{ top: 10, right: 16, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="day" tick={{ fill: "#64748B", fontSize: 11 }} />
              <YAxis tick={{ fill: "#64748B", fontSize: 12 }} />
              <Tooltip content={<NiceTooltip />} />
              <Line type="monotone" dataKey="total" name="Total" stroke="#D17745" strokeWidth={2.5} dot={false} />
            </LineChart>
          )}
        </ChartBox>
      </Card>

      <Card title="Distribución por tipo" subtitle="Top tipos + otros">
        <div className="flex flex-col items-center gap-3 md:flex-row md:items-start md:justify-between md:gap-4 min-w-0">
          <div className="shrink-0" style={{ width: 220, height: 220 }}>
            <ChartBox height={220}>
              {({ w, h }) => {
                const minSide = Math.min(w, h);
                const outer = Math.max(70, Math.floor(minSide / 2) - 10);
                const inner = Math.floor(outer * 0.65);

                return (
                  <PieChart width={w} height={h}>
                    <Pie
                      data={typeLegend}
                      dataKey="total"
                      nameKey="name"
                      innerRadius={inner}
                      outerRadius={outer}
                      paddingAngle={2}
                    >
                      {typeLegend.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<NiceTooltip />} />
                  </PieChart>
                );
              }}
            </ChartBox>
          </div>

          <div className="w-full md:pl-1 min-w-0">
            {typeLegend.length === 0 ? (
              <div className="text-center text-sm text-slate-500">Sin datos</div>
            ) : (
              <div className="space-y-2">
                {typeLegend.map((it) => (
                  <div
                    key={it.name}
                    className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white px-3 py-2"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: it.color }} />
                      <div className="truncate text-xs font-semibold uppercase tracking-wide text-slate-900">
                        {it.name}
                      </div>
                    </div>
                    <div className="ml-3 shrink-0 rounded-lg bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700">
                      {it.total}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card title="Tickets por colaborador" subtitle="Top 10">
        <ChartBox height={260}>
          {({ w, h }) => (
            <BarChart width={w} height={h} data={collabTop} margin={{ top: 10, right: 16, left: 0, bottom: 28 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                dataKey="name"
                interval={0}
                angle={-18}
                textAnchor="end"
                height={50}
                tick={{ fill: "#64748B", fontSize: 11 }}
              />
              <YAxis tick={{ fill: "#64748B", fontSize: 12 }} />
              <Tooltip content={<NiceTooltip />} />
              <Bar dataKey="total" name="Total" fill="#1177B6" radius={[10, 10, 0, 0]} />
            </BarChart>
          )}
        </ChartBox>
      </Card>
    </div>
  );
}
