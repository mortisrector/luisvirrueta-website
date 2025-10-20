'use client';

import { useState } from 'react';
import { 
  User, Settings, Bell, Shield, HelpCircle, 
  LogOut, Edit, Camera, Star, Trophy, 
  Calendar, Target, Home, ChevronRight,
  Moon, Sun, Smartphone, Mail, Lock,
  Download, Upload, Trash2, Heart
} from 'lucide-react';
import CircularMenu from '@/components/BankingBottomNavigation';
import { NavigationView } from '@/types';

interface ProfileScreenProps {
  onBack?: () => void;
  onNavigate?: (view: NavigationView) => void;
}

interface UserStats {
  projectsCompleted: number;
  currentStreak: number;
  totalDays: number;
  achievements: number;
}

export default function ProfileScreen({ onBack, onNavigate }: ProfileScreenProps) {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Mock user data
  const user = {
    name: 'María García',
    email: 'maria@planify.app',
    avatar: null,
    joinDate: 'Enero 2024',
    plan: 'Premium'
  };

  const stats: UserStats = {
    projectsCompleted: 42,
    currentStreak: 15,
    totalDays: 127,
    achievements: 8
  };

  const achievements = [
    { id: 1, name: 'Primer Proyecto', description: 'Completa tu primer proyecto', icon: '🎯', unlocked: true },
    { id: 2, name: 'Racha de 7 días', description: 'Mantén una racha de 7 días', icon: '🔥', unlocked: true },
    { id: 3, name: 'Organizador Pro', description: 'Crea 10 carpetas', icon: '📁', unlocked: true },
    { id: 4, name: 'Multitarea', description: 'Completa 5 tareas en un día', icon: '⚡', unlocked: true },
    { id: 5, name: 'Constancia', description: 'Racha de 30 días', icon: '💎', unlocked: false },
    { id: 6, name: 'Maestro', description: 'Completa 100 proyectos', icon: '👑', unlocked: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="relative px-4 pt-8 pb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Perfil</h1>
                <p className="text-white/70 text-sm">Tu progreso y configuración</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-10 h-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="backdrop-blur-xl bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                  <Camera className="w-3 h-3 text-white" />
                </button>
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">{user.name}</h3>
                <p className="text-white/60 text-sm mb-1">{user.email}</p>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg text-xs font-medium text-white">
                    {user.plan}
                  </span>
                  <span className="text-white/50 text-xs">Desde {user.joinDate}</span>
                </div>
              </div>
              
              <button className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200">
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Estadísticas
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Proyectos', value: stats.projectsCompleted, icon: Target, color: 'from-blue-500 to-cyan-500' },
            { label: 'Racha actual', value: stats.currentStreak, icon: Star, color: 'from-orange-500 to-red-500' },
            { label: 'Días activo', value: stats.totalDays, icon: Calendar, color: 'from-green-500 to-emerald-500' },
            { label: 'Logros', value: stats.achievements, icon: Trophy, color: 'from-purple-500 to-pink-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className={`w-10 h-10 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{value}</div>
              <div className="text-white/60 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements Section */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Star className="w-5 h-5" />
          Logros
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {achievements.map((achievement) => (
            <div 
              key={achievement.id}
              className={`backdrop-blur-xl border rounded-2xl p-4 transition-all duration-300 ${
                achievement.unlocked 
                  ? 'bg-gradient-to-r from-white/10 to-white/5 border-white/20' 
                  : 'bg-white/5 border-white/10 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                  achievement.unlocked ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-white/10'
                }`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <h3 className={`font-medium mb-1 ${achievement.unlocked ? 'text-white' : 'text-white/50'}`}>
                    {achievement.name}
                  </h3>
                  <p className={`text-sm ${achievement.unlocked ? 'text-white/60' : 'text-white/30'}`}>
                    {achievement.description}
                  </p>
                </div>
                {achievement.unlocked && (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings Section */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configuración
        </h2>
        
        <div className="space-y-3">
          {[
            {
              icon: Bell,
              label: 'Notificaciones',
              subtitle: 'Gestiona tus alertas',
              action: 'toggle',
              value: notifications,
              onChange: setNotifications
            },
            {
              icon: darkMode ? Moon : Sun,
              label: 'Tema oscuro',
              subtitle: 'Cambia el tema de la app',
              action: 'toggle',
              value: darkMode,
              onChange: setDarkMode
            },
            {
              icon: Lock,
              label: 'Privacidad y seguridad',
              subtitle: 'Configura tu privacidad',
              action: 'navigate'
            },
            {
              icon: Download,
              label: 'Exportar datos',
              subtitle: 'Descarga tus proyectos',
              action: 'navigate'
            },
            {
              icon: HelpCircle,
              label: 'Ayuda y soporte',
              subtitle: 'Obtén ayuda cuando la necesites',
              action: 'navigate'
            },
            {
              icon: Heart,
              label: 'Acerca de Planify',
              subtitle: 'Versión 1.0.0',
              action: 'navigate'
            },
          ].map((item, index) => (
            <div key={index} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-white/80" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-white font-medium">{item.label}</h3>
                  <p className="text-white/60 text-sm">{item.subtitle}</p>
                </div>
                
                {item.action === 'toggle' && (
                  <button
                    onClick={() => item.onChange?.(!item.value)}
                    className={`w-12 h-6 rounded-full transition-all duration-300 ${
                      item.value ? 'bg-green-500' : 'bg-white/20'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                      item.value ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                )}
                
                {item.action === 'navigate' && (
                  <ChevronRight className="w-5 h-5 text-white/40" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logout Button */}
      <div className="px-4 mb-6">
        <button className="w-full backdrop-blur-xl bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center justify-center gap-3 text-red-400 hover:bg-red-500/20 transition-all duration-300">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Cerrar sesión</span>
        </button>
      </div>

      {/* Circular Menu Navigation */}
      {onNavigate && (
        <CircularMenu 
          currentView="profile" 
          onNavigate={onNavigate} 
        />
      )}
    </div>
  );
}