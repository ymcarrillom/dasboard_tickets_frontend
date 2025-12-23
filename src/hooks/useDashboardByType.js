import { useQuery } from "@tanstack/react-query";
import { fetchDashboardByType } from "../services/dashboard";

export function useDashboardByType(days = 30) {
  return useQuery({
    queryKey: ["dashboardByType", days],
    queryFn: () => fetchDashboardByType(days),
    staleTime: 10_000,
  });
}
