import React from "react";

function Badge({ children, variant = "neutral" }) {
  const styles =
    variant === "success"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
      : variant === "warning"
      ? "bg-orange-50 text-orange-700 border-orange-200/60"
      : "bg-slate-100 text-slate-700 border-slate-200/70";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold ${styles}`}
    >
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
      <div className="mt-1 text-sm text-slate-900">{value ?? "—"}</div>
    </div>
  );
}

function fmt(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function calcDuration(checkIn, checkOut) {
  if (!checkIn || !checkOut) return "—";
  const a = new Date(checkIn).getTime();
  const b = new Date(checkOut).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return "—";
  const ms = b - a;
  const mins = Math.round(ms / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `${m} min`;
  return `${h}h ${m}m`;
}

export default function TaskDetailModal({ open, task, onClose }) {
  if (!open || !task) return null;

  const duration = task.duration ?? calcDuration(task.checkIn, task.checkOut);

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
        <div className="border-b bg-gradient-to-r from-[#1177B6]/10 p-5">
          <div className="flex items-start justify-between gap-4">
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
                <Badge>{task.typeName ?? task.typeId ?? "—"}</Badge>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="p-5">
          {/* Descripción */}
          <div className="mb-4">
            <div className="text-xs font-semibold text-slate-600">Descripción</div>
            <div className="mt-2 whitespace-pre-wrap rounded-xl border border-slate-200/70 bg-slate-50 p-3 text-sm text-slate-800">
              {task.description ?? "—"}
            </div>
          </div>

          {/* Datos */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Cliente" value={task.clientName ?? task.clientId} />
            <Field
              label="Colaborador"
              value={task.collaboratorName ?? task.collaboratorId}
            />

            {/* ✅ Etiqueta más coherente */}
            <Field label="Fecha de respuesta" value={fmt(task.date)} />

            {/* ✅ check in / check out */}
            <Field label="Check-in" value={fmt(task.checkIn)} />
            <Field label="Check-out" value={fmt(task.checkOut)} />

            {/* ✅ tiempo */}
            <Field label="Tiempo" value={duration} />
          </div>
        </div>
      </div>
    </div>
  );
}
