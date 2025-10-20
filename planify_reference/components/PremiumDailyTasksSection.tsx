'use client';

import { useState } from 'react';
import { DailyTask } from '@/types';
import { 
  Activity, ChevronDown, ChevronUp, Zap, CheckCircle2, 
  Circle, Plus, Minus, Star, Crown, Trophy, Award, Flame, Target 
} from 'lucide-react';

interface PremiumDailyTasksSectionProps {
  tasks: DailyTask[];
  onToggleTask?: (taskId: string, value?: number) => void;
  onUpdateTask?: (taskId: string, value: number) => void;
  onAddTask?: () => void;
  onEditTask?: (task: DailyTask) => void;
  onDeleteTask?: (taskId: string) => void;
  onViewStats?: () => void;
  onNavigateToDailyTasksPage?: () => void;
}

export default function PremiumDailyTasksSection({ 
  tasks, 
  onToggleTask,
  onUpdateTask, 
  onAddTask,
  onEditTask,
  onDeleteTask,
  onViewStats,
  onNavigateToDailyTasksPage
}: PremiumDailyTasksSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Calcular tareas completadas
  const completedTasks = tasks.filter(t => 
    t.type === 'boolean' ? t.completed : 
    t.type === 'numeric' ? (t.current || 0) >= (t.target || 1) :
    (t.score0to1 || 0) >= 0.6
  ).length;
  
  const totalTasks = tasks.length;
  
  // Función para obtener el progreso como porcentaje
  const getProgress = (task: DailyTask) => {
    if (task.type === 'boolean') return task.completed ? 100 : 0;
    if (task.type === 'numeric') return Math.min(100, ((task.current || 0) / (task.target || 1)) * 100);
    return ((task.score0to1 || 0) * 100);
  };
  
  // Función para determinar si una tarea está completada
  const isTaskCompleted = (task: DailyTask) => {
    if (task.type === 'boolean') return task.completed;
    if (task.type === 'numeric') return (task.current || 0) >= (task.target || 1);
    return (task.score0to1 || 0) >= 0.6;
  };

  if (totalTasks === 0) {
    return (
      <div className="mb-6">
        <div className="backdrop-blur-xl bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-3xl p-6">
          {/* Header compacto */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-center flex-1">
              <h2 className="text-xl font-bold text-white mb-2">
                Tareas Diarias
              </h2>
              <div className="text-white/60 text-sm">
                0 / 0 completadas
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={onViewStats}
                className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white hover:scale-105 transition-all duration-300 flex items-center justify-center"
                title="Ver estadísticas"
              >
                <Activity className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Estado vacío */}
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-orange-400" />
            </div>
            <p className="text-white/60 text-sm mb-3">
              Sin tareas diarias aún
            </p>
            <button
              onClick={onAddTask}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl text-white text-sm font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Crear primera tarea
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 sm:mb-8">
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl sm:rounded-2xl p-4 sm:p-6">
        {/* Header premium - más minimalista y responsive */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-white/90 mb-1 truncate">
              Tareas Diarias
            </h2>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="text-white/60">
                {completedTasks} de {totalTasks} completadas
              </span>
              {totalTasks > 0 && (
                <span className="text-emerald-400 font-medium">
                  ({Math.round((completedTasks / totalTasks) * 100)}%)
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={onViewStats}
              className="p-1.5 sm:p-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] rounded-md sm:rounded-lg text-white/60 hover:text-white/80 transition-all duration-200 flex items-center justify-center group"
              title="Ver estadísticas"
            >
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-105 transition-transform duration-200" />
            </button>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 sm:p-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] rounded-md sm:rounded-lg text-white/60 hover:text-white/80 transition-all duration-200 flex items-center justify-center group"
              title={isExpanded ? "Contraer" : "Expandir"}
            >
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-105 transition-transform duration-200" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-105 transition-transform duration-200" />
              )}
            </button>
          </div>
        </div>
        
        {/* Barra de progreso general - más sutil y responsive */}
        <div className="mb-4 sm:mb-6">
          <div className="w-full bg-white/[0.08] rounded-full h-1 sm:h-1.5 overflow-hidden">
            <div 
              className="h-full bg-emerald-400/80 transition-all duration-500"
              style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
            />
          </div>
        </div>
        
        {/* Lista de tareas expandible */}
        {isExpanded && (
          <div className="space-y-1.5 sm:space-y-2">
            {tasks.map((task) => (
              <TaskItem 
                key={task.id}
                task={task}
                onToggleTask={onToggleTask}
                onUpdateTask={onUpdateTask}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
              />
            ))}
            
            {/* Botón agregar tarea - más minimalista */}
            <button
              onClick={onAddTask}
              className="w-full p-2.5 sm:p-3 border border-dashed border-white/[0.15] hover:border-emerald-400/40 hover:bg-white/[0.02] rounded-lg sm:rounded-xl text-white/50 hover:text-white/80 transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Agregar nueva tarea
            </button>
          </div>
        )}
        
        {/* Botón para ir a página completa cuando está contraído */}
        {!isExpanded && (
          <div className="text-center">
            <button
              onClick={onNavigateToDailyTasksPage}
              className="text-white/50 hover:text-white/80 text-sm hover:underline transition-all duration-200"
            >
              Ver todas las tareas →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para cada tarea individual
function TaskItem({ 
  task, 
  onToggleTask, 
  onUpdateTask, 
  onEditTask, 
  onDeleteTask 
}: {
  task: DailyTask;
  onToggleTask?: (taskId: string, value?: number) => void;
  onUpdateTask?: (taskId: string, value: number) => void;
  onEditTask?: (task: DailyTask) => void;
  onDeleteTask?: (taskId: string) => void;
}) {
  const isCompleted = task.type === 'boolean' ? task.completed : 
    task.type === 'numeric' ? (task.current || 0) >= (task.target || 1) :
    (task.score0to1 || 0) >= 0.6;
  
  const progress = task.type === 'boolean' ? (task.completed ? 100 : 0) :
    task.type === 'numeric' ? Math.min(100, ((task.current || 0) / (task.target || 1)) * 100) :
    ((task.score0to1 || 0) * 100);

  const getStreakIcon = (streak: number) => {
    if (streak >= 30) return Crown;
    if (streak >= 21) return Trophy;
    if (streak >= 14) return Award;
    if (streak >= 7) return Star;
    if (streak >= 3) return Flame;
    return Target;
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-violet-400';
    if (streak >= 21) return 'text-amber-400';
    if (streak >= 14) return 'text-orange-400';
    if (streak >= 7) return 'text-blue-400';
    if (streak >= 3) return 'text-emerald-400';
    return 'text-white/40';
  };

  const StreakIcon = getStreakIcon(task.streak || 0);

  return (
    <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-3 sm:p-4 mb-2 sm:mb-3 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-200">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Botón de completar */}
        <button
          onClick={() => {
            if (task.type === 'boolean') {
              onToggleTask?.(task.id);
            } else if (task.type === 'numeric') {
              onToggleTask?.(task.id, task.target);
            } else {
              onUpdateTask?.(task.id, 1);
            }
          }}
          className="flex-shrink-0 mt-0.5 group"
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform duration-200" />
          ) : (
            <Circle className="w-5 h-5 text-white/30 hover:text-emerald-400/80 group-hover:scale-105 transition-all duration-200" />
          )}
        </button>
        
        {/* Info de la tarea */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium text-sm leading-relaxed break-words ${isCompleted ? 'text-white/50 line-through' : 'text-white/90'}`}>
            {task.title}
          </h3>
          
          {/* Barra de progreso para tareas numéricas */}
          {task.type === 'numeric' && (
            <div className="mt-2 sm:mt-3">
              <div className="flex items-center justify-between text-xs text-white/50 mb-1 sm:mb-2">
                <span className="truncate">{task.current || 0} / {task.target || 1} {task.unit || ''}</span>
                <span className="font-medium ml-2">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 sm:h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400/80 to-green-400/80 transition-all duration-300"
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Estrellas para tareas subjetivas */}
          {task.type === 'subjective' && (
            <div className="flex gap-1 sm:gap-1.5 mt-2 sm:mt-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => onUpdateTask?.(task.id, star / 5)}
                  className="group/star p-0.5 sm:p-1"
                >
                  <Star 
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-all group-hover/star:scale-110 ${
                      ((task.score0to1 || 0) * 5) >= star 
                        ? 'text-amber-400 fill-amber-400' 
                        : 'text-white/20 hover:text-amber-400/60'
                    }`} 
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Racha - posicionada mejor y responsive */}
        {(task.streak || 0) > 0 && (
          <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-white/[0.06] border border-white/[0.08] rounded-md sm:rounded-lg flex-shrink-0">
            <StreakIcon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${getStreakColor(task.streak || 0)}`} />
            <span className={`text-xs font-semibold ${getStreakColor(task.streak || 0)}`}>
              {task.streak || 0}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}