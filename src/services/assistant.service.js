// src/services/assistant.service.js

export async function askAssistant(message, history = []) {
  const res = await fetch("/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = json?.reply || json?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return json; // { reply, meta }
}
