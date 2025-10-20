import { useMemo } from 'react';
import { DailyTask, Project, Folder } from '@/types';
import { 
  calculateProjectProgress, 
  calculateFolderProgress,
  ProjectProgress,
  FolderProgress,
  getTaskAnalysis
} from '@/lib/progressCalculation';

interface UseProgressCalculationProps {
  projects: Project[];
  folders: Folder[];
  tasks: DailyTask[];
}

interface UseProgressCalculationReturn {
  // Progreso por proyecto
  getProjectProgress: (projectId: string) => ProjectProgress;
  getAllProjectProgress: () => Record<string, ProjectProgress>;
  
  // Progreso por carpeta
  getFolderProgress: (folderId: string) => FolderProgress;
  getAllFolderProgress: () => Record<string, FolderProgress>;
  
  // Análisis detallado
  getTaskAnalysis: (taskId: string) => ReturnType<typeof getTaskAnalysis> | null;
  
  // Estadísticas globales
  globalStats: {
    totalTasks: number;
    completedTasks: number;
    totalProjects: number;
    completedProjects: number;
    overallProgress: number;
  };
}

/**
 * Hook personalizado para calcular progreso dinámico en toda la jerarquía
 */
export function useProgressCalculation({
  projects,
  folders,
  tasks
}: UseProgressCalculationProps): UseProgressCalculationReturn {
  
  // Memoizar cálculos de progreso de proyectos
  const projectProgressMap = useMemo(() => {
    const progressMap: Record<string, ProjectProgress> = {};
    
    for (const project of projects) {
      progressMap[project.id] = calculateProjectProgress(project.id, tasks);
    }
    
    return progressMap;
  }, [projects, tasks]);

  // Memoizar cálculos de progreso de carpetas
  const folderProgressMap = useMemo(() => {
    const progressMap: Record<string, FolderProgress> = {};
    
    for (const folder of folders) {
      progressMap[folder.id] = calculateFolderProgress(folder, projects, tasks);
    }
    
    return progressMap;
  }, [folders, projects, tasks]);

  // Estadísticas globales
  const globalStats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = Object.values(projectProgressMap).reduce(
      (acc, proj) => acc + proj.completedTasks, 0
    );

    const totalProjects = projects.length;
    const completedProjects = Object.values(projectProgressMap).filter(
      proj => proj.progress >= 100
    ).length;

    const overallProgress = totalProjects > 0 
      ? Object.values(projectProgressMap).reduce(
          (acc, proj) => acc + proj.progress, 0
        ) / totalProjects
      : 0;

    return {
      totalTasks,
      completedTasks,
      totalProjects,
      completedProjects,
      overallProgress: Math.round(overallProgress * 100) / 100
    };
  }, [projectProgressMap, projects.length, tasks.length]);

  // Funciones helper
  const getProjectProgress = (projectId: string): ProjectProgress => {
    return projectProgressMap[projectId] || {
      projectId,
      progress: 0,
      totalWeight: 0,
      completedWeight: 0,
      taskCount: 0,
      completedTasks: 0
    };
  };

  const getAllProjectProgress = (): Record<string, ProjectProgress> => {
    return projectProgressMap;
  };

  const getFolderProgress = (folderId: string): FolderProgress => {
    return folderProgressMap[folderId] || {
      folderId,
      progress: 0,
      totalWeight: 0,
      completedWeight: 0,
      projectCount: 0,
      averageProjectProgress: 0
    };
  };

  const getAllFolderProgress = (): Record<string, FolderProgress> => {
    return folderProgressMap;
  };

  const getTaskAnalysisById = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    return task ? getTaskAnalysis(task) : null;
  };

  return {
    getProjectProgress,
    getAllProjectProgress,
    getFolderProgress,
    getAllFolderProgress,
    getTaskAnalysis: getTaskAnalysisById,
    globalStats
  };
}

/**
 * Hook simplificado para obtener solo el progreso de un proyecto específico
 */
export function useProjectProgress(projectId: string, tasks: DailyTask[]): ProjectProgress {
  return useMemo(() => {
    return calculateProjectProgress(projectId, tasks);
  }, [projectId, tasks]);
}

/**
 * Hook simplificado para obtener solo el progreso de una carpeta específica
 */
export function useFolderProgress(
  folder: Folder, 
  projects: Project[], 
  tasks: DailyTask[]
): FolderProgress {
  return useMemo(() => {
    return calculateFolderProgress(folder, projects, tasks);
  }, [folder, projects, tasks]);
}