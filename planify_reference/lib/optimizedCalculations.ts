import { Project, Module, Task, MetricType } from '@/types';

// Cache para evitar recálculos innecesarios
const progressCache = new Map<string, { result: number; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Función optimizada para calcular progreso de tareas
export const calculateTaskProgress = (task: Task): number => {
  switch (task.type) {
    case 'subjective':
      return task.score0to1 !== undefined ? task.score0to1 * 100 : 0;
    case 'numeric':
      if (task.target && task.current !== undefined) {
        return Math.min(100, (task.current / task.target) * 100);
      }
      return 0;
    default:
      return 0;
  }
};

// Función optimizada para calcular progreso de módulos con cache
export const calculateModuleProgress = (mod: Module): number => {
  const cacheKey = `module-${mod.id}-${mod.tasks.map(t => `${t.id}-${t.updatedAt}`).join(',')}`;
  const cached = progressCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.result;
  }

  if (!mod.tasks || mod.tasks.length === 0) return 0;
  
  let totalProgress = 0;
  
  for (const task of mod.tasks) {
    totalProgress += calculateTaskProgress(task);
  }
  
  const result = Math.round(totalProgress / mod.tasks.length);
  
  // Guardar en cache
  progressCache.set(cacheKey, { result, timestamp: Date.now() });
  
  return result;
};

// Función optimizada para calcular progreso de proyectos con pesos
export const calculateProjectProgress = (project: Project): number => {
  const cacheKey = `project-${project.id}-${project.updatedAt}`;
  const cached = progressCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.result;
  }

  if (!project.modules || project.modules.length === 0) return 0;
  
  let totalWeight = 0;
  let weightedProgress = 0;
  
  for (const mod of project.modules) {
    const moduleWeight = mod.weight || 1;
    const moduleProgress = calculateModuleProgress(mod);
    
    totalWeight += moduleWeight;
    weightedProgress += moduleProgress * moduleWeight;
  }
  
  const result = totalWeight > 0 ? Math.round(weightedProgress / totalWeight) : 0;
  
  // Guardar en cache
  progressCache.set(cacheKey, { result, timestamp: Date.now() });
  
  return result;
};

// Función para limpiar cache viejo
export const cleanProgressCache = (): void => {
  const now = Date.now();
  for (const [key, value] of Array.from(progressCache.entries())) {
    if (now - value.timestamp > CACHE_DURATION) {
      progressCache.delete(key);
    }
  }
};

// Función optimizada para actualizar proyecto con nuevos cálculos
export const updateProjectWithProgress = (project: Project): Project => {
  const newProgress = calculateProjectProgress(project);
  const totalTasks = project.modules?.reduce((sum: number, mod: Module) => sum + mod.tasks.length, 0) || 0;
  
  return {
    ...project,
    progress: newProgress,
    items: totalTasks,
    updatedAt: new Date().toISOString()
  };
};

// Funciones de utilidad para estadísticas avanzadas
export const calculateProjectStats = (projects: Project[]) => {
  if (projects.length === 0) {
    return {
      totalProjects: 0,
      averageProgress: 0,
      completedProjects: 0,
      totalTasks: 0,
      completionRate: 0,
      mostActiveProject: null,
      progressDistribution: { low: 0, medium: 0, high: 0, completed: 0 }
    };
  }

  const totalProjects = projects.length;
  const totalProgress = projects.reduce((sum, p) => sum + (p.progress || 0), 0);
  const averageProgress = Math.round(totalProgress / totalProjects);
  const completedProjects = projects.filter(p => (p.progress || 0) >= 100).length;
  const totalTasks = projects.reduce((sum, p) => sum + (p.items || 0), 0);
  const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;

  // Encontrar proyecto más activo (más modificado recientemente)
  const mostActiveProject = projects.reduce((latest, current) => {
    const currDate = current.updatedAt ? new Date(current.updatedAt) : new Date(0);
    const latestDate = latest.updatedAt ? new Date(latest.updatedAt) : new Date(0);
    return currDate > latestDate ? current : latest;
  }, projects[0]);

  // Distribución de progreso
  const progressDistribution = projects.reduce(
    (dist, project) => {
      const progress = project.progress || 0;
      if (progress >= 100) dist.completed++;
      else if (progress >= 75) dist.high++;
      else if (progress >= 25) dist.medium++;
      else dist.low++;
      return dist;
    },
    { low: 0, medium: 0, high: 0, completed: 0 }
  );

  return {
    totalProjects,
    averageProgress,
    completedProjects,
    totalTasks,
    completionRate,
    mostActiveProject,
    progressDistribution
  };
};

