import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../lib/user';
import { userService } from '../lib/user';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStoredUser = async () => {
      try {
        const stored = await AsyncStorage.getItem('user');
        if (stored) setUser(JSON.parse(stored));
      } finally {
        setLoading(false);
      }
    };
    checkStoredUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw new Error(error.message);

      // Ya estamos autenticados; ahora leer el registro en public.user con rol authenticated
      const profile = await userService.getUserByEmail(email);
      if (!profile) {
        throw new Error('Perfil de usuario no encontrado');
      }
      setUser(profile);
      await AsyncStorage.setItem('user', JSON.stringify(profile));
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw new Error(error.message);

      // Crear la fila correspondiente en public.user con hash local para compatibilidad
      const created = await userService.createUser(email, password);
      setUser(created);
      await AsyncStorage.setItem('user', JSON.stringify(created));
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


