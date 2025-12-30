import { useQuery } from "@tanstack/react-query";
import { fetchAging } from "../services/dashboard.service";

export function useDashboardAging() {
  return useQuery({
    queryKey: ["dashboard", "aging"],
    queryFn: fetchAging,
    staleTime: 15_000,
    keepPreviousData: true,
  });
}
