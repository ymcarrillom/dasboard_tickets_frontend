// src/components/assistant/AssistantBubble.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
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

function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function uniq(arr) {
  const out = [];
  const seen = new Set();
  for (const x of arr || []) {
    const k = String(x || "").trim();
    if (!k) continue;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(k);
  }
  return out;
}

function isMoreRequest(text) {
  const t = normalize(text);
  return (
    t === "mas" ||
    t === "más" ||
    t === "siguiente" ||
    t.startsWith("mas ") ||
    t.startsWith("más ") ||
    t.includes("siguiente")
  );
}

function wantsCountOnly(text) {
  const t = normalize(text);
  return (
    t === "cantidad" ||
    t === "solo la cantidad" ||
    t === "solo cantidad" ||
    t === "dame la cantidad" ||
    t === "dame solo la cantidad" ||
    t.includes("solo la cantidad") ||
    t.includes("solo cantidad") ||
    t.includes("cantidad de") ||
    t.includes("cuantos") ||
    t.includes("cuantas")
  );
}

function isNumericOnly(text) {
  const raw = String(text || "").trim();
  return /^(\d{1,3})(?:[.)\s]+)?$/.test(raw);
}

function isLongAssistantMessage(content) {
  const s = String(content || "");
  const lines = s.split("\n").length;
  const looksLikeTable = /\|.+\|/.test(s) && s.includes("---");
  const listCount = (s.match(/^\s*[-*]\s+/gm) || []).length;
  return lines > 18 || looksLikeTable || listCount >= 12;
}

function getLastAssistantNonLocal(messages = []) {
  for (let i = (messages?.length || 0) - 1; i >= 0; i--) {
    const m = messages[i];
    if (m?.role !== "assistant") continue;
    if (m?.meta?.localOnly) continue;
    return m;
  }
  return null;
}

// ✅ fallback: inferir sugerencias si el backend no las manda
function inferSuggestionsFromAssistantText(text) {
  const t = normalize(text || "");
  const s = [];

  // paginación
  if (t.includes("para ver mas") || t.includes("para mas resultados") || t.includes("escribe") && t.includes("mas")) {
    s.push("más");
  }

  // conteo
  if (t.includes("solo la cantidad") || t.includes("solo cantidad") || t.includes("para contar")) {
    s.push("solo la cantidad");
  }

  // extras comunes (opcional)
  if (t.includes("clientes criticos") || t.includes("clientes con mas pendientes")) {
    s.push("¿Qué clientes están críticos?");
  }
  if (t.includes("quien esta mas cargado") || t.includes("carga por persona")) {
    s.push("¿Quién está más cargado?");
  }

  return uniq(s).slice(0, 8);
}

// ✅ fallback: extraer opciones de disambiguación desde el texto
function inferOptionsFromAssistantText(text) {
  const raw = String(text || "");
  const t = normalize(raw);
  if (!t.includes("coincidencias")) return [];

  const lines = raw
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

  const opts = [];

  for (const line of lines) {
    const nl = normalize(line);

    // ignora headers / frases
    if (
      nl.includes("coincidencias") ||
      nl.includes("por favor") ||
      nl.includes("responde") ||
      nl.includes("numero") ||
      nl.includes("número") ||
      nl.includes("nombre") ||
      nl.includes("| # |") ||
      nl.includes("| opcion") ||
      nl.includes("| opción")
    ) continue;

    // tabla markdown: | 3 | HOMI GIRARDOT |
    const row = line.match(/^\|\s*\d{1,3}\s*\|\s*([^|]+?)\s*\|/);
    if (row) {
      const name = row[1].trim();
      if (name) opts.push({ name });
      continue;
    }

    // numerado: 3) HOMI GIRARDOT
    const numLine = line.match(/^\d{1,3}\s*[\)\.\-:]\s*(.+)$/);
    if (numLine) {
      const name = numLine[1].trim();
      if (name) opts.push({ name });
      continue;
    }

    // bullets
    const bullet = line.replace(/^[-*•]\s+/, "").trim();
    if (bullet) opts.push({ name: bullet });
  }

  // únicos
  const seen = new Set();
  const out = [];
  for (const o of opts) {
    const k = normalize(o?.name);
    if (!k) continue;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ name: o.name });
  }
  return out.slice(0, 12);
}

