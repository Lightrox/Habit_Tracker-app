import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../utils/api';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await api.getMe();
      if (response.data) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ error?: string }> => {
    try {
      const response = await api.login(email, password);
      if (response.data) {
        setUser(response.data.user);
        return {};
      }
      // Check for 404 - means API routes aren't being served
      if (response.error && response.error.includes('404')) {
        return { 
          error: 'API routes not found. Make sure you\'re using "npm run dev:vercel" (not "npm run dev")' 
        };
      }
      return { error: response.error || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { error: error instanceof Error ? error.message : 'Login failed' };
    }
  };

  const register = async (
    email: string,
    password: string
  ): Promise<{ error?: string }> => {
    const response = await api.register(email, password);
    if (response.data) {
      setUser(response.data.user);
      return {};
    }
    return { error: response.error || 'Registration failed' };
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

