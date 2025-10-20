'use client';

import { Home, Calendar, Bell, User, FolderOpen, Plus } from 'lucide-react';
import { useState } from 'react';

interface AdaptiveNavigationProps {
  currentView: 'home' | 'folders' | 'calendar' | 'reminders' | 'profile';
  onNavigate: (view: 'home' | 'folders' | 'calendar' | 'reminders' | 'profile') => void;
  isModalOpen?: boolean;
}

export default function AdaptiveNavigation({ currentView, onNavigate, isModalOpen = false }: AdaptiveNavigationProps) {
  const [clickedButton, setClickedButton] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const navigationItems = [
    { 
      icon: Home, 
      label: 'Inicio', 
      id: 'home' as const
    },
    { 
      icon: FolderOpen, 
      label: 'Carpetas', 
      id: 'folders' as const
    },
    { 
      icon: Calendar, 
      label: 'Calendario', 
      id: 'calendar' as const
    },
    { 
      icon: Bell, 
      label: 'Recordatorios', 
      id: 'reminders' as const
    },
    { 
      icon: User, 
      label: 'Perfil', 
      id: 'profile' as const
    }
  ];

  const handleNavClick = (id: string) => {
    setClickedButton(id);
    setTimeout(() => {
      onNavigate(id as any);
      setClickedButton(null);
      if (isModalOpen) setIsExpanded(false);
    }, 300);
  };

  // CSS para animaciones
  const styles = `
    @keyframes pulseWaves {
      0% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.2); opacity: 0.4; }
      100% { transform: scale(1.4); opacity: 0; }
    }
    
    @keyframes particleExplosion {
      0% { transform: scale(0.8) rotate(0deg); opacity: 1; }
      50% { transform: scale(1.3) rotate(180deg); opacity: 0.6; }
      100% { transform: scale(2) rotate(360deg); opacity: 0; }
    }
    
    @keyframes iconBounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); }
    }

    @keyframes slideInRight {
      from { transform: translateX(100%) scale(0.8); opacity: 0; }
      to { transform: translateX(0) scale(1); opacity: 1; }
    }
    
    .pulse-ring { animation: pulseWaves 2s infinite; }
    .particle-explosion { animation: particleExplosion 0.8s ease-out; }
    .icon-bounce { animation: iconBounce 0.6s ease-out; }
    .slide-in { animation: slideInRight 0.3s ease-out; }
  `;

  if (isModalOpen) {
    // Modo contraído - Círculo flotante en la esquina inferior izquierda
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="fixed bottom-6 left-6 z-[60]">
          {/* Menú expandido */}
          {isExpanded && (
            <div className="absolute bottom-16 left-0 flex flex-col gap-2 slide-in">
              {navigationItems.map((item, index) => {
                const isActive = currentView === item.id;
                const isClicked = clickedButton === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    className="relative w-12 h-12 rounded-full bg-black/90 backdrop-blur-xl border border-purple-500/30 flex items-center justify-center transition-all duration-200 hover:scale-110 slide-in"
                  >
                    {isActive && (
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/50"></div>
                    )}
                    <Icon 
                      className={`w-5 h-5 relative z-10 transition-colors ${
                        isActive ? 'text-white' : 'text-gray-300 hover:text-white'
                      } ${isClicked ? 'icon-bounce' : ''}`}
                      strokeWidth={isActive ? 3 : 2.5}
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Botón principal */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shadow-2xl shadow-purple-500/50 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-white/20"
          >
            <Plus 
              className={`w-6 h-6 text-white transition-transform duration-300 ${
                isExpanded ? 'rotate-45' : 'rotate-0'
              }`}
              strokeWidth={3}
            />
          </button>
        </div>
      </>
    );
  }

  // Modo normal - Barra de navegación completa
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="fixed bottom-3 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-black/98 backdrop-blur-xl rounded-full px-3 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 border border-purple-500/30 shadow-2xl shadow-purple-900/60">
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black via-gray-900/95 to-black border border-purple-400/20 shadow-inner shadow-purple-500/20"></div>
          
          <div className="relative flex items-center justify-center space-x-3 sm:space-x-5 md:space-x-7">
            {navigationItems.map((item) => {
              const isActive = currentView === item.id;
              const isClicked = clickedButton === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="relative p-1.5 sm:p-2 md:p-2.5 transition-all duration-200"
                >
                  {isClicked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="absolute w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-purple-500/20 particle-explosion"></div>
                      <div className="absolute w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-full bg-purple-400/30 particle-explosion" style={{animationDelay: '0.1s'}}></div>
                      <div className="absolute w-2 h-2 sm:w-4 sm:h-4 md:w-6 md:h-6 rounded-full bg-purple-300/40 particle-explosion" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  )}
                  
                  {isActive && !isClicked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="absolute w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border border-purple-400/30 pulse-ring"></div>
                      <div className="absolute w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border border-purple-300/20 pulse-ring"></div>
                      <div className="absolute w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border border-purple-200/10 pulse-ring"></div>
                    </div>
                  )}
                  
                  <div className={`
                    w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-200 relative z-10
                    ${isActive 
                      ? 'bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 shadow-lg shadow-purple-500/70 scale-105 sm:scale-110' 
                      : 'bg-gray-900/80 hover:bg-gray-800/90 hover:scale-105 border border-gray-700/50'
                    }
                    ${isClicked ? 'cinematic-click' : ''}
                  `}>
                    {isActive && (
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400/20 to-transparent animate-pulse"></div>
                    )}
                    
                    <Icon 
                      className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 transition-colors duration-200 relative z-10 ${
                        isActive 
                          ? 'text-white drop-shadow-md' 
                          : 'text-gray-400 hover:text-gray-200'
                      } ${isClicked ? 'icon-bounce' : ''}`}
                      strokeWidth={isActive ? 3 : 2.5}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}