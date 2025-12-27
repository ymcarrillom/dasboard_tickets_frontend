import { useQuery } from "@tanstack/react-query";
import { fetchTimeseries } from "../services/dashboard.service";

export function useDashboardTimeseries(days = 30) {
  return useQuery({
    queryKey: ["dashboard-timeseries", days],
    queryFn: () => fetchTimeseries({ days }),
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
  });
}
