import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { askAssistant } from "../../services/assistant.service";

function IconChatRobot() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" className="text-white">
      <path
        fill="currentColor"
        d="M11 2h2v2.1c1.9.2 3.6 1.1 4.8 2.5H20a2 2 0 0 1 2 2v6a6 6 0 0 1-6 6H8a6 6 0 0 1-6-6v-6a2 2 0 0 1 2-2h2.2A7 7 0 0 1 11 4.1V2Zm1 4a5 5 0 0 0-5 5v3a4 4 0 0 0 4 4h2a4 4 0 0 0 4-4v-3a5 5 0 0 0-5-5Zm-2 5a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3Zm6 0a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3Zm-6.2 6.2a1 1 0 0 1 1.4 0c.5.5 1.1.8 1.8.8s1.3-.3 1.8-.8a1 1 0 1 1 1.4 1.4A4.5 4.5 0 0 1 12 19a4.5 4.5 0 0 1-3.2-1.4a1 1 0 0 1 0-1.4Z"
      />
    </svg>
  );
}

function MarkdownMessage({ content }) {
  return (
    <div className="prose prose-slate max-w-none prose-p:my-2 prose-li:my-1 prose-ol:my-2 prose-ul:my-2 prose-strong:text-slate-900">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <div className="text-sm font-semibold text-slate-900 mb-1">{children}</div>,
          h2: ({ children }) => <div className="text-sm font-semibold text-slate-900 mb-1">{children}</div>,
          h3: ({ children }) => <div className="text-sm font-semibold text-slate-900 mb-1">{children}</div>,

          table: ({ children }) => (
            <div className="my-2 overflow-hidden rounded-xl border border-slate-200/70 bg-white">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-slate-50 text-slate-700">{children}</thead>,
          th: ({ children }) => (
            <th className="px-3 py-2 text-left text-[12px] font-semibold uppercase tracking-wide border-b border-slate-200/70">
              {children}
            </th>
          ),
          td: ({ children }) => <td className="px-3 py-2 align-top border-b border-slate-100">{children}</td>,

          ul: ({ children }) => <ul className="list-disc pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5">{children}</ol>,
          li: ({ children }) => <li className="text-sm text-slate-800">{children}</li>,

          code: ({ children }) => (
            <code className="rounded bg-slate-100 px-1 py-0.5 text-[12px] text-slate-800">{children}</code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default function AssistantBubble() {
  const [open, setOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hola 👋 Soy tu asistente del dashboard.\n\nPuedo responder con datos reales: pendientes, en progreso, tiempos promedio, top colaboradores, tipos, SLA y fechas.\n\nTip: para listados grandes usa `limit` y `offset`, o escribe **“más”**.",
    },
  ]);

  const listRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, [open, messages, loading]);

  function clearChat() {
    setMessages([
      {
        role: "assistant",
        content:
          "Listo ✅ Chat limpio.\n\nPuedes preguntarme por métricas del dashboard, fechas, SLA, top colaboradores y más.\n\nTip: escribe **“más”** para siguiente página en listados.",
      },
    ]);
  }

  async function sendMessage(text) {
    const msg = String(text || "").trim();
    if (!msg || loading) return;

    // Armamos history para “memoria” + paginación ("más")
    const history = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setInput("");
    setLoading(true);

   try {
      // ✅ memoria corta: mandamos los últimos mensajes al backend
      const history = messages
        .slice(-16)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await askAssistant(msg, history);

      const reply = res?.reply || "No pude responder. Intenta de nuevo.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Tuve un problema consultando el backend. Verifica que el servidor esté arriba.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const suggestions = [
    "Dame un resumen del estado del dashboard.",
    "¿Cuántos tickets pendientes hay y cuántos están en progreso?",
    "Top 10 colaboradores por tickets (últimos 30 días).",
    "Top 10 clientes por tickets (últimos 30 días).",
    "Pendientes por colaborador (todos) limit 10",
    "Backlog por cliente (todos) limit 10",
    "¿Cuántos tickets tiene Stiven Rivera pendientes?",
    "Backlog por cliente TERMINAL DE TRANSPORTES",
    "Backlog aging de pendientes (0–1d, 2–7d, 8–30d, +30d).",
    "Outliers: tickets con atención > 6 horas (últimos 30 días) limit 10",
    "Tickets en progreso sin check_out > 6 horas (últimos 30 días) limit 10",
    "Tickets creados entre 2023-01-01 y 2023-12-31 (limit 10)",
    "Lista de clientes (limit 10)",
    "Lista de colaboradores (limit 10)",
  ];

  return (
    <>
      {/* PANEL */}
      {open && (
        <div className="fixed bottom-20 right-4 z-[9999] w-[92vw] max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">Agente LIRA 🤖</div>
              <div className="text-[11px] text-slate-500">Respuestas con datos reales de tu BD</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSuggestions((v) => !v)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {showSuggestions ? "Ocultar sugerencias" : "Sugerencias"}
              </button>

              <button
                type="button"
                onClick={clearChat}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Limpiar
              </button>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
              >
                Cerrar
              </button>
            </div>
          </div>

          <div ref={listRef} className="max-h-[56vh] overflow-auto px-4 py-3">
            <div className="grid grid-cols-1 gap-2 pb-3">
              {messages.map((m, idx) => {
                const isUser = m.role === "user";
                return (
                  <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={[
                        "max-w-[90%] rounded-2xl px-3 py-2 text-sm",
                        isUser
                          ? "bg-[#1177B6] text-white shadow-sm"
                          : "bg-slate-100 text-slate-800 border border-slate-200/70",
                      ].join(" ")}
                    >
                      {isUser ? (
                        <div className="whitespace-pre-wrap">{m.content}</div>
                      ) : (
                        <div className="whitespace-pre-wrap">
                          <MarkdownMessage content={m.content} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing (pro) */}
              {loading ? (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-slate-200/70 bg-slate-100 px-3 py-2 text-sm text-slate-700">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.2s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.1s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500" />
                      <span className="text-xs text-slate-600">Escribiendo…</span>
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Sugerencias (colapsables) */}
            {showSuggestions && (
              <div className="grid grid-cols-1 gap-2 border-t pt-3">
                <div className="text-[11px] font-semibold uppercase text-slate-500">
                  Sugerencias rápidas
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
                      type="button"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t bg-white px-4 py-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu pregunta…"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#1177B6]/30"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-[#1177B6] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:opacity-60"
              >
                {loading ? "…" : "Enviar"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BURBUJA */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 z-[9999] flex h-12 w-12 items-center justify-center rounded-full bg-[#1177B6] shadow-lg transition hover:brightness-110"
        aria-label="Abrir asistente"
        title="Agente LIRA"
      >
        <IconChatRobot />
      </button>
    </>
  );
}
