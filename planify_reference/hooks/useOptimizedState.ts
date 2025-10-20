import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Project, Folder, DailyTask } from '@/types';
import { 
  optimizedProjects, 
  optimizedFolders, 
  optimizedDailyTasks,
  calculateProjectProgress,
  updateProjectProgress 
} from '@/lib/optimizedMockData';

// Hook optimizado para gestionar proyectos
export const useOptimizedProjects = () => {
  const [projects, setProjects] = useState<Project[]>(() => {
    return optimizedProjects.map(updateProjectProgress);
  });

  // Memoized project operations
  const updateProject = useCallback((projectId: string, updates: Partial<Project>) => {
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === projectId 
          ? updateProjectProgress({ ...project, ...updates })
          : project
      )
    );
  }, []);

  const addProject = useCallback((newProject: Project) => {
    const projectWithProgress = updateProjectProgress(newProject);
    setProjects(prevProjects => [projectWithProgress, ...prevProjects]);
  }, []);

  const deleteProject = useCallback((projectId: string) => {
    setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
  }, []);

  // Memoized computed values
  const projectStats = useMemo(() => {
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.progress >= 100).length;
    const avgProgress = totalProjects > 0 
      ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / totalProjects)
      : 0;
  const totalTasks = projects.reduce((sum, p) => sum + (p.items || 0), 0);

    return {
      totalProjects,
      completedProjects,
      avgProgress,
      totalTasks,
      completionRate: totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0
    };
  }, [projects]);

  return {
    projects,
    updateProject,
    addProject,
    deleteProject,
    projectStats
  };
};

// Hook optimizado para gestionar carpetas
export const useOptimizedFolders = () => {
  const [folders, setFolders] = useState<Folder[]>(optimizedFolders);

  const updateFolder = useCallback((folderId: string, updates: Partial<Folder>) => {
    setFolders(prevFolders => 
      prevFolders.map(folder => 
        folder.id === folderId 
          ? { ...folder, ...updates, updatedAt: new Date().toISOString() }
          : folder
      )
    );
  }, []);

  const addFolder = useCallback((newFolder: Folder) => {
    setFolders(prevFolders => [newFolder, ...prevFolders]);
  }, []);

  const deleteFolder = useCallback((folderId: string) => {
    setFolders(prevFolders => prevFolders.filter(f => f.id !== folderId));
  }, []);

  return {
    folders,
    updateFolder,
    addFolder,
    deleteFolder
  };
};

// Hook optimizado para gestionar tareas diarias
export const useOptimizedDailyTasks = () => {
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(optimizedDailyTasks);

  const updateDailyTask = useCallback((taskId: string, updates: Partial<DailyTask>) => {
    setDailyTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      )
    );
  }, []);

  const completeDailyTask = useCallback((taskId: string) => {
    setDailyTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              completed: true,
              streak: (task.streak || 0) + 1,
              lastCompletedDate: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          : task
      )
    );
  }, []);

  const addDailyTask = useCallback((newTask: DailyTask) => {
    setDailyTasks(prevTasks => [newTask, ...prevTasks]);
  }, []);

  // Memoized daily task stats
  const dailyTaskStats = useMemo(() => {
    const totalTasks = dailyTasks.length;
    const completedToday = dailyTasks.filter(task => {
      if (!task.lastCompletedDate) return false;
      const lastCompleted = new Date(task.lastCompletedDate);
      const today = new Date();
      return lastCompleted.toDateString() === today.toDateString();
    }).length;

    const avgStreak = totalTasks > 0 
      ? Math.round(dailyTasks.reduce((sum, task) => sum + (task.streak || 0), 0) / totalTasks)
      : 0;

    return {
      totalTasks,
      completedToday,
      completionRate: totalTasks > 0 ? (completedToday / totalTasks) * 100 : 0,
      avgStreak
    };
  }, [dailyTasks]);

  return {
    dailyTasks,
    updateDailyTask,
    completeDailyTask,
    addDailyTask,
    dailyTaskStats
  };
};

// Hook optimizado para estadísticas globales
export const useGlobalStats = (projects: Project[], dailyTasks: DailyTask[]) => {
  return useMemo(() => {
    // Calcular progreso global
    const totalProjects = projects.length;
    const globalProgress = totalProjects > 0 
      ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / totalProjects)
      : 0;

    // Calcular racha global (días consecutivos con actividad)
    const globalStreak = Math.max(
      ...projects.map(p => p.streak || 0),
      ...dailyTasks.map(t => t.streak || 0),
      0
    );

    // Calcular productividad (tareas completadas en la última semana)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const recentActivity = [
      ...projects.filter(p => p.updatedAt && new Date(p.updatedAt) > lastWeek),
      ...dailyTasks.filter(t => t.lastCompletedDate && new Date(t.lastCompletedDate) > lastWeek)
    ].length;

    // Calcular logros desbloqueados
    const achievements = [];
    if (globalProgress >= 25) achievements.push('Primer 25%');
    if (globalProgress >= 50) achievements.push('Mitad del camino');
    if (globalProgress >= 75) achievements.push('Casi ahí');
    if (globalProgress >= 100) achievements.push('¡Completado!');
    if (globalStreak >= 7) achievements.push('Racha semanal');
    if (globalStreak >= 30) achievements.push('Racha mensual');

    return {
      globalProgress,
      globalStreak,
      recentActivity,
      achievements,
      totalProjects,
      totalDailyTasks: dailyTasks.length
    };
  }, [projects, dailyTasks]);
};

// Hook para optimizar renders y evitar re-renders innecesarios
export const useDebounced = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook para memoizar búsquedas y filtros
export const useOptimizedSearch = <T>(
  items: T[], 
  searchTerm: string, 
  searchFields: (keyof T)[]
) => {
  const debouncedSearchTerm = useDebounced(searchTerm, 300);

  return useMemo(() => {
    if (!debouncedSearchTerm.trim()) return items;

    return items.filter(item => 
      searchFields.some(field => {
        const value = item[field];
        return typeof value === 'string' && 
               value.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      })
    );
  }, [items, debouncedSearchTerm, searchFields]);
};

// Hook para manejar estados de UI complejos de forma optimizada
export const useUIState = () => {
  const [uiState, setUIState] = useState({
    showDashboard: false,
    showShareModal: false,
    showCreateModal: false,
    showSettingsModal: false,
    activeView: 'home' as string,
    isLoading: false
  });

  const updateUIState = useCallback((updates: Partial<typeof uiState>) => {
    setUIState(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleModal = useCallback((modalName: keyof typeof uiState) => {
    setUIState(prev => ({ ...prev, [modalName]: !prev[modalName] }));
  }, []);

  return {
    uiState,
    updateUIState,
    toggleModal
  };
};