import React from "react";

function Badge({ children, variant = "neutral" }) {
  const styles =
    variant === "success"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
      : variant === "warning"
      ? "bg-lira-orange/15 text-lira-orange border-lira-orange/30"
      : "bg-slate-100 text-slate-700 border-slate-200/70";

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold ${styles}`}>
      {children}
    </span>
  );
}

function Field({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-white p-3">
      <div className="text-[11px] font-semibold uppercase text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-sm text-slate-900">
        {value ?? "-"}
      </div>
    </div>
  );
}

export default function TaskDetailModal({ open, task, onClose }) {
  if (!open || !task) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="border-b bg-gradient-to-r from-lira-blue/10 p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Detalle de tarea
              </h3>
              <p className="text-xs text-slate-500">
                ID: <span className="font-semibold">{task.id}</span>
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant={task.finished ? "success" : "warning"}>
                  {task.finished ? "Finalizada" : "Pendiente"}
                </Badge>
                <Badge>{task.typeName ?? task.typeId}</Badge>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="p-5">
          {/* Descripción */}
          <div className="mb-4">
            <div className="text-xs font-semibold text-slate-600">
              Descripción
            </div>
            <div className="mt-2 rounded-xl border border-slate-200/70 bg-slate-50 p-3 text-sm text-slate-800 whitespace-pre-wrap">
              {task.description ?? "-"}
            </div>
          </div>

          {/* Datos */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Cliente" value={task.clientName ?? task.clientId} />
            <Field label="Colaborador" value={task.collaboratorName ?? task.collaboratorId} />
            <Field
              label="Fecha"
              value={task.date ? new Date(task.date).toLocaleString() : "-"}
            />
            <Field label="Ticket" value={task.ticket ?? "-"} />
            <Field label="Status ID" value={task.statusId ?? "-"} />
            <Field label="Type ID" value={task.typeId ?? "-"} />
          </div>
        </div>
      </div>
    </div>
  );
}
