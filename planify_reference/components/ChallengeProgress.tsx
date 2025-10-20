'use client';

import React, { useEffect } from 'react';
import { Project, DailyTask } from '@/types';
import { Trophy, Calendar, Target, RotateCcw, CheckCircle2, X, Flame, Zap, Award, TrendingUp, CalendarClock, Gift } from 'lucide-react';
import { getColorSchemeGradient } from '@/lib/colorSchemes';

interface ChallengeProgressProps {
  project: Project;
  dailyTasks: DailyTask[];
  projectProgress: number; // 0-100 (today's progress)
}

// Helper function to calculate overall challenge progress: (tareas completadas) / (total días × total tareas)
function calculateChallengeProgress(project: Project, dailyTasks?: any[]): number {
  if (!project.challengeConfig) return 0;
  
  const { totalDays } = project.challengeConfig;
  if (totalDays === 0) return 0;
  
  // Obtener todas las tareas del proyecto
  const projectTasks = dailyTasks?.filter((task: any) => task.projectId === project.id) || [];
  if (projectTasks.length === 0) return 0;
  
  // Calcular total de tareas completadas (con progreso parcial para numéricas)
  let totalCompletedTasks = 0;
  
  projectTasks.forEach((task: any) => {
    if (task.type === 'boolean') {
      totalCompletedTasks += task.completed ? 1 : 0;
    } else if (task.type === 'numeric') {
      const current = task.current || 0;
      const target = task.target || 1;
      totalCompletedTasks += Math.min(1, current / target); // Progreso parcial como fracción
    } else if (task.type === 'subjective') {
      totalCompletedTasks += task.completed ? 1 : 0;
    }
  });
  
  // Total máximo posible = total días × número de tareas por día
  const tasksPerDay = projectTasks.length;
  const maxPossibleTasks = totalDays * tasksPerDay;
  
  // Progreso = tareas completadas / máximo posible
  return (totalCompletedTasks / maxPossibleTasks) * 100;
}

