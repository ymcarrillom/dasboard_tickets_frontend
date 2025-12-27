import { useQuery } from "@tanstack/react-query";
import { fetchSummary } from "../services/dashboard.service";

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: fetchSummary,
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
    staleTime: 10_000,
  });
}
