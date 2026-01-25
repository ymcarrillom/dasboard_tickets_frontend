// src/services/assistant.service.js

export async function askAssistant(messageOrPayload, history = []) {
  const payload =
    messageOrPayload && typeof messageOrPayload === "object"
      ? {
          message: String(messageOrPayload.message ?? ""),
          history: Array.isArray(messageOrPayload.history)
            ? messageOrPayload.history
            : [],
        }
      : {
          message: String(messageOrPayload ?? ""),
          history: Array.isArray(history) ? history : [],
        };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);

  try {
    const res = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });

    // intenta JSON, si no, cae a texto
    let json = null;
    try {
      json = await res.json();
    } catch {
      const txt = await res.text().catch(() => "");
      json = txt ? { reply: txt } : {};
    }

    if (!res.ok) {
      const msg = json?.reply || json?.error || `HTTP ${res.status}`;
      throw new Error(msg);
    }

    // ✅ normaliza shape
    return {
      reply: String(json?.reply ?? ""),
      meta: json?.meta && typeof json.meta === "object" ? json.meta : {},
    };
  } finally {
    clearTimeout(timer);
  }
}
