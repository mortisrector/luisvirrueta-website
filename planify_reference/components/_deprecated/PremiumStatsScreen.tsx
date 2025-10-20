'use client';

import React, { useState, useMemo } from 'react';
import { Project, DailyTask, Folder } from '@/types';
import { 
  ArrowLeft, Eye, Focus, TrendingUp, TrendingDown, Activity, Target, 
  BarChart3, PieChart, Clock, Calendar, Zap, Award, Trophy, Star,
  CheckCircle2, Circle, Flame, Crown, ChevronRight, Filter, MoreHorizontal,
  Users, BookOpen, Code, Briefcase, Heart, Gamepad2, Download, Share2
} from 'lucide-react';

interface PremiumStatsScreenProps {
  projects: Project[];
  dailyTasks: DailyTask[];
  folders: Folder[];
  globalStreak: number;
  onBack: () => void;
  onProjectClick?: (project: Project) => void;
  onTaskClick?: (task: DailyTask) => void;
  onExportStats?: () => void;
  onShareStats?: () => void;
}

interface StatDetail {
  id: string;
  name: string;
  value: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  category?: string;
  icon?: string;
  lastUpdate?: string;
}

type ViewMode = 'overview' | 'projects' | 'tasks' | 'insights' | 'focus';
type TimeRange = 'today' | 'week' | 'month' | 'year';

