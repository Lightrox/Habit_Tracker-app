import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

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
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ error?: string }> => {
    try {
      if (!email || !password) {
        return { error: 'Email and password are required' };
      }

      // Normalize email: trim, lowercase, remove any extra spaces
      const normalizedEmail = email.trim().toLowerCase().replace(/\s+/g, '');
      
      if (!normalizedEmail.includes('@') || !normalizedEmail.includes('.')) {
        return { error: 'Please enter a valid email address' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        console.error('Supabase login error:', error);
        return { error: error.message };
      }

      if (!data.session) {
        return { error: 'Login failed. Please check your credentials.' };
      }

      return {};
    } catch (error) {
      console.error('Login error:', error);
      return { error: error instanceof Error ? error.message : 'Login failed' };
    }
  };

  const register = async (
    email: string,
    password: string
  ): Promise<{ error?: string }> => {
    try {
      if (typeof email !== 'string' || typeof password !== 'string') {
        return { error: 'Email and password must be strings' };
      }

      const cleanEmail = email.trim().toLowerCase();

      if (!cleanEmail) {
        return { error: 'Email is required' };
      }

      if (password.length < 6) {
        return { error: 'Password must be at least 6 characters' };
      }

      console.log(
        "SIGNUP EMAIL:",
        JSON.stringify(cleanEmail),
        "length:",
        cleanEmail.length
      );

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
      });

      if (error) {
        throw error;
      }

      return {};
    } catch (error) {
      console.error('Registration error:', error);
      return { error: error instanceof Error ? error.message : 'Registration failed' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
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
