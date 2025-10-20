import { Task, Module, Project, Recognition, MilestoneMessage } from '@/types';
import { MILESTONES } from './milestones';

/**
 * Calcula el progreso de una tarea individual
 */
export function calculateTaskProgress(task: Task): number {
  if (task.type === 'numeric') {
    if (!task.target || task.target === 0) return 0;
    return Math.min((task.current || 0) / task.target, 1);
  } else {
    // subjective
    if (task.done) return 1;
    return task.score0to1 || 0;
  }
}

/**
 * Calcula el progreso de un módulo basado en sus tareas
 */
export function calculateModuleProgress(module: Module): number {
  if (module.tasks.length === 0) return 0;
  
  const totalProgress = module.tasks.reduce((sum, task) => {
    return sum + calculateTaskProgress(task);
  }, 0);
  
  return totalProgress / module.tasks.length;
}

/**
 * Calcula el progreso de un proyecto basado en sus módulos ponderados
 */
export function calculateProjectProgress(project: Project): number {
  if (project.modules.length === 0) return 0;
  
  let totalWeightedProgress = 0;
  let totalWeight = 0;
  
  project.modules.forEach((module: Module) => {
    const weight = module.weight || 1;
    const progress = calculateModuleProgress(module);
    totalWeightedProgress += progress * weight;
    totalWeight += weight;
  });
  
  return totalWeight > 0 ? (totalWeightedProgress / totalWeight) : 0;
}

/**
 * Calcula el progreso global basado en todos los proyectos activos
 */
export function calculateGlobalProgress(projects: Project[]): number {
  const activeProjects = projects.filter(p => p.badge !== 'Pausa');
  if (activeProjects.length === 0) return 0;
  
  const totalProgress = activeProjects.reduce((sum, project) => {
    return sum + (calculateProjectProgress(project) * 100);
  }, 0);
  
  return Math.round(totalProgress / activeProjects.length);
}

/**
 * Obtiene los hitos cruzados entre dos porcentajes
 */
export function getCrossedMilestones(prevPct: number, nextPct: number): MilestoneMessage[] {
  const from = Math.floor(prevPct / 10) * 10;
  const to = Math.floor(nextPct / 10) * 10;
  
  return MILESTONES.filter(m => m.threshold > from && m.threshold <= to);
}

/**
 * Aplica el incremento de 1% a un proyecto
 */
export function applyOnePercent(project: Project): {
  updated: Project;
  recognitions: Recognition[];
  messages: MilestoneMessage[];
} {
  const prevProgress = calculateProjectProgress(project) * 100;
  
  // Buscar la primera tarea incompleta para incrementar
  let targetTask: Task | null = null;
  let targetModule: Module | null = null;
  
  for (const mod of project.modules) {
    for (const task of mod.tasks) {
      const taskProgress = calculateTaskProgress(task);
      if (taskProgress < 1) {
        targetTask = task;
        targetModule = mod;
        break;
      }
    }
    if (targetTask) break;
  }
  
  if (!targetTask || !targetModule) {
    // No hay tareas por completar
    return {
      updated: project,
      recognitions: [],
      messages: []
    };
  }
  
  // Incrementar la tarea
  const updatedTask = { ...targetTask };
  
  if (updatedTask.type === 'numeric') {
    const increment = (updatedTask.target || 0) * 0.01;
    updatedTask.current = Math.min((updatedTask.current || 0) + increment, updatedTask.target || 0);
  } else {
    // subjective
    if (updatedTask.score0to1 !== undefined) {
      updatedTask.score0to1 = Math.min((updatedTask.score0to1 || 0) + 0.01, 1);
    } else {
      updatedTask.score0to1 = 0.01;
    }
  }
  
  updatedTask.updatedAt = new Date().toISOString();
  
  // Actualizar el proyecto
  const updatedProject = {
    ...project,
  modules: project.modules.map((mod: Module) => 
      mod.id === targetModule.id
        ? {
            ...mod,
            tasks: mod.tasks.map((task: Task) => 
              task.id === updatedTask.id ? updatedTask : task
            )
          }
        : mod
    ),
    updatedAt: new Date().toISOString()
  };
  
  // Recalcular progreso
  const newProgress = calculateProjectProgress(updatedProject) * 100;
  updatedProject.progress = Math.round(newProgress);
  
  // Verificar hitos cruzados
  const crossedMilestones = getCrossedMilestones(prevProgress, newProgress);
  
  // Crear reconocimientos
  const recognitions: Recognition[] = crossedMilestones.map(milestone => ({
    id: `${project.id}-${milestone.threshold}-${Date.now()}`,
    title: milestone.title,
    icon: milestone.icon,
    date: new Date().toISOString(),
    scope: 'project' as const,
    projectId: project.id
  }));
  
  return {
    updated: updatedProject,
    recognitions,
    messages: crossedMilestones
  };
}