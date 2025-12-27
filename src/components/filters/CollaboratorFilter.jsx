import React, { useState } from "react";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useCollaborators } from "../../hooks/useCollaborators";

export default function CollaboratorFilter({ collaboratorId, onChange }) {
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search, 300);

  const collaboratorsQuery = useCollaborators({ q: debounced, limit: 200 });

  return (
    <div>
      <label className="text-xs font-medium text-slate-600">Colaborador</label>

      {/* Input búsqueda */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar colaborador…"
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-[#1177B6] focus:ring-4 focus:ring-[#1177B6]/10"
      />

      {/* Select resultados */}
      <select
        value={collaboratorId}
        disabled={collaboratorsQuery.isLoading}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-[#1177B6] focus:ring-4 focus:ring-[#1177B6]/10 disabled:opacity-60"
      >
        <option value="">Todos</option>

        {(collaboratorsQuery.data?.items ?? []).map((c) => (
          <option key={c.id} value={String(c.id)}>
            {c.name}
          </option>
        ))}
      </select>

      {/* Estado */}
      <div className="mt-1 text-xs text-slate-500">
        {collaboratorsQuery.isFetching ? "Buscando…" : null}
      </div>
    </div>
  );
}
