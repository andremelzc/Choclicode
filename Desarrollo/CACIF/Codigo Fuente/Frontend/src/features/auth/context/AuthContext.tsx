import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../../../types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (newUser: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function useInitialUser() {
  return useState<User | null>(() => {
    const storedUser = localStorage.getItem('cacif_user');
    const storedToken = localStorage.getItem('cacif_token');
    
    if (storedUser && storedToken) {
      try {
        return JSON.parse(storedUser);
      } catch {
        console.error("Error parsing stored user data");
        localStorage.removeItem('cacif_user');
        localStorage.removeItem('cacif_token');
      }
    }
    return null;
  });
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useInitialUser();
  const [isLoading, setIsLoading] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const login = (newUser: User, _token: string) => {
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cacif_token');
    localStorage.removeItem('cacif_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// @refresh reset
