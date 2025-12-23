import { useQuery } from "@tanstack/react-query";
import { fetchDashboardSummary } from "../services/dashboard";

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboardSummary"],
    queryFn: fetchDashboardSummary,
    staleTime: 10_000,
  });
}
