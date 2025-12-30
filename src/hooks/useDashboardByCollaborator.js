import { useQuery } from "@tanstack/react-query";
import { fetchByCollaborator } from "../services/dashboard.service";

export function useDashboardByCollaborator(days = 3650, limit = 10) {
  return useQuery({
    queryKey: ["dashboard", "by-collaborator", { days, limit }],
    queryFn: () => fetchByCollaborator({ days, limit }),
    staleTime: 15_000,
  });
}
