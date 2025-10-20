'use client';

import { DailyTask } from '@/types';

interface ProjectProgressBarProps {
  tasks: DailyTask[];
  projectColorScheme?: string;
  className?: string;
}

export default function ProjectProgressBar({ 
  tasks, 
  projectColorScheme = 'electric-blue',
  className = '' 
}: ProjectProgressBarProps) {
  const getProjectGradient = () => {
    const gradientMappings: Record<string, string> = {
      'electric-blue': 'from-blue-400 to-cyan-500',
      'electric-green': 'from-emerald-400 to-green-500',
      'electric-purple': 'from-purple-400 to-pink-500',
      'cosmic': 'from-indigo-400 to-purple-500',
      'sunset': 'from-orange-400 to-pink-500',
      'forest': 'from-green-400 to-emerald-500',
      'ocean': 'from-cyan-400 to-teal-500',
      'fire': 'from-red-400 to-orange-500'
    };
    return gradientMappings[projectColorScheme] || 'from-cyan-400 to-blue-500';
  };

  const getProjectAccents = () => {
    const accentMappings: Record<string, { text: string; light: string }> = {
      'electric-blue': { text: 'text-blue-700', light: 'bg-blue-50' },
      'electric-green': { text: 'text-emerald-700', light: 'bg-emerald-50' },
      'electric-purple': { text: 'text-purple-700', light: 'bg-purple-50' },
      'cosmic': { text: 'text-indigo-700', light: 'bg-indigo-50' },
      'sunset': { text: 'text-orange-700', light: 'bg-orange-50' },
      'forest': { text: 'text-green-700', light: 'bg-green-50' },
      'ocean': { text: 'text-cyan-700', light: 'bg-cyan-50' },
      'fire': { text: 'text-red-700', light: 'bg-red-50' }
    };
    return accentMappings[projectColorScheme] || { text: 'text-cyan-700', light: 'bg-cyan-50' };
  };

  const calculateTaskProgress = (task: DailyTask): number => {
    if (task.type === 'boolean') {
      return task.completed ? 100 : 0;
    }
    if (task.type === 'numeric') {
      const progress = ((task.current || 0) / (task.target || 1)) * 100;
      return Math.min(progress, 100);
    }
    if (task.type === 'subjective') {
      return (task.score0to1 || 0) * 100;
    }
    return 0;
  };

  const totalTasks = tasks.length;
  const totalProgress = totalTasks > 0 
    ? tasks.reduce((sum, task) => sum + calculateTaskProgress(task), 0) / totalTasks
    : 0;

  const completedTasks = tasks.filter(task => {
    if (task.type === 'boolean') return task.completed;
    if (task.type === 'numeric') return (task.current || 0) >= (task.target || 1);
    if (task.type === 'subjective') return (task.score0to1 || 0) >= 0.8;
    return false;
  }).length;

  const projectGradient = getProjectGradient();
  const projectAccents = getProjectAccents();

  if (totalTasks === 0) {
    return (
      <div className={`w-full ${className}`}>
        <div className={`bg-white bg-opacity-90 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-gray-200`}>
          <div className="text-center">
            <div className={`text-sm font-medium ${projectAccents.text} opacity-60`}>
              Sin tareas aún
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className={`bg-white bg-opacity-95 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-white border-opacity-50`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${projectGradient} shadow-lg`}></div>
            <span className={`text-sm font-semibold ${projectAccents.text}`}>
              Progreso del Proyecto
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${projectAccents.text}`}>
              {Math.round(totalProgress)}%
            </span>
            <div className="text-xs opacity-60">
              <span className={projectAccents.text}>
                {completedTasks}/{totalTasks} tareas
              </span>
            </div>
          </div>
        </div>

        {/* Barra de progreso principal */}
        <div className="relative flex items-center gap-3">
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <div
                className={`h-3 rounded-full bg-gradient-to-r ${projectGradient} shadow-lg transition-all duration-700 ease-out relative overflow-hidden`}
                style={{ width: `${totalProgress}%` }}
              >
                {/* Efecto de brillo animado */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white via-transparent opacity-30 animate-pulse"></div>
              </div>
            </div>
          </div>
          
          {/* Marcador lateral del porcentaje */}
          {totalProgress > 0 && (
            <div className={`px-3 py-1 rounded-xl ${projectAccents.light} ${projectAccents.text} text-sm font-bold shadow-lg border border-white flex-shrink-0`}>
              {Math.round(totalProgress)}%
            </div>
          )}
        </div>

        {/* Estadísticas detalladas */}
        <div className="flex justify-between mt-4 text-xs font-medium">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className={projectAccents.text}>
              {completedTasks} completadas
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-orange-400"></div>
            <span className={projectAccents.text}>
              {totalTasks - completedTasks} pendientes
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${projectGradient}`}></div>
            <span className={projectAccents.text}>
              {Math.round((totalProgress / 100) * totalTasks * 10) / 10} promedio
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}