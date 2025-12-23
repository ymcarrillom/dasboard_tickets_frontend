import React, { useState } from "react";
import AppShell from "../components/layout/AppShell";
import { useClients } from "../hooks/useClients";

export default function ClientsPage() {
  const [q, setQ] = useState("");
  const clientsQuery = useClients(); // MVP: sin búsqueda remota, luego lo mejoramos
  const items = clientsQuery.data?.items ?? [];

  const filtered = q
    ? items.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()))
    : items;

  return (
    <AppShell>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Clientes</h2>
        <p className="text-sm text-slate-500">Listado de clientes</p>
      </div>

      <div className="mb-4 rounded-2xl border bg-white p-4 shadow-sm">
        <label className="text-xs font-medium text-slate-600">Buscar</label>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nombre del cliente..."
          className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
        />
      </div>

      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-4 text-sm font-medium text-slate-700">
          Clientes
        </div>

        {clientsQuery.isLoading ? (
          <div className="p-6 text-sm text-slate-500">Cargando…</div>
        ) : clientsQuery.isError ? (
          <div className="p-6 text-sm text-red-600">
            Error: {String(clientsQuery.error?.message ?? clientsQuery.error)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">Sin resultados.</div>
        ) : (
          <ul className="divide-y">
            {filtered.slice(0, 200).map((c) => (
              <li key={c.id} className="p-4 text-sm text-slate-700">
                <span className="font-medium text-slate-900">{c.id}</span>{" "}
                — {c.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
