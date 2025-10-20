import { DailyTask, Project, Folder } from '@/types';

export interface TaskWeight {
  taskId: string;
  weight: number;
  complexity: number;
  type: 'boolean' | 'numeric' | 'subjective' | 'text';
}

export interface ProjectProgress {
  projectId: string;
  progress: number;
  totalWeight: number;
  completedWeight: number;
  taskCount: number;
  completedTasks: number;
}

export interface FolderProgress {
  folderId: string;
  progress: number;
  totalWeight: number;
  completedWeight: number;
  projectCount: number;
  averageProjectProgress: number;
}

/**
 * Calcula el peso dinámico de una tarea basado en su tipo y complejidad
 */
export function calculateTaskWeight(task: DailyTask): TaskWeight {
  let weight = 1; // Peso base mínimo
  let complexity = 1;

  switch (task.type) {
    case 'boolean':
      // Tareas booleanas: peso base (checklist simple)
      weight = 1;
      complexity = 1;
      break;

    case 'numeric':
      // Tareas numéricas: peso basado en el objetivo
      const target = task.target || 1;
      
      // Diferentes escalas según la unidad
      if (task.unit) {
        const unit = task.unit.toLowerCase();
        
        if (unit.includes('pág') || unit.includes('page')) {
          // Páginas: cada página tiene peso significativo
          weight = Math.max(1, Math.floor(target / 10)); // 1 punto por cada 10 páginas
          complexity = target;
        } else if (unit.includes('min') || unit.includes('hour') || unit.includes('hr')) {
          // Tiempo: peso moderado
          weight = Math.max(1, Math.floor(target / 30)); // 1 punto por cada 30 minutos
          complexity = target;
        } else if (unit.includes('rep') || unit.includes('ejercicio')) {
          // Repeticiones/ejercicios: peso bajo
          weight = Math.max(1, Math.floor(target / 50)); // 1 punto por cada 50 reps
          complexity = target;
        } else if (unit.includes('km') || unit.includes('mile')) {
          // Distancia: peso moderado-alto
          weight = Math.max(1, Math.floor(target * 2)); // 2 puntos por km
          complexity = target;
        } else {
          // Unidad desconocida: usar target directo con límite
          weight = Math.max(1, Math.min(Math.floor(target / 10), 50));
          complexity = target;
        }
      } else {
        // Sin unidad específica: usar target con escala moderada
        weight = Math.max(1, Math.floor(target / 10));
        complexity = target;
      }
      break;

    case 'subjective':
      // Tareas subjetivas: peso basado en la escala y dificultad implícita
      // Si no hay score, asumir complejidad media-alta
      const hasDescription = task.description && task.description.length > 0;
      const descriptionLength = task.description?.length || 0;
      
      // Peso base por complejidad subjetiva
      weight = 3; // Base más alta que boolean
      
      // Ajustar por descripción (indicador de complejidad)
      if (descriptionLength > 100) {
        weight += 2; // Descripción larga = más compleja
      } else if (descriptionLength > 50) {
        weight += 1;
      }
      
      // Si tiene palabras clave de complejidad
      const description = task.description?.toLowerCase() || '';
      const complexityKeywords = [
        'análisis', 'investigación', 'estudio', 'proyecto', 'desarrollo',
        'diseño', 'planificación', 'estrategia', 'evaluación', 'optimización'
      ];
      
      const hasComplexKeywords = complexityKeywords.some(keyword => 
        description.includes(keyword)
      );
      
      if (hasComplexKeywords) {
        weight += 2;
      }
      
      complexity = weight;
      break;
  }

  // Límites de peso para evitar extremos
  weight = Math.max(1, Math.min(weight, 100)); // Entre 1 y 100

  return {
    taskId: task.id,
    weight,
    complexity,
    type: task.type
  };
}

/**
 * Determina si una tarea está completada
 */
export function isTaskCompleted(task: DailyTask): boolean {
  switch (task.type) {
    case 'boolean':
      return task.completed || false;
    
    case 'numeric':
      const current = task.current || 0;
      const target = task.target || 1;
      return current >= target;
    
    case 'subjective':
      // Consideramos completada solo si score = 1.0 (100% - 10 estrellas)
      return (task.score0to1 || 0) >= 1.0;
    
    default:
      return false;
  }
}

