'use client';

import { memo } from 'react';
import { useBrowserExtensionDetection } from '../hooks/useBrowserExtensions';

interface ExtensionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Componente que protege contra errores de hidratación causados por extensiones
 * Renderiza contenido alternativo si se detectan extensiones problemáticas
 * Optimizado con React.memo para mejor performance
 */
const ExtensionGuard = memo(function ExtensionGuard({ children, fallback }: ExtensionGuardProps) {
  const { hasExtensions, isClient } = useBrowserExtensionDetection();

  // Si no estamos en el cliente, renderizar normalmente
  if (!isClient) {
    return <>{children}</>;
  }

  // Si hay extensiones y tenemos un fallback, usarlo
  if (hasExtensions && fallback) {
    return <>{fallback}</>;
  }

  // Renderizar normalmente en otros casos
  return <>{children}</>;
});

export default ExtensionGuard;