'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { 
  TimeSession, 
  FolderTimeTracking, 
  ProjectTimeTracking, 
  TaskTimeTracking,
  WorkVelocityMetrics 
} from '@/types';

interface TimeTrackingContextType {
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

const TimeTrackingContext = createContext<TimeTrackingContextType | undefined>(undefined);

interface TimeTrackingProviderProps {
  children: ReactNode;
  userId: string | null;
}

export function TimeTrackingProvider({ children, userId }: TimeTrackingProviderProps) {
  const [folderTracking, setFolderTracking] = useState<Map<string, FolderTimeTracking>>(new Map());
  const [projectTracking, setProjectTracking] = useState<Map<string, ProjectTimeTracking>>(new Map());
  const [taskTracking, setTaskTracking] = useState<Map<string, TaskTimeTracking>>(new Map());
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================
  // 📦 Persistencia en localStorage con userId
  // ============================================
  
  const getStorageKey = useCallback((key: string) => {
    return userId ? `${key}_${userId}` : key;
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      console.log('⚠️ TimeTrackingContext: No userId yet, skipping load');
      return;
    }
    
    console.log('🔄 TimeTrackingContext: Loading data for userId:', userId);
    
    // Cargar datos guardados
    const loadTracking = () => {
      try {
        const folderKey = getStorageKey('folderTimeTracking');
        const projectKey = getStorageKey('projectTimeTracking');
        const taskKey = getStorageKey('taskTimeTracking');
        
        console.log('🔑 Storage keys:', { folderKey, projectKey, taskKey });
        
        const folders = localStorage.getItem(folderKey);
        const projects = localStorage.getItem(projectKey);
        const tasks = localStorage.getItem(taskKey);
        
        console.log('📦 Raw data from localStorage:', { 
          folders: folders?.substring(0, 100), 
          projects: projects?.substring(0, 100), 
          tasks: tasks?.substring(0, 100) 
        });
        
        if (folders) {
          const parsed = JSON.parse(folders);
          const map = new Map(Object.entries(parsed)) as Map<string, FolderTimeTracking>;
          setFolderTracking(map);
          console.log('✅ Loaded folders:', map.size, 'items');
        }
        if (projects) {
          const parsed = JSON.parse(projects);
          const map = new Map(Object.entries(parsed)) as Map<string, ProjectTimeTracking>;
          setProjectTracking(map);
          console.log('✅ Loaded projects:', map.size, 'items');
        }
        if (tasks) {
          const parsed = JSON.parse(tasks);
          const map = new Map(Object.entries(parsed)) as Map<string, TaskTimeTracking>;
          setTaskTracking(map);
          console.log('✅ Loaded tasks:', map.size, 'items');
        }
        
        console.log('✅ Time tracking data loaded for user:', userId);
      } catch (error) {
        console.error('❌ Error loading time tracking data:', error);
      }
    };
    
    loadTracking();
  }, [userId, getStorageKey]);

  // Guardar datos automáticamente cada 5 segundos
  useEffect(() => {
    if (!userId) return;
    
    const saveInterval = setInterval(() => {
      // Usar una función para obtener el estado más reciente
      setFolderTracking(current => {
        try {
          const folderKey = getStorageKey('folderTimeTracking');
          localStorage.setItem(folderKey, JSON.stringify(Object.fromEntries(current)));
        } catch (error) {
          console.error('❌ Error saving folder tracking:', error);
        }
        return current; // No modificar el estado
      });
      
      setProjectTracking(current => {
        try {
          const projectKey = getStorageKey('projectTimeTracking');
          localStorage.setItem(projectKey, JSON.stringify(Object.fromEntries(current)));
        } catch (error) {
          console.error('❌ Error saving project tracking:', error);
        }
        return current; // No modificar el estado
      });
      
      setTaskTracking(current => {
        try {
          const taskKey = getStorageKey('taskTimeTracking');
          localStorage.setItem(taskKey, JSON.stringify(Object.fromEntries(current)));
        } catch (error) {
          console.error('❌ Error saving task tracking:', error);
        }
        return current; // No modificar el estado
      });
      
      // Log después de guardar todo
      console.log('💾 Time tracking data saved for userId:', userId);
    }, 5000); // Cada 5 segundos
    
    return () => clearInterval(saveInterval);
  }, [userId, getStorageKey]);

  // ============================================
  // ⏱️ Actualización en tiempo real
  // ============================================
  
