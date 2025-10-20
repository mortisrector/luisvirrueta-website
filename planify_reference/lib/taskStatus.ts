// Helpers de estado y métricas para tareas
// Tipos soportados: boolean, subjective, numeric
// Estados: overdue (vencida), due-today (vence hoy), upcoming (próx 7 días), no-date

import { DailyTask } from '@/types';

export type TaskTemporalStatus = 'overdue' | 'due-today' | 'upcoming' | 'no-date';

export function isTaskOverdue(task: Partial<DailyTask>): boolean {
  if (!task.dueDate) return false;
  if (task.completed) return false; // no contamos completadas como vencidas
  const today = new Date();
  const taskDate = new Date(task.dueDate);
  // Normalizar a medianoche local
  taskDate.setHours(0,0,0,0);
  today.setHours(0,0,0,0);
  return taskDate < today;
}

export function getTaskTemporalStatus(task: Partial<DailyTask>): TaskTemporalStatus {
  if (!task.dueDate) return 'no-date';
  if (isTaskOverdue(task)) return 'overdue';
  const today = new Date();
  const taskDate = new Date(task.dueDate);
  taskDate.setHours(0,0,0,0);
  today.setHours(0,0,0,0);
  const diffDays = (taskDate.getTime() - today.getTime()) / (1000*60*60*24);
  if (diffDays === 0) return 'due-today';
  if (diffDays > 0 && diffDays <= 7) return 'upcoming';
  return 'no-date';
}

// Normaliza assignedTo asegurando que siempre sea array consistente
export function normalizeTaskMembers(task: Partial<DailyTask>): any[] {
  if (!task) return [];
  const assigned = (task as any).assignedTo;
  if (!assigned) return [];
  if (Array.isArray(assigned)) return assigned;
  return [assigned];
}

export interface AggregatedMetrics {
  total: number;
  completed: number;
  overdue: number;
  dueToday: number;
  upcoming: number;
  noDate: number;
  progressPercent: number; // completadas / total (solo boolean) mezclado con subjetivas/numerics aproximado
}

export function aggregateTaskMetrics(tasks: Partial<DailyTask>[]): AggregatedMetrics {
  const metrics: AggregatedMetrics = {
    total: tasks.length,
    completed: 0,
    overdue: 0,
    dueToday: 0,
    upcoming: 0,
    noDate: 0,
    progressPercent: 0
  };
  if (tasks.length === 0) return metrics;
  let weightedProgressSum = 0; // sumatoria de progreso 0..1
  tasks.forEach(t => {
    const status = getTaskTemporalStatus(t);
    switch(status){
      case 'overdue': metrics.overdue++; break;
      case 'due-today': metrics.dueToday++; break;
      case 'upcoming': metrics.upcoming++; break;
      case 'no-date': metrics.noDate++; break;
    }
    // Progreso según tipo
    if ((t as any).type === 'boolean') {
      const done = (t as any).completed ? 1 : 0;
      weightedProgressSum += done;
      if (done) metrics.completed++;
    } else if ((t as any).type === 'subjective') {
      const score = typeof (t as any).score0to1 === 'number' ? (t as any).score0to1 : 0;
      weightedProgressSum += score;
      if (score >= 1) metrics.completed++;
    } else if ((t as any).type === 'numeric') {
      const current = typeof (t as any).current === 'number' ? (t as any).current : 0;
      const target = typeof (t as any).target === 'number' && (t as any).target! > 0 ? (t as any).target! : 1;
      const ratio = Math.min(1, current / target);
      weightedProgressSum += ratio;
      if (ratio >= 1) metrics.completed++;
    }
  });
  metrics.progressPercent = parseFloat(((weightedProgressSum / tasks.length) * 100).toFixed(1));
  return metrics;
}
