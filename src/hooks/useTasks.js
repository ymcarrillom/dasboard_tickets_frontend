import { useQuery } from "@tanstack/react-query";
import { fetchTasks } from "../services/tasks.service";

export function useTasks(params = {}) {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: () => fetchTasks(params),
    staleTime: 15_000,
    keepPreviousData: true,
  });
}
