import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { store } from "../app/store";

// Instancia base apuntando al entorno correspondiente
export const apiClient = axios.create({
  // baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://pc-repair-management.onrender.com/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adjuntar el token JWT dinámicamente en cada request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Obtenemos el estado actual de autenticación directamente del store de Redux
    const state = store.getState();
    const token = state.auth.access_token;
    const currentLang = state.ui.language;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Inyectamos el Header de i18n para el backend
    if (config.headers) {
      config.headers['Accept-Language'] = currentLang;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor global para manejo de respuestas y errores comunes (ej. 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Opcional: Aquí podemos despachar una acción de logout si el token expira
      // store.dispatch(logout());
      console.warn("Sesión expirada o token inválido.");
    }
    return Promise.reject(error);
  },
);
