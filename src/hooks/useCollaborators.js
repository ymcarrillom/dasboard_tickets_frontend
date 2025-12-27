import { useQuery } from "@tanstack/react-query";
import { fetchCollaborators } from "../services/collaborators.service";

export function useCollaborators({ q = "", limit = 200 } = {}) {
  return useQuery({
    queryKey: ["collaborators", q, limit],
    queryFn: () => fetchCollaborators({ q, limit }),
    staleTime: 60_000,
    keepPreviousData: true,
  });
}
