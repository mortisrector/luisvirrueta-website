import { useState } from 'react';
import { motion } from 'framer-motion';
import GmailSetupGuide from './GmailSetupGuide';
import GoogleCloudSetupGuide from './GoogleCloudSetupGuide';

interface EmailConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: EmailConfig) => void;
  currentConfig?: EmailConfig;
}

interface EmailConfig {
  gmailUser: string;
  gmailPassword: string;
  enableEmailSending: boolean;
}

export default function EmailConfigModal({ isOpen, onClose, onSave, currentConfig }: EmailConfigModalProps) {
  const [config, setConfig] = useState<EmailConfig>({
    gmailUser: currentConfig?.gmailUser || '',
    gmailPassword: currentConfig?.gmailPassword || '',
    enableEmailSending: currentConfig?.enableEmailSending || false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [showCloudGuide, setShowCloudGuide] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(config);
      onClose();
    } catch (error) {
      console.error('Error guardando configuración:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    // Función para probar el envío de email
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      if (response.ok) {
        alert('✅ Email de prueba enviado exitosamente');
      } else {
        alert('❌ Error enviando email de prueba');
      }
    } catch (error) {
      alert('❌ Error conectando con el servidor');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">📧 Configuración de Email</h2>
              <p className="text-gray-600 text-sm">Configura Gmail para envío de emails</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Enable Email Toggle */}
          <div className="mb-6 p-4 bg-blue-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Habilitar envío de emails</h3>
                <p className="text-sm text-gray-600">Enviar códigos de verificación por email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enableEmailSending}
                  onChange={(e) => setConfig({ ...config, enableEmailSending: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {config.enableEmailSending && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4"
            >
              {/* Gmail Instructions */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-yellow-800 mb-2">📝 Configuración de Gmail:</h4>
                    <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                      <li>Activa la verificación en 2 pasos</li>
                      <li>Genera una contraseña de aplicación</li>
                      <li>Usa esa contraseña aquí (no tu contraseña normal)</li>
                    </ol>
                  </div>
                  <button
                    onClick={() => setShowSetupGuide(true)}
                    className="ml-3 px-3 py-1 bg-yellow-200 text-yellow-800 rounded-lg text-xs font-medium hover:bg-yellow-300 transition-colors"
                  >
                    Guía Completa
                  </button>
                </div>
              </div>

              {/* Gmail User */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📮 Email de Gmail
                </label>
                <input
                  type="email"
                  value={config.gmailUser}
                  onChange={(e) => setConfig({ ...config, gmailUser: e.target.value })}
                  placeholder="tu-email@gmail.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Gmail App Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔐 Contraseña de Aplicación
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={config.gmailPassword}
                    onChange={(e) => setConfig({ ...config, gmailPassword: e.target.value })}
                    placeholder="abcd efgh ijkl mnop"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.05 8.05m1.828 1.828l4.242 4.242M9.878 14.121L8.05 15.95m1.828-1.828l4.242-4.243" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Contraseña de aplicación de 16 caracteres (no tu contraseña normal)
                </p>
              </div>

              {/* Test Email Button */}
              {config.gmailUser && config.gmailPassword && (
                <button
                  onClick={handleTestEmail}
                  className="w-full py-2 px-4 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Probar Envío de Email
                </button>
              )}
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Guardar Configuración
                </>
              )}
            </button>
          </div>

          {/* Security Note */}
          <div className="mt-4 p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-600 text-center mb-3">
              🔒 Tu información se guarda localmente y nunca se comparte con terceros
            </p>
            <button
              onClick={() => setShowCloudGuide(true)}
              className="w-full py-2 px-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              📘 Guía para configurar Google Drive API
            </button>
          </div>
        </div>
      </motion.div>

      {/* Gmail Setup Guide */}
      <GmailSetupGuide
        isOpen={showSetupGuide}
        onClose={() => setShowSetupGuide(false)}
      />

      {/* Google Cloud Setup Guide */}
      <GoogleCloudSetupGuide
        isOpen={showCloudGuide}
        onClose={() => setShowCloudGuide(false)}
      />
    </div>
  );
}