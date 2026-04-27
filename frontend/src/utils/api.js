import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 12000,
});

export async function checkBackendHealth() {
  const response = await api.get("/health");
  return response.data;
}

export async function predictWinner(pokemon1, pokemon2) {
  try {
    const response = await api.post("/predict", { pokemon1, pokemon2 });
    return response.data;
  } catch (error) {
    const detail = error?.response?.data?.detail;
    const message = detail || error?.message || "Unable to reach backend model.";
    throw new Error(message, { cause: error });
  }
}
