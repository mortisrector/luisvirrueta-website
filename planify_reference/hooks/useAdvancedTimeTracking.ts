'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  TimeTracking, 
  TimeSession, 
  FolderTimeTracking, 
  ProjectTimeTracking, 
  TaskTimeTracking,
  WorkVelocityMetrics 
} from '@/types';

// ============================================
// 🎯 Hook Principal de Time Tracking
// ============================================

interface UseAdvancedTimeTrackingReturn {
  // Carpetas
  startFolderTracking: (folderId: string) => void;
  stopFolderTracking: (folderId: string) => void;
  pauseFolderTracking: (folderId: string, userId: string) => void;
  resumeFolderTracking: (folderId: string) => void;
  getFolderTracking: (folderId: string) => FolderTimeTracking | null;
  
  // Proyectos
  startProjectTracking: (projectId: string, mode: 'close-and-new' | 'continue-adding') => void;
  stopProjectTracking: (projectId: string) => void;
  getProjectTracking: (projectId: string) => ProjectTimeTracking | null;
  updateProjectMode: (projectId: string, mode: 'close-and-new' | 'continue-adding') => void;
  
  // Tareas
  startTaskTracking: (taskId: string) => void;
  stopTaskTracking: (taskId: string) => void;
  pauseTaskTracking: (taskId: string) => void;
  resumeTaskTracking: (taskId: string) => void;
  getTaskTracking: (taskId: string) => TaskTimeTracking | null;
  canCompleteTask: (taskId: string) => boolean;
  
  // Métricas y estadísticas
  calculateVelocity: (itemId: string, type: 'folder' | 'project' | 'task') => WorkVelocityMetrics | null;
  predictCompletionDate: (itemId: string, type: 'folder' | 'project' | 'task') => Date | null;
  getAllActiveTracking: () => {
    folders: FolderTimeTracking[];
    projects: ProjectTimeTracking[];
    tasks: TaskTimeTracking[];
  };
  
  // Utilidades
  formatDuration: (seconds: number) => string;
  getTimeRemaining: (itemId: string, type: 'folder' | 'project' | 'task') => number | null;
}

