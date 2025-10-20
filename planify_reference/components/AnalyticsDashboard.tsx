/**
 * Dashboard avanzado de analíticas de productividad
 * Muestra métricas, tendencias, insights y logros
 */

import { useState, useMemo } from 'react';
import { 
  TrendingUp, Target, Award, Lightbulb, Calendar, 
  BarChart3, PieChart, Activity, Star, Flame,
  Download, Share2, X, ChevronRight
} from 'lucide-react';
import { Project, Folder, DailyTask } from '@/types';
import { analyticsEngine, ProductivityMetrics, ProductivityInsight, Achievement, Goal } from '@/lib/advancedAnalytics';

interface AnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  folders: Folder[];
  dailyTasks: DailyTask[];
}

export default function AnalyticsDashboard({
  isOpen,
  onClose,
  projects,
  folders,
  dailyTasks
}: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'insights' | 'achievements'>('overview');
  
  // Calcular métricas usando el sistema avanzado
  const metrics = useMemo(() => {
    return analyticsEngine.calculateProductivityMetrics(projects, folders, dailyTasks);
  }, [projects, folders, dailyTasks]);

  if (!isOpen) return null;

  const handleExportMetrics = () => {
    const exportData = analyticsEngine.exportMetrics(metrics);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `productividad-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShareReport = () => {
    const report = analyticsEngine.generateProductivityReport(metrics);
    if (navigator.share) {
      navigator.share({
        title: 'Mi Reporte de Productividad',
        text: report
      });
    } else {
      navigator.clipboard.writeText(report);
      alert('Reporte copiado al portapapeles');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl mx-4 max-w-6xl w-full h-[90vh] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Analíticas de Productividad</h2>
              <p className="text-white/60 text-sm">Insights detallados sobre tu progreso</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportMetrics}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
              title="Exportar métricas"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleShareReport}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
              title="Compartir reporte"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {[
            { id: 'overview', label: 'Resumen', icon: PieChart },
            { id: 'trends', label: 'Tendencias', icon: TrendingUp },
            { id: 'insights', label: 'Insights', icon: Lightbulb },
            { id: 'achievements', label: 'Logros', icon: Award }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors
                ${activeTab === tab.id 
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10' 
                  : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <OverviewTab metrics={metrics} />
          )}
          {activeTab === 'trends' && (
            <TrendsTab metrics={metrics} />
          )}
          {activeTab === 'insights' && (
            <InsightsTab insights={metrics.insights} />
          )}
          {activeTab === 'achievements' && (
            <AchievementsTab achievements={metrics.achievements} goals={metrics.goals} />
          )}
        </div>
      </div>
    </div>
  );
}

// Tab Components
function OverviewTab({ metrics }: { metrics: ProductivityMetrics }) {
  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Progreso General"
          value={`${metrics.overallProgress}%`}
          icon={<Target className="w-5 h-5 text-blue-400" />}
          trend={+5}
        />
        <MetricCard
          title="Proyectos Activos"
          value={metrics.activeProjects}
          icon={<Activity className="w-5 h-5 text-green-400" />}
          subtitle={`${metrics.completedProjects} completados`}
        />
        <MetricCard
          title="Tareas Diarias"
          value={`${metrics.dailyTasksCompletionRate}%`}
          icon={<Calendar className="w-5 h-5 text-purple-400" />}
          subtitle={`${metrics.completedDailyTasks}/${metrics.totalDailyTasks} completadas`}
        />
        <MetricCard
          title="Racha Actual"
          value={`${metrics.workPatterns.streakDays} días`}
          icon={<Flame className="w-5 h-5 text-orange-400" />}
          subtitle={`Récord: ${metrics.workPatterns.longestStreak} días`}
        />
      </div>

      {/* Patrones de trabajo */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Patrones de Trabajo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-white/60 text-sm mb-2">Hora más productiva</p>
            <p className="text-white font-medium">{metrics.workPatterns.mostProductiveTimeOfDay}</p>
          </div>
          <div>
            <p className="text-white/60 text-sm mb-2">Promedio de tareas por día</p>
            <p className="text-white font-medium">{metrics.workPatterns.averageTasksPerDay}</p>
          </div>
        </div>
      </div>

      {/* Metas activas */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Metas en Progreso</h3>
        <div className="space-y-3">
          {metrics.goals.filter(g => g.current < g.target).slice(0, 3).map((goal) => (
            <GoalProgress key={goal.id} goal={goal} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TrendsTab({ metrics }: { metrics: ProductivityMetrics }) {
  const { weeklyTrends } = metrics;
  
  return (
    <div className="space-y-6">
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Tendencias de la Semana</h3>
        
        {/* Mini gráfico de tareas completadas */}
        <div className="mb-6">
          <p className="text-white/60 text-sm mb-3">Tareas completadas por día</p>
          <div className="flex items-end gap-2 h-24">
            {weeklyTrends.tasksCompleted.map((count, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500/30 rounded-t min-h-[4px]"
                  style={{ height: `${(count / Math.max(...weeklyTrends.tasksCompleted)) * 100}%` }}
                />
                <span className="text-xs text-white/40 mt-1">{count}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-white/40 mt-2">
            {weeklyTrends.dates.map((date, index) => (
              <span key={index}>{new Date(date).getDate()}</span>
            ))}
          </div>
        </div>

        {/* Puntuación de productividad */}
        <div>
          <p className="text-white/60 text-sm mb-3">Puntuación de productividad</p>
          <div className="flex items-end gap-2 h-24">
            {weeklyTrends.productivityScore.map((score, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-purple-500/30 rounded-t min-h-[4px]"
                  style={{ height: `${score}%` }}
                />
                <span className="text-xs text-white/40 mt-1">{score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightsTab({ insights }: { insights: ProductivityInsight[] }) {
  return (
    <div className="space-y-4">
      {insights.length === 0 ? (
        <div className="text-center py-12">
          <Lightbulb className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <p className="text-white/60">No hay insights disponibles en este momento</p>
        </div>
      ) : (
        insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))
      )}
    </div>
  );
}

function AchievementsTab({ achievements, goals }: { achievements: Achievement[], goals: Goal[] }) {
  return (
    <div className="space-y-6">
      {/* Logros desbloqueados */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Logros Desbloqueados</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </div>

      {/* Todas las metas */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Todas las Metas</h3>
        <div className="space-y-3">
          {goals.map((goal) => (
            <GoalProgress key={goal.id} goal={goal} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Utility Components
function MetricCard({ 
  title, 
  value, 
  icon, 
  trend, 
  subtitle 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  trend?: number; 
  subtitle?: string; 
}) {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/60 text-sm">{title}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      {subtitle && <p className="text-white/40 text-xs">{subtitle}</p>}
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          <TrendingUp className="w-3 h-3 text-green-400" />
          <span className="text-green-400 text-xs">+{trend}%</span>
        </div>
      )}
    </div>
  );
}

function GoalProgress({ goal }: { goal: Goal }) {
  const progress = Math.min((goal.current / goal.target) * 100, 100);
  
  return (
    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-white font-medium">{goal.title}</h4>
        <span className="text-white/60 text-sm">
          {goal.current}/{goal.target} {goal.unit}
        </span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2 mb-2">
        <div 
          className="bg-purple-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-white/60 text-sm">{goal.description}</p>
    </div>
  );
}

function InsightCard({ insight }: { insight: ProductivityInsight }) {
  const typeColors = {
    positive: 'border-green-500/30 bg-green-500/10',
    warning: 'border-yellow-500/30 bg-yellow-500/10',
    suggestion: 'border-blue-500/30 bg-blue-500/10'
  };

  const typeIcons = {
    positive: <Star className="w-5 h-5 text-green-400" />,
    warning: <Activity className="w-5 h-5 text-yellow-400" />,
    suggestion: <Lightbulb className="w-5 h-5 text-blue-400" />
  };

  return (
    <div className={`rounded-xl p-4 border ${typeColors[insight.type]}`}>
      <div className="flex items-start gap-3">
        {typeIcons[insight.type]}
        <div className="flex-1">
          <h4 className="text-white font-medium mb-1">{insight.title}</h4>
          <p className="text-white/70 text-sm mb-3">{insight.message}</p>
          {insight.actionText && (
            <button className="text-blue-400 text-sm font-medium flex items-center gap-1 hover:text-blue-300 transition-colors">
              {insight.actionText}
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center gap-3">
      <div className="text-2xl">{achievement.icon}</div>
      <div className="flex-1">
        <h4 className="text-white font-medium">{achievement.title}</h4>
        <p className="text-white/60 text-sm">{achievement.description}</p>
        <p className="text-white/40 text-xs mt-1">
          Desbloqueado: {new Date(achievement.unlockedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}