function MarkdownMessage({ content }) {
  return (
    <div className="prose prose-slate max-w-none prose-p:my-2 prose-li:my-1 prose-ol:my-2 prose-ul:my-2 prose-strong:text-slate-900">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <div className="text-sm font-semibold text-slate-900 mb-1">
              {children}
            </div>
          ),
          h2: ({ children }) => (
            <div className="text-sm font-semibold text-slate-900 mb-1">
              {children}
            </div>
          ),
          h3: ({ children }) => (
            <div className="text-sm font-semibold text-slate-900 mb-1">
              {children}
            </div>
          ),

          table: ({ children }) => (
            <div className="my-2 rounded-xl border border-slate-200/70 bg-white overflow-auto max-h-[260px]">
              <table className="min-w-[760px] w-full border-collapse text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-50 text-slate-700 sticky top-0 z-10">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left text-[12px] font-semibold uppercase tracking-wide border-b border-slate-200/70 whitespace-nowrap">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 align-top border-b border-slate-100 whitespace-nowrap">
              {children}
            </td>
          ),

          ul: ({ children }) => {
            const count = React.Children.count(children);
            return (
              <ul
                className={[
                  "list-disc pl-5",
                  count >= 12 ? "max-h-[220px] overflow-auto pr-2" : "",
                ].join(" ")}
              >
                {children}
              </ul>
            );
          },
          ol: ({ children }) => {
            const count = React.Children.count(children);
            return (
              <ol
                className={[
                  "list-decimal pl-5",
                  count >= 12 ? "max-h-[220px] overflow-auto pr-2" : "",
                ].join(" ")}
              >
                {children}
              </ol>
            );
          },
          li: ({ children }) => (
            <li className="text-sm text-slate-800">{children}</li>
          ),

          code: ({ children }) => (
            <code className="rounded bg-slate-100 px-1 py-0.5 text-[12px] text-slate-800">
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function MenuButton({ title, subtitle, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm hover:bg-slate-50"
    >
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      {subtitle ? (
        <div className="text-xs text-slate-500">{subtitle}</div>
      ) : null}
    </button>
  );
}

function Chip({ label, onClick, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm",
        "hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed",
      ].join(" ")}
      title={label}
    >
      {label}
    </button>
  );
}

// ✅ wrapper compatible con ambos estilos de service:
// - askAssistant(message, history)
// - askAssistant({ message, history })
async function callAssistant(message, history) {
  try {
    if (typeof askAssistant !== "function")
      throw new Error("askAssistant not a function");
    if (askAssistant.length <= 1) {
      return await askAssistant({ message, history });
    }
    return await askAssistant(message, history);
  } catch (e) {
    // fallback al otro formato por si length no ayuda
    try {
      return await askAssistant({ message, history });
    } catch {
      return await askAssistant(message, history);
    }
  }
}

