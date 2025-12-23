import React from "react";
import { NavLink } from "react-router-dom";

function SidebarLink({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition",
          isActive
            ? "bg-[#1177B6] text-white shadow-sm"
            : "text-slate-700 hover:bg-slate-100",
        ].join(" ")
      }
      end
    >
      <span className="h-2 w-2 rounded-full bg-current opacity-70" />
      {label}
    </NavLink>
  );
}

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-4 lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
          <div className="mb-4">
            <div className="text-lg font-extrabold text-slate-900">LIRA</div>
            <div className="text-xs text-slate-500">Dashboard Operativo</div>
          </div>

          <nav className="flex flex-col gap-2">
            <SidebarLink to="/metrics" label="Métricas" />
            <SidebarLink to="/tasks" label="Tareas" />
            <SidebarLink to="/clients" label="Clientes" />
            <SidebarLink to="/collaborators" label="Colaboradores" />
          </nav>

          <div className="mt-6 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            <div className="font-semibold text-slate-800">Tip</div>
            Separamos Métricas (gerencia) y Tareas (operación) para escalar fácil.
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
