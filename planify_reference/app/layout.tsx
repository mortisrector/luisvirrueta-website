import type { Metadata } from 'next'
import './globals.css'
import ExtensionDebugInfo from '../components/ExtensionDebugInfo'
import { AuthProvider } from '../hooks/useAuth'
// Import browser extension fix to prevent hydration errors
import '../lib/browserExtensionFix'

export const metadata: Metadata = {
  title: 'Planify - Uno por ciento diario',
  description: 'App minimalista para gestión de proyectos con progreso diario del 1%',
  icons: {
    icon: '/favicon.svg',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Comprehensive suppression for browser extension hydration warnings
              const originalError = console.error;
              const originalWarn = console.warn;
              
              // Common browser extension attributes that cause hydration mismatches
              const extensionAttributes = [
                'bis_skin_checked',
                '__processed_',
                'data-lastpass-',
                'data-1p-',
                'data-bitwarden-',
                'data-dashlane-',
                'lp-',
                'data-gramm',
                'grammarly-extension',
                'data-honey-',
                'metamask-',
                'data-ms-editor'
              ];
              
              const isExtensionRelated = (message) => {
                if (typeof message !== 'string') return false;
                const lowerMessage = message.toLowerCase();
                
                return lowerMessage.includes('hydration') ||
                       lowerMessage.includes('hydrated but some attributes') ||
                       lowerMessage.includes('did not match') ||
                       lowerMessage.includes('server rendered html') ||
                       extensionAttributes.some(attr => lowerMessage.includes(attr.toLowerCase()));
              };
              
              console.error = (...args) => {
                if (isExtensionRelated(args[0])) return;
                originalError.apply(console, args);
              };
              
              console.warn = (...args) => {
                if (isExtensionRelated(args[0])) return;
                originalWarn.apply(console, args);
              };
              
              // Also suppress React's internal hydration warnings
              if (typeof window !== 'undefined') {
                window.addEventListener('error', (e) => {
                  if (isExtensionRelated(e.message)) {
                    e.stopPropagation();
                    e.preventDefault();
                  }
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-slate-50 to-white antialiased" suppressHydrationWarning={true}>
        <AuthProvider>
          <main className="min-h-screen" suppressHydrationWarning={true}>
            {children}
          </main>
        </AuthProvider>
        <ExtensionDebugInfo />
      </body>
    </html>
  )
}