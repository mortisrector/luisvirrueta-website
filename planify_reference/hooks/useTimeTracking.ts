'use client';

import { useState, useEffect } from 'react';

interface TimeEntry {
  taskId: string;
  projectId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // en segundos
  isCompleted: boolean;
  sessionId?: string; // Para identificar sesiones
}

interface ProjectTimeStats {
  projectId: string;
  totalTime: number;
  completedTasks: number;
  totalTasks: number;
  averageTaskTime: number;
  taskTimes: { [taskId: string]: number };
}

export type { ProjectTimeStats };

export const useTimeTracking = () => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [currentSession, setCurrentSession] = useState<{
    taskId: string;
    projectId: string;
    startTime: Date;
    sessionId: string;
    isPaused: boolean;
    pausedTime: number; // tiempo acumulado antes de pausas
  } | null>(null);

  // Cargar datos del localStorage al inicializar
  useEffect(() => {
    const savedEntries = localStorage.getItem('timeTrackingEntries');
    if (savedEntries) {
      try {
        const parsed = JSON.parse(savedEntries);
        // Convertir fechas de string a Date
        const entries = parsed.map((entry: any) => ({
          ...entry,
          startTime: new Date(entry.startTime),
          endTime: entry.endTime ? new Date(entry.endTime) : undefined
        }));
        setTimeEntries(entries);
      } catch (error) {
        console.error('Error loading time entries:', error);
      }
    }
  }, []);

  // Guardar en localStorage cuando cambian las entradas
  useEffect(() => {
    localStorage.setItem('timeTrackingEntries', JSON.stringify(timeEntries));
  }, [timeEntries]);

  // Iniciar seguimiento de tiempo para una tarea
  const startTracking = (taskId: string, projectId: string) => {
    const startTime = new Date();
    const sessionId = `${taskId}-${Date.now()}`;
    
    setCurrentSession({
      taskId,
      projectId,
      startTime,
      sessionId,
      isPaused: false,
      pausedTime: 0
    });
    
    console.log(`Started tracking time for task ${taskId} in project ${projectId}`);
  };

  // Pausar seguimiento
  const pauseTracking = () => {
    if (!currentSession || currentSession.isPaused) return;

    const now = new Date();
    const currentDuration = Math.floor((now.getTime() - currentSession.startTime.getTime()) / 1000);
    
    setCurrentSession(prev => prev ? {
      ...prev,
      isPaused: true,
      pausedTime: prev.pausedTime + currentDuration
    } : null);
    
    console.log(`Paused tracking for task ${currentSession.taskId}`);
  };

  // Reanudar seguimiento
  const resumeTracking = () => {
    if (!currentSession || !currentSession.isPaused) return;

    setCurrentSession(prev => prev ? {
      ...prev,
      isPaused: false,
      startTime: new Date() // Nuevo tiempo de inicio para la reanudación
    } : null);
    
    console.log(`Resumed tracking for task ${currentSession.taskId}`);
  };

  // Parar seguimiento y registrar tiempo
  const stopTracking = (isCompleted: boolean = false) => {
    if (!currentSession) return 0;

    const endTime = new Date();
    let duration = currentSession.pausedTime; // Tiempo acumulado de pausas anteriores
    
    // Si no está pausado, agregar el tiempo actual
    if (!currentSession.isPaused) {
      duration += Math.floor((endTime.getTime() - currentSession.startTime.getTime()) / 1000);
    }

    const newEntry: TimeEntry = {
      taskId: currentSession.taskId,
      projectId: currentSession.projectId,
      startTime: currentSession.startTime,
      endTime,
      duration,
      isCompleted,
      sessionId: currentSession.sessionId
    };

    setTimeEntries(prev => [...prev, newEntry]);
    setCurrentSession(null);

    console.log(`Stopped tracking. Duration: ${duration}s, Completed: ${isCompleted}`);
    return duration;
  };

  // Actualizar tiempo de una sesión en curso
  const updateCurrentTime = (taskId: string, additionalSeconds: number) => {
    if (currentSession?.taskId === taskId) {
      // Actualizar la hora de inicio para reflejar el tiempo adicional
      const newStartTime = new Date(currentSession.startTime.getTime() - (additionalSeconds * 1000));
      setCurrentSession(prev => prev ? { ...prev, startTime: newStartTime } : null);
    }
  };

  // Obtener estadísticas de tiempo para un proyecto
  const getProjectTimeStats = (projectId: string): ProjectTimeStats => {
    const projectEntries = timeEntries.filter(entry => entry.projectId === projectId);
    
    const totalTime = projectEntries.reduce((sum, entry) => sum + entry.duration, 0);
    const completedTaskIds = Array.from(new Set(
      projectEntries.filter(entry => entry.isCompleted).map(entry => entry.taskId)
    ));
    const allTaskIds = Array.from(new Set(projectEntries.map(entry => entry.taskId)));
    
    const completedTasks = completedTaskIds.length;
    const totalTasks = allTaskIds.length;
    const averageTaskTime = totalTasks > 0 ? totalTime / totalTasks : 0;

    // Tiempo por tarea
    const taskTimes: { [taskId: string]: number } = {};
    projectEntries.forEach(entry => {
      if (!taskTimes[entry.taskId]) {
        taskTimes[entry.taskId] = 0;
      }
      taskTimes[entry.taskId] += entry.duration;
    });

    return {
      projectId,
      totalTime,
      completedTasks,
      totalTasks,
      averageTaskTime,
      taskTimes
    };
  };

  // Obtener tiempo total para una tarea específica
  const getTaskTime = (taskId: string): number => {
    return timeEntries
      .filter(entry => entry.taskId === taskId)
      .reduce((sum, entry) => sum + entry.duration, 0);
  };

  // Obtener sesiones de una tarea específica
  const getSessionsForTask = (taskId: string) => {
    return timeEntries.filter(entry => entry.taskId === taskId);
  };

  // Obtener todas las estadísticas de proyectos
  const getAllProjectStats = (): ProjectTimeStats[] => {
    const projectIds = Array.from(new Set(timeEntries.map(entry => entry.projectId)));
    return projectIds.map(projectId => getProjectTimeStats(projectId));
  };

  // Formatear tiempo en formato legible
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Formatear tiempo en formato HH:MM:SS
  const formatTimeHMS = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Obtener tiempo actual de la sesión si está activa
  const getCurrentSessionTime = (): number => {
    if (!currentSession) return 0;
    
    let currentTime = currentSession.pausedTime; // Tiempo pausado acumulado
    
    // Si no está pausado, agregar tiempo actual
    if (!currentSession.isPaused) {
      currentTime += Math.floor((new Date().getTime() - currentSession.startTime.getTime()) / 1000);
    }
    
    return currentTime;
  };

  return {
    // Estado
    timeEntries,
    currentSession,
    
    // Acciones
    startTracking,
    stopTracking,
    pauseTracking,
    resumeTracking,
    updateCurrentTime,
    
    // Consultas
    getProjectTimeStats,
    getTaskTime,
    getSessionsForTask,
    getAllProjectStats,
    getCurrentSessionTime,
    
    // Utilidades
    formatTime,
    formatTimeHMS
  };
};