import { ProjectProgress, FolderProgress } from '@/lib/progressCalculation';

interface DynamicProgressBarProps {
  progress: number;
  type?: 'project' | 'folder';
  colorScheme?: string;
  showPercentage?: boolean;
  showWeight?: boolean;
  size?: 'sm' | 'md' | 'lg';
  progressData?: ProjectProgress | FolderProgress;
  className?: string;
}

export default function DynamicProgressBar({
  progress,
  type = 'project',
  colorScheme = 'electric-blue',
  showPercentage = true,
  showWeight = false,
  size = 'md',
  progressData,
  className = ''
}: DynamicProgressBarProps) {
  
  const getColorClasses = () => {
    const colorMappings: Record<string, { bg: string; fill: string; text: string }> = {
      'electric-blue': {
        bg: 'bg-blue-100',
        fill: 'from-blue-400 to-cyan-500',
        text: 'text-blue-800'
      },
      'electric-green': {
        bg: 'bg-emerald-100',
        fill: 'from-emerald-400 to-green-500',
        text: 'text-emerald-800'
      },
      'electric-purple': {
        bg: 'bg-purple-100',
        fill: 'from-purple-400 to-pink-500',
        text: 'text-purple-800'
      },
      'cosmic': {
        bg: 'bg-indigo-100',
        fill: 'from-indigo-400 to-purple-500',
        text: 'text-indigo-800'
      },
      'sunset': {
        bg: 'bg-orange-100',
        fill: 'from-orange-400 to-pink-500',
        text: 'text-orange-800'
      },
      'forest': {
        bg: 'bg-green-100',
        fill: 'from-green-400 to-emerald-500',
        text: 'text-green-800'
      },
      'ocean': {
        bg: 'bg-cyan-100',
        fill: 'from-cyan-400 to-teal-500',
        text: 'text-cyan-800'
      },
      'fire': {
        bg: 'bg-red-100',
        fill: 'from-red-400 to-orange-500',
        text: 'text-red-800'
      },
      'sunset-dream': {
        bg: 'bg-orange-100',
        fill: 'from-orange-500 to-red-500',
        text: 'text-orange-800'
      },
      'northern-lights': {
        bg: 'bg-green-100',
        fill: 'from-green-500 to-blue-600',
        text: 'text-green-800'
      },
      'desert-bloom': {
        bg: 'bg-yellow-100',
        fill: 'from-yellow-500 to-red-600',
        text: 'text-yellow-800'
      },
      'ocean-wave': {
        bg: 'bg-blue-100',
        fill: 'from-blue-500 to-teal-600',
        text: 'text-blue-800'
      }
    };

    return colorMappings[colorScheme] || colorMappings['electric-blue'];
  };

  const getSizeClasses = () => {
    const sizeClasses = {
      sm: { bar: 'h-1.5', text: 'text-xs' },
      md: { bar: 'h-2', text: 'text-sm' },
      lg: { bar: 'h-3', text: 'text-base' }
    };
    return sizeClasses[size];
  };

  const colors = getColorClasses();
  const sizes = getSizeClasses();
  
  // Asegurar que el progreso esté entre 0 y 100
  const normalizedProgress = Math.max(0, Math.min(100, progress));
  
  // Determinar el color basado en el progreso - usando colores del proyecto
  const getProgressColor = () => {
    // Si hay un colorScheme personalizado, usar el gradiente del proyecto
    if (colorScheme && colorScheme !== 'electric-blue') {
      return colors.fill; // Usar siempre el color del proyecto
    }
    
    // Fallback para colores por defecto basados en progreso
    if (normalizedProgress >= 100) return colors.fill;
    if (normalizedProgress >= 80) return colors.fill;
    if (normalizedProgress >= 60) return 'from-yellow-400 to-orange-400';
    if (normalizedProgress >= 40) return 'from-orange-400 to-red-400';
    return 'from-gray-400 to-gray-500';
  };

  const progressColor = getProgressColor();

  return (
    <div className={`w-full ${className}`}>
      {/* Barra de progreso principal */}
      <div className="flex items-center gap-3">
        <div className={`flex-1 ${colors.bg} rounded-full overflow-hidden ${sizes.bar} shadow-inner`}>
          <div
            className={`h-full bg-gradient-to-r ${progressColor} transition-all duration-500 ease-out shadow-sm`}
            style={{ width: `${normalizedProgress}%` }}
          />
        </div>
        
        {showPercentage && (
          <div className={`${colors.text} font-semibold ${sizes.text} min-w-[3rem] text-right`}>
            {normalizedProgress.toFixed(1)}%
          </div>
        )}
      </div>

      {/* Información adicional si se proporciona progressData */}
      {showWeight && progressData && (
        <div className="mt-2 flex justify-between text-xs opacity-70">
          <span className={colors.text}>
            {type === 'project' && 'projectId' in progressData && (
              <>
                {progressData.completedTasks}/{progressData.taskCount} tareas
              </>
            )}
            {type === 'folder' && 'folderId' in progressData && (
              <>
                {progressData.projectCount} proyectos
              </>
            )}
          </span>
          
          <span className={colors.text}>
            Peso: {progressData.completedWeight.toFixed(1)}/{progressData.totalWeight.toFixed(1)}
          </span>
        </div>
      )}

      {/* Indicador de estado */}
      {normalizedProgress >= 100 && (
        <div className="mt-1 flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-medium text-green-700">Completado</span>
        </div>
      )}
    </div>
  );
}

// Variante específica para proyectos
export function ProjectProgressBar({
  projectProgress,
  colorScheme,
  size = 'md',
  showWeight = false,
  className
}: {
  projectProgress: ProjectProgress;
  colorScheme?: string;
  size?: 'sm' | 'md' | 'lg';
  showWeight?: boolean;
  className?: string;
}) {
  return (
    <DynamicProgressBar
      progress={projectProgress.progress}
      type="project"
      colorScheme={colorScheme}
      showWeight={showWeight}
      size={size}
      progressData={projectProgress}
      className={className}
    />
  );
}

// Variante específica para carpetas
export function FolderProgressBar({
  folderProgress,
  colorScheme,
  size = 'md',
  showWeight = false,
  className
}: {
  folderProgress: FolderProgress;
  colorScheme?: string;
  size?: 'sm' | 'md' | 'lg';
  showWeight?: boolean;
  className?: string;
}) {
  return (
    <DynamicProgressBar
      progress={folderProgress.progress}
      type="folder"
      colorScheme={colorScheme}
      showWeight={showWeight}
      size={size}
      progressData={folderProgress}
      className={className}
    />
  );
}