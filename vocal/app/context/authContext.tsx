'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { userService, User } from '../lib/user';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 Iniciando auth...');
    console.log('🔧 Supabase client:', supabase);
    
    // Cargar desde localStorage primero (sin bloquear)
    const stored = localStorage.getItem('user');
    if (stored) {
      console.log('💾 Cargando desde localStorage');
      try {
        const userData = JSON.parse(stored);
        setUser(userData);
        console.log('✅ Usuario cargado desde localStorage:', userData.email);
      } catch (e) {
        console.error('Error parsing stored user:', e);
        localStorage.removeItem('user');
      }
    }
    
    // Marcar como no loading inmediatamente
    setLoading(false);

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user?.id) {
        const profile = await userService.getProfileByUserId(session.user.id);
        if (profile) {
          setUser(profile);
          localStorage.setItem('user', JSON.stringify(profile));
        }
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      const uid = data.session?.user?.id;
      if (!uid) throw new Error('No se obtuvo sesión');
      const profile = await userService.getProfileByUserId(uid);
      if (!profile) throw new Error('Perfil de usuario no encontrado');
      setUser(profile);
      localStorage.setItem('user', JSON.stringify(profile));
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw new Error(error.message);
      // El perfil será creado por trigger en DB. Si confirmación de email está activa, no habrá sesión aún.
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
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
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