  useEffect(() => {
    const hasActiveTracking = 
      Array.from(folderTracking.values()).some(t => t.currentSession?.isRunning) ||
      Array.from(projectTracking.values()).some(t => t.currentSession?.isRunning) ||
      Array.from(taskTracking.values()).some(t => t.currentSession?.isRunning);

    if (hasActiveTracking) {
      intervalRef.current = setInterval(() => {
        const now = new Date().toISOString();
        
        // Actualizar carpetas
        setFolderTracking(prev => {
          const updated = new Map(prev);
          let hasChanges = false;
          
          updated.forEach((tracking, id) => {
            if (tracking.currentSession?.isRunning && !tracking.currentSession?.isPaused) {
              const startTime = new Date(tracking.currentSession.startTime).getTime();
              const elapsed = Math.floor((Date.now() - startTime) / 1000);
              tracking.currentSession.duration = elapsed;
              tracking.totalTimeSpent = elapsed;
              hasChanges = true;
            }
          });
          
          return hasChanges ? new Map(updated) : prev;
        });
        
        // Actualizar proyectos
        setProjectTracking(prev => {
          const updated = new Map(prev);
          let hasChanges = false;
          
          updated.forEach((tracking, id) => {
            if (tracking.currentSession?.isRunning && !tracking.currentSession?.isPaused) {
              const startTime = new Date(tracking.currentSession.startTime).getTime();
              const elapsed = Math.floor((Date.now() - startTime) / 1000);
              tracking.currentSession.duration = elapsed;
              tracking.totalTimeSpent = elapsed;
              hasChanges = true;
            }
          });
          
          return hasChanges ? new Map(updated) : prev;
        });
        
        // Actualizar tareas
        setTaskTracking(prev => {
          const updated = new Map(prev);
          let hasChanges = false;
          
          updated.forEach((tracking, id) => {
            if (tracking.currentSession?.isRunning && !tracking.currentSession?.isPaused) {
              const startTime = new Date(tracking.currentSession.startTime).getTime();
              const elapsed = Math.floor((Date.now() - startTime) / 1000);
              tracking.currentSession.duration = elapsed;
              tracking.totalTimeSpent = elapsed;
              hasChanges = true;
            }
          });
          
          return hasChanges ? new Map(updated) : prev;
        });
        
        setUpdateTrigger(prev => prev + 1);
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
      }
    };
  }, [folderTracking, projectTracking, taskTracking]);

  // ============================================
  // � FUNCIÓN DE GUARDADO MANUAL
  // ============================================
  
  const saveToLocalStorage = useCallback(() => {
    if (!userId) return;
    
    try {
      const folderKey = getStorageKey('folderTimeTracking');
      const projectKey = getStorageKey('projectTimeTracking');
      const taskKey = getStorageKey('taskTimeTracking');
      
      // Guardar directamente desde los estados actuales
      setFolderTracking(current => {
        localStorage.setItem(folderKey, JSON.stringify(Object.fromEntries(current)));
        return current;
      });
      setProjectTracking(current => {
        localStorage.setItem(projectKey, JSON.stringify(Object.fromEntries(current)));
        return current;
      });
      setTaskTracking(current => {
        localStorage.setItem(taskKey, JSON.stringify(Object.fromEntries(current)));
        return current;
      });
      
      console.log('💾 Manual save completed for userId:', userId);
    } catch (error) {
      console.error('❌ Error in manual save:', error);
    }
  }, [userId, getStorageKey]);

  // ============================================
  // �📁 FUNCIONES DE CARPETAS
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
          canPause: true,
        });
      }
      
      return new Map(updated);
    });
    
    console.log('🎬 Carpeta iniciada:', folderId);
    
    // Guardar inmediatamente después de iniciar
    setTimeout(() => saveToLocalStorage(), 100);
  }, [saveToLocalStorage]);

  const stopFolderTracking = useCallback((folderId: string) => {
    setFolderTracking(prev => {
      const updated = new Map(prev);
      const tracking = updated.get(folderId);
      
      if (tracking?.currentSession?.isRunning) {
        tracking.currentSession.isRunning = false;
        tracking.currentSession.endTime = new Date().toISOString();
        tracking.sessions.push({ ...tracking.currentSession });
        tracking.currentSession = undefined;
      }
      
      return new Map(updated);
    });
    
    console.log('⏹️ Carpeta detenida:', folderId);
    
    // Guardar inmediatamente después de detener
    setTimeout(() => saveToLocalStorage(), 100);
  }, [saveToLocalStorage]);

  const pauseFolderTracking = useCallback((folderId: string, userId: string) => {
    setFolderTracking(prev => {
      const updated = new Map(prev);
      const tracking = updated.get(folderId);
      
      if (tracking?.currentSession?.isRunning && !tracking.currentSession.isPaused) {
        tracking.currentSession.isPaused = true;
        tracking.currentSession.pauseStartTime = new Date().toISOString();
      }
      
      return new Map(updated);
    });
  }, []);

  const resumeFolderTracking = useCallback((folderId: string) => {
    setFolderTracking(prev => {
      const updated = new Map(prev);
      const tracking = updated.get(folderId);
      
      if (tracking?.currentSession?.isPaused && tracking.currentSession.pauseStartTime) {
        const pauseStart = new Date(tracking.currentSession.pauseStartTime).getTime();
        const pauseDuration = Math.floor((Date.now() - pauseStart) / 1000);
        tracking.currentSession.pausedDuration += pauseDuration;
        tracking.currentSession.isPaused = false;
        delete tracking.currentSession.pauseStartTime;
      }
      
      return new Map(updated);
    });
  }, []);

  const getFolderTracking = useCallback((folderId: string): FolderTimeTracking | null => {
    return folderTracking.get(folderId) || null;
  }, [folderTracking]);

  // ============================================
  // 📊 FUNCIONES DE PROYECTOS
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
      
      return new Map(updated);
    });
    
    console.log('🎬 Proyecto iniciado:', projectId, 'Modo:', mode);
    
    // Guardar inmediatamente
    setTimeout(() => saveToLocalStorage(), 100);
  }, [saveToLocalStorage]);

  const stopProjectTracking = useCallback((projectId: string) => {
    setProjectTracking(prev => {
      const updated = new Map(prev);
      const tracking = updated.get(projectId);
      
      if (tracking?.currentSession?.isRunning) {
        tracking.currentSession.isRunning = false;
        tracking.currentSession.endTime = new Date().toISOString();
        tracking.sessions.push({ ...tracking.currentSession });
        tracking.currentSession = undefined;
      }
      
      return new Map(updated);
    });
    
    console.log('⏹️ Proyecto detenido:', projectId);
    
    // Guardar inmediatamente
    setTimeout(() => saveToLocalStorage(), 100);
  }, [saveToLocalStorage]);

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
      
      return new Map(updated);
    });
  }, []);

  // ============================================
  // ✅ FUNCIONES DE TAREAS
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
          estimatedDuration: 0,
          actualDuration: 0,
          isOverdue: false,
        });
      }
      
      return new Map(updated);
    });
    
    console.log('🎬 Tarea iniciada:', taskId);
    
    // Guardar inmediatamente
    setTimeout(() => saveToLocalStorage(), 100);
  }, [saveToLocalStorage]);

  const stopTaskTracking = useCallback((taskId: string) => {
    setTaskTracking(prev => {
      const updated = new Map(prev);
      const tracking = updated.get(taskId);
      
      if (tracking?.currentSession?.isRunning) {
        tracking.currentSession.isRunning = false;
        tracking.currentSession.endTime = new Date().toISOString();
        tracking.sessions.push({ ...tracking.currentSession });
        tracking.actualDuration = tracking.totalTimeSpent;
        tracking.currentSession = undefined;
      }
      
      return new Map(updated);
    });
    
    console.log('⏹️ Tarea detenida:', taskId);
    
    // Guardar inmediatamente
    setTimeout(() => saveToLocalStorage(), 100);
  }, [saveToLocalStorage]);

  const pauseTaskTracking = useCallback((taskId: string) => {
    setTaskTracking(prev => {
      const updated = new Map(prev);
      const tracking = updated.get(taskId);
      
      if (tracking?.currentSession?.isRunning && !tracking.currentSession.isPaused) {
        tracking.currentSession.isPaused = true;
        tracking.currentSession.pauseStartTime = new Date().toISOString();
      }
      
      return new Map(updated);
    });
  }, []);

  const resumeTaskTracking = useCallback((taskId: string) => {
    setTaskTracking(prev => {
      const updated = new Map(prev);
      const tracking = updated.get(taskId);
      
      if (tracking?.currentSession?.isPaused && tracking.currentSession.pauseStartTime) {
        const pauseStart = new Date(tracking.currentSession.pauseStartTime).getTime();
        const pauseDuration = Math.floor((Date.now() - pauseStart) / 1000);
        tracking.currentSession.pausedDuration += pauseDuration;
        tracking.currentSession.isPaused = false;
        delete tracking.currentSession.pauseStartTime;
      }
      
      return new Map(updated);
    });
  }, []);

  const getTaskTracking = useCallback((taskId: string): TaskTimeTracking | null => {
    return taskTracking.get(taskId) || null;
  }, [taskTracking]);

  const canCompleteTask = useCallback((taskId: string): boolean => {
    const tracking = taskTracking.get(taskId);
    if (!tracking?.mustPlayToComplete) return true;
    return tracking.hasPlayedAtLeastOnce || false;
  }, [taskTracking]);

  // ============================================
  // 📈 MÉTRICAS Y ESTADÍSTICAS
  // ============================================
  
  const calculateVelocity = useCallback((itemId: string, type: 'folder' | 'project' | 'task'): WorkVelocityMetrics | null => {
    // Implementación básica
    return null;
  }, []);

  const predictCompletionDate = useCallback((itemId: string, type: 'folder' | 'project' | 'task'): Date | null => {
    // Implementación básica
    return null;
  }, []);

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

  const value: TimeTrackingContextType = {
    startFolderTracking,
    stopFolderTracking,
    pauseFolderTracking,
    resumeFolderTracking,
    getFolderTracking,
    startProjectTracking,
    stopProjectTracking,
    getProjectTracking,
    updateProjectMode,
    startTaskTracking,
    stopTaskTracking,
    pauseTaskTracking,
    resumeTaskTracking,
    getTaskTracking,
    canCompleteTask,
    calculateVelocity,
    predictCompletionDate,
    getAllActiveTracking,
    formatDuration,
    getTimeRemaining,
  };

  return (
    <TimeTrackingContext.Provider value={value}>
      {children}
    </TimeTrackingContext.Provider>
  );
}

export function useTimeTracking() {
  const context = useContext(TimeTrackingContext);
  if (context === undefined) {
    throw new Error('useTimeTracking must be used within a TimeTrackingProvider');
  }
  return context;
}
