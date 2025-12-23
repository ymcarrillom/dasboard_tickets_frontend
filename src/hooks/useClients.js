import { useQuery } from "@tanstack/react-query";
import { fetchClients } from "../services/clients.service";

export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: () => fetchClients({ limit: 200 }),
    staleTime: 5 * 60 * 1000,
  });
}
