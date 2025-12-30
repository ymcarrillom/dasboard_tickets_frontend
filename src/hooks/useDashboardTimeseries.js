import { useQuery } from "@tanstack/react-query";
import { fetchTimeseries } from "../services/dashboard.service";

export function useDashboardTimeseries(days = 3650) {
  return useQuery({
    queryKey: ["dashboard", "timeseries", { days }],
    queryFn: () => fetchTimeseries({ days }),
    staleTime: 15_000,
  });
}