export default function PremiumStatsScreen({
  projects,
  dailyTasks,
  folders,
  globalStreak,
  onBack,
  onProjectClick,
  onTaskClick,
  onExportStats,
  onShareStats
}: PremiumStatsScreenProps) {
  const [activeView, setActiveView] = useState<ViewMode>('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [focusMode, setFocusMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  // Análisis de proyectos más y menos trabajados
  const projectAnalysis = useMemo(() => {
    const projectStats = projects.map(project => {
      // Simular análisis basado en progreso, streak y última actualización
      const workIntensity = Math.min(
        (project.progress * 0.4) + 
        (project.streak * 10) + 
        (project.title.length % 30), // Simular actividad reciente basada en título
        100
      );

      return {
        id: project.id,
        name: project.title,
        value: workIntensity,
        percentage: project.progress,
        trend: project.streak > 3 ? 'up' as const : project.streak === 0 ? 'down' as const : 'stable' as const,
        category: project.icon || 'general',
        icon: project.icon,
        lastUpdate: project.updatedAt
      };
    });

    const sorted = [...projectStats].sort((a, b) => b.value - a.value);
    
    return {
      mostWorked: sorted.slice(0, 5),
      leastWorked: sorted.slice(-5).reverse(),
      all: sorted
    };
  }, [projects]);

  // Análisis de tareas diarias
  const taskAnalysis = useMemo(() => {
    const taskStats = dailyTasks.map(task => {
      const completionRate = task.type === 'boolean' ? (task.completed ? 100 : 0) :
        task.type === 'numeric' ? Math.min(((task.current || 0) / (task.target || 1)) * 100, 100) :
        ((task.score0to1 || 0) * 100);

  const workIntensity = ((task.streak || 0) * 15) + completionRate;

      return {
        id: task.id,
        name: task.title,
        value: workIntensity,
        percentage: completionRate,
  trend: (task.streak || 0) > 7 ? 'up' as const : (task.streak || 0) === 0 ? 'down' as const : 'stable' as const,
        category: (task as any).category || 'general',
        lastUpdate: task.updatedAt
      };
    });

    const sorted = [...taskStats].sort((a, b) => b.value - a.value);
    
    return {
      mostWorked: sorted.slice(0, 5),
      leastWorked: sorted.slice(-5).reverse(),
      all: sorted
    };
  }, [dailyTasks]);

  // Estadísticas generales
  const overallStats = useMemo(() => {
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.progress >= 100).length;
    const activeProjects = projects.filter(p => p.progress > 0 && p.progress < 100).length;
    
    const totalTasks = dailyTasks.length;
    const completedTasks = dailyTasks.filter(task => {
      if (task.type === 'boolean') return task.completed;
      if (task.type === 'numeric') return (task.current || 0) >= (task.target || 1);
      return (task.score0to1 || 0) >= 0.6;
    }).length;

    const avgProjectProgress = totalProjects > 0 
      ? projects.reduce((sum, p) => sum + p.progress, 0) / totalProjects 
      : 0;

    const avgTaskStreak = totalTasks > 0
      ? dailyTasks.reduce((sum, t) => sum + (t.streak || 0), 0) / totalTasks
      : 0;

    return {
      totalProjects,
      completedProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      avgProjectProgress,
      avgTaskStreak,
      totalFolders: folders.length,
      globalStreak
    };
  }, [projects, dailyTasks, folders, globalStreak]);

  const viewTabs = [
    { id: 'overview', label: 'Resumen', icon: BarChart3 },
    { id: 'projects', label: 'Proyectos', icon: Trophy },
    { id: 'tasks', label: 'Tareas', icon: CheckCircle2 },
    { id: 'insights', label: 'Insights', icon: Eye },
    { id: 'focus', label: 'Enfoque', icon: Focus }
  ];

  const timeRanges = [
    { id: 'today', label: 'Hoy' },
    { id: 'week', label: 'Semana' },
    { id: 'month', label: 'Mes' },
    { id: 'year', label: 'Año' }
  ];

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-emerald-400';
      case 'down': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4" />;
      case 'down': return <TrendingDown className="w-4 h-4" />;
      default: return <MoreHorizontal className="w-4 h-4" />;
    }
  };

  const renderStatItem = (stat: StatDetail, onClick?: () => void) => (
    <div
      key={stat.id}
      onClick={onClick}
      className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 transition-all ${
        onClick ? 'cursor-pointer hover:bg-white/10 hover:border-white/20' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-white truncate flex-1">{stat.name}</h4>
        <div className={`flex items-center gap-1 ${getTrendColor(stat.trend)}`}>
          {getTrendIcon(stat.trend)}
          <span className="text-sm font-medium">{Math.round(stat.value)}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">Progreso</span>
          <span className="text-white">{Math.round(stat.percentage)}%</span>
        </div>
        
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-1000 ${
              stat.percentage >= 80 ? 'bg-gradient-to-r from-emerald-500 to-green-400' :
              stat.percentage >= 60 ? 'bg-gradient-to-r from-blue-500 to-cyan-400' :
              stat.percentage >= 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-400' :
              'bg-gradient-to-r from-red-500 to-pink-400'
            }`}
            style={{ width: `${Math.min(stat.percentage, 100)}%` }}
          />
        </div>
        
        {stat.category && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">Categoría:</span>
            <span className="text-xs text-white/60 capitalize">{stat.category}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              
              <div>
                <h1 className="text-xl font-bold text-white">Estadísticas Premium</h1>
                <p className="text-sm text-white/60">Análisis detallado y insights avanzados</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Focus Mode */}
              <button
                onClick={() => setFocusMode(!focusMode)}
                className={`p-2 rounded-xl transition-all ${
                  focusMode 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                <Focus className="w-5 h-5" />
              </button>

              {/* Export */}
              <button
                onClick={onExportStats}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Download className="w-5 h-5 text-white" />
              </button>
              
              {/* Share */}
              <button
                onClick={onShareStats}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Share2 className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="px-4 pb-4">
          <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
            {viewTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeView === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as ViewMode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 pb-20">
        {/* Overview */}
        {activeView === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                  <span className="text-2xl font-bold text-white">{overallStats.completedProjects}</span>
                </div>
                <p className="text-white/60 text-sm">Proyectos completados</p>
                <p className="text-xs text-yellow-400 mt-1">de {overallStats.totalProjects} totales</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  <span className="text-2xl font-bold text-white">{overallStats.completedTasks}</span>
                </div>
                <p className="text-white/60 text-sm">Tareas completadas</p>
                <p className="text-xs text-emerald-400 mt-1">de {overallStats.totalTasks} totales</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <Flame className="w-8 h-8 text-orange-400" />
                  <span className="text-2xl font-bold text-white">{overallStats.globalStreak}</span>
                </div>
                <p className="text-white/60 text-sm">Racha global</p>
                <p className="text-xs text-orange-400 mt-1">días consecutivos</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <BarChart3 className="w-8 h-8 text-purple-400" />
                  <span className="text-2xl font-bold text-white">{Math.round(overallStats.avgProjectProgress)}%</span>
                </div>
                <p className="text-white/60 text-sm">Progreso promedio</p>
                <p className="text-xs text-purple-400 mt-1">todos los proyectos</p>
              </div>
            </div>

            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => setActiveView('projects')}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Análisis de Proyectos</h3>
                      <p className="text-white/60 text-sm">Ver más y menos trabajados</p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-white/40 group-hover:text-white transition-colors" />
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{overallStats.activeProjects}</div>
                    <div className="text-xs text-white/60">Activos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-400">{overallStats.completedProjects}</div>
                    <div className="text-xs text-white/60">Completados</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">{Math.round(overallStats.avgProjectProgress)}%</div>
                    <div className="text-xs text-white/60">Promedio</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setActiveView('tasks')}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Análisis de Tareas</h3>
                      <p className="text-white/60 text-sm">Rendimiento y rachas</p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-white/40 group-hover:text-white transition-colors" />
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-purple-400">{overallStats.totalTasks}</div>
                    <div className="text-xs text-white/60">Total</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-400">{overallStats.completedTasks}</div>
                    <div className="text-xs text-white/60">Completadas</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-400">{Math.round(overallStats.avgTaskStreak)}</div>
                    <div className="text-xs text-white/60">Racha prom.</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Projects Analysis */}
        {activeView === 'projects' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Análisis de Proyectos</h2>
              <div className="flex gap-2">
                {timeRanges.map(range => (
                  <button
                    key={range.id}
                    onClick={() => setTimeRange(range.id as TimeRange)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      timeRange === range.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/10 text-white/70 hover:text-white'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Most Worked Projects */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Proyectos más trabajados
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectAnalysis.mostWorked.map(stat => 
                  renderStatItem(stat, () => {
                    const project = projects.find(p => p.id === stat.id);
                    if (project && onProjectClick) onProjectClick(project);
                  })
                )}
              </div>
            </div>

            {/* Least Worked Projects */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-400" />
                Proyectos menos trabajados
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectAnalysis.leastWorked.map(stat => 
                  renderStatItem(stat, () => {
                    const project = projects.find(p => p.id === stat.id);
                    if (project && onProjectClick) onProjectClick(project);
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tasks Analysis */}
        {activeView === 'tasks' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Análisis de Tareas Diarias</h2>

            {/* Most Worked Tasks */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Tareas con mejor rendimiento
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {taskAnalysis.mostWorked.map(stat => 
                  renderStatItem(stat, () => {
                    const task = dailyTasks.find(t => t.id === stat.id);
                    if (task && onTaskClick) onTaskClick(task);
                  })
                )}
              </div>
            </div>

            {/* Least Worked Tasks */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-red-400" />
                Tareas que necesitan atención
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {taskAnalysis.leastWorked.map(stat => 
                  renderStatItem(stat, () => {
                    const task = dailyTasks.find(t => t.id === stat.id);
                    if (task && onTaskClick) onTaskClick(task);
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Insights */}
        {activeView === 'insights' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Insights Avanzados</h2>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="text-center py-20">
                <Eye className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">Análisis de insights próximamente</p>
              </div>
            </div>
          </div>
        )}

        {/* Focus Mode */}
        {activeView === 'focus' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Modo Enfoque</h2>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="text-center py-20">
                <Focus className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">Sesiones de enfoque próximamente</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}