'use client';

import React from 'react';
import { X, ArrowRight, TrendingUp, CheckCircle2, Clock, AlertTriangle, Zap, Trophy, Target, Calendar } from 'lucide-react';

interface MetricModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'daily' | 'streak' | 'global' | 'weekly' | 'notStarted' | 'inProgress' | 'needsAttention' | 'advanced' | 'focused';
  onRedirect?: (section: string) => void;
}

const MetricsModal: React.FC<MetricModalProps> = ({ isOpen, onClose, type, onRedirect }) => {
  if (!isOpen) return null;

  const handleRedirect = (section: string) => {
    if (onRedirect) {
      onRedirect(section);
    }
    onClose();
  };

  const getModalContent = () => {
    switch (type) {
      case 'daily':
        return {
          title: '📊 Tu Progreso Diario',
          subtitle: 'Vas genial hoy, sigue así',
          stats: [
            { label: 'Tareas Completadas', value: '8/10', color: 'text-green-500', icon: CheckCircle2 },
            { label: 'Tiempo Trabajado', value: '6.5h', color: 'text-blue-500', icon: Clock },
            { label: 'Eficiencia', value: '85%', color: 'text-purple-500', icon: TrendingUp },
          ],
          actions: [
            { label: 'Ver Tareas Pendientes', section: 'tasks', color: 'bg-green-500' },
            { label: 'Revisar Horario', section: 'calendar', color: 'bg-blue-500' }
          ]
        };

      case 'streak':
        return {
          title: '🔥 Racha Motivacional',
          subtitle: '¡12 días consecutivos! Imparable',
          stats: [
            { label: 'Días Consecutivos', value: '12', color: 'text-orange-500', icon: Zap },
            { label: 'Mejor Racha', value: '18 días', color: 'text-red-500', icon: Trophy },
            { label: 'Este Mes', value: '28/30', color: 'text-yellow-500', icon: Calendar },
          ],
          actions: [
            { label: 'Ver Historial Completo', section: 'history', color: 'bg-orange-500' },
            { label: 'Configurar Recordatorios', section: 'settings', color: 'bg-red-500' }
          ]
        };

      case 'notStarted':
        return {
          title: '⏸️ Tareas Sin Iniciar',
          subtitle: '15 tareas esperando tu atención',
          stats: [
            { label: 'Sin Iniciar Hoy', value: '5', color: 'text-red-500', icon: AlertTriangle },
            { label: 'De la Semana', value: '10', color: 'text-orange-500', icon: Clock },
            { label: 'Más Antiguas', value: '3 días', color: 'text-gray-500', icon: Calendar },
          ],
          actions: [
            { label: 'Ir a Tareas Pendientes', section: 'pending-tasks', color: 'bg-red-500' },
            { label: 'Crear Plan de Acción', section: 'plan', color: 'bg-orange-500' }
          ]
        };

      case 'inProgress':
        return {
          title: '⚡ Tareas en Proceso',
          subtitle: '4 tareas activas ahora mismo',
          stats: [
            { label: 'En Progreso', value: '4', color: 'text-yellow-500', icon: Zap },
            { label: 'Tiempo Promedio', value: '2.5h', color: 'text-blue-500', icon: Clock },
            { label: 'Para Hoy', value: '2', color: 'text-green-500', icon: Target },
          ],
          actions: [
            { label: 'Ver Tareas Activas', section: 'active-tasks', color: 'bg-yellow-500' },
            { label: 'Gestionar Prioridades', section: 'priorities', color: 'bg-blue-500' }
          ]
        };

      case 'needsAttention':
        return {
          title: '⚠️ Necesitan Tu Atención',
          subtitle: 'Proyectos que extrañan tu toque mágico',
          stats: [
            { label: 'Sin Actividad', value: '3 días', color: 'text-violet-500', icon: AlertTriangle },
            { label: 'Progreso Actual', value: '65%', color: 'text-blue-500', icon: TrendingUp },
            { label: 'Importancia', value: 'Alta', color: 'text-red-500', icon: Trophy },
          ],
          actions: [
            { label: 'Abrir Proyecto Marketing', section: 'project-marketing', color: 'bg-violet-500' },
            { label: 'Ver Todos los Olvidados', section: 'forgotten-tasks', color: 'bg-purple-500' }
          ]
        };

      case 'focused':
        return {
          title: '🚀 ¡Vas que Vuelas!',
          subtitle: 'Estos son tus proyectos estrella',
          stats: [
            { label: 'Más Trabajado', value: 'App Móvil', color: 'text-blue-500', icon: Trophy },
            { label: 'Horas Esta Semana', value: '12.5h', color: 'text-green-500', icon: Clock },
            { label: 'Progreso', value: '+25%', color: 'text-purple-500', icon: TrendingUp },
          ],
          actions: [
            { label: 'Continuar App Móvil', section: 'project-app', color: 'bg-blue-500' },
            { label: 'Ver Análisis Completo', section: 'analytics', color: 'bg-green-500' }
          ]
        };

      default:
        return {
          title: '📈 Métricas Avanzadas',
          subtitle: 'Análisis profundo de tu productividad',
          stats: [
            { label: 'Productividad Promedio', value: '78%', color: 'text-green-500', icon: TrendingUp },
            { label: 'Mejor Día', value: 'Martes', color: 'text-blue-500', icon: Calendar },
            { label: 'Patrón de Trabajo', value: 'Mañanas', color: 'text-purple-500', icon: Clock },
          ],
          actions: [
            { label: 'Dashboard Completo', section: 'dashboard', color: 'bg-indigo-500' },
            { label: 'Reportes Detallados', section: 'reports', color: 'bg-purple-500' }
          ]
        };
    }
  };

  const content = getModalContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-auto">
        <div 
          className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.2)'
          }}
        >
          {/* Header */}
          <div className="relative p-6 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-black text-gray-800 mb-1">
                  {content.title}
                </h3>
                <p className="text-gray-600 text-sm font-medium">
                  {content.subtitle}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-200"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="px-6 pb-4">
            <div className="grid grid-cols-1 gap-3">
              {content.stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/80 border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center">
                        <IconComponent className={`w-4 h-4 ${stat.color}`} />
                      </div>
                      <span className="text-gray-700 font-medium text-sm">
                        {stat.label}
                      </span>
                    </div>
                    <span className={`font-black text-lg ${stat.color}`}>
                      {stat.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 pt-2 space-y-3">
            {content.actions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleRedirect(action.section)}
                className={`w-full p-4 rounded-2xl ${action.color} text-white font-bold text-sm 
                           flex items-center justify-between group hover:scale-[1.02] 
                           transition-all duration-200 shadow-lg hover:shadow-xl`}
              >
                <span>{action.label}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsModal;