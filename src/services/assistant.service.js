import { api } from "./api";

/**
 * Puedes llamar:
 *  - askAssistant("hola")
 *  - askAssistant({ message: "hola", history: [...] })
 */
export async function askAssistant(input) {
  const payload =
    typeof input === "string"
      ? { message: input }
      : { message: input?.message, history: input?.history };

  const { data } = await api.post("/assistant", payload);
  return data; // { reply, meta }
}
