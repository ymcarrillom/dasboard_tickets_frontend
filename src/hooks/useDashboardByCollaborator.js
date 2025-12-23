import { useQuery } from "@tanstack/react-query";
import { fetchDashboardByCollaborator } from "../services/dashboard";

export function useDashboardByCollaborator(days = 30, limit = 10) {
  return useQuery({
    queryKey: ["dashboardByCollaborator", days, limit],
    queryFn: () => fetchDashboardByCollaborator(days, limit),
    staleTime: 10_000,
  });
}
