import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchTaskCheckIn, patchTaskCheckOut } from "../services/tasks.service";

export function useTaskActions() {
  const qc = useQueryClient();

  const invalidateAll = () => {
    // ✅ refresca TODAS las consultas de tareas (sin importar filtros)
    qc.invalidateQueries({ queryKey: ["tasks"], exact: false });

    // ✅ refresca TODAS las métricas
    qc.invalidateQueries({ queryKey: ["dashboard"], exact: false });
  };

  const checkIn = useMutation({
    mutationFn: (id) => patchTaskCheckIn(id),
    onSuccess: invalidateAll,
  });

  const checkOut = useMutation({
    mutationFn: (id) => patchTaskCheckOut(id),
    onSuccess: invalidateAll,
  });

  return { checkIn, checkOut };
}
