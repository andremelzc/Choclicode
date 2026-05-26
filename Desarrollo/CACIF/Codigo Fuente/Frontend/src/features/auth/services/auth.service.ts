import type { User } from "../../../types/auth";

// Base de datos simulada de cuentas
const MOCK_ACCOUNTS: Record<string, User> = {
  "23200107": {
    id: "1",
    university_code: "23200107",
    full_name: "Andre Melendez Cava",
    rol: "estudiante"
  },
  "23200106": {
    id: "2",
    university_code: "23200106",
    full_name: "Fabrizio Mantari Flores",
    rol: "estudiante"
  },
};

export const authService = {
  login: async (university_code: string, password: string): Promise<{ success: boolean, user: User, token: string }> => {
    // Simulamos latencia de red
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Validamos si la cuenta existe y la contraseña es igual al código (solo para la prueba)
    if (MOCK_ACCOUNTS[university_code] && password === university_code) {
      const mockUser = MOCK_ACCOUNTS[university_code];
      const token = `mock-jwt-token-${university_code}`;

      localStorage.setItem("cacif_token", token);
      localStorage.setItem("cacif_user", JSON.stringify(mockUser));

      return { success: true, user: mockUser, token };
    }

    throw new Error("Credenciales inválidas. Intenta con tu código institucional y contraseña igual a tu código.");
  },

  loginAsGuest: async (): Promise<{ success: boolean, user: User, token: string }> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const guestUser: User = {
      id: "guest",
      university_code: "Invitado",
      full_name: "Usuario Invitado",
      rol: "invitado"
    };
    const token = "mock-guest-token";

    localStorage.setItem("cacif_token", token);
    localStorage.setItem("cacif_user", JSON.stringify(guestUser));
    return { success: true, user: guestUser, token };
  },

  logout: () => {
    localStorage.removeItem("cacif_token");
    localStorage.removeItem("cacif_user");
  }
}
