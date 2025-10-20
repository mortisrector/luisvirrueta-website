import React, { memo, useMemo, useCallback } from 'react';
import { Project } from '@/types';
import { Target } from 'lucide-react';
import CircleProgress from './CircleProgress';

interface ProjectCardProps {
  project: Project;
  onOpenProject?: (project: Project) => void;
  onEditTitle?: (projectId: string, newTitle: string) => void;
  onCustomize?: (projectId: string, icon: string, colorScheme: string) => void;
  onDelete?: (project: Project) => void;
  onShare?: (project: Project) => void;
}

// Optimized ProjectCard with memoization
const OptimizedProjectCard = memo(function ProjectCard({ 
  project, 
  onOpenProject,
  onEditTitle,
  onCustomize,
  onDelete,
  onShare
}: ProjectCardProps) {
  // Memoize click handler
  const handleCardClick = useCallback(() => {
    if (onOpenProject) {
      onOpenProject(project);
    }
  }, [onOpenProject, project]);

  // Memoize color schemes
  const colorSchemes = useMemo(() => ({
    'electric-blue': 'from-cyan-400/20 to-blue-600/20',
    'electric-green': 'from-emerald-400/20 to-green-600/20',
    'electric-pink': 'from-pink-400/20 to-fuchsia-600/20',
    'neon-cyan': 'from-cyan-300/20 to-teal-500/20',
    'electric-orange': 'from-orange-400/20 to-red-500/20',
    'electric-teal': 'from-teal-400/20 to-cyan-600/20',
    'electric-lime': 'from-lime-400/20 to-green-500/20',
    'neon-violet': 'from-violet-400/20 to-purple-600/20',
    'electric-gold': 'from-yellow-400/20 to-orange-500/20',
    'electric-rose': 'from-rose-400/20 to-pink-600/20',
    'cyber-blue': 'from-blue-400/20 to-indigo-600/20',
    'electric-amber': 'from-amber-400/20 to-orange-600/20',
    default: 'from-indigo-500/20 to-purple-500/20'
  }), []);

  // Memoize gradient calculation
  const backgroundGradient = useMemo(() => {
    return colorSchemes[project.colorScheme as keyof typeof colorSchemes] || colorSchemes.default;
  }, [project.colorScheme, colorSchemes]);

  // Memoize progress data
  const progressData = useMemo(() => ({
    percentage: project.progress || 0,
    isCompleted: (project.progress || 0) >= 100,
    taskText: `${project.items || 0} tarea${(project.items || 0) !== 1 ? 's' : ''}`
  }), [project.progress, project.items]);

  return (
    <div className="relative group">
      {/* Glow effect */}
      <div className={`absolute inset-0 rounded-3xl transition-all duration-500 bg-gradient-to-br ${backgroundGradient.replace('/20', '/30')} blur-xl opacity-0 group-hover:opacity-50`}></div>
      
      {/* Main card */}
      <div 
        onClick={handleCardClick} 
        className={`relative backdrop-blur-xl bg-gradient-to-br ${backgroundGradient} border border-white/30 rounded-3xl p-6 cursor-pointer min-h-[280px] flex flex-col overflow-hidden hover:scale-105 hover:border-white/40 hover:shadow-2xl active:scale-95 transition-all duration-300 ring-4 ring-white/10 hover:ring-white/20`}
      >
        {/* Glass effect layers */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-3xl"></div>
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/15 to-transparent rounded-3xl"></div>
        
        {/* Content */}
        <div className="relative z-10 flex items-start gap-4 mb-6">
          <div className="relative">
            {/* Icon with progress circle */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 bg-gradient-to-br ${backgroundGradient} hover:scale-105 cursor-pointer shadow-2xl ring-4 ring-white/20 relative overflow-hidden`}>
              <div className="absolute inset-0 bg-white/15 backdrop-blur-sm rounded-2xl"></div>
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-2xl"></div>
              <Target className="w-8 h-8 text-white drop-shadow-2xl relative z-10 filter brightness-110" />
            </div>
            
            {/* Progress circle overlay */}
            <div className="absolute inset-0 w-16 h-16">
              <CircleProgress progress={progressData.percentage} size={64} />
            </div>
          </div>
          
          {/* Project info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-white hover:text-white/90 transition-colors cursor-pointer select-none drop-shadow-md">
                {project.title}
              </h3>
            </div>
            <div className="text-white/70 text-sm space-y-1">
              <p>{progressData.percentage}% completado</p>
              <p>{progressData.taskText}</p>
              {project.streak && project.streak > 0 && (
                <p className="text-orange-400 font-medium">🔥 {project.streak} días</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Badge */}
        {project.badge && (
          <div className={`relative z-10 mb-4 px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-sm border shadow-lg ring-2 ring-white/20 transition-all duration-300 self-start ${
            project.badge === 'Prioritario' ? 'bg-red-500/80 border-red-400/50 text-white' : 
            'bg-white/20 border-white/30 text-white'
          }`}>
            {project.badge}
          </div>
        )}
        
        {/* Progress bar */}
        <div className="relative z-10 space-y-3 mt-auto">
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${
                progressData.isCompleted 
                  ? 'from-emerald-400 to-green-500' 
                  : 'from-cyan-400 to-blue-500'
              }`}
              style={{ width: `${progressData.percentage}%` }}
            ></div>
          </div>
        </div>
        
        {/* Decorative gradients */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-radial from-cyan-500/10 to-transparent rounded-full blur-lg"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-radial from-purple-500/10 to-transparent rounded-full blur-lg"></div>
      </div>
    </div>
  );
});

// Higher-order component for additional optimization
export const ProjectCardWithPerformance = memo(OptimizedProjectCard, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.project.id === nextProps.project.id &&
    prevProps.project.title === nextProps.project.title &&
    prevProps.project.progress === nextProps.project.progress &&
    prevProps.project.items === nextProps.project.items &&
    prevProps.project.streak === nextProps.project.streak &&
    prevProps.project.badge === nextProps.project.badge &&
    prevProps.project.colorScheme === nextProps.project.colorScheme
  );
});

export default OptimizedProjectCard;