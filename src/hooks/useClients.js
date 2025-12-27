import { useQuery } from "@tanstack/react-query";
import { fetchClients } from "../services/clients.service";

export function useClients(params = {}) {
  return useQuery({
    queryKey: ["clients", params],
    queryFn: () => fetchClients(params),
    staleTime: 60_000,
  });
}
