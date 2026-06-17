import axios from 'axios';

// URL base de la API (por defecto a localhost en desarrollo)
// Recuerda crear un archivo .env con VITE_API_URL para apuntar a tu backend real
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Las llamadas a servicios de IA (RAG) pueden tomar más tiempo
  // Aumentado a 120s (2 min) para operaciones de embedding + LLM
  timeout: 120000, 
});

// Interceptor para inyectar token de autenticación en cada petición
api.interceptors.request.use(
  (config) => {
    // Aquí en el futuro obtendremos el token de localStorage o de tu gestor de estado (ej. Zustand)
    const token = localStorage.getItem('cacif_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores globales (ej. 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Lógica futura para cerrar sesión o refrescar token
      console.warn("Sesión expirada o no autorizada. Redirigiendo a login...");
    }
    return Promise.reject(error);
  }
);

// --- Tipos Base Compartidos (Esqueleto) ---
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
