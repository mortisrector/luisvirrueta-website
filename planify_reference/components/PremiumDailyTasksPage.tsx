'use client';

import React, { useState, useMemo } from 'react';
import { DailyTask } from '@/types';
import { 
  ArrowLeft, Calendar, TrendingUp, Target, Flame, 
  Clock, Trophy, Star, Activity, Zap, Crown, Award,
  Eye, Focus, BarChart3, PieChart, LineChart, Filter,
  CheckCircle2, Circle, Plus, Settings, Share2, Download
} from 'lucide-react';

interface PremiumDailyTasksPageProps {
  dailyTasks: DailyTask[];
  onBack: () => void;
  onToggleTask?: (taskId: string, value?: number) => void;
  onUpdateTask?: (taskId: string, value: number) => void;
  onEditTask?: (task: DailyTask) => void;
  onDeleteTask?: (taskId: string) => void;
  onCreateTask?: () => void;
  onExportData?: () => void;
  onShareStats?: () => void;
}

type ViewMode = 'overview' | 'analytics' | 'focus' | 'trends';
type TimeRange = 'today' | 'week' | 'month' | 'year';

export default function PremiumDailyTasksPage({
  dailyTasks,
  onBack,
  onToggleTask,
  onUpdateTask,
  onEditTask,
  onDeleteTask,
  onCreateTask,
  onExportData,
  onShareStats
}: PremiumDailyTasksPageProps) {
  const [activeView, setActiveView] = useState<ViewMode>('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [focusMode, setFocusMode] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Statistics calculations
  const stats = useMemo(() => {
    const total = dailyTasks.length;
    const completed = dailyTasks.filter(task => {
      if (task.type === 'boolean') return task.completed;
      if (task.type === 'numeric') return (task.current || 0) >= (task.target || 1);
      if (task.type === 'subjective') return (task.score0to1 || 0) >= 0.6;
      return false;
    }).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const avgStreak = total > 0 
      ? Math.round(dailyTasks.reduce((sum, task) => sum + (task.streak || 0), 0) / total)
      : 0;
    
    const highPerformers = dailyTasks.filter(task => (task.streak || 0) >= 7).length;
    const needsAttention = dailyTasks.filter(task => (task.streak || 0) === 0).length;

    // Categories analysis
    const categoriesMap = new Map();
    dailyTasks.forEach(task => {
      const category = (task as any).category || 'general';
      if (!categoriesMap.has(category)) {
        categoriesMap.set(category, { total: 0, completed: 0 });
      }
      const categoryData = categoriesMap.get(category);
      categoryData.total++;
      
      let isCompleted = false;
      if (task.type === 'boolean') isCompleted = task.completed || false;
      if (task.type === 'numeric') isCompleted = (task.current || 0) >= (task.target || 1);
      if (task.type === 'subjective') isCompleted = (task.score0to1 || 0) >= 0.6;
      
      if (isCompleted) categoryData.completed++;
    });

    const categories = Array.from(categoriesMap.entries()).map(([name, data]) => ({
      name,
      total: data.total,
      completed: data.completed,
      rate: Math.round((data.completed / data.total) * 100)
    }));

    return {
      total,
      completed,
      completionRate,
      avgStreak,
      highPerformers,
      needsAttention,
      categories
    };
  }, [dailyTasks]);

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-purple-400';
    if (streak >= 21) return 'text-yellow-400';
    if (streak >= 14) return 'text-orange-400';
    if (streak >= 7) return 'text-blue-400';
    if (streak >= 3) return 'text-green-400';
    return 'text-gray-400';
  };

  const getStreakIcon = (streak: number) => {
    if (streak >= 30) return Crown;
    if (streak >= 21) return Trophy;
    if (streak >= 14) return Award;
    if (streak >= 7) return Star;
    if (streak >= 3) return Flame;
    return Target;
  };

  const viewTabs = [
    { id: 'overview', label: 'Resumen', icon: BarChart3 },
    { id: 'analytics', label: 'Análisis', icon: PieChart },
    { id: 'focus', label: 'Enfoque', icon: Focus },
    { id: 'trends', label: 'Tendencias', icon: LineChart }
  ];

  const timeRanges = [
    { id: 'today', label: 'Hoy' },
    { id: 'week', label: 'Semana' },
    { id: 'month', label: 'Mes' },
    { id: 'year', label: 'Año' }
  ];

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
                <h1 className="text-xl font-bold text-white">Tareas Diarias Pro</h1>
                <p className="text-sm text-white/60">Análisis y estadísticas avanzadas</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Focus Mode Toggle */}
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

              {/* Actions */}
              <button
                onClick={onShareStats}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Share2 className="w-5 h-5 text-white" />
              </button>
              
              <button
                onClick={onExportData}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Download className="w-5 h-5 text-white" />
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
        {/* Overview Section */}
        {activeView === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <span className="text-2xl font-bold text-white">{stats.completionRate}%</span>
                </div>
                <p className="text-white/60 text-sm">Completadas hoy</p>
                <div className="mt-2 w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="h-2 bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all"
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Flame className="w-6 h-6 text-orange-400" />
                  <span className="text-2xl font-bold text-white">{stats.avgStreak}</span>
                </div>
                <p className="text-white/60 text-sm">Racha promedio</p>
                <div className="mt-2 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-2 rounded-full ${
                        i < Math.min(stats.avgStreak / 6, 5) ? 'bg-orange-400' : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <span className="text-2xl font-bold text-white">{stats.highPerformers}</span>
                </div>
                <p className="text-white/60 text-sm">Alto rendimiento</p>
                <p className="text-xs text-yellow-400 mt-1">Racha +7 días</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-6 h-6 text-red-400" />
                  <span className="text-2xl font-bold text-white">{stats.needsAttention}</span>
                </div>
                <p className="text-white/60 text-sm">Necesitan atención</p>
                <p className="text-xs text-red-400 mt-1">Sin racha activa</p>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Rendimiento por categoría</h3>
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

              <div className="space-y-4">
                {stats.categories.map((category, index) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white capitalize">{category.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white/60">
                          {category.completed}/{category.total}
                        </span>
                        <span className="text-sm font-medium text-white">
                          {category.rate}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-1000 delay-${index * 100} ${
                          category.rate >= 80 ? 'bg-gradient-to-r from-emerald-500 to-green-400' :
                          category.rate >= 60 ? 'bg-gradient-to-r from-blue-500 to-cyan-400' :
                          category.rate >= 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-400' :
                          'bg-gradient-to-r from-red-500 to-pink-400'
                        }`}
                        style={{ width: `${category.rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Task List with Advanced UI */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Tareas de hoy</h3>
                <button
                  onClick={onCreateTask}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white text-sm font-medium hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Nueva tarea
                </button>
              </div>

              <div className="space-y-3">
                {dailyTasks.map(task => {
                  const streakVal = task.streak || 0;
                  const StreakIcon = getStreakIcon(streakVal);
                  const isCompleted = task.type === 'boolean' ? task.completed :
                    task.type === 'numeric' ? (task.current || 0) >= (task.target || 1) :
                    (task.score0to1 || 0) >= 0.6;

                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isCompleted
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Task Status */}
                        <button
                          onClick={() => onToggleTask?.(task.id)}
                          className="flex-shrink-0"
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                          ) : (
                            <Circle className="w-6 h-6 text-white/40 hover:text-white" />
                          )}
                        </button>

                        {/* Task Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white mb-1">{task.title}</h4>
                          
                          {task.type === 'numeric' && (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-white/10 rounded-full h-2">
                                <div 
                                  className="h-2 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                                  style={{ width: `${Math.min(((task.current || 0) / (task.target || 1)) * 100, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs text-white/60">
                                {task.current || 0}/{task.target} {task.unit}
                              </span>
                            </div>
                          )}

                          {task.type === 'subjective' && (
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    ((task.score0to1 || 0) * 5) >= star 
                                      ? 'text-yellow-400 fill-yellow-400' 
                                      : 'text-white/20'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Streak */}
                        {(streakVal > 0) && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
                            <StreakIcon className={`w-4 h-4 ${getStreakColor(streakVal)}`} />
                            <span className={`text-sm font-bold ${getStreakColor(streakVal)}`}>
                              {streakVal}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Section */}
        {activeView === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Análisis detallado</h3>
              <div className="text-center py-20">
                <PieChart className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">Gráficos analíticos próximamente</p>
              </div>
            </div>
          </div>
        )}

        {/* Focus Mode */}
        {activeView === 'focus' && (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Modo Enfoque</h3>
              <div className="text-center py-20">
                <Focus className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">Sesiones de enfoque próximamente</p>
              </div>
            </div>
          </div>
        )}

        {/* Trends */}
        {activeView === 'trends' && (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Tendencias históricas</h3>
              <div className="text-center py-20">
                <LineChart className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">Análisis de tendencias próximamente</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      {onCreateTask && !focusMode && (
        <button
          onClick={onCreateTask}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full shadow-2xl hover:shadow-purple-500/25 hover:scale-110 transition-all duration-300 flex items-center justify-center z-40"
        >
          <Plus className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  );
}