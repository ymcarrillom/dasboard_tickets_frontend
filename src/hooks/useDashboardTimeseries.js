import { useQuery } from "@tanstack/react-query";
import { fetchDashboardTimeseries } from "../services/dashboard";

export function useDashboardTimeseries(days = 30) {
  return useQuery({
    queryKey: ["dashboardTimeseries", days],
    queryFn: () => fetchDashboardTimeseries(days),
    staleTime: 10_000,
  });
}
