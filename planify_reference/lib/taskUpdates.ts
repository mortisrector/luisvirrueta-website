import { Project, Folder, Task, DailyTask, Module } from '@/types';
import { 
  calculateProjectProgress, 
  calculateFolderStats, 
  calculateGlobalStats, 
  updateProjectProgress 
} from './statistics';

// Función para actualizar una tarea y propagar cambios
export function updateTaskAndPropagate(
  taskId: string,
  moduleId: string,
  projectId: string,
  projects: Project[],
  folders: Folder[],
  taskUpdates: Partial<Task>
): {
  updatedProjects: Project[];
  globalStats: any;
} {
  // Encontrar y actualizar la tarea
  const updatedProjects = projects.map((project: Project) => {
    if (project.id !== projectId) return project;

  const updatedModules = project.modules.map((module: Module) => {
      if (module.id !== moduleId) return module;

  const updatedTasks = module.tasks.map((task: Task) => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          ...taskUpdates,
          updatedAt: new Date().toISOString()
        };
      });

      return {
        ...module,
        tasks: updatedTasks
      };
    });

    // Recalcular progreso del proyecto
    const projectWithNewModules = {
      ...project,
      modules: updatedModules
    };

    return updateProjectProgress(projectWithNewModules);
  });

  // Calcular nuevas estadísticas globales
  const globalStats = calculateGlobalStats(updatedProjects, folders, []);

  return {
    updatedProjects,
    globalStats
  };
}

// Función para actualizar tarea diaria
export function updateDailyTaskAndPropagate(
  taskId: string,
  dailyTasks: DailyTask[],
  projects: Project[],
  folders: Folder[],
  taskUpdates: Partial<DailyTask>
): {
  updatedDailyTasks: DailyTask[];
  globalStats: any;
} {
  // Actualizar la tarea diaria
  const updatedDailyTasks = dailyTasks.map((task: DailyTask) => {
    if (task.id !== taskId) return task;
    
    const updatedTask = {
      ...task,
      ...taskUpdates,
      updatedAt: new Date().toISOString()
    };

    // Si se completó, actualizar la racha
    if (taskUpdates.completed || 
        (taskUpdates.current && taskUpdates.current >= (task.target || 1)) ||
        (taskUpdates.score0to1 && taskUpdates.score0to1 >= 0.6)) {
      
      // Verificar si es el primer completado de hoy
      const today = new Date().toDateString();
  const lastCompleted = (task as any).lastCompletedDate ? new Date((task as any).lastCompletedDate).toDateString() : '';
      
      if (lastCompleted !== today) {
  updatedTask.streak = (task.streak || 0) + 1;
  (updatedTask as any).lastCompletedDate = new Date().toISOString();
      }
    }

    return updatedTask;
  });

  // Calcular nuevas estadísticas globales
  const globalStats = calculateGlobalStats(projects, folders, updatedDailyTasks);

  return {
    updatedDailyTasks,
    globalStats
  };
}

// Función para agregar nueva tarea a proyecto
export function addTaskToProject(
  projectId: string,
  moduleId: string,
  newTask: Omit<Task, 'id' | 'updatedAt'>,
  projects: Project[]
): Project[] {
  return projects.map((project: Project) => {
    if (project.id !== projectId) return project;

  const updatedModules = project.modules.map((module: Module) => {
      if (module.id !== moduleId) return module;

      const taskWithId: Task = {
        title: newTask.title,
        type: newTask.type,
        ...newTask,
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        updatedAt: new Date().toISOString()
      } as Task;

      return {
        ...module,
        tasks: [...module.tasks, taskWithId]
      };
    });

    const projectWithNewTasks = {
      ...project,
      modules: updatedModules
    };

    return updateProjectProgress(projectWithNewTasks);
  });
}

// Función para eliminar tarea de proyecto
export function removeTaskFromProject(
  projectId: string,
  moduleId: string,
  taskId: string,
  projects: Project[]
): Project[] {
  return projects.map((project: Project) => {
    if (project.id !== projectId) return project;

  const updatedModules = project.modules.map((module: Module) => {
      if (module.id !== moduleId) return module;

      return {
        ...module,
        tasks: module.tasks.filter(task => task.id !== taskId)
      };
    });

    const projectWithRemovedTask = {
      ...project,
      modules: updatedModules
    };

    return updateProjectProgress(projectWithRemovedTask);
  });
}

