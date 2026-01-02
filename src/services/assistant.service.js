import { api } from "./api";

export async function askAssistant(message, history = []) {
  const { data } = await api.post("/assistant", { message, history });
  return data; // { reply, meta }
}
