'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Square, 
  Timer, 
  Target,
  BarChart3,
  Clock,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { DailyTask, Project } from '@/types';
import { useTimeTracking } from '@/hooks/useTimeTracking';

interface FocusModeScreenProps {
  task: DailyTask;
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onTaskComplete?: (taskId: string, timeSpent: number) => void;
  onTimeUpdate?: (taskId: string, timeSpent: number) => void;
}

export default function FocusModeScreen({
  task,
  project,
  isOpen,
  onClose,
  onTaskComplete,
  onTimeUpdate
}: FocusModeScreenProps) {
  const { 
    currentSession, 
    startTracking, 
    stopTracking, 
    pauseTracking, 
    resumeTracking,
    getCurrentSessionTime,
    formatTimeHMS 
  } = useTimeTracking();
  
  const [timeElapsed, setTimeElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Determinar si es cuenta regresiva (si tiene estimatedDuration)
  const hasEstimatedDuration = task.estimatedDuration && task.estimatedDuration > 0;
  const isCountdown = hasEstimatedDuration;
  const initialTime = isCountdown ? (task.estimatedDuration || 0) : 0;
  const [timeCompleted, setTimeCompleted] = useState(false);
  
  // Debug: Ver qué tiene la tarea
  console.log('🔍 FocusModeScreen - Task:', {
    title: task.title,
    estimatedDuration: task.estimatedDuration,
    hasEstimatedDuration,
    isCountdown,
    initialTime,
    taskComplete: task
  });

  // Actualizar tiempo en tiempo real
  useEffect(() => {
    if (currentSession && !currentSession.isPaused) {
      intervalRef.current = setInterval(() => {
        const sessionTime = getCurrentSessionTime();
        
        if (isCountdown) {
          // Cuenta regresiva: restar tiempo transcurrido del tiempo inicial
          const remaining = Math.max(0, initialTime - sessionTime);
          setTimeElapsed(remaining);
          
          // Si se acabó el tiempo, marcar para completar
          if (remaining === 0 && !timeCompleted) {
            setTimeCompleted(true);
          }
        } else {
          // Cuenta adelante (normal)
          setTimeElapsed(sessionTime);
        }
        
        // Actualizar tiempo cada minuto
        if (sessionTime % 60 === 0) {
          onTimeUpdate?.(task.id, sessionTime);
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [currentSession, getCurrentSessionTime, task.id, onTimeUpdate, isCountdown, initialTime, timeCompleted]);

  // Auto-completar cuando el tiempo se acaba
  useEffect(() => {
    if (timeCompleted && isCountdown) {
      const finalTime = stopTracking(true);
      onTaskComplete?.(task.id, finalTime);
      onClose();
    }
  }, [timeCompleted, isCountdown, stopTracking, onTaskComplete, task.id, onClose]);

  // Formatear tiempo en HH:MM:SS
  const formatTime = (seconds: number) => {
    return formatTimeHMS(seconds);
  };

  // Iniciar cronómetro
  const startTimer = () => {
    if (!currentSession) {
      startTracking(task.id, project.id);
    } else if (currentSession.isPaused) {
      resumeTracking();
    }
  };

  // Pausar cronómetro
  const pauseTimer = () => {
    if (currentSession && !currentSession.isPaused) {
      pauseTracking();
    }
  };

  // Completar tarea
  const completeTask = () => {
    if (currentSession) {
      const finalTime = stopTracking(true);
      onTaskComplete?.(task.id, finalTime);
    }
    onClose();
  };

  // Cleanup al cerrar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Limpiar interval al cerrar modal y auto-iniciar al abrir
  useEffect(() => {
    if (!isOpen) {
      if (currentSession) {
        stopTracking(false);
      }
      setTimeElapsed(isCountdown ? initialTime : 0);
    } else {
      // Establecer tiempo inicial correcto
      setTimeElapsed(isCountdown ? initialTime : 0);
      // Auto-iniciar el timer cuando se abre el modo enfoque
      setTimeout(() => {
        startTimer();
      }, 500); // Pequeño delay para animación
    }
  }, [isOpen, isCountdown, initialTime]);

  if (!isOpen) return null;

  const projectGradient = project.colorScheme 
    ? `from-${project.colorScheme}-500 to-${project.colorScheme}-600`
    : 'from-blue-500 to-indigo-600';

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-50 flex items-center justify-center">
      {/* Efecto de fondo con el color del proyecto */}
      <div className={`absolute inset-0 bg-gradient-to-br ${projectGradient} opacity-5`} />
      <div className={`absolute inset-0 bg-gradient-to-t ${projectGradient} opacity-10`} />
      
      {/* Contenido principal */}
      <div className="relative w-full h-full flex flex-col items-center justify-center p-8 text-center">
        
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all duration-300 group"
        >
          <X className="w-6 h-6 text-white/70 group-hover:text-white transition-colors" />
        </button>

        {/* Información del proyecto */}
        <div className="mb-8 opacity-60">
          <p className="text-white/60 text-lg font-light">Proyecto</p>
          <h2 className="text-white/80 text-2xl font-medium">{project.title}</h2>
        </div>

        {/* Tarea actual */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Target className={`w-8 h-8 text-${project.colorScheme || 'blue'}-400`} />
            <h1 className="text-white text-4xl md:text-5xl font-light tracking-wide">
              {task.title}
            </h1>
          </div>
          
          {task.description && (
            <p className="text-white/60 text-xl font-light max-w-2xl">
              {task.description}
            </p>
          )}
        </div>

        {/* Cronómetro principal */}
        <div className="mb-16">
          {/* Indicador de modo countdown */}
          {isCountdown && (
            <div className="mb-4 flex items-center justify-center gap-2">
              <Timer className="w-5 h-5 text-cyan-400" />
              <span className="text-white/60 text-sm uppercase tracking-wide">Cuenta Regresiva</span>
            </div>
          )}
          
          <div className={`w-64 h-64 rounded-full border-4 ${
            isCountdown 
              ? timeElapsed < 60 
                ? 'border-red-400/50 bg-gradient-to-br from-red-500/20 to-orange-500/10' 
                : 'border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10'
              : `border-${project.colorScheme || 'blue'}-400/30 bg-gradient-to-br ${projectGradient}/10`
          } flex items-center justify-center mb-8 mx-auto shadow-2xl relative`}>
            <div className="text-center">
              <div className={`text-6xl font-light text-white mb-2 font-mono tracking-wider ${
                isCountdown && timeElapsed < 60 ? 'animate-pulse text-red-400' : ''
              }`}>
                {formatTime(timeElapsed)}
              </div>
              <div className="text-white/50 text-sm font-medium uppercase tracking-widest">
                {currentSession && !currentSession.isPaused ? (isCountdown ? 'Tiempo restante' : 'En progreso') : 'Pausado'}
              </div>
            </div>
          </div>

          {/* Controles del cronómetro */}
          <div className="flex items-center justify-center gap-6">
            {!currentSession || currentSession.isPaused ? (
              <button
                onClick={startTimer}
                className={`w-16 h-16 rounded-full bg-gradient-to-r ${projectGradient} hover:scale-110 shadow-2xl border border-white/20 transition-all duration-300 flex items-center justify-center group`}
              >
                <Play className="w-8 h-8 text-white ml-1 group-hover:scale-110 transition-transform" />
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:scale-110 shadow-2xl border border-white/20 transition-all duration-300 flex items-center justify-center group"
              >
                <Pause className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
              </button>
            )}

            <button
              onClick={completeTask}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 hover:scale-110 shadow-2xl border border-white/20 transition-all duration-300 flex items-center justify-center group"
              title="Completar tarea"
            >
              <CheckCircle2 className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* Información de la sesión */}
        {currentSession && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-8 text-center">
              <div>
                <div className="text-white/50 text-sm font-medium mb-1">Sesión iniciada</div>
                <div className="text-white/80 text-lg font-mono">
                  {currentSession.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              
              <div className="w-px h-12 bg-white/20" />
              
              <div>
                <div className="text-white/50 text-sm font-medium mb-1">Tiempo transcurrido</div>
                <div className="text-white/80 text-lg font-mono">
                  {formatTime(timeElapsed)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Teclas de acceso rápido */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="text-white/30 text-sm text-center">
            <p>Teclas: <span className="font-mono bg-white/10 px-2 py-1 rounded">Espacio</span> Play/Pause • <span className="font-mono bg-white/10 px-2 py-1 rounded">Esc</span> Salir</p>
          </div>
        </div>
      </div>
    </div>
  );
}