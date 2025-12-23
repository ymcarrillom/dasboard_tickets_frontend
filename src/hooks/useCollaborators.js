import { useQuery } from "@tanstack/react-query";
import { fetchCollaborators } from "../services/collaborators.service";

export function useCollaborators() {
  return useQuery({
    queryKey: ["collaborators"],
    queryFn: () => fetchCollaborators({ limit: 200 }),
    staleTime: 5 * 60 * 1000,
  });
}
