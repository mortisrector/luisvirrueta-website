'use client';

import { Home, Calendar, Bell, User, FolderOpen, Brain } from 'lucide-react';
import { useState } from 'react';
type NavigationView = 'home' | 'folders' | 'ideas' | 'calendar' | 'reminders' | 'profile';

interface CircularMenuProps {
  currentView: NavigationView;
  onNavigate: (view: NavigationView) => void;
}

export default function CircularMenu({ currentView, onNavigate }: CircularMenuProps) {
  const [clickedButton, setClickedButton] = useState<string | null>(null);
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
      icon: Brain, 
      label: 'Ideas', 
      id: 'ideas' as const
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

  return (
    <>
      {/* CSS for Pulse Waves Animation */}
      <style jsx>{`
        @keyframes pulseWaves {
          0% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.3;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
        
        @keyframes subtlePulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.5;
          }
        }
        
        @keyframes cinematicClick {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.7);
          }
          25% {
            transform: scale(0.95);
            box-shadow: 0 0 0 10px rgba(168, 85, 247, 0.4);
          }
          50% {
            transform: scale(1.1);
            box-shadow: 0 0 0 20px rgba(168, 85, 247, 0.2);
          }
          75% {
            transform: scale(1.05);
            box-shadow: 0 0 0 30px rgba(168, 85, 247, 0.1);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 40px rgba(168, 85, 247, 0);
          }
        }
        
        @keyframes particleExplosion {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            transform: scale(3) rotate(180deg);
            opacity: 0;
          }
        }
        
        @keyframes iconBounce {
          0% {
            transform: scale(1);
          }
          25% {
            transform: scale(0.8);
          }
          50% {
            transform: scale(1.2);
          }
          75% {
            transform: scale(0.95);
          }
          100% {
            transform: scale(1);
          }
        }
        
        .pulse-ring {
          animation: pulseWaves 2s infinite;
        }
        
        .pulse-ring:nth-child(2) {
          animation-delay: 0.5s;
        }
        
        .pulse-ring:nth-child(3) {
          animation-delay: 1s;
        }
        
        .subtle-pulse {
          animation: subtlePulse 3s ease-in-out infinite;
        }
        
        .cinematic-click {
          animation: cinematicClick 0.6s ease-out;
        }
        
        .particle-explosion {
          animation: particleExplosion 0.8s ease-out;
        }
        
        .icon-bounce {
          animation: iconBounce 0.6s ease-out;
        }
      `}</style>

      <div className="fixed bottom-3 left-1/2 transform -translate-x-1/2 z-50">
      {/* Responsive Circular Container with Electric Style */}
      <div className="bg-black/98 backdrop-blur-xl rounded-full px-3 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 border border-purple-500/30 shadow-2xl shadow-purple-900/60">
        {/* Electric Glow Ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black via-gray-900/95 to-black border border-purple-400/20 shadow-inner shadow-purple-500/20"></div>
        
        <div className="relative flex items-center justify-center space-x-3 sm:space-x-5 md:space-x-7">
          {navigationItems.map((item) => {
            const isActive = currentView === item.id;
            const isClicked = clickedButton === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  // Trigger cinematic effect
                  setClickedButton(item.id);
                  
                  // Navigate after a short delay for the effect
                  setTimeout(() => {
                    onNavigate(item.id);
                    setClickedButton(null);
                  }, 300);
                }}
                className="relative p-1.5 sm:p-2 md:p-2.5 transition-all duration-200"
              >
                {/* Cinematic Click Effect */}
                {isClicked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Particle Explosion Effect */}
                    <div className="absolute w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-purple-500/20 particle-explosion"></div>
                    <div className="absolute w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-full bg-purple-400/30 particle-explosion" style={{animationDelay: '0.1s'}}></div>
                    <div className="absolute w-2 h-2 sm:w-4 sm:h-4 md:w-6 md:h-6 rounded-full bg-purple-300/40 particle-explosion" style={{animationDelay: '0.2s'}}></div>
                  </div>
                )}
                
                {/* Pulse Waves for Active State - Perfectly Centered */}
                {isActive && !isClicked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border border-purple-400/30 pulse-ring"></div>
                    <div className="absolute w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border border-purple-300/20 pulse-ring"></div>
                    <div className="absolute w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border border-purple-200/10 pulse-ring"></div>
                  </div>
                )}
                
                {/* Responsive Circle Background */}
                <div className={`
                  w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-200 relative z-10
                  ${isActive 
                    ? 'bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 shadow-lg shadow-purple-500/70 scale-105 sm:scale-110 subtle-pulse' 
                    : 'bg-gray-900/80 hover:bg-gray-800/90 hover:scale-105 border border-gray-700/50'
                  }
                  ${isClicked ? 'cinematic-click' : ''}
                `}>
                  {/* Electric Glow for Active */}
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