import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  BuildingOffice2Icon,
  UsersIcon,
} from "@heroicons/react/24/outline";

function SidebarItem({ to, label, collapsed, Icon }) {
  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        [
          "group relative flex items-center gap-3 rounded-xl px-3 py-2 transition-colors",
          isActive
            ? "bg-[#1177B6]/10 text-[#0E5E90]"
            : "text-slate-700 hover:bg-slate-100",
        ].join(" ")
      }
    >
      {/* Acento lateral cuando está activo */}
      <span
        className={({ isActive }) => ""}
      />
      <NavLink
        to={to}
        className={({ isActive }) =>
          [
            "absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full transition",
            isActive ? "bg-[#1177B6]" : "bg-transparent",
          ].join(" ")
        }
      />

      {/* Icono */}
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100">
        <Icon className="h-5 w-5 text-slate-700 group-hover:text-slate-900" />
      </span>

      {/* Label animado */}
      <span
        className={[
          "origin-left whitespace-nowrap text-[15px] font-semibold tracking-tight transition-all duration-200",
          collapsed ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100",
        ].join(" ")}
      >
        {label}
      </span>
    </NavLink>
  );
}

export default function AppShell({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar (width fijo, sin animar) */}
      <aside
        className={[
          "sticky top-0 h-screen border-r border-slate-200 bg-white",
          collapsed ? "w-20" : "w-64",
        ].join(" ")}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex flex-col items-center px-4 pt-7 pb-5">
            <img
              src="/lira-logo.jpg"
              alt="LIRA Seguridad"
              className={[
                "mb-3 object-contain transition-all duration-300",
                collapsed ? "h-12 w-12" : "h-16 w-16",
              ].join(" ")}
            />

            <div
              className={[
                "origin-top text-center transition-all duration-200",
                collapsed ? "scale-y-0 opacity-0" : "scale-y-100 opacity-100",
              ].join(" ")}
            >
              <div className="text-base font-bold text-slate-900">LIRA Seguridad</div>
              <div className="text-sm font-semibold text-slate-600">Dashboard de Tickets</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="px-3">
            <div className="flex flex-col gap-1">
              <SidebarItem
                to="/metrics"
                label="Métricas"
                collapsed={collapsed}
                Icon={ChartBarIcon}
              />
              <SidebarItem
                to="/tasks"
                label="Tareas"
                collapsed={collapsed}
                Icon={ClipboardDocumentCheckIcon}
              />
              <SidebarItem
                to="/clients"
                label="Clientes"
                collapsed={collapsed}
                Icon={BuildingOffice2Icon}
              />
              <SidebarItem
                to="/collaborators"
                label="Colaboradores"
                collapsed={collapsed}
                Icon={UsersIcon}
              />
            </div>
          </nav>

          {/* Toggle */}
          <div className="mt-auto p-3">
            <button
              onClick={() => setCollapsed((v) => !v)}
              className={[
                "flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200",
                collapsed
                  ? "bg-[#1177B6] text-white shadow-sm hover:brightness-110"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
              ].join(" ")}
              title={collapsed ? "Expandir menú" : "Colapsar menú"}
            >
              <span className="text-base">{collapsed ? "→" : "←"}</span>
              {!collapsed && <span>Colapsar</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="min-w-0 flex-1 p-6">{children}</main>
    </div>
  );
}
