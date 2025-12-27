import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

export function useTasks(params) {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: async () => {
      const { data } = await api.get("/tasks", { params });
      return data;
    },

    // 🔁 AUTO REFRESH
    refetchInterval: 15000,
    refetchIntervalInBackground: true,

    staleTime: 5000,
    keepPreviousData: true,
  });
}