// Función para agregar proyecto a carpeta
export function addProjectToFolder(
  folderId: string,
  newProject: Omit<Project, 'id' | 'updatedAt'>,
  projects: Project[],
  folders: Folder[]
): {
  updatedProjects: Project[];
  updatedFolders: Folder[];
} {
  const projectWithId: Project = {
    title: newProject.title,
    progress: 0,
    ...newProject,
    id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    folderId,
    updatedAt: new Date().toISOString(),
    items: (newProject as any).items || 0,
    streak: (newProject as any).streak || 0
  } as Project;

  const updatedProjects = [...projects, projectWithId];

  const updatedFolders = folders.map((folder: Folder) => {
    if (folder.id !== folderId) return folder;
    
    return {
      ...folder,
  projectIds: [...(folder.projectIds || []), projectWithId.id],
      updatedAt: new Date().toISOString()
    };
  });

  return {
    updatedProjects,
    updatedFolders
  };
}

// Función para mover proyecto entre carpetas
export function moveProjectToFolder(
  projectId: string,
  oldFolderId: string | undefined,
  newFolderId: string,
  projects: Project[],
  folders: Folder[]
): {
  updatedProjects: Project[];
  updatedFolders: Folder[];
} {
  // Actualizar proyecto
  const updatedProjects = projects.map(project => {
    if (project.id !== projectId) return project;
    
    return {
      ...project,
      folderId: newFolderId,
      updatedAt: new Date().toISOString()
    };
  });

  // Actualizar carpetas
  const updatedFolders = folders.map(folder => {
    // Remover de carpeta anterior
    if (folder.id === oldFolderId) {
      return {
        ...folder,
  projectIds: (folder.projectIds || []).filter((id: string) => id !== projectId),
        updatedAt: new Date().toISOString()
      };
    }
    
    // Agregar a nueva carpeta
    if (folder.id === newFolderId) {
      return {
        ...folder,
  projectIds: [...(folder.projectIds || []), projectId],
        updatedAt: new Date().toISOString()
      };
    }
    
    return folder;
  });

  return {
    updatedProjects,
    updatedFolders
  };
}

// Función para calcular notificaciones de usuarios atrasados
export function getTeamNotifications(
  projects: Project[],
  dailyTasks: DailyTask[]
): {
  userId: string;
  userName: string;
  notifications: {
    type: 'overdue_task' | 'low_progress' | 'missed_daily';
    message: string;
    urgency: 'low' | 'medium' | 'high';
    projectId?: string;
    taskId?: string;
  }[];
}[] {
  const userNotifications: { [userId: string]: any } = {};

  // Revisar tareas de proyectos
  projects.forEach((project: Project) => {
  project.modules.forEach((module: Module) => {
  module.tasks.forEach((task: Task) => {
        if (task.assignedTo?.length) {
          (task.assignedTo || []).forEach((user: any) => {
            if (!userNotifications[user.id]) {
              userNotifications[user.id] = {
                userId: user.id,
                userName: user.name,
                notifications: []
              };
            }

            // Verificar progreso bajo
            const progress = task.type === 'subjective' 
              ? (task.done ? 100 : (task.score0to1 || 0) * 100)
              : Math.min(100, ((task.current || 0) / (task.target || 1)) * 100);

            if (progress < 50) {
              userNotifications[user.id].notifications.push({
                type: 'low_progress',
                message: `Tarea "${task.title}" con bajo progreso (${Math.round(progress)}%)`,
                urgency: progress < 25 ? 'high' : 'medium',
                projectId: project.id,
                taskId: task.id
              });
            }
          });
        }
      });
    });
  });

  // Revisar tareas diarias
  dailyTasks.forEach((task: DailyTask) => {
    if (task.assignedTo?.length) {
      const isCompleted = task.type === 'boolean' ? task.completed :
        task.type === 'numeric' ? (task.current || 0) >= (task.target || 1) :
        (task.score0to1 || 0) >= 0.6;

      if (!isCompleted) {
  (task.assignedTo || []).forEach((user: any) => {
          if (!userNotifications[user.id]) {
            userNotifications[user.id] = {
              userId: user.id,
              userName: user.name,
              notifications: []
            };
          }

          userNotifications[user.id].notifications.push({
            type: 'missed_daily',
            message: `Tarea diaria "${task.title}" sin completar`,
            urgency: 'medium',
            taskId: task.id
          });
        });
      }
    }
  });

  return Object.values(userNotifications);
}