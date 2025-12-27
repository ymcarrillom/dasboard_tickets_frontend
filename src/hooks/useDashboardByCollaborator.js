import { useQuery } from "@tanstack/react-query";
import { fetchByCollaborator } from "../services/dashboard.service";

export function useDashboardByCollaborator(days = 30, limit = 10) {
  return useQuery({
    queryKey: ["dashboard-by-collaborator", days, limit],
    queryFn: () => fetchByCollaborator({ days, limit }),
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
  });
}
