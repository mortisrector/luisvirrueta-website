'use client';

import { Project } from '@/types';
import { TrendingUp, Calendar, Zap, Award, Target } from 'lucide-react';

interface MiniStatProps {
  icon: any;
  value: string | number;
  label: string;
  trend?: string;
  color: 'orange' | 'green' | 'purple' | 'blue';
}

function MiniStat({ icon: Icon, value, label, trend, color }: MiniStatProps) {
  const colorStyles = {
    orange: {
      gradient: 'from-orange-500 to-red-500',
      glow: 'shadow-orange-500/25',
      bg: 'from-orange-500/10 to-red-500/5'
    },
    green: {
      gradient: 'from-emerald-500 to-green-500',
      glow: 'shadow-emerald-500/25',
      bg: 'from-emerald-500/10 to-green-500/5'
    },
    purple: {
      gradient: 'from-purple-500 to-pink-500',
      glow: 'shadow-purple-500/25',
      bg: 'from-purple-500/10 to-pink-500/5'
    },
    blue: {
      gradient: 'from-cyan-500 to-blue-500',
      glow: 'shadow-cyan-500/25',
      bg: 'from-cyan-500/10 to-blue-500/5'
    }
  };

  const style = colorStyles[color];

  return (
    <div className="flex-1 min-w-0">
      <div className="group relative">
        {/* Glow effect */}
        <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition-all duration-500`}></div>
        
        {/* Card */}
        <div className={`relative backdrop-blur-xl bg-gradient-to-br ${style.bg} border border-white/20 rounded-2xl p-4 text-center hover:scale-105 hover:border-white/30 transition-all duration-300 ${style.glow} shadow-2xl`}>
          {/* Icon Container */}
          <div className="relative mb-3">
            <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} rounded-xl blur-sm opacity-50`}></div>
            <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${style.gradient} flex items-center justify-center mx-auto transform group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="w-5 h-5 text-white drop-shadow-sm" />
            </div>
          </div>
          
          {/* Value */}
          <div className="text-2xl font-bold text-white mb-1 leading-none drop-shadow-sm">
            {value}
          </div>
          
          {/* Label */}
          <div className="text-sm font-medium text-white/80 mb-2">
            {label}
          </div>
          
          {/* Trend */}
          {trend && (
            <div className="flex items-center justify-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-medium rounded-lg border border-emerald-400/30">
              <TrendingUp className="w-3 h-3" />
              <span>{trend}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface PremiumStatsProps {
  projects: Project[];
  globalStreak: number;
}

export default function PremiumStats({ projects, globalStreak }: PremiumStatsProps) {
  // Calcular estadísticas
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.progress >= 100).length;
  const activeProjects = projects.filter(p => p.progress < 100 && p.badge !== 'Pausa').length;
  
  const globalProgress = projects.length > 0 
    ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
    : 0;
    
  const totalTasks = projects.reduce((sum, p) => sum + (p.items || 0), 0);
  const progressSpeed = globalProgress > 0 ? `+${(globalProgress * 0.12).toFixed(1)}%` : '0%';
  const monthlyMilestones = Math.floor(globalProgress / 10);
  
  const productivityScore = Math.min(100, Math.round(
    (globalProgress * 0.4) + 
    (globalStreak * 2) + 
    (completedProjects * 15) +
    (activeProjects * 5)
  ));

  return (
    <div className="space-y-6 relative">
      {/* Main Premium Progress Card */}
      <div className="relative group">
        {/* Glow effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-emerald-500/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
        
        <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl p-6 shadow-2xl overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-cyan-500/15 to-transparent rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-radial from-purple-500/15 to-transparent rounded-full blur-xl" />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              {/* Progress Header */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl blur-sm opacity-50"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-white drop-shadow-sm" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Progreso Global</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-sm font-medium rounded-lg border border-emerald-400/30">
                      <TrendingUp className="w-4 h-4" />
                      <span>{progressSpeed}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Big Progress Number */}
              <div className="text-right">
                <div className="text-5xl font-bold bg-gradient-to-r from-cyan-200 via-purple-200 to-emerald-200 bg-clip-text text-transparent drop-shadow-sm">
                  {globalProgress}%
                </div>
                <div className="text-white/60 text-sm font-medium mt-1">completado</div>
              </div>
            </div>
            
            {/* Premium Progress Bar */}
            <div className="relative mb-4">
              <div className="w-full bg-white/10 rounded-2xl h-4 overflow-hidden border border-white/20">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500 rounded-2xl transition-all duration-1000 ease-out relative overflow-hidden"
                  style={{ width: `${globalProgress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
                </div>
              </div>
            </div>
            
            {/* Status indicators */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2 text-white/80">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                  <span>{completedProjects} completados</span>
                </span>
                <span className="flex items-center gap-2 text-white/80">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse delay-300" />
                  <span>{activeProjects} activos</span>
                </span>
                <span className="flex items-center gap-2 text-white/80">
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-600" />
                  <span>{totalTasks} tareas</span>
                </span>
              </div>
              
              <div className="flex items-center gap-1 px-3 py-1 bg-white/10 rounded-lg border border-white/20">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-white/90 font-semibold">{productivityScore}</span>
                <span className="text-white/60 text-xs">pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mini Stats Row - Una línea perfecta */}
      <div className="flex gap-3">
        <MiniStat
          icon={Calendar}
          value={`${globalStreak}d`}
          label="Racha"
          trend="+2d"
          color="orange"
        />
        
        <MiniStat
          icon={Zap}
          value={progressSpeed}
          label="Velocidad"
          trend="↗"
          color="green"
        />
        
        <MiniStat
          icon={Award}
          value={monthlyMilestones}
          label="Hitos"
          trend={monthlyMilestones > 0 ? `+${monthlyMilestones}` : undefined}
          color="purple"
        />
        
        <MiniStat
          icon={Target}
          value={productivityScore}
          label="Score"
          trend={productivityScore > 70 ? "Alto" : "Medio"}
          color="blue"
        />
      </div>
    </div>
  );
}