export default function AssistantBubble() {
  const [open, setOpen] = useState(false);

  // menú (panel lateral)
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState([]); // stack de ids

  // input + loading
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // wizard
  const [flow, setFlow] = useState(null); // { title, prompt, placeholder, buildBackend, buildDisplay, returnPath }

  // ✅ meta + estado para chips/disambiguación
  const [lastMeta, setLastMeta] = useState(null);
  const [lastNonControlQuery, setLastNonControlQuery] = useState(""); // última consulta “real” (no "más" ni "solo la cantidad")
  const lastBackendSentRef = useRef("");

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hola 👋 Soy tu asistente del dashboard.\n\nUsa el botón **Menú** para navegar por opciones (sin escribir nombres hasta que te los pida).",
    },
  ]);

  const listRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 50);
  }, [open, messages, loading]);

  function clearChat() {
    setFlow(null);
    setMenuOpen(false);
    setMenuPath([]);
    setLastMeta(null);
    setLastNonControlQuery("");
    lastBackendSentRef.current = "";
    setMessages([
      {
        role: "assistant",
        content: "Listo ✅ Chat limpio.\n\nAbre **Menú** para elegir acciones por botones.",
      },
    ]);
  }

  function pushLocalAssistant(content) {
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content, meta: { localOnly: true } },
    ]);
  }

  // ✅ HISTORY: NO duplicar el message actual dentro del history
  function buildHistoryForBackend() {
    return messages
      .slice(-60)
      .filter((m) => !m?.meta?.localOnly)
      .map((m) => ({
        role: m.role,
        content: String(m.backendContent ?? m.content ?? ""),
      }));
  }

  async function sendMessage(text, opts = {}) {
    const raw = String(text || "").trim();
    if (!raw || loading) return;

    // wizard: el texto del usuario se interpreta como “dato”
    if (flow) {
      const t = normalize(raw);
      if (t === "cancelar" || t === "cancel" || t === "salir") {
        const back = flow.returnPath ?? [];
        setFlow(null);
        setMessages((prev) => [...prev, { role: "user", content: "cancelar" }]);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Cancelado ✅. Puedes volver al **Menú**." },
        ]);
        setMenuOpen(true);
        setMenuPath(back);
        setInput("");
        return;
      }
    }

    let displayText = String(opts.displayText ?? raw);
    let backendText = String(opts.backendText ?? raw);

    if (flow) {
      const value = raw;
      backendText = flow.buildBackend(value);
      displayText = flow.buildDisplay ? flow.buildDisplay(value) : value;

      const back = flow.returnPath ?? [];
      setFlow(null);
      setMenuOpen(true);
      setMenuPath(back);
      setInput("");
    }

    // ✅ Conteo robusto
    const isCount = wantsCountOnly(raw);
    const isMore = isMoreRequest(raw);
    const isNum = isNumericOnly(raw);
    const isControl = isCount || isMore || isNum;

    if (isCount && lastNonControlQuery) {
      const base = normalize(lastNonControlQuery);
      if (!base.includes("solo la cantidad") && !base.includes("solo cantidad")) {
        backendText = `${lastNonControlQuery} solo la cantidad`;
      }
    }

    if (!isControl) {
      setLastNonControlQuery(backendText);
    }

    lastBackendSentRef.current = backendText;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: displayText, backendContent: backendText },
    ]);
    setInput("");
    setLoading(true);

    try {
      const history = buildHistoryForBackend();
      const res = await callAssistant(backendText, history);

      const reply = res?.reply || "No pude responder. Intenta de nuevo.";
      const meta = res?.meta || null;

      setMessages((prev) => [...prev, { role: "assistant", content: reply, meta }]);
      setLastMeta(meta);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Tuve un problema consultando el backend.\n\n✅ Revisa:\n- que el servidor esté arriba\n- que Vite proxy esté activo\n- que no haya error CORS en consola",
          meta: { ok: false, mode: "error" },
        },
      ]);
      setLastMeta({ ok: false, mode: "error" });
    } finally {
      setLoading(false);
    }
  }

  function openFlow(flowDef) {
    setFlow({ ...flowDef, returnPath: menuPath });
    setMenuOpen(false);

    pushLocalAssistant(
      `✅ **${flowDef.title}**\n\n${flowDef.prompt}\n\nEscribe el dato o escribe **cancelar**.`
    );
  }

  // ===== Menú: solo opciones funcionales =====
  const MENU_NODES = useMemo(() => {
    const nodes = {
      root: {
        title: "Menú",
        subtitle: "Elige una sección",
        items: [
          { kind: "submenu", to: "kpis", title: "Resumen / KPIs", subtitle: "Estado general y promedios" },
          { kind: "submenu", to: "listas", title: "Listas", subtitle: "Clientes y colaboradores" },
          { kind: "submenu", to: "tickets", title: "Tickets", subtitle: "Por colaborador / cliente" },
          { kind: "submenu", to: "fechas", title: "Fechas", subtitle: "Creados hoy / ayer / entre" },
          { kind: "submenu", to: "ayuda", title: "Ayuda", subtitle: "Qué puedes preguntar" },
        ],
      },

      kpis: {
        title: "Resumen / KPIs",
        subtitle: "Acciones directas",
        items: [
          { kind: "send", title: "Resumen", backendText: "resumen", displayText: "📌 Resumen" },
          { kind: "send", title: "KPIs", backendText: "kpis", displayText: "📊 KPIs" },
        ],
      },

      listas: {
        title: "Listas",
        subtitle: "Listados",
        items: [
          { kind: "send", title: "Lista de clientes", backendText: "lista de clientes", displayText: "📋 Lista de clientes" },
          { kind: "send", title: "Lista de colaboradores", backendText: "lista de colaboradores", displayText: "📋 Lista de colaboradores" },
        ],
      },

      tickets: {
        title: "Tickets",
        subtitle: "Elige por quién filtrar",
        items: [
          { kind: "submenu", to: "tickets_collab", title: "Por colaborador", subtitle: "Pendientes / Finalizados / Cantidad" },
          { kind: "submenu", to: "tickets_client", title: "Por cliente", subtitle: "Finalizados (mes pasado)" },
        ],
      },

      tickets_collab: {
        title: "Tickets • Colaborador",
        subtitle: "Te pediré el nombre solo cuando sea necesario",
        items: [
          {
            kind: "flow",
            title: "Pendientes (listar)",
            subtitle: "",
            flow: {
              title: "Pendientes por colaborador",
              prompt: "Escribe el **nombre del colaborador**.",
              placeholder: "Ej: Leonardo Tellez",
              buildBackend: (name) => `tickets pendientes del colaborador ${name}`,
              buildDisplay: (name) => `Pendientes • Colaborador: ${name}`,
            },
          },
          {
            kind: "flow",
            title: "Pendientes (solo cantidad)",
            subtitle: "",
            flow: {
              title: "Cantidad de pendientes (colaborador)",
              prompt: "Escribe el **nombre del colaborador**.",
              placeholder: "Ej: Leonardo Tellez",
              buildBackend: (name) => `tickets pendientes del colaborador ${name} solo la cantidad`,
              buildDisplay: (name) => `Cantidad pendientes • Colaborador: ${name}`,
            },
          },
          {
            kind: "flow",
            title: "Finalizados (listar)",
            subtitle: "",
            flow: {
              title: "Finalizados por colaborador",
              prompt: "Escribe el **nombre del colaborador**.",
              placeholder: "Ej: Leonardo Tellez",
              buildBackend: (name) => `tickets finalizados del colaborador ${name}`,
              buildDisplay: (name) => `Finalizados • Colaborador: ${name}`,
            },
          },
          {
            kind: "flow",
            title: "Finalizados (solo cantidad)",
            subtitle: "",
            flow: {
              title: "Cantidad de finalizados (colaborador)",
              prompt: "Escribe el **nombre del colaborador**.",
              placeholder: "Ej: Leonardo Tellez",
              buildBackend: (name) => `tickets finalizados del colaborador ${name} solo la cantidad`,
              buildDisplay: (name) => `Cantidad finalizados • Colaborador: ${name}`,
            },
          },
          {
            kind: "flow",
            title: "Últimos 60 días (listar)",
            subtitle: "",
            flow: {
              title: "Tickets del colaborador (últimos 60 días)",
              prompt: "Escribe el **nombre del colaborador**.",
              placeholder: "Ej: Daniel Naranjo",
              buildBackend: (name) => `tickets del colaborador ${name} últimos 60 días`,
              buildDisplay: (name) => `Tickets últimos 60 días • Colaborador: ${name}`,
            },
          },
        ],
      },

      tickets_client: {
        title: "Tickets • Cliente",
        subtitle: "Te pediré el nombre solo cuando sea necesario",
        items: [
          {
            kind: "flow",
            title: "Finalizados (mes pasado)",
            subtitle: "",
            flow: {
              title: "Finalizados por cliente (mes pasado)",
              prompt: "Escribe el **nombre del cliente**.",
              placeholder: "Ej: LIRA Seguridad",
              buildBackend: (name) => `tickets finalizados del cliente ${name} mes pasado`,
              buildDisplay: (name) => `Finalizados mes pasado • Cliente: ${name}`,
            },
          },
          {
            kind: "flow",
            title: "Finalizados (mes pasado • cantidad)",
            subtitle: "",
            flow: {
              title: "Cantidad finalizados (cliente • mes pasado)",
              prompt: "Escribe el **nombre del cliente**.",
              placeholder: "Ej: LIRA Seguridad",
              buildBackend: (name) => `tickets finalizados del cliente ${name} mes pasado solo la cantidad`,
              buildDisplay: (name) => `Cantidad finalizados mes pasado • Cliente: ${name}`,
            },
          },
        ],
      },

      fechas: {
        title: "Fechas",
        subtitle: "Tickets creados",
        items: [
          { kind: "send", title: "Creados hoy", backendText: "tickets creados hoy", displayText: "📅 Tickets creados hoy" },
          { kind: "send", title: "Creados ayer", backendText: "tickets creados ayer", displayText: "📅 Tickets creados ayer" },
          {
            kind: "flow",
            title: "Creados entre fechas",
            subtitle: "",
            flow: {
              title: "Tickets creados entre fechas",
              prompt: 'Escribe el rango así: **2025-12-04 y 2025-12-05** (o en texto).',
              placeholder: "Ej: 2025-12-04 y 2025-12-05",
              buildBackend: (range) => `tickets creados entre ${range}`,
              buildDisplay: (range) => `Tickets creados entre: ${range}`,
            },
          },
        ],
      },

      ayuda: {
        title: "Ayuda",
        subtitle: "Capacidades actuales",
        items: [
          {
            kind: "local",
            title: "Ver qué puedo responder",
            subtitle: "",
            content:
              "✅ **Qué puedes preguntarme**\n\n" +
              "**Resumen / KPIs**\n- resumen\n- kpis\n\n" +
              "**Listas**\n- lista de clientes\n- lista de colaboradores\n\n" +
              "**Tickets**\n- tickets pendientes del colaborador <nombre>\n- tickets finalizados del colaborador <nombre>\n- tickets finalizados del cliente <nombre> mes pasado\n- agrega **solo la cantidad** al final\n\n" +
              "**Fechas**\n- tickets creados hoy\n- tickets creados ayer\n- tickets creados entre AAAA-MM-DD y AAAA-MM-DD\n\n" +
              'Tip: después de una lista, escribe **más** para paginar.',
          },
        ],
      },
    };

    return nodes;
  }, []);

  const currentMenuId = menuPath.length ? menuPath[menuPath.length - 1] : "root";
  const currentNode = MENU_NODES[currentMenuId] || MENU_NODES.root;

  function menuBack() {
    setMenuPath((prev) => (prev.length ? prev.slice(0, -1) : prev));
  }

  function handleMenuItem(it) {
    if (it.kind === "submenu") {
      setMenuPath((prev) => [...prev, it.to]);
      return;
    }
    if (it.kind === "send") {
      sendMessage(it.backendText, {
        displayText: it.displayText ?? it.title,
        backendText: it.backendText,
      });
      setMenuOpen(false);
      return;
    }
    if (it.kind === "flow") {
      openFlow(it.flow);
      return;
    }
    if (it.kind === "local") {
      setMenuOpen(false);
      pushLocalAssistant(it.content);
      return;
    }
  }

  // ✅ Fuente de meta: último assistant real (mejor) o lastMeta (fallback)
  const lastAssistantMsg = getLastAssistantNonLocal(messages);
  const metaSource = lastAssistantMsg?.meta || lastMeta || {};

  let suggestions = Array.isArray(metaSource?.suggestions) ? metaSource.suggestions : [];
  let optionsRaw = Array.isArray(metaSource?.options) ? metaSource.options : [];

  // ✅ fallback de suggestions si backend no mandó
  if (!suggestions.length && lastAssistantMsg?.content) {
    suggestions = inferSuggestionsFromAssistantText(lastAssistantMsg.content);
  }

  // ✅ fallback de options si backend no mandó
  if (!optionsRaw.length && lastAssistantMsg?.content) {
    optionsRaw = inferOptionsFromAssistantText(lastAssistantMsg.content);
  }

  const disambiguationOptions = optionsRaw
    .map((o) => (typeof o === "string" ? { name: o } : o))
    .filter((o) => o && o.name);

  return (
    <>
      {open && (
        <div
          className={[
            "fixed bottom-20 right-4 z-[9999] w-[92vw] max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl flex flex-col",
            "h-[72vh] max-h-[72vh]",
          ].join(" ")}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">Agente LIRA 🤖</div>
              <div className="text-[11px] text-slate-500">Menú guiado por botones</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen((v) => !v);
                  if (!menuOpen) setMenuPath([]);
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {menuOpen ? "Cerrar menú" : "Menú"}
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

          {/* Middle: menú lateral + chat */}
          <div className="flex min-h-0 flex-1">
            {/* Menú lateral */}
            {menuOpen && (
              <aside className="w-64 border-r border-slate-200 bg-white">
                <div className="flex h-full flex-col">
                  <div className="border-b bg-slate-50 px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {currentNode.title}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {currentNode.subtitle}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {menuPath.length > 0 ? (
                          <button
                            type="button"
                            onClick={menuBack}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            ←
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            setMenuPath([]);
                          }}
                          className="rounded-lg bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white hover:brightness-110"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 overflow-auto">
                    <div className="grid grid-cols-1 gap-2">
                      {(currentNode.items || []).map((it) => (
                        <MenuButton
                          key={it.title}
                          title={it.title}
                          subtitle={it.subtitle}
                          onClick={() => handleMenuItem(it)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </aside>
            )}

            {/* Chat */}
            <div className="min-w-0 flex-1 flex flex-col">
              <div ref={listRef} className="flex-1 overflow-auto px-4 py-3">
                <div className="grid grid-cols-1 gap-2 pb-3">
                  {messages.map((m, idx) => {
                    const isUser = m.role === "user";
                    const longAssistant = !isUser && isLongAssistantMessage(m.content);

                    return (
                      <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                        <div
                          className={[
                            "max-w-[92%] rounded-2xl px-3 py-2 text-sm",
                            isUser
                              ? "bg-[#1177B6] text-white shadow-sm"
                              : "bg-slate-100 text-slate-800 border border-slate-200/70",
                          ].join(" ")}
                        >
                          {isUser ? (
                            <div className="whitespace-pre-wrap">{m.content}</div>
                          ) : (
                            <div className={longAssistant ? "max-h-[320px] overflow-auto pr-1" : ""}>
                              <MarkdownMessage content={m.content} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

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
              </div>

              {/* ✅ Barrita de chips */}
              {(disambiguationOptions.length > 0 || suggestions.length > 0) && !loading ? (
                <div className="border-t bg-white px-4 py-2">
                  {/* Disambiguación: botones 1..N */}
                  {disambiguationOptions.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {disambiguationOptions.map((o, i) => (
                        <Chip
                          key={`${i}-${o.name}`}
                          label={`${i + 1}) ${o.name}`}
                          onClick={() =>
                            sendMessage(String(i + 1), {
                              displayText: `${i + 1}) ${o.name}`,
                              backendText: String(i + 1),
                            })
                          }
                        />
                      ))}
                    </div>
                  ) : null}

                  {/* Suggestions */}
                  {suggestions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {suggestions.slice(0, 8).map((s) => (
                        <Chip key={s} label={s} onClick={() => sendMessage(s)} />
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* Input */}
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
                    placeholder={flow?.placeholder ? flow.placeholder : "Escribe tu pregunta… (o abre Menú)"}
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
          </div>
        </div>
      )}

      {/* FAB */}
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
