import { useQuery } from "@tanstack/react-query";
import { fetchClients } from "../services/clients.service";

export function useClients(params) {
  const q = params?.q ?? "";
  return useQuery({
    queryKey: ["clients", q],
    queryFn: () => fetchClients({ limit: 200, ...(params || {}) }),
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });
}
