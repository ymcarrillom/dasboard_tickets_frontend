import { useQuery } from "@tanstack/react-query";
import { fetchDashboardSummary } from "../services/dashboard.service";

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboardSummary"],
    queryFn: fetchDashboardSummary,
    staleTime: 10_000,
    refetchInterval: 15_000, // opcional (igual que tasks)
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
