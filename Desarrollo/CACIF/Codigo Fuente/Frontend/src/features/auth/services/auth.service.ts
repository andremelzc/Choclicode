import type { User } from "../../../types/auth";
import { api } from "../../../services/api";

export const authService = {
  login: async (email: string, password: string): Promise<{ success: boolean, user: User, token: string }> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem("cacif_token", token);
      localStorage.setItem("cacif_user", JSON.stringify(user));

      return { success: true, user, token };
    } catch (error: unknown) {
      const detail = error instanceof Error 
        ? error.message 
        : (error instanceof Object && 'response' in error && typeof error.response === 'object' && error.response !== null && 'data' in error.response ? (error.response.data as { detail?: string }).detail : undefined) || "Credenciales inválidas o error de conexión.";
      throw new Error(detail, { cause: error });
    }
  },

  loginAsGuest: async (): Promise<{ success: boolean, user: User, token: string }> => {
    try {
      const response = await api.post('/auth/guest');
      const { token, user } = response.data;

      localStorage.setItem("cacif_token", token);
      localStorage.setItem("cacif_user", JSON.stringify(user));
      
      return { success: true, user, token };
    } catch (error: unknown) {
      const detail = error instanceof Error 
        ? error.message 
        : (error instanceof Object && 'response' in error && typeof error.response === 'object' && error.response !== null && 'data' in error.response ? (error.response.data as { detail?: string }).detail : undefined) || "Error al iniciar sesión como invitado.";
      throw new Error(detail, { cause: error });
    }
  },

  logout: () => {
    localStorage.removeItem("cacif_token");
    localStorage.removeItem("cacif_user");
  }
};
