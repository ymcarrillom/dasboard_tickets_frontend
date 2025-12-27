import { useQuery } from "@tanstack/react-query";
import { fetchByType } from "../services/dashboard.service";

export function useDashboardByType(days = 30) {
  return useQuery({
    queryKey: ["dashboard-by-type", days],
    queryFn: () => fetchByType({ days }),
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
  });
}
