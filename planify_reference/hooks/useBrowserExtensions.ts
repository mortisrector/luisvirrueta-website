'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to detect browser extensions that might interfere with hydration
 */
export function useBrowserExtensionDetection() {
  const [hasExtensions, setHasExtensions] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Check for common extension signatures
    const checkForExtensions = () => {
      if (typeof window === 'undefined') return false;

      // Common extension attributes
      const extensionSelectors = [
        '[bis_skin_checked]',
        '[data-lastpass-icon-root]',
        '[data-1p-ignore]',
        '[data-bitwarden-watching]',
        '[data-dashlane-rid]',
        '[data-gramm]',
        '[data-honey-extension]',
        '.metamask-extension'
      ];

      // Check if any extension elements exist
      const hasExtensionElements = extensionSelectors.some(selector => {
        try {
          return document.querySelector(selector) !== null;
        } catch {
          return false;
        }
      });

      // Check for extension-injected scripts
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const hasExtensionScripts = scripts.some(script => {
        const src = script.getAttribute('src') || '';
        return src.includes('extension') || 
               src.includes('chrome-extension') || 
               src.includes('moz-extension');
      });

      return hasExtensionElements || hasExtensionScripts;
    };

    // Initial check
    setHasExtensions(checkForExtensions());

    // Periodic check for dynamically added extension elements
    const intervalId = setInterval(() => {
      setHasExtensions(checkForExtensions());
    }, 1000);

    // Cleanup
    return () => clearInterval(intervalId);
  }, []);

  return { hasExtensions, isClient };
}

/**
 * Hook for safe hydration - prevents hydration mismatches
 */
export function useSafeHydration() {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  return isMounted;
}