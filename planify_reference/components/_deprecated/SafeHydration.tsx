'use client';

import { ReactNode, memo } from 'react';
import { useSafeHydration } from '../hooks/useBrowserExtensions';

interface SafeHydrationProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that safely handles hydration by only rendering on client
 * Prevents hydration mismatches caused by browser extensions
 * Optimized with React.memo for better performance
 */
const SafeHydration = memo(function SafeHydration({ children, fallback = null }: SafeHydrationProps) {
  const isMounted = useSafeHydration();
  
  if (!isMounted) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
});

export default SafeHydration;