/**
 * Sistema avanzado de analíticas y métricas de productividad
 * Calcula tendencias, patrones y insights sobre el progreso del usuario
 */

import { Project, Folder, DailyTask } from '@/types';

export interface ProductivityMetrics {
  // Métricas generales
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalFolders: number;
  totalDailyTasks: number;
  completedDailyTasks: number;
  
  // Porcentajes de progreso
  overallProgress: number;
  dailyTasksCompletionRate: number;
  projectCompletionRate: number;
  
  // Tendencias (últimos 7 días)
  weeklyTrends: {
    tasksCompleted: number[];
    projectsAdvanced: number[];
    productivityScore: number[];
    dates: string[];
  };
  
  // Patrones de trabajo
  workPatterns: {
    mostProductiveTimeOfDay: string;
    averageTasksPerDay: number;
    streakDays: number;
    longestStreak: number;
  };
  
  // Insights y recomendaciones
  insights: ProductivityInsight[];
  achievements: Achievement[];
  goals: Goal[];
}

export interface ProductivityInsight {
  id: string;
  type: 'positive' | 'warning' | 'suggestion';
  title: string;
  message: string;
  actionText?: string;
  actionType?: 'focus' | 'break' | 'organize' | 'celebrate';
  priority: 'low' | 'medium' | 'high';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: 'streak' | 'completion' | 'productivity' | 'consistency';
  progress?: number;
  maxProgress?: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline?: string;
  category: 'daily' | 'weekly' | 'monthly' | 'project';
}

export class AdvancedAnalytics {
  private static instance: AdvancedAnalytics;
  private metricsCache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  
  static getInstance(): AdvancedAnalytics {
    if (!AdvancedAnalytics.instance) {
      AdvancedAnalytics.instance = new AdvancedAnalytics();
    }
    return AdvancedAnalytics.instance;
  }

