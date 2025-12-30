import { useQuery } from "@tanstack/react-query";
import { fetchOpsKpis } from "../services/dashboard.service";

export function useDashboardOpsKpis() {
  return useQuery({
    queryKey: ["dashboard", "ops-kpis"],
    queryFn: fetchOpsKpis,
    staleTime: 15_000,
    keepPreviousData: true,
  });
}
