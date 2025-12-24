import React, { useState } from "react";
import { NavLink } from "react-router-dom";

function SidebarLink({ to, label, icon, collapsed }) {
  return (
    <NavLink
      to={to}
      end
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        [
          "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition",
          isActive
            ? "bg-[#1177B6] text-white shadow-sm"
            : "text-slate-700 hover:bg-slate-100",
        ].join(" ")
      }
    >
      <span className="text-base">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

export default function AppShell({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ✅ Un solo contenedor estable en todas las rutas */}
      <div
        className={[
          "mx-auto w-full max-w-[1400px] p-4",
          "grid gap-6",
          collapsed ? "lg:grid-cols-[72px_1fr]" : "lg:grid-cols-[260px_1fr]",
        ].join(" ")}
      >
        <aside className="rounded-2xl border border-slate-200/70 bg-white p-3 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-2">
            {!collapsed && (
              <div>
                <div className="text-lg font-extrabold text-slate-900">LIRA</div>
                <div className="text-xs text-slate-500">Dashboard</div>
              </div>
            )}

            <button
              onClick={() => setCollapsed((v) => !v)}
              className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 hover:bg-slate-50"
              title={collapsed ? "Expandir" : "Colapsar"}
            >
              {collapsed ? "»" : "«"}
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            <SidebarLink to="/metrics" label="Métricas" icon="📊" collapsed={collapsed} />
            <SidebarLink to="/tasks" label="Tareas" icon="✅" collapsed={collapsed} />
            <SidebarLink to="/clients" label="Clientes" icon="🏢" collapsed={collapsed} />
            <SidebarLink to="/collaborators" label="Colaboradores" icon="👷" collapsed={collapsed} />
          </nav>

          {!collapsed && (
            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
              <div className="font-semibold text-slate-800">Tip</div>
              Colapsa el menú para ver más ancho.
            </div>
          )}
        </aside>

        <main className="min-w-0 w-full">{children}</main>
      </div>
    </div>
  );
}