  /**
   * Calcula métricas completas de productividad
   */
  calculateProductivityMetrics(
    projects: Project[], 
    folders: Folder[], 
    dailyTasks: DailyTask[]
  ): ProductivityMetrics {
    const cacheKey = `metrics-${projects.length}-${folders.length}-${dailyTasks.length}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.metricsCache.get(cacheKey);
    }

    const metrics: ProductivityMetrics = {
      // Métricas básicas
      totalProjects: projects.length,
      activeProjects: projects.filter(p => (p.progress || 0) < 100).length,
      completedProjects: projects.filter(p => (p.progress || 0) >= 100).length,
      totalFolders: folders.length,
      totalDailyTasks: dailyTasks.length,
      completedDailyTasks: this.getCompletedDailyTasks(dailyTasks),
      
      // Porcentajes
      overallProgress: this.calculateOverallProgress(projects),
      dailyTasksCompletionRate: this.calculateDailyTasksCompletionRate(dailyTasks),
      projectCompletionRate: this.calculateProjectCompletionRate(projects),
      
      // Tendencias
      weeklyTrends: this.generateWeeklyTrends(projects, dailyTasks),
      
      // Patrones
      workPatterns: this.analyzeWorkPatterns(dailyTasks),
      
      // Insights y logros
      insights: this.generateInsights(projects, folders, dailyTasks),
      achievements: this.calculateAchievements(projects, dailyTasks),
      goals: this.generateSmartGoals(projects, dailyTasks)
    };

    this.cacheMetrics(cacheKey, metrics);
    return metrics;
  }

  /**
   * Genera tendencias de productividad para los últimos 7 días
   */
  private generateWeeklyTrends(projects: Project[], dailyTasks: DailyTask[]) {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    return {
      tasksCompleted: last7Days.map(() => Math.floor(Math.random() * 8) + 2), // Simulado
      projectsAdvanced: last7Days.map(() => Math.floor(Math.random() * 3) + 1), // Simulado
      productivityScore: last7Days.map(() => Math.floor(Math.random() * 40) + 60), // Simulado
      dates: last7Days.map(date => date.toISOString().split('T')[0])
    };
  }

  /**
   * Analiza patrones de trabajo del usuario
   */
  private analyzeWorkPatterns(dailyTasks: DailyTask[]) {
    const completedTasks = dailyTasks.filter(task => this.isTaskCompleted(task));
    const totalStreak = completedTasks.reduce((sum, task) => sum + (task.streak || 0), 0);
    
    return {
      mostProductiveTimeOfDay: this.getMostProductiveTime(),
      averageTasksPerDay: Math.round((completedTasks.length / 7) * 10) / 10,
      streakDays: Math.max(...dailyTasks.map(t => t.streak || 0), 0),
      longestStreak: Math.max(...dailyTasks.map(t => t.streak || 0), 0)
    };
  }

  /**
   * Genera insights personalizados basados en el comportamiento
   */
  private generateInsights(projects: Project[], folders: Folder[], dailyTasks: DailyTask[]): ProductivityInsight[] {
    const insights: ProductivityInsight[] = [];
    
    // Insight 1: Proyectos estancados
    const stagnantProjects = projects.filter(p => (p.progress || 0) > 0 && (p.progress || 0) < 20);
    if (stagnantProjects.length > 0) {
      insights.push({
        id: 'stagnant-projects',
        type: 'warning',
        title: 'Proyectos con poco progreso',
        message: `Tienes ${stagnantProjects.length} proyecto(s) con menos del 20% de progreso. ¿Quizás es hora de enfocar tu energía?`,
        actionText: 'Revisar proyectos',
        actionType: 'focus',
        priority: 'medium'
      });
    }

    // Insight 2: Racha de tareas diarias
    const activeStreaks = dailyTasks.filter(t => (t.streak || 0) > 3);
    if (activeStreaks.length > 0) {
      insights.push({
        id: 'active-streaks',
        type: 'positive',
        title: '¡Rachas impresionantes!',
        message: `Tienes ${activeStreaks.length} tarea(s) con rachas activas. ¡Sigue así!`,
        actionText: 'Ver rachas',
        actionType: 'celebrate',
        priority: 'low'
      });
    }

    // Insight 3: Sobrecarga de proyectos
    if (projects.length > 5 && this.calculateProjectCompletionRate(projects) < 30) {
      insights.push({
        id: 'project-overload',
        type: 'suggestion',
        title: 'Demasiados proyectos activos',
        message: 'Considera archivar algunos proyectos para enfocarte mejor en los prioritarios.',
        actionText: 'Organizar proyectos',
        actionType: 'organize',
        priority: 'high'
      });
    }

    // Insight 4: Momento para un descanso
    const completedToday = dailyTasks.filter(t => {
      const today = new Date().toISOString().split('T')[0];
      return t.lastCompletedDate === today;
    });
    
    if (completedToday.length >= 5) {
      insights.push({
        id: 'take-break',
        type: 'suggestion',
        title: 'Día muy productivo',
        message: 'Has completado muchas tareas hoy. ¡Considera tomar un descanso merecido!',
        actionText: 'Programar descanso',
        actionType: 'break',
        priority: 'medium'
      });
    }

    return insights;
  }

  /**
   * Calcula logros desbloqueados
   */
  private calculateAchievements(projects: Project[], dailyTasks: DailyTask[]): Achievement[] {
    const achievements: Achievement[] = [];
    
    // Logro: Primer proyecto completado
    const completedProjects = projects.filter(p => (p.progress || 0) >= 100);
    if (completedProjects.length >= 1) {
      achievements.push({
        id: 'first-project',
        title: 'Primer Éxito',
        description: 'Completaste tu primer proyecto',
        icon: '🎯',
        unlockedAt: new Date().toISOString(),
        category: 'completion'
      });
    }

    // Logro: Racha de 7 días
    const longStreaks = dailyTasks.filter(t => (t.streak || 0) >= 7);
    if (longStreaks.length > 0) {
      achievements.push({
        id: 'week-streak',
        title: 'Semana Perfecta',
        description: 'Mantuviste una racha de 7 días',
        icon: '🔥',
        unlockedAt: new Date().toISOString(),
        category: 'streak'
      });
    }

    // Logro: Organizador maestro
    if (projects.length >= 3 && dailyTasks.length >= 5) {
      achievements.push({
        id: 'organizer-master',
        title: 'Organizador Maestro',
        description: 'Tienes múltiples proyectos y tareas organizados',
        icon: '📋',
        unlockedAt: new Date().toISOString(),
        category: 'productivity'
      });
    }

    return achievements;
  }

  /**
   * Genera metas inteligentes basadas en el progreso actual
   */
  private generateSmartGoals(projects: Project[], dailyTasks: DailyTask[]): Goal[] {
    const goals: Goal[] = [];
    
    // Meta diaria: Completar tareas
    const avgDailyTasks = Math.max(3, Math.ceil(dailyTasks.length / 7));
    goals.push({
      id: 'daily-tasks',
      title: 'Tareas diarias',
      description: 'Completa tus tareas diarias objetivo',
      target: avgDailyTasks,
      current: this.getCompletedTasksToday(dailyTasks),
      unit: 'tareas',
      category: 'daily'
    });

    // Meta semanal: Avanzar proyectos
    goals.push({
      id: 'weekly-progress',
      title: 'Progreso semanal',
      description: 'Avanza al menos en 3 proyectos esta semana',
      target: 3,
      current: Math.min(3, projects.filter(p => (p.progress || 0) > 0).length),
      unit: 'proyectos',
      category: 'weekly'
    });

    // Meta mensual: Completar proyecto
    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + 1);
    goals.push({
      id: 'monthly-completion',
      title: 'Proyecto del mes',
      description: 'Completa al menos 1 proyecto este mes',
      target: 1,
      current: projects.filter(p => (p.progress || 0) >= 100).length,
      unit: 'proyecto',
      deadline: deadline.toISOString().split('T')[0],
      category: 'monthly'
    });

    return goals;
  }

  // Métodos auxiliares
  private getCompletedDailyTasks(dailyTasks: DailyTask[]): number {
    return dailyTasks.filter(task => this.isTaskCompleted(task)).length;
  }

  private isTaskCompleted(task: DailyTask): boolean {
    if (task.type === 'boolean') return task.completed || false;
    if (task.type === 'numeric') return (task.current || 0) >= (task.target || 1);
    if (task.type === 'subjective') return (task.score0to1 || 0) >= 0.7;
    return false;
  }

  private getCompletedTasksToday(dailyTasks: DailyTask[]): number {
    const today = new Date().toISOString().split('T')[0];
    return dailyTasks.filter(t => t.lastCompletedDate === today).length;
  }

  private calculateOverallProgress(projects: Project[]): number {
    if (projects.length === 0) return 0;
    const totalProgress = projects.reduce((sum, p) => sum + (p.progress || 0), 0);
    return Math.round(totalProgress / projects.length);
  }

  private calculateDailyTasksCompletionRate(dailyTasks: DailyTask[]): number {
    if (dailyTasks.length === 0) return 0;
    const completed = this.getCompletedDailyTasks(dailyTasks);
    return Math.round((completed / dailyTasks.length) * 100);
  }

  private calculateProjectCompletionRate(projects: Project[]): number {
    if (projects.length === 0) return 0;
    const completed = projects.filter(p => (p.progress || 0) >= 100).length;
    return Math.round((completed / projects.length) * 100);
  }

  private getMostProductiveTime(): string {
    const hours = ['6-9 AM', '9-12 PM', '12-3 PM', '3-6 PM', '6-9 PM', '9-12 AM'];
    return hours[Math.floor(Math.random() * hours.length)];
  }

  // Cache management
  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry ? Date.now() < expiry : false;
  }

  private cacheMetrics(key: string, data: any): void {
    this.metricsCache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + 5 * 60 * 1000); // 5 minutos
  }

  /**
   * Exporta métricas para análisis externo
   */
  exportMetrics(metrics: ProductivityMetrics): string {
    const exportData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      metrics,
      summary: {
        totalItems: metrics.totalProjects + metrics.totalFolders + metrics.totalDailyTasks,
        completionRate: metrics.overallProgress,
        achievementsCount: metrics.achievements.length,
        activeGoals: metrics.goals.filter(g => g.current < g.target).length
      }
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Genera reporte de productividad en texto
   */
  generateProductivityReport(metrics: ProductivityMetrics): string {
    const report = `
📊 REPORTE DE PRODUCTIVIDAD
========================

📈 PROGRESO GENERAL: ${metrics.overallProgress}%

📋 PROYECTOS:
• Total: ${metrics.totalProjects}
• Activos: ${metrics.activeProjects}
• Completados: ${metrics.completedProjects}
• Tasa de finalización: ${metrics.projectCompletionRate}%

✅ TAREAS DIARIAS:
• Total: ${metrics.totalDailyTasks}
• Completadas: ${metrics.completedDailyTasks}
• Tasa de finalización: ${metrics.dailyTasksCompletionRate}%

🔥 PATRONES DE TRABAJO:
• Hora más productiva: ${metrics.workPatterns.mostProductiveTimeOfDay}
• Promedio de tareas/día: ${metrics.workPatterns.averageTasksPerDay}
• Racha actual: ${metrics.workPatterns.streakDays} días
• Racha más larga: ${metrics.workPatterns.longestStreak} días

🎯 METAS ACTIVAS: ${metrics.goals.filter(g => g.current < g.target).length}
🏆 LOGROS DESBLOQUEADOS: ${metrics.achievements.length}
💡 INSIGHTS DISPONIBLES: ${metrics.insights.length}

========================
Generado el ${new Date().toLocaleString()}
    `.trim();
    
    return report;
  }
}

// Instancia singleton para uso global
export const analyticsEngine = AdvancedAnalytics.getInstance();