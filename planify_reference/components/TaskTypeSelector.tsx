'use client';

import React, { useState } from 'react';
import { X, CheckCircle, Hash, Star, Plus, Calendar, Clock, User, Tag, AlertCircle, GitBranch, Hourglass, HelpCircle, Zap } from 'lucide-react';
import * as Icons from 'lucide-react';
import { getColorSchemeGradient } from '@/lib/colorSchemes';

interface TaskData {
  title: string;
  description?: string;
  type: 'boolean' | 'numeric' | 'subjective' | 'conditional' | 'temporal' | 'experimental';
  target?: number;
  unit?: string;
  priority: 'baja' | 'media' | 'alta';
  category?: string;
  dueDate?: string;
  estimatedTime?: string;
  dependsOn?: string;
  dependencyDescription?: string;
  startDate?: string;
  endDate?: string;
  timeWindow?: string;
}

interface TaskTypeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (taskData: TaskData) => void;
  projectTitle: string;
  projectIcon?: string;
  projectColorScheme?: string;
}

export default function TaskTypeSelector({
  isOpen,
  onClose,
  onCreateTask,
  projectTitle,
  projectIcon,
  projectColorScheme
}: TaskTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<'boolean' | 'numeric' | 'subjective' | 'conditional' | 'temporal' | 'experimental' | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [taskData, setTaskData] = useState<TaskData>({
    title: '',
    description: '',
    type: 'boolean',
    priority: 'media',
    category: '',
    dueDate: '',
    estimatedTime: ''
  });

  type TaskType = {
    id: 'boolean' | 'numeric' | 'subjective' | 'conditional' | 'temporal' | 'experimental';
    name: string;
    icon: any;
  };

  const getTypeGradient = (typeId: string) => {
    const gradients: Record<string, string> = {
      'boolean': 'from-emerald-400 via-teal-500 to-cyan-600',
      'numeric': 'from-violet-400 via-purple-500 to-indigo-600', 
      'subjective': 'from-pink-400 via-rose-500 to-red-500',
      'conditional': 'from-amber-400 via-orange-500 to-red-500',
      'temporal': 'from-blue-400 via-indigo-500 to-purple-600',
      'experimental': 'from-yellow-400 via-amber-500 to-orange-500'
    };
    return gradients[typeId] || 'from-gray-500 to-gray-600';
  };

  const getTypeDescription = (typeId: string) => {
    const descriptions: Record<string, string> = {
      'boolean': 'Tareas que se pueden marcar como completadas o no completadas. Perfectas para acciones específicas y concretas.',
      'numeric': 'Tareas con un objetivo numérico específico que debes alcanzar. Ideales para metas cuantificables.',
      'subjective': 'Tareas que se evalúan con una puntuación personal del 1 al 10. Útiles para aspectos cualitativos.',
      'conditional': 'Tareas que se desbloquean automáticamente al completar otra tarea prerequisito. Sistema tipo videojuego.',
      'temporal': 'Tareas enfocadas en dedicar tiempo específico a una actividad. Incluye temporizador integrado.',
      'experimental': 'Nuevo tipo de tarea en desarrollo. Próximamente disponible con características innovadoras.'
    };
    return descriptions[typeId] || 'Descripción no disponible';
  };

  const getTypeExamples = (typeId: string) => {
    const examples: Record<string, string[]> = {
      'boolean': ['Llamar al cliente', 'Enviar informe', 'Revisar código', 'Hacer ejercicio'],
      'numeric': ['Escribir 2000 palabras', 'Hacer 50 flexiones', 'Leer 3 capítulos', 'Ahorrar $500'],
      'subjective': ['Calidad del diseño', 'Nivel de satisfacción', 'Estado de ánimo', 'Creatividad'],
      'conditional': ['Test después del capítulo 1', 'Revisión tras el borrador', 'Entrega final'],
      'temporal': ['Meditar 15 minutos', 'Trabajar 1 hora', 'Estudiar 30 minutos', 'Ejercicio'],
      'experimental': ['Próximamente...', 'En desarrollo', 'Beta testing']
    };
    return examples[typeId] || [];
  };

  const taskTypes: TaskType[] = [
    {
      id: 'boolean',
      name: 'Objetiva',
      icon: CheckCircle
    },
    {
      id: 'numeric',
      name: 'Numérica',
      icon: Hash
    },
    {
      id: 'subjective',
      name: 'Subjetiva',
      icon: Star
    },
    {
      id: 'conditional',
      name: 'Condicionada',
      icon: GitBranch
    },
    {
      id: 'temporal',
      name: 'Temporal',
      icon: Hourglass
    },
    {
      id: 'experimental',
      name: 'Experimental',
      icon: Zap
    }
  ];

  // Map project color scheme to gradients
  const getProjectGradient = () => {
    // Usar directamente la función del lib para consistencia
    return getColorSchemeGradient(projectColorScheme || 'electric-blue');
  };

  const projectGradient = getProjectGradient();

  // Get dynamic background based on project colors
  const getProjectBackground = () => {
    const backgroundMappings: Record<string, string> = {
      'electric-blue': 'from-slate-900/95 via-blue-900/20 to-cyan-900/30',
      'electric-green': 'from-slate-900/95 via-emerald-900/25 to-green-900/30',
      'electric-purple': 'from-slate-900/95 via-purple-900/20 to-pink-900/25',
      'cosmic': 'from-slate-900/95 via-purple-900/25 to-blue-900/20',
      'sunset': 'from-slate-900/95 via-orange-900/20 to-pink-900/25',
      'forest': 'from-slate-900/95 via-green-900/25 to-emerald-900/30',
      'ocean': 'from-slate-900/95 via-cyan-900/20 to-teal-900/25',
      'fire': 'from-slate-900/95 via-red-900/25 to-orange-900/20',
      'lavender': 'from-slate-900/95 via-purple-900/15 to-pink-900/20',
      'mint': 'from-slate-900/95 via-emerald-900/20 to-teal-900/25',
      'gold': 'from-slate-900/95 via-yellow-900/20 to-orange-900/25',
      'silver': 'from-slate-900/95 via-gray-900/25 to-slate-900/30'
    };
    
    return backgroundMappings[projectColorScheme || ''] || 'from-slate-900/95 via-gray-900/20 to-slate-900/95';
  };

  const projectBackground = getProjectBackground();

  // Get dynamic icon component
  const getProjectIcon = () => {
    if (!projectIcon) return Icons.Target;
    
    // Capitalize first letter and get icon from Icons
    const iconName = projectIcon.charAt(0).toUpperCase() + projectIcon.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    const IconComponent = (Icons as any)[iconName];
    
    return IconComponent || Icons.Target;
  };

  const ProjectIconComponent = getProjectIcon();

  const priorities = [
    { value: 'alta', label: 'Alta', color: 'bg-red-500/20 border-red-400/50 text-red-400' },
    { value: 'media', label: 'Media', color: 'bg-orange-500/20 border-orange-400/50 text-orange-400' },
    { value: 'baja', label: 'Baja', color: 'bg-blue-500/20 border-blue-400/50 text-blue-400' }
  ];

  const handleSubmit = () => {
    if (!taskData.title.trim() || !selectedType) return;
    
    onCreateTask({...taskData, type: selectedType});
    
    // Reset form
    setTaskData({
      title: '',
      description: '',
      type: 'boolean',
      priority: 'media',
      category: '',
      dueDate: '',
      estimatedTime: ''
    });
    setSelectedType(null);
    onClose();
  };

  const handleBack = () => {
    setSelectedType(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {!selectedType ? (
        /* Floating Task Type Buttons */
        <div className="relative w-full h-full">
          {/* Enhanced background blur */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-lg"></div>
          
          {/* Close button - top right corner */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-60 p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-110"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          
          {/* Floating content */}
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center space-y-8">
              {/* Title */}
              <div className="space-y-3">
                <h2 className="text-4xl font-bold text-white drop-shadow-2xl">
                  Tipo de Tarea
                </h2>
                <p className="text-white/80 text-lg drop-shadow-lg">
                  Elige la categoría perfecta para tu objetivo
                </p>
                <p className="text-white/60 text-sm">
                  Para: {projectTitle}
                </p>
              </div>
              
              {/* Floating buttons grid */}
              <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
                {taskTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedType(type.id);
                      setTaskData(prev => ({ ...prev, type: type.id }));
                    }}
                    className="group relative aspect-square p-8 rounded-3xl cursor-pointer transition-all duration-500 hover:scale-110 active:scale-95 shadow-2xl hover:shadow-3xl"
                  >
                    {/* Premium gradient background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${getTypeGradient(type.id)} opacity-95 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl`}></div>
                    
                    {/* Animated shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                    
                    {/* Glow effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${getTypeGradient(type.id)} opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500 rounded-3xl`}></div>
                    
                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-4">
                      <type.icon size={36} className="text-white drop-shadow-2xl group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-base font-bold text-white text-center leading-tight drop-shadow-lg">
                        {type.name}
                      </span>
                    </div>
                    
                    {/* Premium border */}
                    <div className="absolute inset-0 rounded-3xl border-2 border-white/30 group-hover:border-white/50 transition-colors duration-300"></div>
                  </button>
                ))}
              </div>
              
              {/* Elegant floating help button */}
              <div className="pt-6">
                <button
                  onClick={() => setShowHelpModal(true)}
                  className="group inline-flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 rounded-full transition-all duration-300 hover:scale-105 shadow-xl backdrop-blur-sm"
                >
                  <HelpCircle size={20} className="text-white/70 group-hover:text-white transition-colors" />
                  <span className="text-sm text-white/70 group-hover:text-white font-medium transition-colors">
                    ¿Necesitas ayuda?
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Task Creation Form in Modal */
        <div className="bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 h-full">
          <div className={`bg-gradient-to-br ${projectBackground} backdrop-blur-xl border border-white/20 rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${projectGradient} rounded-xl flex items-center justify-center shadow-lg`}>
                  <ProjectIconComponent className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Crear Tarea</h2>
                  <p className="text-white/60 text-sm">Completa los detalles</p>
                </div>
              </div>
              <button
                onClick={handleBack}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Task form content */}
            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">
                  Nombre de la tarea *
                </label>
                <input
                  type="text"
                  value={taskData.title}
                  onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Revisar documentación..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                  autoFocus
                />
              </div>

              {/* Campo de descripción */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Descripción
                </label>
                <textarea
                  value={taskData.description || ''}
                  onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe los detalles de la tarea..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleBack}
                  className={`flex-1 px-6 py-3 bg-white/10 border border-white/20 hover:border-white/40 rounded-xl text-white font-medium hover:bg-white/20 transition-all hover:scale-105`}
                >
                  Atrás
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!taskData.title.trim()}
                  className={`flex-1 px-6 py-3 bg-gradient-to-r ${projectGradient} rounded-xl text-white font-medium hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                >
                  Crear Tarea
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-white/20 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Tipos de Tareas</h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="space-y-6">
              {taskTypes.map((type) => (
                <div key={type.id} className="p-5 rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600/30">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getTypeGradient(type.id)} flex items-center justify-center`}>
                      <type.icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white mb-2">
                        {type.name}
                      </h4>
                      <p className="text-gray-300 text-sm mb-3">
                        {getTypeDescription(type.id)}
                      </p>
                      
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Ejemplos:</p>
                        <div className="flex flex-wrap gap-1">
                          {getTypeExamples(type.id).map((example: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-white/10 rounded-lg text-xs text-white/80"
                            >
                              {example}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}