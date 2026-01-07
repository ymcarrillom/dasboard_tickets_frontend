// src/hooks/useCollaborators.js
import { useQuery } from "@tanstack/react-query";
import { fetchCollaborators } from "../services/collaborators.service";

export function useCollaborators(q = "") {
  return useQuery({
    queryKey: ["collaborators", q],
    queryFn: () => fetchCollaborators({ q, limit: 200, offset: 0 }),
    staleTime: 60_000,
  });
}
