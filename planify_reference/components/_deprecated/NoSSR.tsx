'use client';

import { useEffect, useState, memo } from 'react';

interface NoSSRProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * NoSSR Component - Prevents hydration mismatches for browser extensions
 * Only renders children on the client side after hydration
 * Optimized with React.memo for better performance
 */
const NoSSR = memo(function NoSSR({ children, fallback = null }: NoSSRProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
});

export default NoSSR;