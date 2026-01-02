import React, { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../services/api";

function BubbleButton({ open, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition
        ${open ? "bg-slate-900 text-white" : "bg-[#1177B6] text-white hover:brightness-110"}`}
      aria-label="Abrir asistente"
      title="Asistente"
      type="button"
    >
      {open ? "×" : "💬"}
    </button>
  );
}

function TypingDots() {
  return (
    <div className="inline-flex items-center gap-1 rounded-2xl border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
      <span className="ml-2 text-xs text-slate-500">Escribiendo…</span>
    </div>
  );
}

export default function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text:
        "Hola 👋 Soy tu asistente. Puedes preguntarme por pendientes, en progreso, top colaboradores y también por clientes (top clientes, backlog por cliente).",
    },
  ]);

  const listRef = useRef(null);

  const suggestions = useMemo(
    () => [
      "¿Cuántos tickets pendientes hay y cuántos están en progreso?",
      "Dame un resumen del estado del dashboard (total, pendientes, finalizados).",
      "Top 5 colaboradores por tickets (últimos 30 días).",
      "Top 5 tipos de solicitud (últimos 30 días).",
      "¿Qué clientes tienen más tickets (últimos 30 días)?",
      "¿Qué clientes tienen más pendientes actualmente (backlog por cliente)?",
      "Muéstrame los tickets más recientes.",
      "Promedio de tiempo de respuesta y de atención.",
    ],
    []
  );

  useEffect(() => {
    if (!open) return;
    setTimeout(() => {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 60);
  }, [open, messages, loading]);

  async function send(textOverride) {
    const text = String(textOverride ?? input).trim();
    if (!text || loading) return;

    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post("/assistant", { message: text });
      setMessages((m) => [...m, { role: "assistant", text: data?.reply || "No pude responder." }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text:
            "Ups, hubo un error hablando con el backend. Verifica que el backend esté arriba y que exista /api/assistant.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Panel */}
      <div
        className={`fixed bottom-24 right-5 z-50 w-[360px] max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-xl transition
          ${open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}
      >
        <div className="border-b border-slate-200/70 bg-slate-50 p-4">
          <div className="text-sm font-semibold text-slate-900">Asistente</div>
          <div className="text-xs text-slate-500">
            Consulta datos del dashboard (incluye clientes) en lenguaje natural
          </div>
        </div>

        <div ref={listRef} className="max-h-[360px] space-y-2 overflow-auto p-3">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm shadow-sm
                  ${m.role === "user" ? "bg-[#1177B6] text-white" : "bg-slate-100 text-slate-900"}`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {/* Typing bubble */}
          {loading ? (
            <div className="flex justify-start">
              <TypingDots />
            </div>
          ) : null}

          {/* Suggestions */}
          <div className="mt-3 border-t border-slate-200/70 pt-3">
            <div className="mb-2 text-[11px] font-semibold uppercase text-slate-500">
              Sugerencias rápidas
            </div>
            <div className="grid grid-cols-1 gap-2">
              {suggestions.slice(0, 5).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  disabled={loading}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200/70 p-3">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => (e.key === "Enter" ? send() : null)}
              placeholder="Escribe tu pregunta…"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-[#1177B6] focus:ring-4 focus:ring-[#1177B6]/10"
            />
            <button
              type="button"
              onClick={() => send()}
              className="rounded-xl bg-[#D17745] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110 disabled:opacity-60"
              disabled={loading}
            >
              Enviar
            </button>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Tip: “Top clientes” · “Backlog por cliente” · “Top colaboradores”
          </div>
        </div>
      </div>

      {/* Burbuja */}
      <BubbleButton open={open} onClick={() => setOpen((v) => !v)} />
    </>
  );
}
