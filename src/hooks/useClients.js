// src/hooks/useClients.js
import { useQuery } from "@tanstack/react-query";
import { fetchClients } from "../services/clients.service";

export function useClients({ q = "", limit = 200, offset = 0 } = {}) {
  return useQuery({
    queryKey: ["clients", q, limit, offset],
    queryFn: () => fetchClients({ q, limit, offset }),
    staleTime: 60_000,
    keepPreviousData: true,
  });
}
