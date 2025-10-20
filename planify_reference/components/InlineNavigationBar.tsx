'use client';

import { Folder, Lightbulb, Calendar, Bell, Home } from 'lucide-react';

type NavigationView = 'home' | 'folders' | 'ideas' | 'calendar' | 'reminders' | 'profile';

interface InlineNavigationBarProps {
  currentView: NavigationView;
  onNavigate: (view: NavigationView) => void;
}

export default function InlineNavigationBar({ currentView, onNavigate }: InlineNavigationBarProps) {
  const navItems = [
    { 
      id: 'folders' as NavigationView, 
      label: 'Carpetas', 
      icon: Folder,
      gradient: 'from-purple-500 to-violet-500',
      activeGlow: 'shadow-purple-500/50'
    },
    { 
      id: 'ideas' as NavigationView, 
      label: 'Ideas', 
      icon: Lightbulb,
      gradient: 'from-amber-500 to-orange-500',
      activeGlow: 'shadow-amber-500/50'
    },
    { 
      id: 'calendar' as NavigationView, 
      label: 'Calendario', 
      icon: Calendar,
      gradient: 'from-blue-500 to-cyan-500',
      activeGlow: 'shadow-blue-500/50'
    },
    { 
      id: 'reminders' as NavigationView, 
      label: 'Recordatorios', 
      icon: Bell,
      gradient: 'from-pink-500 to-rose-500',
      activeGlow: 'shadow-pink-500/50'
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Botones circulares minimalistas - estilo header premium */}
      <div className="flex items-center justify-center gap-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          const isIdeas = item.id === 'ideas';
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center
                transition-all duration-300 hover:scale-110 active:scale-95
                ${isActive 
                  ? `bg-gradient-to-br ${item.gradient} shadow-2xl ${item.activeGlow}` 
                  : 'bg-white/[0.08] backdrop-blur-sm border border-white/[0.15] hover:bg-white/[0.15] hover:shadow-xl'
                }
              `}
              style={{
                boxShadow: isActive 
                  ? '0 20px 40px rgba(139, 92, 246, 0.4), 0 10px 20px rgba(168, 85, 247, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.25)'
                  : undefined,
                animation: isIdeas ? 'pulse 2s ease-in-out infinite' : undefined
              }}
              title={item.label}
            >
              <Icon 
                className={`
                  transition-all duration-300
                  ${isActive 
                    ? 'w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-lg' 
                    : 'w-5 h-5 sm:w-6 sm:h-6 text-white/70 hover:text-white'
                  }
                `}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
