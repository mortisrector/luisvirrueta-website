import { motion } from 'framer-motion';

interface GoogleCloudSetupGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GoogleCloudSetupGuide({ isOpen, onClose }: GoogleCloudSetupGuideProps) {
  if (!isOpen) return null;

  const steps = [
    {
      title: "Crear proyecto en Google Cloud",
      description: "Ve a Google Cloud Console y crea un nuevo proyecto",
      image: "🌐",
      action: () => window.open('https://console.cloud.google.com/', '_blank'),
      details: [
        "Haz clic en 'Nuevo Proyecto'",
        "Dale un nombre como 'Planify App'",
        "Selecciona tu organización (opcional)"
      ]
    },
    {
      title: "Habilitar Google Drive API",
      description: "Activa la API de Google Drive para tu proyecto",
      image: "🔧",
      action: () => window.open('https://console.cloud.google.com/apis/library/drive.googleapis.com', '_blank'),
      details: [
        "Busca 'Google Drive API'",
        "Haz clic en 'Habilitar'",
        "Espera a que se active"
      ]
    },
    {
      title: "Configurar pantalla de consentimiento",
      description: "Configura la pantalla que verán los usuarios al autorizar",
      image: "🔐",
      action: () => window.open('https://console.cloud.google.com/apis/credentials/consent', '_blank'),
      details: [
        "Selecciona 'Externo' como tipo de usuario",
        "Completa información básica de la app",
        "Agrega tu email como desarrollador"
      ]
    },
    {
      title: "Crear credenciales OAuth 2.0",
      description: "Genera las credenciales para autenticación",
      image: "🔑",
      action: () => window.open('https://console.cloud.google.com/apis/credentials', '_blank'),
      details: [
        "Haz clic en '+ Crear credenciales'",
        "Selecciona 'ID de cliente OAuth 2.0'",
        "Tipo: Aplicación web"
      ]
    },
    {
      title: "Configurar URIs de redirección",
      description: "Agregar URLs autorizadas para redirección",
      image: "🔗",
      note: "URIs importantes para desarrollo",
      details: [
        "URI autorizada: http://localhost:3000",
        "URI de redirección: http://localhost:3000/api/auth/google/callback",
        "Para producción usa tu dominio real"
      ]
    },
    {
      title: "Copiar credenciales",
      description: "Guarda el Client ID y Client Secret",
      image: "📋",
      note: "Información confidencial - guárdala segura",
      details: [
        "Copia el 'Client ID'",
        "Copia el 'Client Secret'",
        "Agrégalos a tu archivo .env.local"
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">☁️ Configurar Google Cloud Console</h2>
              <p className="opacity-90">Guía completa para habilitar Google Drive API</p>
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
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Step Connector */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-16 w-0.5 h-16 bg-gradient-to-b from-blue-500 to-purple-500 opacity-30"></div>
                )}

                <div className="flex gap-6">
                  {/* Step Number */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {index + 1}
                    </div>
                  </div>
                  
                  {/* Step Content */}
                  <div className="flex-1 bg-gray-50 rounded-2xl p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <span className="text-3xl">{step.image}</span>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                        <p className="text-gray-600 mb-3">{step.description}</p>
                        
                        {step.note && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                            <p className="text-amber-800 text-sm">
                              💡 <strong>Nota:</strong> {step.note}
                            </p>
                          </div>
                        )}

                        {/* Step Details */}
                        <div className="space-y-2">
                          {step.details.map((detail, detailIndex) => (
                            <div key={detailIndex} className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                              <span className="text-gray-700 text-sm">{detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    {step.action && (
                      <div className="flex justify-end">
                        <button
                          onClick={step.action}
                          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium flex items-center gap-2 shadow-lg"
                        >
                          Abrir Consola
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Final Configuration Section */}
          <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-2xl">
            <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
              <span className="text-xl">⚙️</span>
              Configuración Final en .env.local
            </h4>
            <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm">
              <div># Google Drive API Configuration</div>
              <div>GOOGLE_CLIENT_ID=tu-client-id-aqui.googleusercontent.com</div>
              <div>GOOGLE_CLIENT_SECRET=tu-client-secret-aqui</div>
              <div>GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback</div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h5 className="font-bold text-blue-800 mb-2">🔒 Seguridad</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Nunca compartas tu Client Secret</li>
                <li>• Usa URIs HTTPS en producción</li>
                <li>• Revisa permisos regularmente</li>
              </ul>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <h5 className="font-bold text-purple-800 mb-2">📱 Producción</h5>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Verifica tu dominio en Google</li>
                <li>• Solicita verificación de la app</li>
                <li>• Configura políticas de privacidad</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium"
            >
              Ya configuré Google Cloud
            </button>
            <button
              onClick={() => window.open('https://developers.google.com/drive/api/quickstart/nodejs', '_blank')}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Documentación Oficial
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}