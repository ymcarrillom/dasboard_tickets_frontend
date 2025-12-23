import { useQuery } from "@tanstack/react-query";
import { fetchTasks } from "../services/tasks.service";

export function useTasks(filters) {
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => fetchTasks(filters),
    refetchInterval: 15000, // refresco automático (MVP realtime)
  });
}
