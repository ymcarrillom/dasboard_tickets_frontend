import React from "react";

function Badge({ children, variant = "neutral" }) {
  const styles =
    variant === "success"
      ? "bg-emerald-50 text-emerald-700"
      : variant === "warning"
      ? "bg-amber-50 text-amber-700"
      : "bg-slate-100 text-slate-700";

  return (
    <span
      className={
        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium " +
        styles
      }
    >
      {children}
    </span>
  );
}

function Field({ label, value }) {
  return (
    <div className="rounded-xl border bg-white p-3">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-sm text-slate-900">{value ?? "-"}</div>
    </div>
  );
}

export default function TaskDetailModal({ open, task, onClose }) {
  if (!open || !task) return null;

  const dateLabel = task.date ? new Date(task.date).toLocaleString() : "-";
  const stateLabel = task.finished ? "Finalizada" : "Pendiente";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-2xl bg-white shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b p-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-900">
                Detalle de tarea
              </h3>
              <Badge variant={task.finished ? "success" : "warning"}>
                {stateLabel}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              ID: <span className="font-medium text-slate-700">{task.id}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
          >
            Cerrar
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="mb-4">
            <div className="text-xs font-medium text-slate-500">Descripción</div>
            <div className="mt-1 whitespace-pre-wrap rounded-xl border bg-slate-50 p-3 text-sm text-slate-800">
              {task.description ?? "-"}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Cliente" value={task.clientName ?? task.clientId} />
            <Field
              label="Colaborador"
              value={task.collaboratorName ?? task.collaboratorId}
            />
            <Field label="Tipo" value={task.typeName ?? task.typeId} />

            <Field label="Fecha" value={dateLabel} />
            <Field label="Status ID" value={task.statusId ?? "-"} />
            <Field label="Ticket" value={task.ticket ?? "-"} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t p-5">
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(String(task.id));
              } catch {}
            }}
            className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
          >
            Copiar ID
          </button>

          <div className="text-xs text-slate-500">
            Tip: haz click fuera del modal para cerrar
          </div>
        </div>
      </div>
    </div>
  );
}
