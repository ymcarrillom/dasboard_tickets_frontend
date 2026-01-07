// src/hooks/useTasks.js
import { useQuery } from "@tanstack/react-query";
import { fetchTasks } from "../services/tasks.service";

export function useTasks(params) {
  return useQuery({
    queryKey: [
      "tasks",
      params?.q ?? "",
      params?.finished ?? "",
      params?.clientId ?? "",
      params?.collaboratorId ?? "",
      params?.limit ?? 20,
      params?.offset ?? 0,
    ],
    queryFn: () => fetchTasks(params),
    staleTime: 30_000,
    keepPreviousData: true,
  });
}