// Función para calcular tendencias de productividad
export const calculateProductivityTrends = (projects: Project[]): {
  dailyProgress: number[];
  weeklyAverage: number;
  trend: 'up' | 'down' | 'stable';
} => {
  // Simular datos de los últimos 7 días basados en la actividad del proyecto
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - i));
    
    // Calcular actividad del día basada en actualizaciones de proyectos
    const dayActivity = projects.filter(project => {
      const updatedDate = project.updatedAt ? new Date(project.updatedAt) : new Date(0);
      return updatedDate.toDateString() === day.toDateString();
    }).length;
    
    return Math.min(100, dayActivity * 25); // Convertir a porcentaje
  });

  const weeklyAverage = last7Days.reduce((sum, day) => sum + day, 0) / 7;
  
  // Calcular tendencia comparando primera y segunda mitad de la semana
  const firstHalf = last7Days.slice(0, 3).reduce((sum, day) => sum + day, 0) / 3;
  const secondHalf = last7Days.slice(4).reduce((sum, day) => sum + day, 0) / 3;
  
  let trend: 'up' | 'down' | 'stable' = 'stable';
  const difference = secondHalf - firstHalf;
  
  if (difference > 5) trend = 'up';
  else if (difference < -5) trend = 'down';

  return {
    dailyProgress: last7Days,
    weeklyAverage: Math.round(weeklyAverage),
    trend
  };
};

// Función para calcular milestones y logros
export const calculateAchievements = (projects: Project[]): Array<{
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
}> => {
  const stats = calculateProjectStats(projects);
  
  return [
    {
      id: 'first-project',
      title: 'Primer Proyecto',
      description: 'Crea tu primer proyecto',
      icon: '🎯',
      unlocked: stats.totalProjects > 0
    },
    {
      id: 'project-25',
      title: '25% Progreso',
      description: 'Alcanza 25% en cualquier proyecto',
      icon: '🚀',
      unlocked: projects.some(p => (p.progress || 0) >= 25),
      progress: projects.length > 0 ? Math.max(...projects.map(p => p.progress || 0)) : 0
    },
    {
      id: 'project-50',
      title: 'Mitad del Camino',
      description: 'Alcanza 50% en cualquier proyecto',
      icon: '⭐',
      unlocked: projects.some(p => (p.progress || 0) >= 50)
    },
    {
      id: 'project-complete',
      title: 'Proyecto Completado',
      description: 'Completa tu primer proyecto al 100%',
      icon: '🏆',
      unlocked: stats.completedProjects > 0
    },
    {
      id: 'multi-project',
      title: 'Multitarea',
      description: 'Gestiona 3 proyectos simultáneamente',
      icon: '🎭',
      unlocked: stats.totalProjects >= 3
    },
    {
      id: 'productivity-streak',
      title: 'Racha Productiva',
      description: 'Mantén actividad durante 7 días',
      icon: '🔥',
      unlocked: projects.some(p => (p.streak || 0) >= 7)
    }
  ];
};

// Función de utilidad para formatear números
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Función para generar colores dinámicos basados en progreso
export const getProgressColor = (progress: number): string => {
  if (progress >= 100) return 'from-emerald-500 to-green-600';
  if (progress >= 75) return 'from-blue-500 to-cyan-500';
  if (progress >= 50) return 'from-yellow-500 to-orange-500';
  if (progress >= 25) return 'from-orange-500 to-red-500';
  return 'from-gray-500 to-slate-500';
};

// Auto-limpieza del cache cada 10 minutos
setInterval(cleanProgressCache, 10 * 60 * 1000);