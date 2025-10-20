import { motion } from 'framer-motion';

interface GmailSetupGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GmailSetupGuide({ isOpen, onClose }: GmailSetupGuideProps) {
  if (!isOpen) return null;

  const steps = [
    {
      title: "Ir a tu cuenta de Google",
      description: "Ve a myaccount.google.com",
      image: "🌐",
      action: () => window.open('https://myaccount.google.com', '_blank')
    },
    {
      title: "Activar verificación en 2 pasos",
      description: "En la sección Seguridad, activa la verificación en 2 pasos",
      image: "🔐",
      note: "Esto es requerido para generar contraseñas de aplicación"
    },
    {
      title: "Generar contraseña de aplicación",
      description: "Ve a Contraseñas de aplicación y genera una para 'Mail'",
      image: "🔑",
      action: () => window.open('https://myaccount.google.com/apppasswords', '_blank')
    },
    {
      title: "Copiar la contraseña",
      description: "Copia la contraseña de 16 caracteres que se genera",
      image: "📋",
      note: "Guárdala en un lugar seguro, solo se muestra una vez"
    },
    {
      title: "Configurar en Planify",
      description: "Usa esa contraseña en la configuración de email",
      image: "✨",
      note: "NO uses tu contraseña normal de Gmail"
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">📧 Configurar Gmail</h2>
              <p className="opacity-90">Guía paso a paso para habilitar emails</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{step.image}</span>
                    <h3 className="font-bold text-gray-900">{step.title}</h3>
                  </div>
                  
                  <p className="text-gray-600 mb-2">{step.description}</p>
                  
                  {step.note && (
                    <p className="text-sm text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      💡 {step.note}
                    </p>
                  )}
                  
                  {step.action && (
                    <button
                      onClick={step.action}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      Abrir enlace
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Important Notes */}
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <h4 className="font-bold text-red-800 mb-2">⚠️ Notas Importantes:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• La contraseña de aplicación es diferente a tu contraseña normal</li>
              <li>• Solo se muestra una vez, guárdala en un lugar seguro</li>
              <li>• Si la pierdes, puedes generar una nueva</li>
              <li>• Nunca compartas esta contraseña con terceros</li>
            </ul>
          </div>

          {/* Benefits */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-2xl">
            <h4 className="font-bold text-green-800 mb-2">✅ Con esto podrás:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Recibir códigos de verificación por email</li>
              <li>• Emails de bienvenida personalizados</li>
              <li>• Notificaciones importantes de tu cuenta</li>
              <li>• Recuperación de contraseña por email</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium"
            >
              Ya configuré Gmail
            </button>
            <button
              onClick={() => window.open('https://support.google.com/accounts/answer/185833', '_blank')}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ayuda Oficial
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}