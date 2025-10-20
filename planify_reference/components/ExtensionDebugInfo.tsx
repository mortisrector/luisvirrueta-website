'use client';

import { useState } from 'react';
import { useBrowserExtensionDetection } from '../hooks/useBrowserExtensions';

export default function ExtensionDebugInfo() {
  const { hasExtensions, isClient } = useBrowserExtensionDetection();
  const [isVisible, setIsVisible] = useState(true);

  // Solo mostrar en desarrollo y cuando está en el cliente
  if (!isClient || process.env.NODE_ENV === 'production' || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {hasExtensions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-lg relative">
          {/* Botón de cerrar */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-200 hover:bg-blue-300 flex items-center justify-center transition-colors duration-200"
            title="Cerrar notificación"
          >
            <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex items-center gap-2 text-blue-800 pr-6">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Extensiones detectadas</span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Se detectaron extensiones del navegador. Los errores de hidratación relacionados se han suprimido automáticamente.
          </p>
          <details className="mt-2">
            <summary className="text-xs text-blue-700 cursor-pointer hover:text-blue-900">
              ▶ Ver detalles técnicos
            </summary>
            <div className="mt-1 text-xs text-blue-600 space-y-1">
              <p>• Errores de hidratación: Suprimidos ✓</p>
              <p>• Atributos de extensión: Detectados ✓</p>
              <p>• Renderizado seguro: Activo ✓</p>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}