/**
 * Calcula el progreso parcial de una tarea (0-1)
 */
export function getTaskProgress(task: DailyTask): number {
  switch (task.type) {
    case 'boolean':
      return task.completed ? 1 : 0;
    
    case 'numeric':
      const current = task.current || 0;
      const target = task.target || 1;
      return Math.min(current / target, 1);
    
    case 'subjective':
      return task.score0to1 || 0;
    
    default:
      return 0;
  }
}

/**
 * Calcula el progreso de un proyecto basado en sus tareas con pesos dinámicos
 */
export function calculateProjectProgress(projectId: string, tasks: DailyTask[]): ProjectProgress {
  const projectTasks = tasks.filter(task => task.projectId === projectId);
  
  if (projectTasks.length === 0) {
    return {
      projectId,
      progress: 0,
      totalWeight: 0,
      completedWeight: 0,
      taskCount: 0,
      completedTasks: 0
    };
  }

  let totalWeight = 0;
  let completedWeight = 0;
  let completedTasks = 0;

  for (const task of projectTasks) {
    const taskWeight = calculateTaskWeight(task);
    const taskProgress = getTaskProgress(task);
    
    totalWeight += taskWeight.weight;
    completedWeight += taskWeight.weight * taskProgress;
    
    if (isTaskCompleted(task)) {
      completedTasks++;
    }
  }

  const progress = totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;

  return {
    projectId,
    progress: Math.round(progress * 100) / 100, // Redondear a 2 decimales
    totalWeight,
    completedWeight,
    taskCount: projectTasks.length,
    completedTasks
  };
}

/**
 * Calcula el progreso de una carpeta basado en sus proyectos
 */
export function calculateFolderProgress(
  folder: Folder, 
  projects: Project[], 
  tasks: DailyTask[]
): FolderProgress {
  const folderProjects = projects.filter(project => 
    (folder.projectIds || []).includes(project.id)
  );

  if (folderProjects.length === 0) {
    return {
      folderId: folder.id,
      progress: 0,
      totalWeight: 0,
      completedWeight: 0,
      projectCount: 0,
      averageProjectProgress: 0
    };
  }

  let totalWeight = 0;
  let completedWeight = 0;
  let totalProgress = 0;

  for (const project of folderProjects) {
    const projectProgress = calculateProjectProgress(project.id, tasks);
    
    // El peso de un proyecto es la suma de los pesos de sus tareas
    const projectWeight = projectProgress.totalWeight || 1; // Mínimo 1 para proyectos sin tareas
    
    totalWeight += projectWeight;
    completedWeight += projectWeight * (projectProgress.progress / 100);
    totalProgress += projectProgress.progress;
  }

  const progress = totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;
  const averageProjectProgress = folderProjects.length > 0 ? totalProgress / folderProjects.length : 0;

  return {
    folderId: folder.id,
    progress: Math.round(progress * 100) / 100,
    totalWeight,
    completedWeight,
    projectCount: folderProjects.length,
    averageProjectProgress: Math.round(averageProjectProgress * 100) / 100
  };
}

/**
 * Calcula estadísticas detalladas de una tarea para debugging
 */
export function getTaskAnalysis(task: DailyTask): {
  weight: TaskWeight;
  progress: number;
  completed: boolean;
  analysis: string;
} {
  const weight = calculateTaskWeight(task);
  const progress = getTaskProgress(task);
  const completed = isTaskCompleted(task);

  let analysis = `Tarea "${task.title}" (${task.type}): `;
  
  switch (task.type) {
    case 'boolean':
      analysis += `Checklist simple, peso base = ${weight.weight}`;
      break;
    case 'numeric':
      analysis += `Objetivo: ${task.current || 0}/${task.target || 1} ${task.unit || 'unidades'}, peso = ${weight.weight} (basado en complejidad ${weight.complexity})`;
      break;
    case 'subjective':
      analysis += `Evaluación subjetiva: ${((task.score0to1 || 0) * 100).toFixed(1)}%, peso = ${weight.weight} (basado en complejidad estimada)`;
      break;
  }

  return { weight, progress, completed, analysis };
}