import React from "react";
import { NavLink } from "react-router-dom";

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 text-slate-900">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex md:w-64 md:flex-col md:gap-6 md:border-r md:border-slate-200/70 md:bg-white/70 md:backdrop-blur md:p-5">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-lira-blue to-lira-orange shadow-sm" />
            <div>
              <div className="text-sm font-semibold leading-4">LIRA</div>
              <div className="text-xs text-slate-500">Seguridad • Tickets</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1">
            {[
              { to: "/", label: "Tareas", end: true },
              { to: "/clients", label: "Clientes" },
              { to: "/collaborators", label: "Colaboradores" },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  "rounded-xl px-3 py-2 text-sm font-medium transition " +
                  (isActive
                    ? "bg-lira-blue text-white shadow-sm"
                    : "text-slate-700 hover:bg-white hover:shadow-sm")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Footer sidebar */}
          <div className="mt-auto rounded-2xl border border-slate-200/70 bg-white/70 p-3 text-xs text-slate-600 shadow-sm">
            Realtime: <span className="font-semibold text-emerald-600">ON</span>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1">
          {/* Topbar */}
          <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/60 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <div>
                <h1 className="text-lg font-semibold">Dashboard</h1>
                <p className="text-xs text-slate-500">
                  Operación y monitoreo de tareas
                </p>
              </div>

              {/* Si no lo quieres, bórralo */}
              <div className="rounded-2xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm text-slate-700 shadow-sm">
                Backend: <span className="font-semibold">localhost</span>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-6xl p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
