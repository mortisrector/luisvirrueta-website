'use client';

import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { User, AuthSession, LoginCredentials, RegisterCredentials, VerificationRequest } from '@/types/auth';
import { authService } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message: string; needsVerification?: boolean }>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; message: string; needsVerification?: boolean }>;
  verifyEmail: (verification: VerificationRequest) => Promise<{ success: boolean; message: string }>;
  resendCode: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar sesión existente al cargar
    const initializeAuth = async () => {
      try {
        // Primero verificar si hay parámetros de Google auth en la URL
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const googleAuth = urlParams.get('google_auth');
          const token = urlParams.get('token');
          
          if (googleAuth === 'success' && token) {
            console.log('✅ Autenticación Google exitosa, procesando token...');
            
            // Guardar el token en localStorage
            localStorage.setItem('auth_session', token);
            
            // Decodificar el token para obtener información del usuario
            const sessionData = authService.validateSession(token);
            if (sessionData) {
              setSession(sessionData);
              console.log('✅ Sesión Google establecida para:', sessionData.user.email);
            }
            
            // Limpiar parámetros de URL
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
            
            return;
          }
        }
        
        // Verificar sesión existente normalmente
        const currentSession = authService.getCurrentSession();
        setSession(currentSession);
      } catch (error) {
        console.error('Error loading session:', error);
        // Limpiar localStorage si hay error
        localStorage.removeItem('auth_session');
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const result = await authService.login(credentials);
      if (result.success && result.session) {
        setSession(result.session);
      }
      return { success: result.success, message: result.message, needsVerification: result.needsVerification };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    try {
      const result = await authService.register(credentials);
      console.log('🔍 useAuth - Resultado del servicio:', result);
      return { success: result.success, message: result.message, needsVerification: result.needsVerification };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (verification: VerificationRequest) => {
    setIsLoading(true);
    try {
      const result = await authService.verifyEmail(verification);
      if (result.success && result.session) {
        setSession(result.session);
      }
      return { success: result.success, message: result.message };
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async (email: string) => {
    return await authService.resendCode(email);
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    const result = await authService.updateProfile(updates);
    if (result.success && result.user) {
      setSession(prev => prev ? { ...prev, user: result.user! } : null);
    }
    return { success: result.success, message: result.message };
  };

  const value: AuthContextType = {
    user: session?.user || null,
    session,
    isAuthenticated: !!session,
    isLoading,
    login,
    register,
    verifyEmail,
    resendCode,
    logout,
    updateProfile
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}