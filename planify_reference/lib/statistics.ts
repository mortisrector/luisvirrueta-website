import { Project, Folder, Task, DailyTask, Module } from '@/types';

// Función para calcular el progreso de una tarea
export function calculateTaskProgress(task: Task): number {
  if (task.type === 'subjective') {
    return task.done ? 100 : (task.score0to1 || 0) * 100;
  } else if (task.type === 'numeric') {
    if (!task.target || task.target === 0) return 0;
    return Math.min(100, ((task.current || 0) / task.target) * 100);
  }
  return 0;
}

// Función para calcular el progreso de un módulo
export function calculateModuleProgress(module: Module): number {
  if (module.tasks.length === 0) return 0;
  
  const totalProgress = module.tasks.reduce((sum, task) => {
    return sum + calculateTaskProgress(task);
  }, 0);
  
  return totalProgress / module.tasks.length;
}

// Función para calcular el progreso de un proyecto
export function calculateProjectProgress(project: Project): {
  progress: number;
  totalTasks: number;
  completedTasks: number;
  averageProgress: number;
} {
  // Para la estructura actual simple, usamos directamente el progreso del proyecto
  const progress = project.progress || 0;
  const totalItems = project.items || 0;
  const completedItems = project.completedItems || 0;
  
  return {
    progress: progress,
    totalTasks: totalItems,
    completedTasks: completedItems,
    averageProgress: progress
  };
}

// Función para calcular estadísticas de una carpeta
export function calculateFolderStats(folder: Folder, projects: Project[]): {
  totalProjects: number;
  completedProjects: number;
  averageProgress: number;
  totalTasks: number;
  completedTasks: number;
} {
  const folderProjects = projects.filter(p => p.folderId === folder.id);
  
  if (folderProjects.length === 0) {
    return {
      totalProjects: 0,
      completedProjects: 0,
      averageProgress: 0,
      totalTasks: 0,
      completedTasks: 0
    };
  }

  let totalProgress = 0;
  let completedProjects = 0;
  let totalTasks = 0;
  let completedTasks = 0;

  folderProjects.forEach(project => {
    const stats = calculateProjectProgress(project);
    
    totalProgress += stats.progress;
    totalTasks += stats.totalTasks;
    completedTasks += stats.completedTasks;
    
    // Considerar proyecto completado si tiene >= 90% de progreso
    if (stats.progress >= 90) {
      completedProjects++;
    }
  });

  return {
    totalProjects: folderProjects.length,
    completedProjects,
    averageProgress: Math.round(totalProgress / folderProjects.length),
    totalTasks,
    completedTasks
  };
}

// Función para calcular estadísticas globales
export function calculateGlobalStats(projects: Project[], folders: Folder[], dailyTasks: DailyTask[]): {
  totalProjects: number;
  completedProjects: number;
  averageProjectProgress: number;
  totalTasks: number;
  completedTasks: number;
  totalDailyTasks: number;
  completedDailyTasks: number;
  dailyTasksCompletionRate: number;
  overallProgress: number;
} {
  // Estadísticas de proyectos
  let totalProjectProgress = 0;
  let completedProjects = 0;
  let totalTasks = 0;
  let completedTasks = 0;

  projects.forEach(project => {
    const stats = calculateProjectProgress(project);
    
    totalProjectProgress += stats.progress;
    totalTasks += stats.totalTasks;
    completedTasks += stats.completedTasks;
    
    if (stats.progress >= 90) {
      completedProjects++;
    }
  });

  const averageProjectProgress = projects.length > 0 ? totalProjectProgress / projects.length : 0;

  // Estadísticas de tareas diarias
  const completedDailyTasks = dailyTasks.filter(task => {
    if (task.type === 'boolean') return task.completed;
    if (task.type === 'numeric') return (task.current || 0) >= (task.target || 1);
    if (task.type === 'subjective') return (task.score0to1 || 0) >= 0.6;
    return false;
  }).length;

  const dailyTasksCompletionRate = dailyTasks.length > 0 ? 
    (completedDailyTasks / dailyTasks.length) * 100 : 0;

  // Progreso general combinado (70% proyectos, 30% tareas diarias)
  const overallProgress = (averageProjectProgress * 0.7) + (dailyTasksCompletionRate * 0.3);

  return {
    totalProjects: projects.length,
    completedProjects,
    averageProjectProgress: Math.round(averageProjectProgress),
    totalTasks,
    completedTasks,
    totalDailyTasks: dailyTasks.length,
    completedDailyTasks,
    dailyTasksCompletionRate: Math.round(dailyTasksCompletionRate),
    overallProgress: Math.round(overallProgress)
  };
}

// Función para detectar usuarios que no han cumplido tareas
export function getOverdueNotifications(projects: Project[], dailyTasks: DailyTask[]): {
  type: 'project' | 'daily' | 'task';
  title: string;
  description: string;
  assignedTo?: string[];
  projectId?: string;
  taskId?: string;
  urgency: 'low' | 'medium' | 'high';
}[] {
  const notifications: any[] = [];
  const now = new Date();

  // Revisar tareas diarias no completadas
  dailyTasks.forEach(task => {
    const isCompleted = task.type === 'boolean' ? task.completed :
      task.type === 'numeric' ? (task.current || 0) >= (task.target || 1) :
      (task.score0to1 || 0) >= 0.6;

    if (!isCompleted && task.assignedTo?.length) {
      notifications.push({
        type: 'daily',
        title: `Tarea diaria pendiente: ${task.title}`,
        description: 'Esta tarea diaria no ha sido completada hoy',
        assignedTo: (task as any).assignedTo?.map((u: any) => u.name) || [],
        taskId: task.id,
        urgency: 'medium'
      });
    }
  });

  // Revisar proyectos con bajo progreso
  projects.forEach(project => {
    const stats = calculateProjectProgress(project);
    
    if (stats.progress < 20 && project.assignedTo?.length) {
      notifications.push({
        type: 'project',
        title: `Proyecto estancado: ${project.title}`,
        description: `Solo ${stats.progress}% de progreso`,
        assignedTo: (project as any).assignedTo?.map((u: any) => u.name) || [],
        projectId: project.id,
        urgency: 'high'
      });
    }

    // Revisar tareas específicas atrasadas - comentado por compatibilidad
    // TODO: Implementar cuando tengamos estructura de modules/tasks
    /*
    project.modules.forEach(module => {
      module.tasks.forEach(task => {
        const progress = calculateTaskProgress(task);
        if (progress < 50 && task.assignedTo?.length) {
          notifications.push({
            type: 'task',
            title: `Tarea atrasada: ${task.title}`,
            description: `En proyecto: ${project.title}`,
            assignedTo: (task as any).assignedTo?.map((u: any) => u.name) || [],
            projectId: project.id,
            taskId: task.id,
            urgency: 'medium'
          });
        }
      });
    });
    */
  });

  return notifications;
}

// Función para calcular racha de un proyecto
export function calculateProjectStreak(project: Project): number {
  // Esta función necesitaría datos históricos, por ahora retorno el valor actual
  return project.streak || 0;
}

// Función para actualizar progreso de proyecto automáticamente
export function updateProjectProgress(project: Project): Project {
  const stats = calculateProjectProgress(project);
  
  return {
    ...project,
    progress: stats.progress,
    items: stats.totalTasks,
    updatedAt: new Date().toISOString()
  };
}