import axios from "axios";

export const API_BASE_URL =
  (typeof window !== "undefined" && (window as any).__API_BASE_URL__) ||
  import.meta.env.VITE_API_BASE_URL ||
  "https://task-team-manager-production-df88.up.railway.app/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("ttm_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("ttm_token");
      localStorage.removeItem("ttm_user");
    }
    return Promise.reject(err);
  },
);
