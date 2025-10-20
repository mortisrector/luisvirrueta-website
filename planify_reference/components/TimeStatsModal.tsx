'use client';

import React from 'react';
import { 
  X, 
  Clock, 
  Target, 
  TrendingUp, 
  BarChart3, 
  CheckCircle2,
  Timer,
  Award,
  Calendar,
  Zap
} from 'lucide-react';
import { Project, DailyTask } from '@/types';
import { useTimeTracking, ProjectTimeStats } from '@/hooks/useTimeTracking';

interface TimeStatsModalProps {
  project: Project;
  tasks: DailyTask[];
  isOpen: boolean;
  onClose: () => void;
}

export default function TimeStatsModal({
  project,
  tasks,
  isOpen,
  onClose
}: TimeStatsModalProps) {
  const timeTracking = useTimeTracking();
  
  if (!isOpen) return null;

  const projectStats = timeTracking.getProjectTimeStats(project.id);
  const projectGradient = project.colorScheme 
    ? `from-${project.colorScheme}-500 to-${project.colorScheme}-600`
    : 'from-blue-500 to-indigo-600';

  // Estadísticas por tarea
  const taskStats = tasks.map(task => {
    const sessions = timeTracking.getSessionsForTask ? timeTracking.getSessionsForTask(task.id) : [];
    return {
      ...task,
      timeSpent: timeTracking.getTaskTime(task.id),
      sessions: sessions,
      sessionCount: sessions.length,
      isCompleted: task.completed || task.score0to1 === 1 || (task.current && task.target && task.current >= task.target)
    };
  }).sort((a, b) => b.timeSpent - a.timeSpent);

  const totalProjectTime = projectStats.totalTime;
  const completedTasksCount = taskStats.filter(t => t.isCompleted).length;
  const completionRate = tasks.length > 0 ? (completedTasksCount / tasks.length) * 100 : 0;

  // Función para obtener color basado en el progreso
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'from-emerald-500 to-green-500';
    if (percentage >= 60) return 'from-blue-500 to-cyan-500';
    if (percentage >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Efectos de luz glassmorphism */}
        <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${projectGradient} opacity-20 blur-2xl scale-110 -z-10`} />
        <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${projectGradient} opacity-10 blur-3xl scale-125 -z-20`} />
        
        {/* Contenido del modal */}
        <div className={`relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl`}>
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${projectGradient} flex items-center justify-center`}>
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Estadísticas de Tiempo</h2>
                <p className="text-white/60">{project.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all duration-300"
            >
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          {/* Resumen general */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto mb-4 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {timeTracking.formatTime(totalProjectTime)}
              </div>
              <div className="text-white/60 text-sm">Tiempo Total</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {completedTasksCount}/{tasks.length}
              </div>
              <div className="text-white/60 text-sm">Tareas Completadas</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {completionRate.toFixed(1)}%
              </div>
              <div className="text-white/60 text-sm">Progreso</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 mx-auto mb-4 flex items-center justify-center">
                <Timer className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {timeTracking.formatTime(Math.round(projectStats.averageTaskTime))}
              </div>
              <div className="text-white/60 text-sm">Promedio por Tarea</div>
            </div>
          </div>

          {/* Barra de progreso general */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Progreso del Proyecto</h3>
              <span className="text-white/60">{completionRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${getProgressColor(completionRate)} transition-all duration-500`}
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          {/* Lista de tareas con tiempo */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Tiempo por Tarea</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {taskStats.map((task) => {
                const timePercentage = totalProjectTime > 0 ? (task.timeSpent / totalProjectTime) * 100 : 0;
                
                return (
                  <div key={task.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-3 h-3 rounded-full ${task.isCompleted ? 'bg-emerald-500' : 'bg-white/30'}`} />
                        <span className="text-white font-medium truncate">{task.title}</span>
                        {task.isCompleted && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-white font-semibold">
                          {timeTracking.formatTime(task.timeSpent)}
                        </div>
                        <div className="text-white/50 text-sm">
                          {timePercentage.toFixed(1)}% • {task.sessionCount} sesión{task.sessionCount !== 1 ? 'es' : ''}
                        </div>
                      </div>
                    </div>
                    
                    {/* Barra de tiempo por tarea */}
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${task.isCompleted ? 'from-emerald-500 to-green-500' : 'from-blue-500 to-cyan-500'} transition-all duration-300`}
                        style={{ width: `${Math.max(2, timePercentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              
              {taskStats.length === 0 && (
                <div className="text-center py-8 text-white/50">
                  <Timer className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay datos de tiempo registrados aún</p>
                  <p className="text-sm">Usa el botón ▶️ en las tareas para empezar a medir tiempo</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer con información adicional */}
          {totalProjectTime > 0 && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center justify-center gap-6 text-center">
                <div>
                  <div className="text-white/60 text-sm mb-1">Sesión más larga</div>
                  <div className="text-white font-semibold">
                    {timeTracking.formatTime(Math.max(...taskStats.map(t => t.timeSpent)))}
                  </div>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div>
                  <div className="text-white/60 text-sm mb-1">Productividad</div>
                  <div className="text-white font-semibold">
                    {completionRate >= 80 ? '🔥 Excelente' : completionRate >= 60 ? '👍 Buena' : completionRate >= 40 ? '⚡ Regular' : '🚀 Empezando'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}