export const useAdvancedTimeTracking = (): UseAdvancedTimeTrackingReturn => {
  const [folderTracking, setFolderTracking] = useState<Map<string, FolderTimeTracking>>(new Map());
  const [projectTracking, setProjectTracking] = useState<Map<string, ProjectTimeTracking>>(new Map());
  const [taskTracking, setTaskTracking] = useState<Map<string, TaskTimeTracking>>(new Map());
  const [updateTrigger, setUpdateTrigger] = useState(0); // Forzar re-renders
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================
  // 📦 Persistencia en localStorage
  // ============================================
  
  useEffect(() => {
    // Cargar datos guardados
    const loadTracking = () => {
      try {
        const folders = localStorage.getItem('folderTimeTracking');
        const projects = localStorage.getItem('projectTimeTracking');
        const tasks = localStorage.getItem('taskTimeTracking');
        
        if (folders) {
          const parsed = JSON.parse(folders);
          setFolderTracking(new Map(Object.entries(parsed)));
        }
        if (projects) {
          const parsed = JSON.parse(projects);
          setProjectTracking(new Map(Object.entries(parsed)));
        }
        if (tasks) {
          const parsed = JSON.parse(tasks);
          setTaskTracking(new Map(Object.entries(parsed)));
        }
      } catch (error) {
        console.error('Error loading time tracking data:', error);
      }
    };
    
    loadTracking();
  }, []);

  // Guardar datos automáticamente cada 10 segundos
  useEffect(() => {
    const saveInterval = setInterval(() => {
      try {
        localStorage.setItem('folderTimeTracking', JSON.stringify(Object.fromEntries(folderTracking)));
        localStorage.setItem('projectTimeTracking', JSON.stringify(Object.fromEntries(projectTracking)));
        localStorage.setItem('taskTimeTracking', JSON.stringify(Object.fromEntries(taskTracking)));
      } catch (error) {
        console.error('Error saving time tracking data:', error);
      }
    }, 10000);
    
    return () => clearInterval(saveInterval);
  }, [folderTracking, projectTracking, taskTracking]);

  // ============================================
  // ⏱️ Actualización en tiempo real
  // ============================================
  
  useEffect(() => {
    // Actualizar contadores cada segundo
    intervalRef.current = setInterval(() => {
      const now = new Date().toISOString();
      let hasActiveTracking = false;
      
      // Actualizar carpetas activas
      setFolderTracking(prev => {
        const updated = new Map(prev);
        updated.forEach((tracking, folderId) => {
          if (tracking.currentSession?.isRunning && !tracking.currentSession?.isPaused) {
            hasActiveTracking = true;
            const session = tracking.currentSession;
            const elapsed = Math.floor((new Date(now).getTime() - new Date(session.startTime).getTime()) / 1000);
            session.duration = elapsed - session.pausedDuration;
            tracking.totalTimeSpent = tracking.sessions.reduce((sum, s) => sum + s.duration, 0) + session.duration;
            tracking.lastWorkedAt = now;
          }
        });
        return new Map(updated); // Nueva referencia
      });
      
      // Actualizar proyectos activos
      setProjectTracking(prev => {
        const updated = new Map(prev);
        updated.forEach((tracking, projectId) => {
          if (tracking.currentSession?.isRunning && !tracking.currentSession?.isPaused) {
            hasActiveTracking = true;
            const session = tracking.currentSession;
            const elapsed = Math.floor((new Date(now).getTime() - new Date(session.startTime).getTime()) / 1000);
            session.duration = elapsed - session.pausedDuration;
            tracking.totalTimeSpent = tracking.sessions.reduce((sum, s) => sum + s.duration, 0) + session.duration;
            tracking.lastWorkedAt = now;
          }
        });
        return new Map(updated); // Nueva referencia
      });
      
      // Actualizar tareas activas
      setTaskTracking(prev => {
        const updated = new Map(prev);
        updated.forEach((tracking, taskId) => {
          if (tracking.currentSession?.isRunning && !tracking.currentSession?.isPaused) {
            hasActiveTracking = true;
            const session = tracking.currentSession;
            const elapsed = Math.floor((new Date(now).getTime() - new Date(session.startTime).getTime()) / 1000);
            session.duration = elapsed - session.pausedDuration;
            tracking.totalTimeSpent = tracking.sessions.reduce((sum, s) => sum + s.duration, 0) + session.duration;
            tracking.actualDuration = tracking.totalTimeSpent;
            tracking.lastWorkedAt = now;
            
            // Calcular tiempo hasta vencimiento
            if (tracking.dueDate) {
              const timeUntilDue = Math.floor((new Date(tracking.dueDate).getTime() - new Date(now).getTime()) / 1000);
              tracking.timeUntilDue = Math.max(0, timeUntilDue);
              tracking.isOverdue = timeUntilDue < 0;
            }
          }
        });
        return new Map(updated); // Nueva referencia
      });
      
      // Forzar re-render si hay tracking activo
      if (hasActiveTracking) {
        setUpdateTrigger(prev => prev + 1);
      }
    }, 1000);
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // ============================================
  // 📁 CARPETAS - Tracking Functions
  // ============================================
  
  const startFolderTracking = useCallback((folderId: string) => {
    const now = new Date().toISOString();
    const sessionId = `session-${Date.now()}`;
    
    const session: TimeSession = {
      id: sessionId,
      startTime: now,
      duration: 0,
      pausedDuration: 0,
      isPaused: false,
      isRunning: true,
    };
    
    setFolderTracking(prev => {
      const updated = new Map(prev);
      const existing = updated.get(folderId);
      
      if (existing) {
        existing.currentSession = session;
        existing.lastWorkedAt = now;
      } else {
        updated.set(folderId, {
          folderId,
          totalTimeSpent: 0,
          currentSession: session,
          sessions: [],
          startedAt: now,
          lastWorkedAt: now,
          projectsCompleted: 0,
          projectsTotal: 0,
          tasksCompleted: 0,
          tasksTotal: 0,
          canPause: true, // Se controlará por permisos
        });
      }
      
      return updated;
    });
    
    console.log('🎬 Carpeta iniciada:', folderId);
  }, []);

  const stopFolderTracking = useCallback((folderId: string) => {
    const now = new Date().toISOString();
    
    setFolderTracking(prev => {
      const updated = new Map(prev);
      const tracking = updated.get(folderId);
      
      if (tracking?.currentSession) {
        const session = tracking.currentSession;
        session.endTime = now;
        session.isRunning = false;
        tracking.sessions.push(session);
        tracking.currentSession = undefined;
        tracking.completedAt = now;
        tracking.totalTimeSpent = tracking.sessions.reduce((sum, s) => sum + s.duration, 0);
      }
      
      return updated;
    });
    
    console.log('⏹️ Carpeta detenida:', folderId);
  }, []);

  const pauseFolderTracking = useCallback((folderId: string, userId: string) => {
    const now = new Date().toISOString();
    
    setFolderTracking(prev => {
      const updated = new Map(prev);
      const tracking = updated.get(folderId);
      
      if (tracking?.currentSession && !tracking.currentSession.isPaused) {
        tracking.currentSession.isPaused = true;
        tracking.currentSession.pausedAt = now;
        tracking.currentSession.pausedBy = userId;
      }
      
      return updated;
    });
    
    console.log('⏸️ Carpeta pausada por admin:', folderId, userId);
  }, []);

  const resumeFolderTracking = useCallback((folderId: string) => {
    const now = new Date().toISOString();
    
    setFolderTracking(prev => {
      const updated = new Map(prev);
      const tracking = updated.get(folderId);
      
      if (tracking?.currentSession?.isPaused && tracking.currentSession.pausedAt) {
        const pauseDuration = Math.floor(
          (new Date(now).getTime() - new Date(tracking.currentSession.pausedAt).getTime()) / 1000
        );
        tracking.currentSession.pausedDuration += pauseDuration;
        tracking.currentSession.isPaused = false;
        tracking.currentSession.pausedAt = undefined;
      }
      
      return updated;
    });
    
    console.log('▶️ Carpeta reanudada:', folderId);
  }, []);

  const getFolderTracking = useCallback((folderId: string): FolderTimeTracking | null => {
    return folderTracking.get(folderId) || null;
  }, [folderTracking]);

  // ============================================
  // 📂 PROYECTOS - Tracking Functions
  // ============================================
  
  const startProjectTracking = useCallback((projectId: string, mode: 'close-and-new' | 'continue-adding') => {
    const now = new Date().toISOString();
    const sessionId = `session-${Date.now()}`;
    
    const session: TimeSession = {
      id: sessionId,
      startTime: now,
      duration: 0,
      pausedDuration: 0,
      isPaused: false,
      isRunning: true,
    };
    
    setProjectTracking(prev => {
      const updated = new Map(prev);
      const existing = updated.get(projectId);
      
      if (existing) {
        existing.currentSession = session;
        existing.lastWorkedAt = now;
        existing.phaseMode = mode;
      } else {
        updated.set(projectId, {
          projectId,
          totalTimeSpent: 0,
          currentSession: session,
          sessions: [],
          startedAt: now,
          lastWorkedAt: now,
          tasksCompleted: 0,
          tasksTotal: 0,
          phase: 1,
          phaseMode: mode,
        });
      }
      
      return updated;
    });
    
    console.log(`🎬 Proyecto iniciado en modo ${mode}:`, projectId);
  }, []);

  const stopProjectTracking = useCallback((projectId: string) => {
    const now = new Date().toISOString();
    
    setProjectTracking(prev => {
      const updated = new Map(prev);
      const tracking = updated.get(projectId);
      
      if (tracking?.currentSession) {
        const session = tracking.currentSession;
        session.endTime = now;
        session.isRunning = false;
        tracking.sessions.push(session);
        tracking.currentSession = undefined;
        tracking.completedAt = now;
        tracking.totalTimeSpent = tracking.sessions.reduce((sum, s) => sum + s.duration, 0);
      }
      
      return updated;
    });
    
    console.log('⏹️ Proyecto detenido:', projectId);
  }, []);

  const getProjectTracking = useCallback((projectId: string): ProjectTimeTracking | null => {
    return projectTracking.get(projectId) || null;
  }, [projectTracking]);

  const updateProjectMode = useCallback((projectId: string, mode: 'close-and-new' | 'continue-adding') => {
    setProjectTracking(prev => {
      const updated = new Map(prev);
      const tracking = updated.get(projectId);
      
      if (tracking) {
        tracking.phaseMode = mode;
      }
      
      return updated;
    });
    
    console.log(`🔄 Modo de proyecto actualizado a ${mode}:`, projectId);
  }, []);

  // ============================================
  // ✅ TAREAS - Tracking Functions
  // ============================================
  
  const startTaskTracking = useCallback((taskId: string) => {
    const now = new Date().toISOString();
    const sessionId = `session-${Date.now()}`;
    
    const session: TimeSession = {
      id: sessionId,
      startTime: now,
      duration: 0,
      pausedDuration: 0,
      isPaused: false,
      isRunning: true,
    };
    
    setTaskTracking(prev => {
      const updated = new Map(prev);
      const existing = updated.get(taskId);
      
      if (existing) {
        existing.currentSession = session;
        existing.lastWorkedAt = now;
        existing.hasPlayedAtLeastOnce = true;
      } else {
        updated.set(taskId, {
          taskId,
          totalTimeSpent: 0,
          currentSession: session,
          sessions: [],
          startedAt: now,
          lastWorkedAt: now,
          mustPlayToComplete: true,
          hasPlayedAtLeastOnce: true,
          isOverdue: false,
        });
      }
      
      return updated;
    });
    
    console.log('🎬 Tarea iniciada:', taskId);
  }, []);

  const stopTaskTracking = useCallback((taskId: string) => {
    const now = new Date().toISOString();
    
    setTaskTracking(prev => {
      const updated = new Map(prev);
      const tracking = updated.get(taskId);
      
      if (tracking?.currentSession) {
        const session = tracking.currentSession;
        session.endTime = now;
        session.isRunning = false;
        tracking.sessions.push(session);
        tracking.currentSession = undefined;
        tracking.completedAt = now;
        tracking.totalTimeSpent = tracking.sessions.reduce((sum, s) => sum + s.duration, 0);
        tracking.actualDuration = tracking.totalTimeSpent;
      }
      
      return updated;
    });
    
    console.log('⏹️ Tarea detenida:', taskId);
  }, []);

  const pauseTaskTracking = useCallback((taskId: string) => {
    const now = new Date().toISOString();
    
    setTaskTracking(prev => {
      const updated = new Map(prev);
      const tracking = updated.get(taskId);
      
      if (tracking?.currentSession && !tracking.currentSession.isPaused) {
        tracking.currentSession.isPaused = true;
        tracking.currentSession.pausedAt = now;
      }
      
      return updated;
    });
    
    console.log('⏸️ Tarea pausada:', taskId);
  }, []);

  const resumeTaskTracking = useCallback((taskId: string) => {
    const now = new Date().toISOString();
    
    setTaskTracking(prev => {
      const updated = new Map(prev);
      const tracking = updated.get(taskId);
      
      if (tracking?.currentSession?.isPaused && tracking.currentSession.pausedAt) {
        const pauseDuration = Math.floor(
          (new Date(now).getTime() - new Date(tracking.currentSession.pausedAt).getTime()) / 1000
        );
        tracking.currentSession.pausedDuration += pauseDuration;
        tracking.currentSession.isPaused = false;
        tracking.currentSession.pausedAt = undefined;
      }
      
      return updated;
    });
    
    console.log('▶️ Tarea reanudada:', taskId);
  }, []);

  const getTaskTracking = useCallback((taskId: string): TaskTimeTracking | null => {
    return taskTracking.get(taskId) || null;
  }, [taskTracking]);

  const canCompleteTask = useCallback((taskId: string): boolean => {
    const tracking = taskTracking.get(taskId);
    return tracking?.hasPlayedAtLeastOnce || false;
  }, [taskTracking]);

  // ============================================
  // 📊 MÉTRICAS Y ESTADÍSTICAS
  // ============================================
  
  const calculateVelocity = useCallback((itemId: string, type: 'folder' | 'project' | 'task'): WorkVelocityMetrics | null => {
    let tracking: TimeTracking | null = null;
    let itemsCompleted = 0;
    let itemsTotal = 0;
    
    if (type === 'folder') {
      const folderTrack = folderTracking.get(itemId);
      tracking = folderTrack || null;
      itemsCompleted = folderTrack?.tasksCompleted || 0;
      itemsTotal = folderTrack?.tasksTotal || 0;
    } else if (type === 'project') {
      const projectTrack = projectTracking.get(itemId);
      tracking = projectTrack || null;
      itemsCompleted = projectTrack?.tasksCompleted || 0;
      itemsTotal = projectTrack?.tasksTotal || 0;
    } else {
      tracking = taskTracking.get(itemId) || null;
      itemsCompleted = tracking?.completedAt ? 1 : 0;
      itemsTotal = 1;
    }
    
    if (!tracking || tracking.totalTimeSpent === 0) return null;
    
    const hours = tracking.totalTimeSpent / 3600;
    const itemsCompletedPerHour = hours > 0 ? itemsCompleted / hours : 0;
    const averageTimePerTask = itemsCompleted > 0 ? tracking.totalTimeSpent / itemsCompleted : 0;
    
    // Calcular tendencia (simplificado)
    const recentSessions = tracking.sessions.slice(-5);
    const trend = recentSessions.length >= 2 ? 'stable' : 'stable';
    
    return {
      itemsCompletedPerHour,
      averageTimePerTask,
      productivityTrend: trend as 'increasing' | 'stable' | 'decreasing',
      peakProductivityHours: [9, 10, 14, 15], // Placeholder
    };
  }, [folderTracking, projectTracking, taskTracking]);

  const predictCompletionDate = useCallback((itemId: string, type: 'folder' | 'project' | 'task'): Date | null => {
    const velocity = calculateVelocity(itemId, type);
    if (!velocity || velocity.itemsCompletedPerHour === 0) return null;
    
    let itemsRemaining = 0;
    
    if (type === 'folder') {
      const tracking = folderTracking.get(itemId);
      itemsRemaining = (tracking?.tasksTotal || 0) - (tracking?.tasksCompleted || 0);
    } else if (type === 'project') {
      const tracking = projectTracking.get(itemId);
      itemsRemaining = (tracking?.tasksTotal || 0) - (tracking?.tasksCompleted || 0);
    } else {
      return null; // Las tareas individuales no tienen predicción
    }
    
    if (itemsRemaining <= 0) return null;
    
    const hoursNeeded = itemsRemaining / velocity.itemsCompletedPerHour;
    const msNeeded = hoursNeeded * 3600 * 1000;
    
    return new Date(Date.now() + msNeeded);
  }, [calculateVelocity, folderTracking, projectTracking]);

  const getAllActiveTracking = useCallback(() => {
    const folders = Array.from(folderTracking.values()).filter(
      t => t.currentSession?.isRunning && !t.currentSession?.isPaused
    );
    const projects = Array.from(projectTracking.values()).filter(
      t => t.currentSession?.isRunning && !t.currentSession?.isPaused
    );
    const tasks = Array.from(taskTracking.values()).filter(
      t => t.currentSession?.isRunning && !t.currentSession?.isPaused
    );
    
    return { folders, projects, tasks };
  }, [folderTracking, projectTracking, taskTracking]);

  // ============================================
  // 🛠️ UTILIDADES
  // ============================================
  
  const formatDuration = useCallback((seconds: number): string => {
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
  }, []);

  const getTimeRemaining = useCallback((itemId: string, type: 'folder' | 'project' | 'task'): number | null => {
    if (type === 'task') {
      const tracking = taskTracking.get(itemId);
      if (tracking?.estimatedDuration && tracking.totalTimeSpent < tracking.estimatedDuration) {
        return tracking.estimatedDuration - tracking.totalTimeSpent;
      }
    }
    return null;
  }, [taskTracking]);

  return {
    // Carpetas
    startFolderTracking,
    stopFolderTracking,
    pauseFolderTracking,
    resumeFolderTracking,
    getFolderTracking,
    
    // Proyectos
    startProjectTracking,
    stopProjectTracking,
    getProjectTracking,
    updateProjectMode,
    
    // Tareas
    startTaskTracking,
    stopTaskTracking,
    pauseTaskTracking,
    resumeTaskTracking,
    getTaskTracking,
    canCompleteTask,
    
    // Métricas
    calculateVelocity,
    predictCompletionDate,
    getAllActiveTracking,
    
    // Utilidades
    formatDuration,
    getTimeRemaining,
  };
};
