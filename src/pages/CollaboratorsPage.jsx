import React, { useState } from "react";
import AppShell from "../components/layout/AppShell";
import { useCollaborators } from "../hooks/useCollaborators";

export default function CollaboratorsPage() {
  const [q, setQ] = useState("");
  const collaboratorsQuery = useCollaborators(q ? { q } : undefined);

  const items = collaboratorsQuery.data?.items ?? [];

  return (
    <AppShell>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Colaboradores</h2>
        <p className="text-sm text-slate-500">Listado de colaboradores</p>
      </div>

      <div className="mb-4 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
        <label className="text-xs font-medium text-slate-600">Buscar</label>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar colaborador…"
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-[#1177B6] focus:ring-4 focus:ring-[#1177B6]/10"
        />
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        <div className="border-b border-slate-200/70 p-4 text-sm font-semibold text-slate-900">
          Lista
        </div>

        {collaboratorsQuery.isLoading ? (
          <div className="p-6 text-sm text-slate-500">Cargando…</div>
        ) : collaboratorsQuery.isError ? (
          <div className="p-6 text-sm text-red-600">Error cargando colaboradores</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">Sin resultados</div>
        ) : (
          <ul className="divide-y divide-slate-200/70">
            {items.map((c) => (
              <li key={c.id} className="p-4 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">{c.name}</span>
                <span className="ml-2 text-xs text-slate-500">#{c.id}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
