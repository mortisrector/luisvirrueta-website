'use client';

import { User, AuthSession, LoginCredentials, RegisterCredentials, VerificationRequest } from '@/types/auth';

class AuthService {
  private baseUrl = '/api/auth';

  // Registrar usuario
  async register(credentials: RegisterCredentials): Promise<{ success: boolean; message: string; needsVerification?: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      const result = await response.json();
      console.log('🌐 AuthService - Respuesta completa del servidor:', result);
      return result;
    } catch (error) {
      console.log('💥 AuthService - Error en fetch:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }

  // Iniciar sesión
  async login(credentials: LoginCredentials): Promise<{ success: boolean; session?: AuthSession; message: string; needsVerification?: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      const result = await response.json();
      
      if (result.success && result.session) {
        // Guardar sesión en localStorage
        localStorage.setItem('auth_session', JSON.stringify(result.session));
      }
      
      return result;
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    }
  }

  // Verificar email con código
  async verifyEmail(verification: VerificationRequest): Promise<{ success: boolean; session?: AuthSession; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verification)
      });
      
      const result = await response.json();
      
      if (result.success && result.session) {
        // Guardar sesión en localStorage
        localStorage.setItem('auth_session', JSON.stringify(result.session));
      }
      
      return result;
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    }
  }

  // Reenviar código de verificación
  async resendCode(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/resend-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    }
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      localStorage.removeItem('auth_session');
    }
  }

  // Obtener sesión actual
  getCurrentSession(): AuthSession | null {
    try {
      const sessionData = localStorage.getItem('auth_session');
      if (!sessionData) return null;
      
      // Si es un JWT (Google auth), validarlo
      if (sessionData.includes('.')) {
        return this.validateSession(sessionData);
      }
      
      // Si es JSON normal, parsearlo
      const session: AuthSession = JSON.parse(sessionData);
      
      // Verificar si la sesión no ha expirado
      if (new Date() > new Date(session.expiresAt)) {
        localStorage.removeItem('auth_session');
        return null;
      }
      
      return session;
    } catch (error) {
      console.error('Error getting current session:', error);
      localStorage.removeItem('auth_session');
      return null;
    }
  }

  // Validar sesión JWT (para Google auth)
  validateSession(token: string): AuthSession | null {
    try {
      // Decodificar JWT manualmente (solo para lectura, sin verificación de firma)
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      
      // Verificar expiración
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        localStorage.removeItem('auth_session');
        return null;
      }
      
      // Crear sesión compatible
      const session: AuthSession = {
        user: {
          id: payload.id,
          email: payload.email,
          name: payload.name,
          avatar: payload.avatar,
          isVerified: true, // Los usuarios de Google siempre están verificados
          provider: payload.provider || 'google',
          driveConnected: payload.driveConnected || true,
          googleTokens: payload.googleTokens,
          createdAt: payload.connectedAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          connectedAt: payload.connectedAt || new Date().toISOString()
        },
        token: token,
        expiresAt: new Date(payload.exp * 1000).toISOString()
      };
      
      return session;
    } catch (error) {
      console.error('Error validating JWT session:', error);
      return null;
    }
  }

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    return this.getCurrentSession() !== null;
  }

  // Obtener usuario actual
  getCurrentUser(): User | null {
    const session = this.getCurrentSession();
    return session?.user || null;
  }

  // Headers de autenticación
  private getAuthHeaders(): HeadersInit {
    const session = this.getCurrentSession();
    return {
      'Content-Type': 'application/json',
      'Authorization': session ? `Bearer ${session.token}` : ''
    };
  }

  // Actualizar perfil de usuario
  async updateProfile(updates: Partial<User>): Promise<{ success: boolean; user?: User; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/profile`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      
      const result = await response.json();
      
      if (result.success && result.user) {
        // Actualizar sesión local
        const session = this.getCurrentSession();
        if (session) {
          session.user = result.user;
          localStorage.setItem('auth_session', JSON.stringify(session));
        }
      }
      
      return result;
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    }
  }
}

export const authService = new AuthService();