export default function ChallengeProgress({ project, dailyTasks, projectProgress }: ChallengeProgressProps) {
  if (!project.challengeConfig) return null;

  const { totalDays, daysCompleted, currentStreak, resetOnMiss, startDate, reward } = project.challengeConfig;
  
  // Calculate overall challenge progress: (tareas completadas) / (días × tareas)
  const overallChallengeProgress = calculateChallengeProgress(project, dailyTasks);
  
  // Calculate days since start - Validar fecha de inicio correctamente
  const start = new Date(startDate || project.createdAt || new Date());
  start.setHours(0, 0, 0, 0); // Reset start time to beginning of day
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  
  const daysSinceStart = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  // Verificar si el reto ya ha comenzado
  const challengeHasStarted = today.getTime() >= start.getTime();
  const todayString = today.toISOString().split('T')[0];
  
  // Solo permitir completar días si el reto ha comenzado y es el día correcto o posterior
  const canCompleteToday = challengeHasStarted && daysSinceStart >= 0;
  
  // Check if today should be marked as completed
  const isTodayCompleted = canCompleteToday && (daysCompleted.includes(todayString) || projectProgress >= 100);

  // Auto-reset funcionalidad - Verificar si necesita crear un nuevo día
  useEffect(() => {
    if (!challengeHasStarted) return;
    
    const checkForNewDay = () => {
      const now = new Date();
      const currentDayString = now.toISOString().split('T')[0];
      
      // Si es un nuevo día y el reto ha comenzado, podríamos triggerear auto-reset
      if (currentDayString !== todayString) {
        console.log('Nuevo día detectado, restableciendo progreso diario');
        // Aquí podrías llamar una función para resetear el progreso diario
        // onNewDayReset?.(currentDayString);
      }
    };

    // Verificar cada minuto si es un nuevo día
    const interval = setInterval(checkForNewDay, 60000);
    
    return () => clearInterval(interval);
  }, [challengeHasStarted, todayString]);
  
  // Generate calendar grid based on mode
  const calendar = [];
  
  if (resetOnMiss) {
    // MODO ESTRICTO: Mostrar días desde la fecha de inicio, no desde hoy
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i); // Days forward from start date
      const dateString = date.toISOString().split('T')[0];
      const isCompleted = daysCompleted.includes(dateString);
      const isToday = dateString === todayString;
      const isFuture = date.getTime() > today.getTime();
      const isPast = date.getTime() < today.getTime();
      
      calendar.push({
        date: dateString,
        day: date.getDate(),
        dayNumber: i + 1, // Días secuenciales del reto
        isCompleted,
        isToday,
        isFuture,
        isPast,
        canComplete: challengeHasStarted && !isFuture // Solo se puede completar si el reto ha comenzado y no es futuro
      });
    }
  } else {
    // MODO ACUMULATIVO: Mostrar días desde fecha de inicio hasta totalDays
    const numCompleted = daysCompleted.length;
    
    // Generar calendario desde fecha de inicio
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      const isCompleted = daysCompleted.includes(dateString);
      const isToday = dateString === todayString;
      const isFuture = date.getTime() > today.getTime();
      const canComplete = challengeHasStarted && date.getTime() <= today.getTime();
      
      calendar.push({
        date: dateString,
        day: date.getDate(),
        dayNumber: i + 1,
        isCompleted,
        isToday,
        isFuture,
        canComplete
      });
    }
  }

  // Obtener gradiente del proyecto
  const projectGradient = getColorSchemeGradient(project.colorScheme || 'default');

  return (
    <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 mb-6 overflow-hidden shadow-2xl">
      {/* Glow sutil de fondo con color del proyecto */}
      <div className="absolute inset-0 -z-0 pointer-events-none">
        <div className={`absolute -inset-24 bg-gradient-to-br ${projectGradient} opacity-5 blur-3xl`} />
      </div>
      
      {/* Alerta si el reto no ha comenzado */}
      {!challengeHasStarted && (
        <div className="relative mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <CalendarClock className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-amber-200 text-sm font-medium">
                El reto comenzará el {start.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-amber-300/60 text-xs">
                Faltan {Math.abs(daysSinceStart)} día(s) para empezar
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Premium */}
      <div className="relative flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          {/* Icono premium con glow */}
          <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${projectGradient} flex items-center justify-center shadow-xl`}>
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${projectGradient} blur-xl opacity-50`} />
            <Trophy className="w-7 h-7 text-white relative z-10 drop-shadow-lg" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              Reto: {totalDays} días
            </h3>
            <p className="text-white/60 text-sm font-medium">
              {daysCompleted.length}/{totalDays} días completados
            </p>
          </div>
        </div>
        
        {/* Racha actual - Badge premium */}
        <div className="relative">
          <div className={`px-4 py-2 rounded-xl bg-gradient-to-br ${projectGradient} shadow-lg border border-white/20`}>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-white" />
              <div className="text-right">
                <div className="text-2xl font-bold text-white leading-none">
                  {currentStreak}
                </div>
                <div className="text-[10px] text-white/80 font-medium uppercase tracking-wide">racha</div>
              </div>
            </div>
          </div>
          {/* Glow del badge */}
          <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${projectGradient} blur-lg opacity-40 -z-10`}></div>
        </div>
      </div>

      {/* Info adicional: Fecha de inicio y Premio (si existen) */}
      {(startDate || reward) && (
        <div className="relative mb-5 flex flex-wrap gap-2">
          {startDate && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <CalendarClock className="w-4 h-4 text-cyan-400" />
              <span className="text-white/80 text-xs">
                Inicio: <span className="font-semibold text-white">{new Date(startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
              </span>
            </div>
          )}
          {reward && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <Gift className="w-4 h-4 text-purple-400" />
              <span className="text-white/80 text-xs">
                <span className="font-semibold text-purple-300">{reward}</span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Progress Bars Premium */}
      <div className="relative space-y-4 mb-5">
        {/* Progreso de Hoy */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/90 text-xs font-medium flex items-center gap-1.5">
              <Target className="w-4 h-4 text-white/60" />
              Progreso de Hoy
            </span>
            <span className={`text-sm font-bold bg-gradient-to-r ${projectGradient} bg-clip-text text-transparent`}>
              {projectProgress.toFixed(1)}%
            </span>
          </div>
          <div className="relative w-full h-2.5 rounded-full bg-white/8 border border-white/15 shadow-inner overflow-visible">
            <div 
              className={`h-full bg-gradient-to-r ${projectGradient} transition-all duration-700 ease-out rounded-full shadow-xl`}
              style={{ width: `${projectProgress}%` }}
            />
            {/* Badge al ras de la barra - Aparece progresivamente */}
            <div 
              className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out z-10"
              style={{ 
                left: `${Math.min(Math.max(projectProgress, 5), 100)}%`,
                opacity: projectProgress > 0 ? 1 : 0,
                transform: `translateX(-50%) translateY(-50%) scale(${projectProgress > 0 ? 1 : 0.8})`
              }}
            >
              <div className={`relative px-1.5 py-0.5 rounded bg-gradient-to-r ${projectGradient} shadow-md transition-all duration-700 ease-out`}>
                <span className="text-white text-[10px] font-medium">{projectProgress.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Avance del Reto - Progreso basado en días completados */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/90 text-xs font-medium flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-white/60" />
              Avance del Reto
            </span>
            <span className={`text-sm font-bold bg-gradient-to-r ${projectGradient} bg-clip-text text-transparent`}>
              {overallChallengeProgress.toFixed(1)}%
            </span>
          </div>
          <div className="relative w-full h-2.5 rounded-full bg-white/8 border border-white/15 shadow-inner overflow-visible">
            <div 
              className={`h-full bg-gradient-to-r ${projectGradient} transition-all duration-700 ease-out rounded-full shadow-xl opacity-90`}
              style={{ width: `${overallChallengeProgress}%` }}
            />
            {/* Badge al ras de la barra - Aparece progresivamente */}
            <div 
              className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out z-10"
              style={{ 
                left: `${Math.min(Math.max(overallChallengeProgress, 5), 100)}%`,
                opacity: overallChallengeProgress > 0 ? 0.9 : 0,
                transform: `translateX(-50%) translateY(-50%) scale(${overallChallengeProgress > 0 ? 1 : 0.8})`
              }}
            >
              <div className={`relative px-1.5 py-0.5 rounded bg-gradient-to-r ${projectGradient} shadow-md transition-all duration-700 ease-out`}>
                <span className="text-white text-[10px] font-medium">{overallChallengeProgress.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid Premium */}
      <div className="relative mb-5 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
        <h4 className="text-white text-sm font-bold mb-2 flex items-center gap-2">
          <Calendar className={`w-5 h-5 bg-gradient-to-br ${projectGradient} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent', backgroundClip: 'text' }} />
          <span className="bg-gradient-to-r ${projectGradient} bg-clip-text text-transparent" style={{ WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {resetOnMiss ? `Próximos ${totalDays} días` : 'Progreso del Reto'}
          </span>
        </h4>
        {!resetOnMiss && (
          <p className="text-white/50 text-xs mb-3">
            Puedes completar días en cualquier momento. Meta: {totalDays} días totales.
          </p>
        )}
        <div className={`grid gap-2.5 ${totalDays <= 10 ? 'grid-cols-5 sm:grid-cols-10' : totalDays <= 15 ? 'grid-cols-5 sm:grid-cols-10' : totalDays <= 21 ? 'grid-cols-7' : totalDays <= 30 ? 'grid-cols-5 sm:grid-cols-10' : 'grid-cols-8'}`}>
          {calendar.map((day) => (
            <div
              key={day.date}
              className={`
                relative aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all duration-300 
                ${day.canComplete || day.isCompleted ? 'cursor-pointer' : 'cursor-not-allowed'} group
                ${day.isCompleted 
                  ? `bg-gradient-to-br ${projectGradient} text-white shadow-xl hover:scale-105 ring-2 ring-white/30` 
                  : day.isToday 
                    ? projectProgress >= 100
                      ? `bg-gradient-to-br ${projectGradient} text-white shadow-xl animate-pulse ring-2 ring-white/40`
                      : `bg-white/10 border-2 bg-gradient-to-br ${projectGradient} bg-clip-text text-transparent border-white/30 font-black`
                    : day.isFuture || !day.canComplete
                      ? 'bg-white/5 border border-white/10 text-white/30 opacity-50'
                      : 'bg-white/10 text-white/50 hover:bg-white/15'
                }
              `}
              title={`Día ${day.dayNumber} (${day.date}) - ${
                day.isCompleted ? 'Completado ✓' : 
                !challengeHasStarted ? 'El reto aún no ha comenzado' :
                day.isFuture ? 'Día futuro - No disponible' :
                day.isToday ? 'Hoy' : 'Pendiente'
              }`}
              onClick={() => {
                if ((day.canComplete || day.isCompleted) && challengeHasStarted) {
                  // Aquí podría ir lógica para marcar/desmarcar el día
                  console.log(`Clicked day ${day.dayNumber}: ${day.date}, Can complete: ${day.canComplete}`);
                }
              }}
            >
              {/* Glow sutil para días completados */}
              {day.isCompleted && (
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${projectGradient} blur-md opacity-50 -z-10`}></div>
              )}
              
              {day.isCompleted ? (
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-lg" />
              ) : day.isToday && projectProgress >= 100 ? (
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-lg" />
              ) : (
                <span className="text-[11px] sm:text-xs font-bold">{day.dayNumber}</span>
              )}
              
              {/* Indicador de día actual */}
              {day.isToday && (
                <div className={`absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-gradient-to-br ${projectGradient} shadow-lg animate-pulse`}></div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 text-xs">
          <span className="text-white/50 font-medium">Día actual:</span>
          <span className={`font-bold bg-gradient-to-r ${projectGradient} bg-clip-text text-transparent px-2 py-0.5 rounded-md bg-white/10`}>
            {calendar.findIndex(d => d.isToday) + 1} de {totalDays}
          </span>
        </div>
      </div>

      {/* Status Messages Premium */}
      <div className="relative space-y-3">
        {/* Today's Status - Completado */}
        {projectProgress >= 100 && !isTodayCompleted && (
          <div className="relative flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden group hover:bg-white/10 transition-all">
            <div className={`absolute inset-0 bg-gradient-to-r ${projectGradient} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
            <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${projectGradient} flex items-center justify-center shadow-lg`}>
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div className="relative flex-1">
              <span className="text-white font-bold text-sm block">
                ¡Día completado!
              </span>
              <span className="text-white/60 text-xs">
                Progreso: 100%
              </span>
            </div>
          </div>
        )}
        
        {/* Warning if not completed today */}
        {projectProgress < 100 && (
          <div className="relative flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden group hover:bg-white/10 transition-all">
            <div className={`absolute inset-0 bg-gradient-to-r ${projectGradient} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
            <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${projectGradient} opacity-50 flex items-center justify-center`}>
              <Target className="w-5 h-5 text-white" />
            </div>
            <div className="relative flex-1">
              <span className="text-white font-bold text-sm block">
                Progreso hoy: {projectProgress.toFixed(1)}%
              </span>
              <span className="text-white/60 text-xs">
                ¡Completa las tareas para marcar el día!
              </span>
            </div>
          </div>
        )}

        {/* Reset warning - SOLO EN MODO ESTRICTO */}
        {resetOnMiss && projectProgress < 100 && currentStreak > 0 && (
          <div className="relative flex items-center gap-3 p-3 bg-red-500/5 backdrop-blur-sm border border-red-500/20 rounded-xl overflow-hidden group hover:bg-red-500/10 transition-all">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 opacity-50"></div>
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg">
              <RotateCcw className="w-5 h-5 text-white" />
            </div>
            <div className="relative flex-1">
              <span className="text-red-400 font-bold text-sm block">
                ⚠️ Racha en riesgo - Modo Estricto
              </span>
              <span className="text-red-400/80 text-xs">
                Si no completas hoy, la racha se reseteará a 0
              </span>
            </div>
          </div>
        )}
        
        {/* Info en modo acumulativo */}
        {!resetOnMiss && projectProgress < 100 && (
          <div className="relative flex items-center gap-3 p-3 bg-blue-500/5 backdrop-blur-sm border border-blue-500/20 rounded-xl overflow-hidden group hover:bg-blue-500/10 transition-all">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-50"></div>
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="relative flex-1">
              <span className="text-blue-400 font-bold text-sm block">
                💪 Modo Acumulativo
              </span>
              <span className="text-blue-400/80 text-xs">
                Puedes fallar días. Cada día completado suma a tu progreso total.
              </span>
            </div>
          </div>
        )}
        
        {/* Success message */}
        {daysCompleted.length >= totalDays && (
          <div className="relative flex items-center gap-3 p-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden group hover:bg-white/10 transition-all">
            <div className={`absolute inset-0 bg-gradient-to-r ${projectGradient} opacity-20`}></div>
            <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${projectGradient} flex items-center justify-center shadow-xl`}>
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${projectGradient} blur-lg opacity-50`}></div>
              <Trophy className="w-6 h-6 text-white relative z-10" />
            </div>
            <div className="relative flex-1">
              <span className="text-white font-bold text-base block">
                🎉 ¡Reto completado!
              </span>
              <span className="text-white/80 text-sm">
                {totalDays} días consecutivos logrados
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}