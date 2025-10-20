'use client';

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { LoginCredentials, RegisterCredentials, VerificationRequest } from '@/types/auth';

interface AuthScreenProps {
  onAuthSuccess?: () => void;
  mode?: 'login' | 'register' | 'verify';
  onModeChange?: (mode: 'login' | 'register' | 'verify') => void;
  pendingEmail?: string;
  onPendingEmailChange?: (email: string) => void;
}

export default function AuthScreen({ 
  onAuthSuccess, 
  mode: externalMode = 'login', 
  onModeChange,
  pendingEmail = '',
  onPendingEmailChange 
}: AuthScreenProps) {
  const [mode, setModeInternal] = useState<'login' | 'register' | 'verify' | 'forgot-password' | 'reset-password'>(externalMode);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(pendingEmail);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showActionButtons, setShowActionButtons] = useState(false);
  
  const { login, register, verifyEmail, resendCode } = useAuth();

  // Función para cambiar modo (usa externa si está disponible, interna si no)
  const setMode = (newMode: 'login' | 'register' | 'verify' | 'forgot-password' | 'reset-password') => {
    console.log('🎭 Cambiando modo de', mode, 'a', newMode);
    setError('');
    setSuccess('');
    setShowActionButtons(false);
    if (onModeChange) {
      onModeChange(newMode as any);
    } else {
      setModeInternal(newMode);
    }
  };

  // Usar modo externo si está disponible
  const currentMode = onModeChange ? externalMode : mode;

  // Log para debuggear cambios de modo
  console.log('🎭 AuthScreen render - modo actual:', currentMode);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const credentials: LoginCredentials = { email, password };
      const result = await login(credentials);
      
      if (result.success) {
        console.log('✅ Login exitoso, redirigiendo a conectar Google Drive...');
        // Después de autenticación exitosa, conectar automáticamente con Google Drive
        window.location.href = '/api/auth/google';
      } else if (result.needsVerification) {
        setMode('verify');
        setError('Tu cuenta necesita verificación. Revisa tu email.');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const credentials: RegisterCredentials = { email, password, name };
      console.log('🔄 Enviando registro:', { email, name });
      
      const result = await register(credentials);
      console.log('📥 Respuesta del registro:', result);
      
      if (result.success && result.needsVerification) {
        console.log('✅ Registro exitoso, cambiando a modo verificación');
        setMode('verify');
        if (onPendingEmailChange) onPendingEmailChange(email);
        setError('Código de verificación enviado a tu email.');
      } else if (result.success) {
        console.log('✅ Registro exitoso sin verificación, redirigiendo a conectar Google Drive...');
        // Registro exitoso sin necesidad de verificación
        window.location.href = '/api/auth/google';
      } else {
        console.log('❌ Error en registro:', result.message);
        handleRegisterResponse(result);
      }
    } catch (error) {
      console.log('💥 Excepción en registro:', error);
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const verification: VerificationRequest = { email, code: verificationCode };
      const result = await verifyEmail(verification);
      
      if (result.success) {
        console.log('✅ Verificación exitosa, redirigiendo a conectar Google Drive...');
        // Después de autenticación exitosa, conectar automáticamente con Google Drive
        window.location.href = '/api/auth/google';
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setIsLoading(true);

    try {
      const result = await resendCode(email);
      if (result.success) {
        setError('Código reenviado exitosamente');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Error reenviando código');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const result = await response.json();
      
      if (result.success) {
        setSuccess('Código de recuperación enviado a tu email');
        setMode('reset-password');
        if (onPendingEmailChange) onPendingEmailChange(email);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          code: verificationCode, 
          newPassword 
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setSuccess('Contraseña cambiada exitosamente');
        setTimeout(() => {
          setMode('login');
          setPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setVerificationCode('');
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    try {
      // Redirigir a Google OAuth con permisos completos
      const authUrl = 'https://accounts.google.com/oauth/authorize?' +
        'client_id=' + encodeURIComponent(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '') +
        '&redirect_uri=' + encodeURIComponent(`${window.location.origin}/api/auth/google/callback`) +
        '&response_type=code' +
        '&scope=' + encodeURIComponent([
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/drive.file',
          'https://www.googleapis.com/auth/gmail.readonly',
          'https://www.googleapis.com/auth/gmail.send'
        ].join(' ')) +
        '&access_type=offline' +
        '&prompt=consent';
      
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error iniciando login con Google:', error);
      setError('Error al conectar con Google');
    }
  };

  const handleRegisterResponse = (result: any) => {
    if (result.userExists && result.showPasswordReset) {
      setError(result.message);
      setShowActionButtons(true);
    } else if (result.userExists && result.showResendCode) {
      setError(result.message);
      setShowActionButtons(true);
    } else {
      setError(result.message);
      setShowActionButtons(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Glassmorphism Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {currentMode === 'login' && 'Iniciar Sesión'}
              {currentMode === 'register' && 'Crear Cuenta'}
              {currentMode === 'verify' && 'Verificar Email'}
              {currentMode === 'forgot-password' && 'Recuperar Contraseña'}
              {currentMode === 'reset-password' && 'Nueva Contraseña'}
            </h1>
            <p className="text-white/70">
              {currentMode === 'login' && 'Accede a tu cuenta de productividad'}
              {currentMode === 'register' && 'Únete y comienza a organizarte'}
              {currentMode === 'verify' && 'Verifica tu email para continuar'}
              {currentMode === 'forgot-password' && 'Te enviaremos un código de recuperación'}
              {currentMode === 'reset-password' && 'Crea una nueva contraseña segura'}
              {currentMode === 'register' && 'Únete a la plataforma de productividad'}
              {currentMode === 'verify' && 'Ingresa el código enviado a tu email'}
            </p>
          </div>

          {/* Forms */}
          {currentMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition-colors"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-12 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition-colors"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Iniciar Sesión</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Google Login Button */}
              <div className="mt-6 mb-6">
                <div className="relative flex items-center justify-center mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20" />
                  </div>
                  <div className="relative bg-slate-900/50 px-4">
                    <span className="text-sm text-white/60">O continúa con</span>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl group"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Continuar con Google</span>
                    <span className="text-xs text-white/60">Incluye Drive + Gmail automático</span>
                  </div>
                </button>
              </div>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={() => setMode('forgot-password')}
                  className="text-orange-300 hover:text-orange-200 text-sm transition-colors block w-full"
                >
                  ¿Olvidaste tu contraseña?
                </button>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-purple-300 hover:text-purple-200 text-sm transition-colors"
                >
                  ¿No tienes cuenta? Regístrate
                </button>
              </div>

              {/* Botón para probar sin cuenta */}
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => onAuthSuccess?.()}
                  className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium py-3 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>🚀 Probar sin cuenta</span>
                </button>
                <p className="text-white/50 text-xs mt-2">
                  Explora la app sin registrarte (datos temporales)
                </p>
              </div>
            </form>
          )}

          {currentMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Nombre (opcional)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition-colors"
                    placeholder="Tu nombre"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition-colors"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-12 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition-colors"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                <p className="text-white/50 text-xs mt-1">Mínimo 6 caracteres</p>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm">
                  {error}
                  {showActionButtons && (
                    <div className="mt-3 flex flex-col space-y-2">
                      <button
                        type="button"
                        onClick={() => setMode('forgot-password')}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                      >
                        🔐 Recuperar contraseña
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          setIsLoading(true);
                          try {
                            const result = await resendCode(email);
                            if (result.success) {
                              setMode('verify');
                              setError('Código reenviado exitosamente');
                            } else {
                              setError(result.message);
                            }
                          } catch {
                            setError('Error reenviando código');
                          } finally {
                            setIsLoading(false);
                          }
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                      >
                        📧 Reenviar código de verificación
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Crear Cuenta</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-purple-300 hover:text-purple-200 text-sm transition-colors"
                >
                  ¿Ya tienes cuenta? Inicia sesión
                </button>
              </div>
            </form>
          )}

          {currentMode === 'verify' && (
            <form onSubmit={handleVerification} className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-purple-300" />
                </div>
                <p className="text-white/70 text-sm">
                  Hemos enviado un código de 6 dígitos a:<br />
                  <span className="text-white font-medium">{email}</span>
                </p>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Código de Verificación
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-widest placeholder-white/40 focus:outline-none focus:border-purple-400 transition-colors"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              {error && (
                <div className={`border rounded-lg p-3 text-sm ${
                  error.includes('exitosamente') 
                    ? 'bg-green-500/20 border-green-500/30 text-green-200'
                    : 'bg-red-500/20 border-red-500/30 text-red-200'
                }`}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verificar Cuenta</span>
                  </>
                )}
              </button>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="text-purple-300 hover:text-purple-200 text-sm transition-colors"
                >
                  Reenviar código
                </button>
                <br />
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-white/50 hover:text-white/70 text-sm transition-colors"
                >
                  Volver al inicio de sesión
                </button>
              </div>
            </form>
          )}

          {/* Forgot Password Form */}
          {currentMode === 'forgot-password' && (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition-colors"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-green-200 text-sm">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enviar código de recuperación</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-white/50 hover:text-white/70 text-sm transition-colors"
                >
                  Volver al inicio de sesión
                </button>
              </div>
            </form>
          )}

          {/* Reset Password Form */}
          {currentMode === 'reset-password' && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Código de recuperación
                </label>
                <div className="relative">
                  <CheckCircle2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition-colors text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>
                <p className="text-white/50 text-xs mt-1">Código enviado a {email}</p>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-12 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition-colors"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                <p className="text-white/50 text-xs mt-1">Mínimo 6 caracteres</p>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition-colors"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-green-200 text-sm">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Cambiar contraseña</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-white/50 hover:text-white/70 text-sm transition-colors"
                >
                  Volver al inicio de sesión
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white/50 text-sm">
            App de Productividad Premium
          </p>
        </div>
      </div>
    </div>
  );
}