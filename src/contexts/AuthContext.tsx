import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/authService';

interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  totalStudyTime?: number;
  totalCardsStudied?: number;
  createdAt?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
            // Verify token with server
            try {
              const response = await authService.getMe();
              setUser(response.data.user);
            } catch {
              // Token invalid, clear storage
              authService.logout();
              setUser(null);
            }
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (data: LoginData): Promise<void> => {
    const response = await authService.login(data);
    if (response.success) {
      authService.storeAuthData(response.data.token, response.data.user);
      setUser(response.data.user);
    } else {
      throw new Error(response.message);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    const response = await authService.register(data);
    if (response.success) {
      authService.storeAuthData(response.data.token, response.data.user);
      setUser(response.data.user);
    } else {
      throw new Error(response.message);
    }
  };

  const logout = (): void => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (updatedUser: User): void => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
