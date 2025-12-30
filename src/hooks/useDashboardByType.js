import { useQuery } from "@tanstack/react-query";
import { fetchByType } from "../services/dashboard.service";

export function useDashboardByType(days = 3650) {
  return useQuery({
    queryKey: ["dashboard", "by-type", { days }],
    queryFn: () => fetchByType({ days }),
    staleTime: 15_000,
  });
}
