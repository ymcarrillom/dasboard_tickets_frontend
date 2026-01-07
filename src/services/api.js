import axios from "axios";

// Usa proxy de Vite: "/api" -> http://localhost:3000/api
export const api = axios.create({
  baseURL: "/api",
});
