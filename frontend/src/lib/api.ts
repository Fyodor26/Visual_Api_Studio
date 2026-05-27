import { API_URL } from "./config";
import { useAuthStore } from "./auth-store";

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = useAuthStore.getState().token;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}