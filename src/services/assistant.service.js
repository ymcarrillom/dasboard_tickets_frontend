// src/services/assistant.service.js (frontend)
export async function askAssistant(message, history) {
  const res = await fetch("/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  return res.json();
}
