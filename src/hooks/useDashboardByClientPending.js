import { useQuery } from "@tanstack/react-query";
import { fetchByClientPending } from "../services/dashboard.service";

export function useDashboardByClientPending(days = 30, limit = 5) {
  return useQuery({
    queryKey: ["dashboard-by-client-pending", days, limit],
    queryFn: () => fetchByClientPending({ days, limit }),
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
  });
}
