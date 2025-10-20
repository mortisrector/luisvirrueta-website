'use client';

import { useState, useMemo, useEffect } from 'react';
import { Project, DailyTask, User, Team } from '@/types';
import { capitalizeFirst } from '@/utils/textUtils';
import { ArrowLeft, Edit3, Target, Plus, CheckCircle2, Star, TrendingUp, Filter, X, BarChart3, Scale, Users, AlertTriangle, Clock, Circle, Calendar, Hash, Flag, Tag, Zap, Search, CheckCircle, ToggleLeft } from 'lucide-react';
import { getUserGradient, generateUserAvatar } from '@/lib/userColors';
import { getColorSchemeWithOpacity, getColorSchemeGradient, ALL_COLOR_SCHEMES } from '@/lib/colorSchemes';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import TaskScheduleModal from './TaskScheduleModal';
import * as Icons from 'lucide-react';
import TaskTypeSelector from './TaskTypeSelector';
import QuickTaskComposer, { QuickTaskComposerTask } from './QuickTaskComposer';
import FullScreenStyleModal from './FullScreenStyleModal';
import PremiumDailyTasksPage from './PremiumDailyTasksPage';
import TaskControls from './TaskControls';
import { ProjectProgressBar } from './DynamicProgressBar';
import { useProjectProgress } from '@/hooks/useProgressCalculation';
import { isTaskCompleted, getTaskProgress, calculateTaskWeight } from '@/lib/progressCalculation';
import { getTaskTemporalStatus } from '@/lib/taskStatus';
import { TEAMS, USERS } from '@/lib/centralizedData';
import FocusModeScreen from './FocusModeScreen';
import ChallengeProgress from './ChallengeProgress';
import CompetitionDashboard from './CompetitionDashboard';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { useTimeTracking as useTimeTrackingContext } from '@/contexts/TimeTrackingContext';
import TimeStatsModal from './TimeStatsModal';

interface ProjectDetailScreenProps {
  project: Project;
  dailyTasks?: DailyTask[];
  team?: Team; // Agregar soporte para equipo
  parentFolder?: any; // Carpeta padre para herencia de colores
  currentUserId?: string; // ID del usuario actual para competiciones
  onBack: () => void;
  onAddTask?: (projectId: string, taskData?: any) => void;
  onToggleTask?: (taskId: string, value?: number) => void;
  onUpdateTask?: (taskId: string, value: number) => void;
  onEditTask?: (task: DailyTask) => void;
  onDeleteTask?: (taskId: string) => void;
  onUpdateTaskAssignment?: (taskId: string, assignedUsers: User[]) => void;
  onEditProjectTitle?: (projectId: string, newTitle: string) => void;
  onUpdateCompetitionProgress?: (projectId: string, userId: string, progress: number) => void;
  onCustomizeProject?: (projectId: string, icon: string, colorScheme: string, title?: string) => void;
}

type TaskStatus = 'all' | 'not-started' | 'in-progress' | 'completed';
type TaskFilter = 'all' | 'boolean' | 'numeric' | 'subjective';

export default function ProjectDetailScreen({
  project,
  dailyTasks = [],
  team,
  parentFolder,
  currentUserId = 'user1', // Default user for testing
  onBack,
  onAddTask,
  onToggleTask,
  onUpdateTask,
  onEditTask,
  onDeleteTask,
  onUpdateTaskAssignment,
  onEditProjectTitle,
  onUpdateCompetitionProgress,
  onCustomizeProject
}: ProjectDetailScreenProps) {
  const [showTaskTypeSelector, setShowTaskTypeSelector] = useState(false);
  const [showQuickComposer, setShowQuickComposer] = useState(false);
  const [showTasksView, setShowTasksView] = useState(false);
  const [taskStatusFilter, setTaskStatusFilter] = useState<TaskStatus>('all');
  const [taskTypeFilter, setTaskTypeFilter] = useState<TaskFilter>('all');
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [focusTask, setFocusTask] = useState<DailyTask | null>(null);
  const [showTimeStats, setShowTimeStats] = useState(false);
  
  // Hook de seguimiento de tiempo
  const timeTracking = useTimeTracking();
  const [showFilters, setShowFilters] = useState(false);
  const [showScoringExplanation, setShowScoringExplanation] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [previousProgress, setPreviousProgress] = useState<number>(0);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedTaskForSchedule, setSelectedTaskForSchedule] = useState<DailyTask | null>(null);
  // Estado local para controlar asignaciones de equipo por tarea
  const [taskAssignments, setTaskAssignments] = useState<{[taskId: string]: string[]}>({});
  // Control de paneles de multi-asignación abiertos (inline, inician desactivados/colapsados)
  const [openAssignmentPanels, setOpenAssignmentPanels] = useState<Set<string>>(new Set());
  
  // Usar el contexto global de TimeTracking en lugar del hook local
  const { 
    startTaskTracking, 
    stopTaskTracking, 
    getTaskTracking
  } = useTimeTrackingContext();
  
  // Estado para controlar el input de incremento personalizado
  const [customIncrementInputs, setCustomIncrementInputs] = useState<{[taskId: string]: boolean}>({});
  const [customIncrementValues, setCustomIncrementValues] = useState<{[taskId: string]: string}>({});
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(project.title || '');
  const [showTaskFilterMenu, setShowTaskFilterMenu] = useState(false);
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);

  // Estado para cronómetro regresivo por tarea
  const [taskTimers, setTaskTimers] = useState<{[taskId: string]: {
    remainingTime: number; // tiempo restante en segundos
    isActive: boolean; // si está corriendo
    isPaused: boolean; // si está pausado
    intervalId?: NodeJS.Timeout;
  } | undefined}>({});

  // Función para limpiar descripciones repetitivas automáticamente
  useEffect(() => {
    if (!onEditTask) return;

    const cleanupTaskDescriptions = () => {
      const projectTasksToClean = dailyTasks.filter((task: DailyTask) => 
        task.projectId === project.id && 
        task.description &&
        (
          task.description.startsWith('Tarea del proyecto:') ||
          task.description === project.title ||
          task.description.includes(`Tarea del proyecto: ${project.title}`)
        )
      );

      if (projectTasksToClean.length > 0) {
        projectTasksToClean.forEach(task => {
          onEditTask({
            ...task,
            description: '' // Limpiar la descripción repetitiva
          });
        });
      }
    };

    cleanupTaskDescriptions();
  }, [project.id, project.title, dailyTasks, onEditTask]);

  // Funciones para manejar cronómetro regresivo
  const startTimer = (taskId: string, duration: number) => {
    console.log(`Starting timer for ${taskId} with ${duration} seconds`);
    
    // Limpiar timer existente si hay uno
    const existingTimer = taskTimers[taskId];
    if (existingTimer?.intervalId) {
      clearInterval(existingTimer.intervalId);
      console.log(`Cleared existing timer for ${taskId}`);
    }

    // Establecer el estado inicial
    setTaskTimers(prev => ({
      ...prev,
      [taskId]: {
        remainingTime: duration,
        isActive: true,
        isPaused: false,
        intervalId: undefined
      }
    }));
  };

  const pauseTimer = (taskId: string) => {
    setTaskTimers(prev => {
      const current = prev[taskId];
      if (current?.intervalId) {
        clearInterval(current.intervalId);
      }
      if (!current) return prev;
      return {
        ...prev,
        [taskId]: { 
          remainingTime: current.remainingTime,
          isPaused: true, 
          isActive: false, 
          intervalId: undefined 
        }
      };
    });
  };

  const resumeTimer = (taskId: string) => {
    const current = taskTimers[taskId];
    if (current && current.remainingTime > 0) {
      startTimer(taskId, current.remainingTime);
    }
  };

  const stopTimer = (taskId: string) => {
    setTaskTimers(prev => {
      const current = prev[taskId];
      if (current?.intervalId) {
        clearInterval(current.intervalId);
      }
      return {
        ...prev,
        [taskId]: undefined
      };
    });
  };

  const completeTask = (taskId: string) => {
    stopTimer(taskId);
    if (onToggleTask) {
      onToggleTask(taskId);
    }
  };

  // Cronómetro principal - useEffect separado para cada timer activo
  useEffect(() => {
    const intervals: { [taskId: string]: NodeJS.Timeout } = {};

    Object.entries(taskTimers).forEach(([taskId, timer]) => {
      if (timer && timer.isActive && !timer.isPaused && timer.remainingTime > 0) {
        console.log(`Creating interval for active timer ${taskId}`);
        
        intervals[taskId] = setInterval(() => {
          console.log(`Tick for timer ${taskId}`);
          
          setTaskTimers(prev => {
            const current = prev[taskId];
            if (!current || !current.isActive || current.isPaused) {
              console.log(`Stopping timer ${taskId} - not active or paused`);
              return prev;
            }

            const newTime = Math.max(0, current.remainingTime - 1);
            console.log(`Timer ${taskId}: ${current.remainingTime}s -> ${newTime}s`);

            if (newTime <= 0) {
              console.log(`Timer ${taskId} completed! Completing task.`);
              if (onToggleTask) {
                onToggleTask(taskId);
              }
              return {
                ...prev,
                [taskId]: {
                  remainingTime: 0,
                  isActive: false,
                  isPaused: false,
                  intervalId: undefined
                }
              };
            }

            return {
              ...prev,
              [taskId]: {
                ...current,
                remainingTime: newTime
              }
            };
          });
        }, 1000);
      }
    });

    // Cleanup function
    return () => {
      Object.values(intervals).forEach(intervalId => {
        clearInterval(intervalId);
      });
    };
  }, [taskTimers, onToggleTask]);

  // Limpiar intervals al desmontar
  useEffect(() => {
    return () => {
      Object.values(taskTimers).forEach(timer => {
        if (timer?.intervalId) {
          clearInterval(timer.intervalId);
        }
      });
    };
  }, []);

  // Obtener miembros del equipo desde props o usar equipo por defecto
  const currentTeam = team || 
    (project.teamId ? Object.values(TEAMS).find(t => t.id === project.teamId) : null) ||
    TEAMS.DESARROLLO; // Fallback al equipo de desarrollo

  const teamMembers = currentTeam.members || [];
  const teamColor = currentTeam.color || '#3B82F6';

  // Sincronizar tempTitle con el título del proyecto
  useEffect(() => {
    setTempTitle(project.title || '');
  }, [project.title]);

  // Función para generar color único para cada miembro
  const getMemberColor = (memberId: string, memberName: string) => {
    const colors = [
      '#10B981', // verde
      '#F59E0B', // amarillo/naranja  
      '#EF4444', // rojo
      '#8B5CF6', // violeta
      '#06B6D4', // cyan
      '#EC4899', // rosa
      '#F97316', // naranja
      '#84CC16', // lima
    ];
    
    // Usar el ID del miembro para consistencia
    const hash = memberId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Función para obtener iniciales
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  // Usar el hook para calcular progreso dinámico
  const projectTasks = dailyTasks.filter((task: DailyTask) => task.projectId === project.id);
  const projectProgress = useProjectProgress(project.id, dailyTasks);
  
  // Calcular progreso real ponderado en tiempo real con decimales
  const realProgress = useMemo(() => {
    if (projectTasks.length === 0) return 0;
    
    let totalProgress = 0;
    let totalWeight = 0;
    
    projectTasks.forEach(task => {
      const progress = getTaskProgress(task);
      const weightObj = calculateTaskWeight(task);
      const weight = weightObj.weight;
      totalProgress += progress * weight;
      totalWeight += weight;
    });
    
    const currentProgress = totalWeight > 0 ? (totalProgress / totalWeight) * 100 : 0;
    
    return currentProgress;
  }, [projectTasks, projectTasks.map(task => ({ 
    id: task.id, 
    completed: task.completed, 
    current: task.current, 
    target: task.target, 
    score0to1: task.score0to1 
  })).join(',')]);

  // Efecto para actualizar el progreso anterior
  useEffect(() => {
    const currentProgress = realProgress;
    
    // Actualizar progreso anterior
    const timeoutId = setTimeout(() => setPreviousProgress(currentProgress), 100);
    
    return () => clearTimeout(timeoutId);
  }, [realProgress, previousProgress]);

  // Cálculos mejorados de tareas con dependencias correctas
  const taskStats = useMemo(() => {
    const notStarted = projectTasks.filter(task => 
      !task.completed && getTaskProgress(task) === 0
    ).length;
    
    const inProgress = projectTasks.filter(task => 
      !task.completed && getTaskProgress(task) > 0
    ).length;
    
    const completed = projectTasks.filter(task => isTaskCompleted(task)).length;
    
    const subjectiveTasks = projectTasks.filter(task => task.type === 'subjective').length;
    const numericTasks = projectTasks.filter(task => task.type === 'numeric').length;
    const booleanTasks = projectTasks.filter(task => task.type === 'boolean').length;

    return {
      notStarted,
      inProgress,
      completed,
      total: projectTasks.length,
      byType: {
        subjective: subjectiveTasks,
        numeric: numericTasks,
        boolean: booleanTasks
      }
    };
  }, [projectTasks, projectTasks.map(task => ({ 
    id: task.id, 
    completed: task.completed, 
    current: task.current, 
    target: task.target, 
    score0to1: task.score0to1 
  })).join(',')]);

  // Filtrar tareas según los filtros activos
  const filteredTasks = useMemo(() => {
    let filtered = [...projectTasks];

    // Filtro por búsqueda
    if (taskSearchQuery.trim()) {
      const query = taskSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        (task.unit && task.unit.toLowerCase().includes(query))
      );
    }

    // Filtro por estado
    if (taskStatusFilter !== 'all') {
      filtered = filtered.filter(task => {
        const progress = getTaskProgress(task);
        const completed = isTaskCompleted(task);
        
        switch (taskStatusFilter) {
          case 'not-started':
            return !completed && progress === 0;
          case 'in-progress':
            return !completed && progress > 0;
          case 'completed':
            return completed;
          default:
            return true;
        }
      });
    }

    // Filtro por tipo
    if (taskTypeFilter !== 'all') {
      filtered = filtered.filter(task => task.type === taskTypeFilter);
    }

    return filtered;
  }, [projectTasks, taskStatusFilter, taskTypeFilter, taskSearchQuery]);

  // Helper para obtener miembros asignados a una tarea (hereda de project.assignedTo o task.assignedTo directo)
  const findMemberById = (id: string) => {
    const pool: any[] = (project as any).assignedTo || [];
    return pool.find(m => m.id === id);
  };

  // Normalizar asignaciones multi-miembro en tareas (si una tarea trae task.assignedTo es un array de ids u objetos)
  const enrichTaskMembers = (task: DailyTask) => {
    const raw = (task as any).assignedTo; // podría ser undefined | [] | usuarios ya
    if (!raw) return [] as any[];
    const list = Array.isArray(raw) ? raw : [raw];
    return list.map(entry => {
      if (typeof entry === 'string') return findMemberById(entry) || { id: entry, name: entry };
      return entry; // ya es objeto usuario
    }).filter(Boolean);
  };

  // Alternar visibilidad del panel de selección de miembros para una tarea
  const toggleAssignmentPanel = (taskId: string) => {
    setOpenAssignmentPanels(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId); else next.add(taskId);
      return next;
    });
  };

  // Agregar o quitar un miembro de la tarea (multi-asignación)
  const handleToggleMember = (task: DailyTask, member: any) => {
    if (!onEditTask) return;
    const current: any[] = ((task as any).assignedTo || []).slice();
    const exists = current.some(m => m.id === member.id);
    const updated = exists ? current.filter(m => m.id !== member.id) : [...current, member];
    onEditTask({ ...task, assignedTo: updated } as any);
  };

  // ✨ SISTEMA DE HERENCIA DE COLORES CENTRALIZADO - REACTIVO ✨
  const { effectiveColorScheme, iconGradient, progressGradient, projectAccents } = useMemo(() => {
    const getEffectiveColorScheme = () => {
      // 1. Si el proyecto tiene color propio, usarlo
      if (project.colorScheme) {
        console.log('🎨 ProjectDetailScreen: Usando color propio del proyecto:', project.colorScheme);
        return project.colorScheme;
      }
      
      // 2. Si no, heredar de la carpeta padre
      if (parentFolder?.colorScheme) {
        console.log('🎨 ProjectDetailScreen: Heredando color de carpeta:', parentFolder.colorScheme);
        return parentFolder.colorScheme;
      }
      
      // 3. Fallback por defecto
      console.log('🎨 ProjectDetailScreen: Usando color por defecto');
      return 'default';
    };

    const effectiveColorScheme = getEffectiveColorScheme();
    console.log('🎨 ProjectDetailScreen: Color efectivo final:', effectiveColorScheme);
    console.log('🎨 ProjectDetailScreen: Proyecto actual:', { id: project.id, title: project.title, colorScheme: project.colorScheme, icon: project.icon });

    // Usar el sistema centralizado de esquemas de colores - IGUAL QUE FolderProjectsScreen
    const colorSchemes = ALL_COLOR_SCHEMES.reduce((acc, scheme) => {
      acc[scheme.name] = getColorSchemeGradient(scheme.name); // Usar gradiente vibrante, no con opacidad
      return acc;
    }, {} as Record<string, string>);

    const borderSchemes: Record<string, string> = {};
    const iconSchemes: Record<string, string> = {};
    const progressSchemes: Record<string, string> = {};
    const titleSchemes: Record<string, string> = {};

    // Generar automáticamente esquemas de borde, íconos, progreso y TÍTULOS para todos los colores
    Object.keys(colorSchemes).forEach(colorName => {
      // Para esquemas de borde, usar el gradiente vibrante con opacidad ligera
      borderSchemes[colorName] = `border-white/20`;
      
      // Para esquemas de íconos, usar el gradiente vibrante completo
      iconSchemes[colorName] = colorSchemes[colorName as keyof typeof colorSchemes];
      
      // Para barras de progreso, usar exactamente los mismos colores vibrantes
      progressSchemes[colorName] = colorSchemes[colorName as keyof typeof colorSchemes];
      
      // Para títulos, usar el mismo gradiente vibrante
      titleSchemes[colorName] = colorSchemes[colorName as keyof typeof colorSchemes];
    });

    // Asegurar defaults para evitar accesos undefined
    if (!borderSchemes.default) borderSchemes.default = 'border-white/20';
    if (!iconSchemes.default) iconSchemes.default = getColorSchemeGradient('default');
    if (!progressSchemes.default) progressSchemes.default = getColorSchemeGradient('default');
    if (!titleSchemes.default) titleSchemes.default = getColorSchemeGradient('default');

    // Obtener los colores finales usando el esquema efectivo
    const bgGradient = colorSchemes[effectiveColorScheme as keyof typeof colorSchemes] || colorSchemes.default;
    const iconGradient = iconSchemes[effectiveColorScheme as keyof typeof iconSchemes] || iconSchemes.default;
    const progressGradient = progressSchemes[effectiveColorScheme as keyof typeof progressSchemes] || progressSchemes.default;
    const titleGradient = titleSchemes[effectiveColorScheme as keyof typeof titleSchemes] || titleSchemes.default;

    // Crear projectAccents compatible con el sistema actual usando los colores heredados
    const inheritedProjectAccents = {
      primary: progressGradient, // Usar el gradiente sin opacidad para elementos principales
      secondary: iconGradient,   // Usar el gradiente con opacidad para elementos secundarios
      text: 'text-white',        // Texto siempre blanco sobre fondos con gradiente
      border: 'border-white/20', // Bordes siempre blancos con opacidad
      chip: 'bg-white/10',       // Chips con fondo blanco translúcido
      chipText: 'text-white'     // Texto de chips siempre blanco
    };

    return {
      effectiveColorScheme,
      iconGradient,
      progressGradient,
      projectAccents: inheritedProjectAccents
    };
  }, [project.colorScheme, project.icon, parentFolder?.colorScheme]); // ✨ Recalcular cuando cambien estos valores

  const getProjectBackground = () => {
    const backgroundMappings: Record<string, string> = {
      'midnight': 'from-slate-50 via-gray-100 to-slate-200',
      'midnight-blue': 'from-slate-50 via-blue-100 to-slate-200',
      'obsidian': 'from-gray-50 via-gray-100 to-gray-200',
      'electric-blue': 'from-blue-50 via-cyan-100 to-blue-200',
      'electric-green': 'from-green-50 via-emerald-100 to-green-200',
      'electric-purple': 'from-purple-50 via-pink-100 to-purple-200',
      'electric-pink': 'from-pink-50 via-fuchsia-100 to-pink-200',
      'electric-rose': 'from-rose-50 via-pink-100 to-rose-200',
      'electric-orange': 'from-orange-50 via-red-100 to-orange-200',
      'electric-teal': 'from-teal-50 via-cyan-100 to-teal-200',
      'electric-lime': 'from-lime-50 via-green-100 to-lime-200',
      'electric-gold': 'from-yellow-50 via-amber-100 to-yellow-200',
      'electric-amber': 'from-amber-50 via-orange-100 to-amber-200',
      'electric-cyan': 'from-cyan-50 via-sky-100 to-cyan-200',
      'electric-purple-neon': 'from-violet-50 via-purple-100 to-fuchsia-200',
      'cosmic': 'from-indigo-50 via-purple-100 to-indigo-200',
      'sunset': 'from-orange-50 via-pink-100 to-orange-200',
      'forest': 'from-green-50 via-emerald-100 to-teal-200',
      'ocean': 'from-cyan-50 via-teal-100 to-cyan-200',
      'fire': 'from-red-50 via-orange-100 to-red-200',
      'neon-cyan': 'from-cyan-50 via-teal-100 to-cyan-200',
      'neon-magenta': 'from-fuchsia-50 via-pink-100 to-fuchsia-200',
      'neon-violet': 'from-violet-50 via-purple-100 to-violet-200',
      'neon-green': 'from-lime-50 via-green-100 to-emerald-200',
      'neon-pink': 'from-pink-50 via-fuchsia-100 to-purple-200',
      'neon-blue': 'from-cyan-50 via-blue-100 to-indigo-200',
      'neon-yellow': 'from-yellow-50 via-amber-100 to-orange-200',
      'cyber-blue': 'from-blue-50 via-indigo-100 to-blue-200',
      'dark-storm': 'from-gray-50 via-slate-100 to-gray-200',
      'royal': 'from-indigo-50 via-purple-100 to-pink-200',
      'mint': 'from-emerald-50 via-cyan-100 to-blue-200',
      'gold': 'from-yellow-50 via-amber-100 to-orange-200',
      'emerald': 'from-emerald-50 via-green-100 to-teal-200',
      'ruby': 'from-red-50 via-rose-100 to-pink-200',
      'sapphire': 'from-blue-50 via-indigo-100 to-blue-200',
      'amethyst': 'from-purple-50 via-violet-100 to-purple-200',
      'topaz': 'from-amber-50 via-yellow-100 to-orange-200',
      'aquamarine': 'from-cyan-50 via-blue-100 to-teal-200',
      
      // NUEVOS COLORES NEÓN
      'neon-hot-pink': 'from-hot-pink-50 via-pink-100 to-rose-200',
      'neon-electric-blue': 'from-blue-50 via-sky-100 to-blue-200',
      'neon-toxic-green': 'from-lime-50 via-green-100 to-emerald-200',
      'neon-laser-red': 'from-red-50 via-rose-100 to-pink-200',
      'neon-cyber-yellow': 'from-yellow-50 via-amber-100 to-orange-200',
      'neon-plasma-purple': 'from-purple-50 via-violet-100 to-fuchsia-200',
      'neon-aqua': 'from-cyan-50 via-teal-100 to-blue-200',
      
      // COLORES CHICLE Y DULCES
      'bubblegum-pink': 'from-pink-50 via-pink-100 to-rose-200',
      'cotton-candy': 'from-pink-50 via-blue-100 to-purple-200',
      'strawberry-milk': 'from-pink-50 via-rose-100 to-red-200',
      'mint-cream': 'from-green-50 via-teal-100 to-cyan-200',
      'lemon-drop': 'from-yellow-50 via-yellow-100 to-amber-200',
      'grape-soda': 'from-purple-50 via-violet-100 to-indigo-200',
      'blue-raspberry': 'from-blue-50 via-indigo-100 to-purple-200',
      'orange-creamsicle': 'from-orange-50 via-orange-100 to-yellow-200',
      
      // GRADIENTES EXPERIMENTALES
      'aurora-borealis': 'from-green-50 via-blue-100 to-pink-200',
      'sunset-mars': 'from-red-50 via-orange-100 to-pink-200',
      'deep-space': 'from-indigo-50 via-purple-100 to-black/10',
      'toxic-waste': 'from-lime-50 via-green-100 to-green-200',
      'galaxy-swirl': 'from-purple-50 via-blue-100 to-green-200',
      'lava-flow': 'from-red-50 via-orange-100 to-red-200',
      'ocean-depths': 'from-blue-50 via-teal-100 to-blue-200',
      'rainbow-prism': 'from-red-50 via-yellow-100 to-purple-200',
      
      // COLORES METÁLICOS
      'chrome-shine': 'from-gray-50 via-slate-100 to-zinc-200',
      'gold-rush': 'from-yellow-50 via-amber-100 to-orange-200',
      'silver-moon': 'from-slate-50 via-gray-100 to-zinc-200',
      'copper-penny': 'from-orange-50 via-amber-100 to-red-200',
      'rose-gold': 'from-pink-50 via-rose-100 to-orange-200',
      'black-pearl': 'from-gray-50 via-slate-100 to-zinc-200',
      
      // COLORES CYBERPUNK
      'cyber-punk-blue': 'from-cyan-50 via-blue-100 to-indigo-200',
      'cyber-punk-pink': 'from-fuchsia-50 via-pink-100 to-rose-200',
      'cyber-punk-green': 'from-lime-50 via-green-100 to-emerald-200',
      'matrix-green': 'from-green-50 via-lime-100 to-green-200',
      'neon-city': 'from-purple-50 via-pink-100 to-cyan-200',
      'digital-dreams': 'from-blue-50 via-purple-100 to-pink-200',
      
      // COLORES RETRO WAVE
      'retro-wave-purple': 'from-purple-50 via-fuchsia-100 to-pink-200',
      'retro-wave-cyan': 'from-cyan-50 via-blue-100 to-purple-200',
      'synthwave-sunset': 'from-pink-50 via-purple-100 to-cyan-200',
      'vaporwave-aesthetic': 'from-purple-50 via-pink-100 to-cyan-200',
      'neon-80s': 'from-fuchsia-50 via-purple-100 to-blue-200',
      
      // COLORES NATURALES VIBRANTES
      'tropical-sunset': 'from-orange-50 via-pink-100 to-purple-200',
      'amazon-jungle': 'from-green-50 via-emerald-100 to-teal-200',
      'coral-reef': 'from-orange-50 via-pink-100 to-red-200',
      'northern-lights': 'from-green-50 via-teal-100 to-blue-200',
      'desert-bloom': 'from-yellow-50 via-orange-100 to-red-200',
      'ocean-wave': 'from-blue-50 via-cyan-100 to-teal-200',
      
      'default': 'from-indigo-50 via-indigo-100 to-indigo-200'
    };
    return backgroundMappings[project.colorScheme || ''] || 'from-indigo-50 via-indigo-100 to-indigo-200';
  };

  const getProjectAccents = () => {
    const accentMappings: Record<string, { 
      primary: string; 
      secondary: string; 
      text: string; 
      border: string;
      chip: string;
      chipText: string;
    }> = {
      'midnight': { 
        primary: 'from-slate-500 to-gray-500', 
        secondary: 'from-slate-400 to-gray-400',
        text: 'text-slate-800',
        border: 'border-slate-200',
        chip: 'bg-slate-100',
        chipText: 'text-slate-700'
      },
      'electric-blue': { 
        primary: 'from-blue-500 to-cyan-500', 
        secondary: 'from-blue-400 to-cyan-400',
        text: 'text-blue-800',
        border: 'border-blue-200',
        chip: 'bg-blue-100',
        chipText: 'text-blue-700'
      },
      'electric-green': { 
        primary: 'from-green-500 to-emerald-500', 
        secondary: 'from-green-400 to-emerald-400',
        text: 'text-green-800',
        border: 'border-green-200',
        chip: 'bg-green-100',
        chipText: 'text-green-700'
      },
      'electric-purple': { 
        primary: 'from-purple-500 to-pink-500', 
        secondary: 'from-purple-400 to-pink-400',
        text: 'text-purple-800',
        border: 'border-purple-200',
        chip: 'bg-purple-100',
        chipText: 'text-purple-700'
      },
      'electric-pink': { 
        primary: 'from-pink-500 to-fuchsia-500', 
        secondary: 'from-pink-400 to-fuchsia-400',
        text: 'text-pink-800',
        border: 'border-pink-200',
        chip: 'bg-pink-100',
        chipText: 'text-pink-700'
      },
      'electric-rose': { 
        primary: 'from-rose-500 to-pink-500', 
        secondary: 'from-rose-400 to-pink-400',
        text: 'text-rose-800',
        border: 'border-rose-200',
        chip: 'bg-rose-100',
        chipText: 'text-rose-700'
      },
      'electric-orange': { 
        primary: 'from-orange-500 to-red-500', 
        secondary: 'from-orange-400 to-red-400',
        text: 'text-orange-800',
        border: 'border-orange-200',
        chip: 'bg-orange-100',
        chipText: 'text-orange-700'
      },
      'electric-teal': { 
        primary: 'from-teal-500 to-cyan-500', 
        secondary: 'from-teal-400 to-cyan-400',
        text: 'text-teal-800',
        border: 'border-teal-200',
        chip: 'bg-teal-100',
        chipText: 'text-teal-700'
      },
      'electric-lime': { 
        primary: 'from-lime-500 to-green-500', 
        secondary: 'from-lime-400 to-green-400',
        text: 'text-lime-800',
        border: 'border-lime-200',
        chip: 'bg-lime-100',
        chipText: 'text-lime-700'
      },
      'electric-gold': { 
        primary: 'from-yellow-500 to-amber-500', 
        secondary: 'from-yellow-400 to-amber-400',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        chip: 'bg-yellow-100',
        chipText: 'text-yellow-700'
      },
      'electric-amber': { 
        primary: 'from-amber-500 to-orange-500', 
        secondary: 'from-amber-400 to-orange-400',
        text: 'text-amber-800',
        border: 'border-amber-200',
        chip: 'bg-amber-100',
        chipText: 'text-amber-700'
      },
      'electric-cyan': { 
        primary: 'from-cyan-500 to-sky-500', 
        secondary: 'from-cyan-400 to-sky-400',
        text: 'text-cyan-800',
        border: 'border-cyan-200',
        chip: 'bg-cyan-100',
        chipText: 'text-cyan-700'
      },
      'electric-purple-neon': { 
        primary: 'from-violet-500 to-fuchsia-500', 
        secondary: 'from-violet-400 to-fuchsia-400',
        text: 'text-violet-800',
        border: 'border-violet-200',
        chip: 'bg-violet-100',
        chipText: 'text-violet-700'
      },
      'cosmic': { 
        primary: 'from-indigo-500 to-purple-500', 
        secondary: 'from-indigo-400 to-purple-400',
        text: 'text-indigo-800',
        border: 'border-indigo-200',
        chip: 'bg-indigo-100',
        chipText: 'text-indigo-700'
      },
      'sunset': { 
        primary: 'from-orange-500 to-pink-500', 
        secondary: 'from-orange-400 to-pink-400',
        text: 'text-orange-800',
        border: 'border-orange-200',
        chip: 'bg-orange-100',
        chipText: 'text-orange-700'
      },
      'forest': { 
        primary: 'from-green-500 to-emerald-500', 
        secondary: 'from-green-400 to-emerald-400',
        text: 'text-green-800',
        border: 'border-green-200',
        chip: 'bg-green-100',
        chipText: 'text-green-700'
      },
      'ocean': { 
        primary: 'from-cyan-500 to-teal-500', 
        secondary: 'from-cyan-400 to-teal-400',
        text: 'text-cyan-800',
        border: 'border-cyan-200',
        chip: 'bg-cyan-100',
        chipText: 'text-cyan-700'
      },
      'fire': { 
        primary: 'from-red-500 to-orange-500', 
        secondary: 'from-red-400 to-orange-400',
        text: 'text-red-800',
        border: 'border-red-200',
        chip: 'bg-red-100',
        chipText: 'text-red-700'
      },
      'neon-cyan': { 
        primary: 'from-cyan-400 to-teal-500', 
        secondary: 'from-cyan-300 to-teal-400',
        text: 'text-cyan-800',
        border: 'border-cyan-200',
        chip: 'bg-cyan-100',
        chipText: 'text-cyan-700'
      },
      'neon-magenta': { 
        primary: 'from-fuchsia-500 to-pink-500', 
        secondary: 'from-fuchsia-400 to-pink-400',
        text: 'text-fuchsia-800',
        border: 'border-fuchsia-200',
        chip: 'bg-fuchsia-100',
        chipText: 'text-fuchsia-700'
      },
      'neon-violet': { 
        primary: 'from-violet-500 to-purple-500', 
        secondary: 'from-violet-400 to-purple-400',
        text: 'text-violet-800',
        border: 'border-violet-200',
        chip: 'bg-violet-100',
        chipText: 'text-violet-700'
      },
      'neon-green': { 
        primary: 'from-lime-500 to-emerald-500', 
        secondary: 'from-lime-400 to-emerald-400',
        text: 'text-lime-800',
        border: 'border-lime-200',
        chip: 'bg-lime-100',
        chipText: 'text-lime-700'
      },
      'neon-pink': { 
        primary: 'from-pink-500 to-purple-500', 
        secondary: 'from-pink-400 to-purple-400',
        text: 'text-pink-800',
        border: 'border-pink-200',
        chip: 'bg-pink-100',
        chipText: 'text-pink-700'
      },
      'neon-blue': { 
        primary: 'from-cyan-500 to-indigo-500', 
        secondary: 'from-cyan-400 to-indigo-400',
        text: 'text-blue-800',
        border: 'border-blue-200',
        chip: 'bg-blue-100',
        chipText: 'text-blue-700'
      },
      'neon-yellow': { 
        primary: 'from-yellow-500 to-orange-500', 
        secondary: 'from-yellow-400 to-orange-400',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        chip: 'bg-yellow-100',
        chipText: 'text-yellow-700'
      },
      'cyber-blue': { 
        primary: 'from-blue-500 to-indigo-500', 
        secondary: 'from-blue-400 to-indigo-400',
        text: 'text-blue-800',
        border: 'border-blue-200',
        chip: 'bg-blue-100',
        chipText: 'text-blue-700'
      },
      'royal': { 
        primary: 'from-indigo-500 to-pink-500', 
        secondary: 'from-indigo-400 to-pink-400',
        text: 'text-indigo-800',
        border: 'border-indigo-200',
        chip: 'bg-indigo-100',
        chipText: 'text-indigo-700'
      },
      'mint': { 
        primary: 'from-emerald-500 to-blue-500', 
        secondary: 'from-emerald-400 to-blue-400',
        text: 'text-emerald-800',
        border: 'border-emerald-200',
        chip: 'bg-emerald-100',
        chipText: 'text-emerald-700'
      },
      'gold': { 
        primary: 'from-yellow-500 to-orange-500', 
        secondary: 'from-yellow-400 to-orange-400',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        chip: 'bg-yellow-100',
        chipText: 'text-yellow-700'
      },
      'emerald': { 
        primary: 'from-emerald-500 to-teal-500', 
        secondary: 'from-emerald-400 to-teal-400',
        text: 'text-emerald-800',
        border: 'border-emerald-200',
        chip: 'bg-emerald-100',
        chipText: 'text-emerald-700'
      },
      'ruby': { 
        primary: 'from-red-500 to-pink-500', 
        secondary: 'from-red-400 to-pink-400',
        text: 'text-red-800',
        border: 'border-red-200',
        chip: 'bg-red-100',
        chipText: 'text-red-700'
      },
      'sapphire': { 
        primary: 'from-blue-500 to-blue-600', 
        secondary: 'from-blue-400 to-blue-500',
        text: 'text-blue-800',
        border: 'border-blue-200',
        chip: 'bg-blue-100',
        chipText: 'text-blue-700'
      },
      'amethyst': { 
        primary: 'from-purple-500 to-violet-500', 
        secondary: 'from-purple-400 to-violet-400',
        text: 'text-purple-800',
        border: 'border-purple-200',
        chip: 'bg-purple-100',
        chipText: 'text-purple-700'
      },
      'topaz': { 
        primary: 'from-amber-500 to-orange-500', 
        secondary: 'from-amber-400 to-orange-400',
        text: 'text-amber-800',
        border: 'border-amber-200',
        chip: 'bg-amber-100',
        chipText: 'text-amber-700'
      },
      'aquamarine': { 
        primary: 'from-cyan-500 to-teal-500', 
        secondary: 'from-cyan-400 to-teal-400',
        text: 'text-cyan-800',
        border: 'border-cyan-200',
        chip: 'bg-cyan-100',
        chipText: 'text-cyan-700'
      },
      
      // NUEVOS COLORES NEÓN
      'neon-hot-pink': { 
        primary: 'from-hot-pink-500 to-rose-500', 
        secondary: 'from-hot-pink-400 to-rose-400',
        text: 'text-pink-800',
        border: 'border-pink-200',
        chip: 'bg-pink-100',
        chipText: 'text-pink-700'
      },
      'neon-electric-blue': { 
        primary: 'from-blue-500 to-sky-500', 
        secondary: 'from-blue-400 to-sky-400',
        text: 'text-blue-800',
        border: 'border-blue-200',
        chip: 'bg-blue-100',
        chipText: 'text-blue-700'
      },
      'neon-toxic-green': { 
        primary: 'from-lime-500 to-emerald-500', 
        secondary: 'from-lime-400 to-emerald-400',
        text: 'text-lime-800',
        border: 'border-lime-200',
        chip: 'bg-lime-100',
        chipText: 'text-lime-700'
      },
      'neon-laser-red': { 
        primary: 'from-red-500 to-pink-500', 
        secondary: 'from-red-400 to-pink-400',
        text: 'text-red-800',
        border: 'border-red-200',
        chip: 'bg-red-100',
        chipText: 'text-red-700'
      },
      'neon-cyber-yellow': { 
        primary: 'from-yellow-500 to-orange-500', 
        secondary: 'from-yellow-400 to-orange-400',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        chip: 'bg-yellow-100',
        chipText: 'text-yellow-700'
      },
      'neon-plasma-purple': { 
        primary: 'from-purple-500 to-fuchsia-500', 
        secondary: 'from-purple-400 to-fuchsia-400',
        text: 'text-purple-800',
        border: 'border-purple-200',
        chip: 'bg-purple-100',
        chipText: 'text-purple-700'
      },
      'neon-aqua': { 
        primary: 'from-cyan-500 to-blue-500', 
        secondary: 'from-cyan-400 to-blue-400',
        text: 'text-cyan-800',
        border: 'border-cyan-200',
        chip: 'bg-cyan-100',
        chipText: 'text-cyan-700'
      },
      
      // COLORES CHICLE Y DULCES
      'bubblegum-pink': { 
        primary: 'from-pink-400 to-rose-400', 
        secondary: 'from-pink-300 to-rose-300',
        text: 'text-pink-800',
        border: 'border-pink-200',
        chip: 'bg-pink-100',
        chipText: 'text-pink-700'
      },
      'cotton-candy': { 
        primary: 'from-pink-300 to-purple-400', 
        secondary: 'from-pink-200 to-purple-300',
        text: 'text-pink-800',
        border: 'border-pink-200',
        chip: 'bg-pink-100',
        chipText: 'text-pink-700'
      },
      'strawberry-milk': { 
        primary: 'from-pink-300 to-red-400', 
        secondary: 'from-pink-200 to-red-300',
        text: 'text-pink-800',
        border: 'border-pink-200',
        chip: 'bg-pink-100',
        chipText: 'text-pink-700'
      },
      'mint-cream': { 
        primary: 'from-green-300 to-cyan-400', 
        secondary: 'from-green-200 to-cyan-300',
        text: 'text-green-800',
        border: 'border-green-200',
        chip: 'bg-green-100',
        chipText: 'text-green-700'
      },
      'lemon-drop': { 
        primary: 'from-yellow-300 to-amber-400', 
        secondary: 'from-yellow-200 to-amber-300',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        chip: 'bg-yellow-100',
        chipText: 'text-yellow-700'
      },
      'grape-soda': { 
        primary: 'from-purple-400 to-indigo-500', 
        secondary: 'from-purple-300 to-indigo-400',
        text: 'text-purple-800',
        border: 'border-purple-200',
        chip: 'bg-purple-100',
        chipText: 'text-purple-700'
      },
      'blue-raspberry': { 
        primary: 'from-blue-400 to-purple-500', 
        secondary: 'from-blue-300 to-purple-400',
        text: 'text-blue-800',
        border: 'border-blue-200',
        chip: 'bg-blue-100',
        chipText: 'text-blue-700'
      },
      'orange-creamsicle': { 
        primary: 'from-orange-300 to-yellow-400', 
        secondary: 'from-orange-200 to-yellow-300',
        text: 'text-orange-800',
        border: 'border-orange-200',
        chip: 'bg-orange-100',
        chipText: 'text-orange-700'
      },
      
      // GRADIENTES EXPERIMENTALES
      'aurora-borealis': { 
        primary: 'from-green-400 to-pink-500', 
        secondary: 'from-green-300 to-pink-400',
        text: 'text-green-800',
        border: 'border-green-200',
        chip: 'bg-green-100',
        chipText: 'text-green-700'
      },
      'sunset-mars': { 
        primary: 'from-red-500 to-pink-500', 
        secondary: 'from-red-400 to-pink-400',
        text: 'text-red-800',
        border: 'border-red-200',
        chip: 'bg-red-100',
        chipText: 'text-red-700'
      },
      'deep-space': { 
        primary: 'from-indigo-800 to-black', 
        secondary: 'from-indigo-700 to-gray-900',
        text: 'text-indigo-800',
        border: 'border-indigo-200',
        chip: 'bg-indigo-100',
        chipText: 'text-indigo-700'
      },
      'toxic-waste': { 
        primary: 'from-lime-500 to-green-600', 
        secondary: 'from-lime-400 to-green-500',
        text: 'text-lime-800',
        border: 'border-lime-200',
        chip: 'bg-lime-100',
        chipText: 'text-lime-700'
      },
      'galaxy-swirl': { 
        primary: 'from-purple-600 to-green-500', 
        secondary: 'from-purple-500 to-green-400',
        text: 'text-purple-800',
        border: 'border-purple-200',
        chip: 'bg-purple-100',
        chipText: 'text-purple-700'
      },
      'lava-flow': { 
        primary: 'from-red-600 to-red-700', 
        secondary: 'from-red-500 to-red-600',
        text: 'text-red-800',
        border: 'border-red-200',
        chip: 'bg-red-100',
        chipText: 'text-red-700'
      },
      'ocean-depths': { 
        primary: 'from-blue-900 to-blue-800', 
        secondary: 'from-blue-800 to-blue-700',
        text: 'text-blue-800',
        border: 'border-blue-200',
        chip: 'bg-blue-100',
        chipText: 'text-blue-700'
      },
      'rainbow-prism': { 
        primary: 'from-red-400 to-purple-400', 
        secondary: 'from-red-300 to-purple-300',
        text: 'text-red-800',
        border: 'border-red-200',
        chip: 'bg-red-100',
        chipText: 'text-red-700'
      },
      
      // COLORES METÁLICOS
      'chrome-shine': { 
        primary: 'from-gray-400 to-zinc-500', 
        secondary: 'from-gray-300 to-zinc-400',
        text: 'text-gray-800',
        border: 'border-gray-200',
        chip: 'bg-gray-100',
        chipText: 'text-gray-700'
      },
      'gold-rush': { 
        primary: 'from-yellow-500 to-orange-600', 
        secondary: 'from-yellow-400 to-orange-500',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        chip: 'bg-yellow-100',
        chipText: 'text-yellow-700'
      },
      'silver-moon': { 
        primary: 'from-slate-400 to-zinc-500', 
        secondary: 'from-slate-300 to-zinc-400',
        text: 'text-slate-800',
        border: 'border-slate-200',
        chip: 'bg-slate-100',
        chipText: 'text-slate-700'
      },
      'copper-penny': { 
        primary: 'from-orange-600 to-red-600', 
        secondary: 'from-orange-500 to-red-500',
        text: 'text-orange-800',
        border: 'border-orange-200',
        chip: 'bg-orange-100',
        chipText: 'text-orange-700'
      },
      'rose-gold': { 
        primary: 'from-pink-400 to-orange-500', 
        secondary: 'from-pink-300 to-orange-400',
        text: 'text-pink-800',
        border: 'border-pink-200',
        chip: 'bg-pink-100',
        chipText: 'text-pink-700'
      },
      'black-pearl': { 
        primary: 'from-gray-800 to-zinc-800', 
        secondary: 'from-gray-700 to-zinc-700',
        text: 'text-gray-800',
        border: 'border-gray-200',
        chip: 'bg-gray-100',
        chipText: 'text-gray-700'
      },
      
      // COLORES CYBERPUNK
      'cyber-punk-blue': { 
        primary: 'from-cyan-500 to-indigo-600', 
        secondary: 'from-cyan-400 to-indigo-500',
        text: 'text-cyan-800',
        border: 'border-cyan-200',
        chip: 'bg-cyan-100',
        chipText: 'text-cyan-700'
      },
      'cyber-punk-pink': { 
        primary: 'from-fuchsia-500 to-rose-600', 
        secondary: 'from-fuchsia-400 to-rose-500',
        text: 'text-fuchsia-800',
        border: 'border-fuchsia-200',
        chip: 'bg-fuchsia-100',
        chipText: 'text-fuchsia-700'
      },
      'cyber-punk-green': { 
        primary: 'from-lime-500 to-emerald-600', 
        secondary: 'from-lime-400 to-emerald-500',
        text: 'text-lime-800',
        border: 'border-lime-200',
        chip: 'bg-lime-100',
        chipText: 'text-lime-700'
      },
      'matrix-green': { 
        primary: 'from-green-500 to-green-600', 
        secondary: 'from-green-400 to-green-500',
        text: 'text-green-800',
        border: 'border-green-200',
        chip: 'bg-green-100',
        chipText: 'text-green-700'
      },
      'neon-city': { 
        primary: 'from-purple-500 to-cyan-500', 
        secondary: 'from-purple-400 to-cyan-400',
        text: 'text-purple-800',
        border: 'border-purple-200',
        chip: 'bg-purple-100',
        chipText: 'text-purple-700'
      },
      'digital-dreams': { 
        primary: 'from-blue-500 to-pink-500', 
        secondary: 'from-blue-400 to-pink-400',
        text: 'text-blue-800',
        border: 'border-blue-200',
        chip: 'bg-blue-100',
        chipText: 'text-blue-700'
      },
      
      // COLORES RETRO WAVE
      'retro-wave-purple': { 
        primary: 'from-purple-600 to-pink-500', 
        secondary: 'from-purple-500 to-pink-400',
        text: 'text-purple-800',
        border: 'border-purple-200',
        chip: 'bg-purple-100',
        chipText: 'text-purple-700'
      },
      'retro-wave-cyan': { 
        primary: 'from-cyan-500 to-purple-600', 
        secondary: 'from-cyan-400 to-purple-500',
        text: 'text-cyan-800',
        border: 'border-cyan-200',
        chip: 'bg-cyan-100',
        chipText: 'text-cyan-700'
      },
      'synthwave-sunset': { 
        primary: 'from-pink-500 to-cyan-500', 
        secondary: 'from-pink-400 to-cyan-400',
        text: 'text-pink-800',
        border: 'border-pink-200',
        chip: 'bg-pink-100',
        chipText: 'text-pink-700'
      },
      'vaporwave-aesthetic': { 
        primary: 'from-purple-400 to-cyan-400', 
        secondary: 'from-purple-300 to-cyan-300',
        text: 'text-purple-800',
        border: 'border-purple-200',
        chip: 'bg-purple-100',
        chipText: 'text-purple-700'
      },
      'neon-80s': { 
        primary: 'from-fuchsia-500 to-blue-500', 
        secondary: 'from-fuchsia-400 to-blue-400',
        text: 'text-fuchsia-800',
        border: 'border-fuchsia-200',
        chip: 'bg-fuchsia-100',
        chipText: 'text-fuchsia-700'
      },
      
      // COLORES NATURALES VIBRANTES
      'tropical-sunset': { 
        primary: 'from-orange-500 to-purple-600', 
        secondary: 'from-orange-400 to-purple-500',
        text: 'text-orange-800',
        border: 'border-orange-200',
        chip: 'bg-orange-100',
        chipText: 'text-orange-700'
      },
      'amazon-jungle': { 
        primary: 'from-green-600 to-teal-600', 
        secondary: 'from-green-500 to-teal-500',
        text: 'text-green-800',
        border: 'border-green-200',
        chip: 'bg-green-100',
        chipText: 'text-green-700'
      },
      'coral-reef': { 
        primary: 'from-orange-400 to-red-500', 
        secondary: 'from-orange-300 to-red-400',
        text: 'text-orange-800',
        border: 'border-orange-200',
        chip: 'bg-orange-100',
        chipText: 'text-orange-700'
      },
      'northern-lights': { 
        primary: 'from-green-500 to-blue-600', 
        secondary: 'from-green-400 to-blue-500',
        text: 'text-green-800',
        border: 'border-green-200',
        chip: 'bg-green-100',
        chipText: 'text-green-700'
      },
      'desert-bloom': { 
        primary: 'from-yellow-500 to-red-600', 
        secondary: 'from-yellow-400 to-red-500',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        chip: 'bg-yellow-100',
        chipText: 'text-yellow-700'
      },
      'ocean-wave': { 
        primary: 'from-blue-500 to-teal-600', 
        secondary: 'from-blue-400 to-teal-500',
        text: 'text-blue-800',
        border: 'border-blue-200',
        chip: 'bg-blue-100',
        chipText: 'text-blue-700'
      },
      
      'default': { 
        primary: 'from-indigo-500 to-blue-500', 
        secondary: 'from-indigo-400 to-blue-400',
        text: 'text-indigo-800',
        border: 'border-indigo-200',
        chip: 'bg-indigo-100',
        chipText: 'text-indigo-700'
      }
    };
    return accentMappings[project.colorScheme || 'default'] || accentMappings.default;
  };

  const projectBackground = getProjectBackground();

  // Función para renderizar el icono del proyecto correctamente
  const renderProjectIcon = () => {
    const iconName = project.icon;
    if (typeof iconName === 'string') {
      // Si es string, buscar el componente en lucide-react
      const IconComponent = (Icons as any)[iconName];
      if (IconComponent) {
        return <IconComponent className="w-6 h-6" />;
      }
    }
    // Si ya es un componente o no se encuentra, renderizar directamente
    return project.icon || <Target className="w-6 h-6" />;
  };

  // Task types helpers
  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'boolean':
        return <CheckCircle2 className="w-3 h-3" />;
      case 'numeric':
        return <Target className="w-3 h-3" />;
      case 'subjective':
        return <Star className="w-3 h-3" />;
      default:
        return <CheckCircle2 className="w-3 h-3" />;
    }
  };

  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case 'boolean':
        return 'Sí/No';
      case 'numeric':
        return 'Numérica';
      case 'subjective':
        return 'Subjetiva';
      default:
        return 'Sí/No';
    }
  };

  if (showTasksView) {
    return (
      <PremiumDailyTasksPage
        dailyTasks={dailyTasks}
        onBack={() => setShowTasksView(false)}
        onToggleTask={onToggleTask}
        onUpdateTask={onUpdateTask}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onCreateTask={() => {
          // Abrir el nuevo compositor rápido en lugar del selector por tipos
          setShowQuickComposer(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden animate-fadeInScreen">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${progressGradient} opacity-5`}></div>
        <div className={`absolute top-0 left-0 w-96 h-96 bg-gradient-to-br ${iconGradient} rounded-full blur-3xl opacity-10 -translate-x-1/2 -translate-y-1/2`}></div>
        <div className={`absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br ${iconGradient} rounded-full blur-3xl opacity-15 translate-x-1/3 translate-y-1/3`}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-8 md:pt-12 px-3 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* PREMIUM TAREAS HEADER - IGUAL A CARPETAS Y PROYECTOS */}
          <div className="text-center mb-8 md:mb-10">
            {/* Icono principal con glow effect - hereda del proyecto - CLICKEABLE PARA PERSONALIZAR */}
            <button
              onClick={() => setShowCustomizeModal(true)}
              className={`relative w-20 h-20 rounded-3xl bg-gradient-to-br ${iconGradient} flex items-center justify-center mb-5 shadow-2xl mx-auto hover:scale-105 transition-transform cursor-pointer`}
              title="Click para personalizar proyecto"
            >
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${iconGradient} blur-xl opacity-50`}></div>
              {(() => {
                const IconComponent = Icons[project.icon as keyof typeof Icons] as any;
                return IconComponent ? (
                  <IconComponent className="w-9 h-9 text-white relative z-10" />
                ) : (
                  <Target className="w-9 h-9 text-white relative z-10" />
                );
              })()}
            </button>

            {/* Título y subtítulo estilo Carpetas y Proyectos */}
            <div className="mb-2">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={tempTitle}
                  placeholder="Nombre del proyecto"
                  onChange={(e) => {
                    setTempTitle(e.target.value);
                  }}
                  onFocus={(e) => {
                    e.target.select();
                  }}
                  onBlur={(e) => {
                    const newTitle = capitalizeFirst(tempTitle.trim());
                    if (onEditProjectTitle && newTitle) {
                      onEditProjectTitle(project.id, newTitle);
                    }
                    setIsEditingTitle(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const newTitle = capitalizeFirst(tempTitle.trim());
                      if (onEditProjectTitle && newTitle) {
                        onEditProjectTitle(project.id, newTitle);
                      }
                      setIsEditingTitle(false);
                    }
                    if (e.key === 'Escape') {
                      setTempTitle(project.title || '');
                      setIsEditingTitle(false);
                    }
                  }}
                  className="text-white font-bold text-2xl bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-center outline-none focus:border-white/40 focus:bg-white/15 transition-all max-w-full mx-auto"
                  maxLength={30}
                  autoFocus
                />
              ) : (
                <h1 
                  onClick={() => {
                    setTempTitle(project.title || '');
                    setIsEditingTitle(true);
                  }}
                  className="text-white font-bold text-2xl mb-1 tracking-tight cursor-pointer hover:opacity-80 transition-opacity" 
                  title="Click para editar nombre"
                >
                  {project.title || 'Sin nombre'}
                </h1>
              )}
            </div>
            <p className="text-white/50 text-sm">Tareas del proyecto</p>
            
            {/* Project Description - Más compacto */}
            {project.description && (
              <p className="text-white/40 text-xs mt-2 px-4 max-w-lg mx-auto leading-relaxed">
                {project.description}
              </p>
            )}
            
            {/* PROGRESS CHIPS - botones circulares minimalistas - IGUAL A CARPETAS Y PROYECTOS */}
            <div className="flex justify-center gap-3 mt-5 mb-4 md:mb-6">
              {/* Botón Regresar - AL INICIO */}
              <button
                onClick={onBack}
                className="relative group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 bg-white/[0.08] backdrop-blur-sm border border-white/[0.15] text-white/70 hover:bg-white/[0.15] hover:scale-105 hover:text-white"
                title="Regresar"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              {/* Botón Fusionado: Filtros de Tareas - CIRCULAR */}
              <button
                onClick={() => setShowTaskFilterMenu(!showTaskFilterMenu)}
                className={`relative group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                  showTaskFilterMenu || taskStatusFilter !== 'all' || taskTypeFilter !== 'all' || taskSearchQuery
                    ? `bg-gradient-to-r ${projectAccents.primary} text-white shadow-lg scale-110 ring-2 ring-white/30`
                    : `bg-white/[0.08] backdrop-blur-sm border border-white/[0.15] text-white/70 hover:bg-white/[0.15] hover:scale-105 hover:text-white`
                }`}
                title="Filtros de Tareas"
              >
                <Filter className="w-4 h-4" />
                {/* Indicador activo */}
                {(taskStatusFilter !== 'all' || taskTypeFilter !== 'all' || taskSearchQuery) && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse border border-white shadow-lg" />
                )}
              </button>
              
              {/* Botón de nueva tarea - IGUAL A CARPETAS */}
              <button
                onClick={() => setShowQuickComposer(true)}
                className={`relative group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 bg-gradient-to-r ${projectAccents.primary} text-white shadow-lg hover:scale-110 hover:shadow-xl ring-2 ring-white/20`}
                title="Nueva tarea"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tasks Section - Réplica exacta del estilo de Tareas Diarias */}
          <div className="mb-6 sm:mb-8">
            
            {/* Challenge Progress (if challenge mode) */}
            {project.mode === 'challenge' && (
              <ChallengeProgress 
                project={project}
                dailyTasks={projectTasks}
                projectProgress={realProgress}
              />
            )}
            
            {/* Competition Dashboard (if competition mode) */}
            {project.mode === 'competition' && (
              <CompetitionDashboard
                project={project}
                currentUserId={currentUserId}
                onUpdateProgress={(userId, progress) => {
                  if (onUpdateCompetitionProgress) {
                    onUpdateCompetitionProgress(project.id, userId, progress);
                  }
                }}
              />
            )}
            
            {/* Barra de progreso estilo carpetas - Simple y visual - OCULTA EN MODO RETO */}
            {taskStats.total > 0 && project.mode !== 'challenge' && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-white">Progreso General</span>
                  <span className="text-sm font-semibold text-white">
                    {taskStats.completed} de {taskStats.total} tareas
                  </span>
                </div>
                
                {/* Barra simple con porcentaje flotante que se desplaza */}
                <div className="relative w-full h-2.5 rounded-full bg-white/8 border border-white/15 shadow-inner overflow-visible">
                  <div 
                    className={`h-full bg-gradient-to-r ${progressGradient} transition-all duration-700 ease-out rounded-full shadow-lg`} 
                    style={{ width: `${Math.min(realProgress, 100)}%` }}
                  ></div>
                  {/* Círculo porcentaje flotante que acompaña la barra */}
                  <div 
                    className="absolute -top-8 transform -translate-x-1/2 transition-all duration-700 ease-out z-10"
                    style={{ 
                      left: `${Math.min(Math.max(realProgress, 5), 100)}%`,
                      opacity: realProgress > 0 ? 1 : 0
                    }}
                  >
                    <div className={`relative px-2.5 py-1 rounded-full bg-gradient-to-r ${progressGradient} shadow-lg border border-white/20`}>
                      <span className="text-white text-xs font-semibold drop-shadow-sm">{Math.round(realProgress)}%</span>
                      <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-r ${progressGradient} rotate-45 border-r border-b border-white/20`}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TYPE FILTERS - Minimalistas y compactos */}
            {showFilters && (
              <div className="mb-4 sm:mb-6">
                <div className="flex flex-wrap gap-1.5 justify-center">
                  <button
                    onClick={() => setTaskTypeFilter('all')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                      taskTypeFilter === 'all' 
                        ? `bg-gradient-to-r ${projectAccents.primary} text-white shadow-md scale-105` 
                        : `bg-white/[0.08] backdrop-blur-sm border border-white/[0.12] text-white/80 hover:bg-white/[0.12] hover:scale-105`
                    }`}
                  >
                    <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                    <span className="whitespace-nowrap">Todas ({taskStats.total})</span>
                  </button>
                  
                  <button
                    onClick={() => setTaskTypeFilter(taskTypeFilter === 'subjective' ? 'all' : 'subjective')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                      taskTypeFilter === 'subjective' 
                        ? `bg-gradient-to-r ${projectAccents.primary} text-white shadow-md scale-105` 
                        : `bg-white/[0.08] backdrop-blur-sm border border-white/[0.12] text-white/80 hover:bg-white/[0.12] hover:scale-105`
                    }`}
                  >
                    <Star className="w-3 h-3" />
                    <span className="whitespace-nowrap">Subjetivas ({taskStats.byType.subjective})</span>
                  </button>
                  
                  <button
                    onClick={() => setTaskTypeFilter(taskTypeFilter === 'numeric' ? 'all' : 'numeric')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                      taskTypeFilter === 'numeric' 
                        ? `bg-gradient-to-r ${projectAccents.primary} text-white shadow-md scale-105` 
                        : `bg-white/[0.08] backdrop-blur-sm border border-white/[0.12] text-white/80 hover:bg-white/[0.12] hover:scale-105`
                    }`}
                  >
                    <Target className="w-3 h-3" />
                    <span className="whitespace-nowrap">Numéricas ({taskStats.byType.numeric})</span>
                  </button>
                  
                  <button
                    onClick={() => setTaskTypeFilter(taskTypeFilter === 'boolean' ? 'all' : 'boolean')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                      taskTypeFilter === 'boolean' 
                        ? `bg-gradient-to-r ${projectAccents.primary} text-white shadow-md scale-105` 
                        : `bg-white/[0.08] backdrop-blur-sm border border-white/[0.12] text-white/80 hover:bg-white/[0.12] hover:scale-105`
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span className="whitespace-nowrap">Binarias ({taskStats.byType.boolean})</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tasks List - Nuevo diseño minimalista */}
            <div>
              {projectTasks.length === 0 ? (
                <div className="mb-6">
                  <button
                    onClick={() => setShowQuickComposer(true)}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/10 hover:border-white/20 rounded-2xl text-white/40 hover:text-white/70 transition-all duration-300 flex items-center justify-center gap-3 group hover:scale-[1.02]"
                  >
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${projectAccents.primary} group-hover:opacity-90 flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                      <Target className="w-5 h-5 text-white/80 group-hover:text-white" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-base font-semibold text-white/70 group-hover:text-white">Nueva Tarea</span>
                      <span className="text-sm text-white/40 group-hover:text-white/60">Crea tu primera tarea para este proyecto</span>
                    </div>
                  </button>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/[0.04] flex items-center justify-center border border-white/[0.08]">
                    <Filter className="w-6 h-6 text-white/40" />
                  </div>
                  <h4 className="text-lg font-bold text-white/90 mb-2">No hay tareas con estos filtros</h4>
                  <p className="text-white/60 text-sm mb-4">
                    Prueba ajustando los filtros o crea una nueva tarea
                  </p>
                  <button
                    onClick={() => {
                      setTaskStatusFilter('all');
                      setTaskTypeFilter('all');
                    }}
                    className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] text-white/60 hover:text-white/80 rounded-lg font-medium text-sm transition-all duration-200"
                  >
                    Mostrar todas las tareas
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTasks.map((task) => {
                    const isCompleted = isTaskCompleted(task);
                    const progress = task.type === 'numeric' 
                      ? ((task.current || 0) / (task.target || 1)) * 100 
                      : (task.score0to1 || 0) * 100;
                    
                    return (
                      <div
                        key={task.id}
                        className={`group relative rounded-xl border transition-all overflow-hidden ${
                          isCompleted 
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {/* Contenido principal de la tarjeta */}
                        <div className="p-4">
                          <div className="flex items-start gap-3 sm:gap-4">
                            {/* Checkbox - Funcional para toggle en todos los tipos */}
                            <button
                              onClick={() => {
                                if (task.type === 'boolean' && onToggleTask) {
                                  // Para tareas booleanas: toggle normal
                                  onToggleTask(task.id);
                                } else if (task.type === 'numeric' && onUpdateTask) {
                                  // Para tareas numéricas: si está completada, resetear a 0; si no, completar
                                  if (isCompleted) {
                                    onUpdateTask(task.id, 0);
                                  } else {
                                    onUpdateTask(task.id, task.target || 1);
                                  }
                                } else if (task.type === 'subjective' && onUpdateTask) {
                                  // Para tareas subjetivas: si está completada, resetear a 0; si no, completar a 1.0
                                  if (isCompleted) {
                                    onUpdateTask(task.id, 0);
                                  } else {
                                    onUpdateTask(task.id, 1.0);
                                  }
                                }
                              }}
                              className="flex-shrink-0 mt-0.5 group"
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform duration-200" />
                              ) : (
                                <Circle className="w-5 h-5 text-white/30 hover:text-emerald-400/80 group-hover:scale-105 transition-all duration-200" />
                              )}
                            </button>
                            
                            {/* Info de la tarea - idéntica a tareas diarias */}
                            <div className="flex-1 min-w-0">
                              <h3 className={`font-medium text-sm leading-relaxed break-words ${isCompleted ? 'text-white/50 line-through' : 'text-white/90'}`}>
                                {task.title}
                              </h3>
                              
                              {/* Solo mostrar descripción si existe y no es repetitiva */}
                              {task.description && 
                               !task.description.startsWith('Tarea del proyecto:') && 
                               task.description.trim() !== project.title && (
                                <p className={`text-xs mt-1 leading-relaxed break-words ${isCompleted ? 'text-white/30' : 'text-white/60'}`}>
                                  {task.description}
                                </p>
                              )}
                              
                              {/* Barra de progreso para tareas numéricas - Con botones + y - y campos editables */}
                              {task.type === 'numeric' && (
                                <div className="mt-2 sm:mt-3">
                                  {/* Campos editables - Más compactos */}
                                  <div className="flex items-center justify-center mb-2">
                                    <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-1">
                                      {/* Campo actual con icono - más compacto */}
                                      <div className="flex items-center gap-0.5 px-0.5">
                                        <Hash className="w-2.5 h-2.5 text-emerald-400 flex-shrink-0" />
                                        <input
                                          type="number"
                                          value={task.current || 0}
                                          onChange={(e) => {
                                            const value = parseInt(e.target.value) || 0;
                                            onUpdateTask?.(task.id, value);
                                          }}
                                          onFocus={(e) => e.target.select()}
                                          onClick={(e) => (e.target as HTMLInputElement).select()}
                                          className="w-10 h-5 text-xs text-center bg-transparent border-none text-white focus:outline-none"
                                          min="0"
                                          title="Progreso actual"
                                        />
                                      </div>
                                      
                                      <span className="text-white/40 text-xs px-0.5">/</span>
                                      
                                      {/* Campo objetivo con icono - más compacto */}
                                      <div className="flex items-center gap-0.5 px-0.5">
                                        <Flag className="w-2.5 h-2.5 text-blue-400 flex-shrink-0" />
                                        <input
                                          type="number"
                                          value={task.target || 1}
                                          onChange={(e) => {
                                            const value = Math.max(1, parseInt(e.target.value) || 1);
                                            if (onEditTask) {
                                              onEditTask({ ...task, target: value });
                                            }
                                          }}
                                          onFocus={(e) => e.target.select()}
                                          onClick={(e) => (e.target as HTMLInputElement).select()}
                                          className="w-10 h-5 text-xs text-center bg-transparent border-none text-white focus:outline-none"
                                          min="1"
                                          title="Meta a alcanzar"
                                        />
                                      </div>
                                      
                                      {/* Campo unidad con icono - más compacto */}
                                      <div className="flex items-center gap-0.5 px-0.5">
                                        <Tag className="w-2.5 h-2.5 text-purple-400 flex-shrink-0" />
                                        <input
                                          type="text"
                                          value={task.unit || ''}
                                          onChange={(e) => {
                                            if (onEditTask) {
                                              onEditTask({ ...task, unit: e.target.value });
                                            }
                                          }}
                                          onFocus={(e) => e.target.select()}
                                          onClick={(e) => (e.target as HTMLInputElement).select()}
                                          className="w-12 h-5 text-xs text-center bg-transparent border-none text-white focus:outline-none placeholder-white/30"
                                          placeholder="unidad"
                                          title="Tipo de unidad (ej: páginas, km, horas)"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Botones y barra de progreso con porcentaje circular seguidor */}
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        const newValue = Math.max(0, (task.current || 0) - 1);
                                        onUpdateTask?.(task.id, newValue);
                                      }}
                                      className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"
                                      disabled={(task.current || 0) <= 0}
                                    >
                                      <span className="text-sm font-bold">-</span>
                                    </button>
                                    
                                    {/* Barra de progreso más larga con porcentaje circular seguidor */}
                                    <div className="flex-1 relative min-w-[120px]">
                                      <div 
                                        className="bg-white/10 rounded-full h-4 overflow-hidden cursor-pointer"
                                        onClick={() => {
                                          const newValue = Math.min(task.target || 1, (task.current || 0) + 1);
                                          onUpdateTask?.(task.id, newValue);
                                        }}
                                      >
                                        <div 
                                          className={`h-full bg-gradient-to-r ${projectAccents.primary} transition-all duration-1000 ease-out relative overflow-hidden shadow-inner`}
                                          style={{ width: `${Math.min(100, progress)}%` }}
                                        >
                                          {/* Efecto de brillo sutil */}
                                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-1/4 h-full animate-pulse opacity-30" />
                                        </div>
                                      </div>
                                      
                                      {/* Porcentaje circular que sigue la barra con color heredado */}
                                      {progress > 5 && (
                                        <div 
                                          className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 rounded-full w-7 h-7 flex items-center justify-center shadow-lg transition-all duration-1000 ease-out bg-gradient-to-r ${projectAccents.primary}`}
                                          style={{ left: `${Math.min(100, Math.max(5, progress))}%` }}
                                        >
                                          <span className="text-[10px] font-bold text-white">{Math.round(progress)}%</span>
                                        </div>
                                      )}
                                      
                                      {/* Porcentaje fijo cuando el progreso es muy bajo */}
                                      {progress <= 5 && (
                                        <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 rounded-full w-6 h-6 flex items-center justify-center bg-gradient-to-r ${projectAccents.primary}`}>
                                          <span className="text-[9px] font-bold text-white">{Math.round(progress)}%</span>
                                        </div>
                                      )}
                                    </div>
                                    
                                    <button
                                      onClick={() => {
                                        const newValue = Math.min(task.target || 1, (task.current || 0) + 1);
                                        onUpdateTask?.(task.id, newValue);
                                      }}
                                      className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"
                                      disabled={(task.current || 0) >= (task.target || 1)}
                                    >
                                      <span className="text-sm font-bold">+</span>
                                    </button>
                                    
                                    {/* Botón inteligente para incremento personalizado */}
                                    {!customIncrementInputs[task.id] ? (
                                      <button
                                        onClick={() => {
                                          setCustomIncrementInputs(prev => ({...prev, [task.id]: true}));
                                          setCustomIncrementValues(prev => ({...prev, [task.id]: ''}));
                                        }}
                                        className="w-7 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"
                                        disabled={(task.current || 0) >= (task.target || 1)}
                                        title={`Avanzar múltiples ${task.unit || 'unidades'}`}
                                      >
                                        <Zap className="w-3 h-3" />
                                      </button>
                                    ) : (
                                      <div className="flex items-center gap-1">
                                        <input
                                          type="number"
                                          value={customIncrementValues[task.id] || ''}
                                          onChange={(e) => {
                                            setCustomIncrementValues(prev => ({...prev, [task.id]: e.target.value}));
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              const value = parseInt(customIncrementValues[task.id] || '0');
                                              if (!isNaN(value) && value > 0) {
                                                const newValue = Math.min(task.target || 1, (task.current || 0) + value);
                                                onUpdateTask?.(task.id, newValue);
                                              }
                                              setCustomIncrementInputs(prev => ({...prev, [task.id]: false}));
                                              setCustomIncrementValues(prev => ({...prev, [task.id]: ''}));
                                            } else if (e.key === 'Escape') {
                                              setCustomIncrementInputs(prev => ({...prev, [task.id]: false}));
                                              setCustomIncrementValues(prev => ({...prev, [task.id]: ''}));
                                            }
                                          }}
                                          onBlur={() => {
                                            const value = parseInt(customIncrementValues[task.id] || '0');
                                            if (!isNaN(value) && value > 0) {
                                              const newValue = Math.min(task.target || 1, (task.current || 0) + value);
                                              onUpdateTask?.(task.id, newValue);
                                            }
                                            setCustomIncrementInputs(prev => ({...prev, [task.id]: false}));
                                            setCustomIncrementValues(prev => ({...prev, [task.id]: ''}));
                                          }}
                                          className="w-12 h-6 text-xs text-center bg-white/20 border border-white/30 rounded text-white focus:outline-none focus:bg-white/30"
                                          placeholder="+"
                                          min="1"
                                          autoFocus
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {/* Estrellas para tareas subjetivas - Sistema de 10 estrellas */}
                              {task.type === 'subjective' && (
                                <div className="flex gap-1 sm:gap-1.5 mt-2 sm:mt-3 flex-wrap">
                                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                                    <button
                                      key={star}
                                      onClick={() => onUpdateTask?.(task.id, star / 10)}
                                      className="group/star p-0.5 sm:p-1"
                                    >
                                      <Star 
                                        className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-all group-hover/star:scale-110 ${
                                          ((task.score0to1 || 0) * 10) >= star 
                                            ? 'text-yellow-400 fill-yellow-400' 
                                            : 'text-white/20 hover:text-yellow-400/60'
                                        }`} 
                                      />
                                    </button>
                                  ))}
                                </div>
                              )}

                              {/* Información adicional del proyecto - solo reloj y círculos del equipo */}
                              <div className="flex items-center gap-2 mt-3 flex-wrap">
                                {/* Reloj solo ícono - más pequeño y minimalista */}
                                <button
                                  onClick={() => {
                                    setSelectedTaskForSchedule(task);
                                    setShowScheduleModal(true);
                                  }}
                                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                                    task.dueDate 
                                      ? 'bg-orange-500/20 border border-orange-500/30 hover:bg-orange-500/30' 
                                      : 'bg-white/[0.06] border border-white/[0.12] hover:bg-white/[0.12] hover:bg-orange-500/20'
                                  }`}
                                  title={
                                    task.dueDate 
                                      ? `Fecha límite: ${new Date(task.dueDate).toLocaleDateString()}${task.dueTime ? ` a las ${task.dueTime}` : ''}` 
                                      : "Configurar horarios y fecha"
                                  }
                                >
                                  <Clock className={`w-3 h-3 ${task.dueDate ? 'text-orange-400' : 'text-white/40'}`} />
                                </button>

                                {/* Círculos del equipo - Más pequeños y minimalistas como en la imagen */}
                                <div className="flex items-center gap-1 ml-2">
                                  {teamMembers.slice(0, 3).map((member) => {
                                    // Usar estado local o asignaciones existentes
                                    const assignedMembers = taskAssignments[task.id] || 
                                      (task.assignedTo?.map((u: User) => u.id) || []);
                                    const isAssigned = assignedMembers.includes(member.id);
                                    const memberColor = getMemberColor(member.id, member.name);
                                    const initials = getInitials(member.name);
                                    
                                    return (
                                      <button
                                        key={member.id}
                                        onClick={() => {
                                          // Toggle assignment usando estado local
                                          const currentAssigned = taskAssignments[task.id] || [];
                                          const newAssigned = isAssigned 
                                            ? currentAssigned.filter(id => id !== member.id)
                                            : [...currentAssigned, member.id];
                                          
                                          // Actualizar estado local
                                          setTaskAssignments(prev => ({
                                            ...prev,
                                            [task.id]: newAssigned
                                          }));
                                          
                                          // Llamar a la función de actualización si existe
                                          const updatedUsers = teamMembers.filter(m => newAssigned.includes(m.id));
                                          onUpdateTaskAssignment?.(task.id, updatedUsers);
                                        }}
                                        className={`w-6 h-6 rounded-full text-xs font-medium flex items-center justify-center transition-all duration-200 ${
                                          isAssigned 
                                            ? `text-white shadow-sm scale-105` 
                                            : 'bg-white/8 text-white/40 hover:bg-white/15 hover:text-white/70 hover:scale-105 border border-white/10'
                                        }`}
                                        style={{
                                          backgroundColor: isAssigned ? memberColor : undefined
                                        }}
                                        title={`${member.name} - ${currentTeam.name}${isAssigned ? ' (Asignado)' : ''}`}
                                      >
                                        {initials}
                                      </button>
                                    );
                                  })}
                                  
                                  {/* Mostrar +N si hay más miembros - también más pequeño */}
                                  {teamMembers.length > 3 && (
                                    <span 
                                      className="w-6 h-6 rounded-full bg-white/8 text-white/40 text-xs font-medium flex items-center justify-center border border-white/10"
                                      title={`+${teamMembers.length - 3} miembros más de ${currentTeam.name}`}
                                    >
                                      +{teamMembers.length - 3}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Botón de eliminar en línea */}
                            <button
                              onClick={() => setTaskToDelete(task.id)}
                              className="w-6 h-6 rounded-full bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-400/30 transition-all duration-200 flex items-center justify-center group/delete flex-shrink-0"
                              title="Eliminar tarea"
                            >
                              <X className="w-3 h-3 text-white/40 group-hover/delete:text-red-300 transition-colors duration-200" />
                            </button>
                          </div>
                        </div>

                        {/* Cronómetro regresivo - Al lado del botón Start, alineado al texto */}
                        {task.estimatedDuration && (
                          <div className="absolute bottom-2 right-24">
                            <div className="flex items-center gap-1.5">
                              <Clock className={`w-3.5 h-3.5 ${
                                taskTimers[task.id]?.isActive 
                                  ? 'text-orange-400 animate-pulse' 
                                  : taskTimers[task.id]?.isPaused
                                  ? 'text-yellow-400'
                                  : 'text-white/70'
                              }`} />
                              <span className={`text-xs font-medium tabular-nums ${
                                taskTimers[task.id]?.isActive 
                                  ? 'text-orange-300 font-bold' 
                                  : taskTimers[task.id]?.isPaused
                                  ? 'text-yellow-300 font-bold'
                                  : 'text-white/80'
                              }`}>
                                {(() => {
                                  const timer = taskTimers[task.id];
                                  const timeToShow = timer?.remainingTime ?? task.estimatedDuration;
                                  const hours = Math.floor(timeToShow / 3600);
                                  const minutes = Math.floor((timeToShow % 3600) / 60);
                                  const seconds = Math.floor(timeToShow % 60);
                                  
                                  // Debug para ver qué está pasando
                                  if (timer?.isActive) {
                                    console.log(`Rendering timer ${task.id}: ${timeToShow}s -> ${minutes}:${seconds.toString().padStart(2, '0')}`);
                                  }
                                  
                                  // Siempre mostrar formato con segundos
                                  if (hours > 0) {
                                    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                                  }
                                  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
                                })()}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {/* Botones de control de cronómetro */}
                        <div className="absolute bottom-0 right-0">
                          {isTaskCompleted(task) ? (
                            // Tarea completada - solo mostrar ícono de completado
                            <button
                              disabled
                              className="px-3 py-2 bg-white/10 opacity-50 cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-1.5 rounded-tl-xl"
                              title="Tarea completada"
                            >
                              <CheckCircle className="w-3.5 h-3.5 text-white/60" />
                              <span className="text-xs font-medium text-white/60">Done</span>
                            </button>
                          ) : taskTimers[task.id]?.isActive || taskTimers[task.id]?.isPaused ? (
                            // Timer activo o pausado - EL MISMO botón Start dividido en dos mitades exactas
                            <div className="flex">
                              {/* Mitad izquierda - Pausa/Reanudar - Exactamente la mitad del Start original */}
                              <button
                                onClick={() => {
                                  if (taskTimers[task.id]?.isActive) {
                                    pauseTimer(task.id);
                                  } else if (taskTimers[task.id]?.isPaused) {
                                    resumeTimer(task.id);
                                  }
                                }}
                                className={`px-1.5 py-2 transition-all duration-200 flex items-center justify-center gap-1 group/pause hover:opacity-90 ${
                                  taskTimers[task.id]?.isActive 
                                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500' 
                                    : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                                }`}
                                title={taskTimers[task.id]?.isActive ? 'Pausar cronómetro' : 'Reanudar cronómetro'}
                              >
                                {taskTimers[task.id]?.isActive ? (
                                  <svg className="w-3 h-3 text-white group-hover/pause:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                                    <rect x="6" y="4" width="4" height="16"/>
                                    <rect x="14" y="4" width="4" height="16"/>
                                  </svg>
                                ) : (
                                  <svg className="w-3 h-3 text-white group-hover/pause:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                  </svg>
                                )}
                              </button>

                              {/* Mitad derecha - Completar - La otra mitad exacta del Start original */}
                              <button
                                onClick={() => completeTask(task.id)}
                                className="px-1.5 py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-1 group/complete rounded-tl-xl"
                                title="Completar tarea"
                              >
                                <CheckCircle className="w-3 h-3 text-white group-hover/complete:scale-110 transition-transform duration-200" />
                              </button>
                            </div>
                          ) : (
                            // Estado inicial - botón Start
                            <button
                              onClick={() => {
                                if (task.estimatedDuration) {
                                  startTimer(task.id, task.estimatedDuration);
                                }
                              }}
                              className={`px-3 py-2 bg-gradient-to-r ${projectAccents.primary} hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-1.5 group/play rounded-tl-xl`}
                              title="Iniciar cronómetro"
                            >
                              <svg 
                                className="w-3.5 h-3.5 text-white group-hover/play:scale-110 transition-transform duration-200" 
                                fill="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                              <span className="text-xs font-medium text-white">Start</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Botón Nueva Tarea - Estilo Nuevo Proyecto */}
                  <button
                    onClick={() => setShowQuickComposer(true)}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/10 hover:border-white/20 rounded-2xl text-white/40 hover:text-white/70 transition-all duration-300 flex items-center justify-center gap-3 group hover:scale-[1.02]"
                  >
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${projectAccents.primary} group-hover:opacity-90 flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                      <Target className="w-5 h-5 text-white/80 group-hover:text-white" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-base font-semibold text-white/70 group-hover:text-white">Nueva Tarea</span>
                      <span className="text-sm text-white/40 group-hover:text-white/60">Agrega una tarea a este proyecto</span>
                    </div>
                  </button>

                  {/* Botón estadísticas de tiempo */}
                  {projectTasks.length > 0 && (
                    <button
                      onClick={() => setShowTimeStats(true)}
                      className="w-full p-2.5 sm:p-3 border border-white/[0.15] hover:border-blue-400/40 hover:bg-blue-500/[0.05] rounded-lg sm:rounded-xl text-white/60 hover:text-white/90 transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm mt-2"
                    >
                      <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Ver resumen de tiempo
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* SCORING EXPLANATION SECTION - NEW FEATURE */}
          {projectTasks.length > 0 && (
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl sm:rounded-2xl p-4 sm:p-6 mt-4 sm:mt-6">
              <button
                onClick={() => setShowScoringExplanation(!showScoringExplanation)}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] transition-all duration-200 text-white/80"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
                  <span className="font-medium text-white/90">¿Cómo se calcula la puntuación?</span>
                </div>
                <div className={`transform transition-transform duration-200 ${showScoringExplanation ? 'rotate-180' : ''}`}>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {showScoringExplanation && (
                <div className="mt-4 p-4 bg-white/[0.04] rounded-lg border border-white/[0.08]">
                  <h4 className="font-semibold text-white/90 mb-3">Sistema de Ponderación de Tareas</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-white/80 mb-2">Tipos de Tareas:</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-white/70"><strong className="text-white/90">Sí/No:</strong> Peso base = 1 punto</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-blue-400" />
                          <span className="text-white/70"><strong className="text-white/90">Numéricas:</strong> Peso basado en objetivo (1-10 puntos)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-amber-400" />
                          <span className="text-white/70"><strong className="text-white/90">Subjetivas:</strong> Peso fijo = 3 puntos</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-white/80 mb-2">Estadísticas del Proyecto:</h5>
                      <div className="space-y-2 text-sm text-white/70">
                        <div>Total de tareas: <strong className="text-white/90">{projectTasks.length}</strong></div>
                        <div>Peso total: <strong className="text-white/90">{projectProgress.totalWeight}</strong></div>
                        <div>Peso completado: <strong className="text-white/90">{Math.round(projectProgress.completedWeight * 100) / 100}</strong></div>
                        <div>Progreso: <strong className="text-emerald-400">{Math.round(projectProgress.progress)}%</strong></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-white/[0.04] rounded-lg border border-white/[0.08]">
                    <p className="text-sm text-white/60">
                      <strong className="text-white/80">💡 Ejemplo:</strong> Una tarea de &quot;Leer 500 páginas&quot; tendrá un peso mayor que &quot;Verificar enlaces&quot; 
                      porque requiere más esfuerzo y tiempo. El progreso se calcula proporcionalmente según estos pesos.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Task Type Selector Modal */}
      {showTaskTypeSelector && (
        <TaskTypeSelector
          isOpen={showTaskTypeSelector}
          onClose={() => setShowTaskTypeSelector(false)}
          onCreateTask={(taskData: any) => {
            if (onAddTask) {
              onAddTask(project.id, taskData);
            }
            setShowTaskTypeSelector(false);
          }}
          projectTitle={project.title}
          projectIcon={project.icon}
          projectColorScheme={effectiveColorScheme}
        />
      )}

      {/* Quick Task Composer */}
      <QuickTaskComposer
        isOpen={showQuickComposer}
        onClose={() => setShowQuickComposer(false)}
        projectTitle={project.title}
        onCreateTasks={(tasks: QuickTaskComposerTask[]) => {
          if (!onAddTask) return;
          console.log('📝 Creando tareas (bulk):', tasks.length, tasks);
          const payload = tasks.map(t => ({
            title: t.title,
            description: t.description,
            type: t.type,
            priority: t.priority || 'media',
            target: t.target,
            unit: t.unit,
            dueDate: t.dueDate,
            dueTime: t.dueTime,
            estimatedDuration: t.estimatedDuration // Agregar duración estimada
          }));
          console.log('📦 Payload a enviar:', payload);
          onAddTask(project.id, payload);
        }}
      />
      {taskToDelete && onDeleteTask && (
        <DeleteConfirmationModal
          isOpen={true}
          onClose={() => setTaskToDelete(null)}
          onConfirm={() => {
            if (taskToDelete && onDeleteTask) {
              onDeleteTask(taskToDelete);
            }
            setTaskToDelete(null);
          }}
          itemName={projectTasks.find(t=>t.id===taskToDelete)?.title || 'tarea'}
          itemType="tarea"
          warningMessage="Esta acción eliminará permanentemente la tarea. No se puede deshacer."
        />
      )}

      {/* Task Schedule Modal */}
      {showScheduleModal && selectedTaskForSchedule && (
        <TaskScheduleModal
          isOpen={showScheduleModal}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedTaskForSchedule(null);
          }}
          task={selectedTaskForSchedule}
          onSave={(scheduleData) => {
            // Aquí podrías llamar a una función para actualizar los horarios de la tarea
            // onUpdateTaskSchedule?.(selectedTaskForSchedule.id, scheduleData);
            console.log('Horarios guardados:', scheduleData);
          }}
        />
      )}

      {/* Pantalla de modo enfoque */}
      {showFocusMode && focusTask && (
        <FocusModeScreen
          task={focusTask}
          project={project}
          isOpen={showFocusMode}
          onClose={() => {
            setShowFocusMode(false);
            setFocusTask(null);
          }}
          onTaskComplete={(taskId, timeSpent) => {
            // Detener el tracking del contexto global
            stopTaskTracking(taskId);
            // Marcar la tarea como completada
            onToggleTask?.(taskId, 1);
            console.log(`✅ Tarea ${taskId} completada en ${timeSpent} segundos`);
            console.log('🛑 Tracking detenido y guardado en el contexto global');
          }}
          onTimeUpdate={(taskId, timeSpent) => {
            timeTracking.updateCurrentTime(taskId, timeSpent);
          }}
        />
      )}

      {/* Modal de estadísticas de tiempo */}
      {showTimeStats && (
        <TimeStatsModal
          project={project}
          tasks={projectTasks}
          isOpen={showTimeStats}
          onClose={() => setShowTimeStats(false)}
        />
      )}

      {/* Modal de Filtros de Tareas - IGUAL AL DE CARPETAS */}
      {showTaskFilterMenu && (
        <div className="fixed inset-0 z-[1000] bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 animate-in fade-in duration-300">
          {/* Overlay con efecto de cristal y animación */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-3xl animate-in fade-in duration-500"></div>
          
          {/* Patrón de fondo sutil */}
          <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
          
          <div className="absolute inset-0 flex flex-col animate-in slide-in-from-bottom-4 duration-500">
            
            {/* Header Premium - IGUAL A CARPETAS */}
            <div className="relative flex flex-col items-center justify-center pt-10 pb-6">
              {/* Icono principal con glow effect */}
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-400 via-violet-500 to-indigo-500 flex items-center justify-center mb-5 shadow-2xl shadow-purple-500/50">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-400 to-violet-500 blur-xl opacity-50"></div>
                <Filter className="w-9 h-9 text-white relative z-10" />
              </div>
              
              <h1 className="text-white font-bold text-2xl mb-1 tracking-tight">Filtrar Tareas</h1>
              <p className="text-white/50 text-sm">
                Encuentra y organiza tus tareas
              </p>
              
              {/* Botón cerrar flotante en esquina superior derecha */}
              <div className="absolute top-6 right-6">
                <button 
                  onClick={() => setShowTaskFilterMenu(false)}
                  className="w-10 h-10 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                  title="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content - Búsqueda y Filtros */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <div className="max-w-md mx-auto space-y-6">
                {/* Barra de Búsqueda - ESTILO CARPETAS */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 z-10" />
                  <input
                    type="text"
                    value={taskSearchQuery}
                    onChange={(e) => setTaskSearchQuery(e.target.value)}
                    placeholder="Buscar tareas..."
                    className="w-full bg-white/5 backdrop-blur-md border border-white/10 text-white placeholder-white/30 pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300 text-base font-medium"
                  />
                  {taskSearchQuery && (
                    <button
                      onClick={() => setTaskSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all border border-white/10 z-10"
                    >
                      <X className="w-4 h-4 text-white/60" />
                    </button>
                  )}
                </div>

                {/* Grid de filtros - SOLO SI NO HAY BÚSQUEDA */}
                {!taskSearchQuery && (
                  <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                    {/* Filtros por Estado */}
                    <button
                      onClick={() => {
                        setTaskStatusFilter(taskStatusFilter === 'all' ? 'all' : 'all');
                        setShowTaskFilterMenu(false);
                      }}
                      className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-md border ${
                        taskStatusFilter === 'all' 
                          ? 'bg-white/10 border-purple-400/50 hover:bg-white/15' 
                          : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
                      }`}
                      style={{ minHeight: '110px' }}
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-500 shadow-xl">
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl blur-xl opacity-50"></div>
                          <Target className="w-6 h-6 text-white relative z-10" />
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-white">Todas</div>
                          <div className="text-xs text-white/60 font-medium">{taskStats.total}</div>
                        </div>
                      </div>
                      {taskStatusFilter === 'all' && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setTaskStatusFilter(taskStatusFilter === 'not-started' ? 'all' : 'not-started');
                        setShowTaskFilterMenu(false);
                      }}
                      className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-md border ${
                        taskStatusFilter === 'not-started' 
                          ? 'bg-white/10 border-purple-400/50 hover:bg-white/15' 
                          : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
                      }`}
                      style={{ minHeight: '110px' }}
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-slate-500 to-gray-600 shadow-xl">
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-500 to-gray-600 rounded-2xl blur-xl opacity-50"></div>
                          <Circle className="w-6 h-6 text-white relative z-10" />
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-white">Sin iniciar</div>
                          <div className="text-xs text-white/60 font-medium">{taskStats.notStarted}</div>
                        </div>
                      </div>
                      {taskStatusFilter === 'not-started' && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setTaskStatusFilter(taskStatusFilter === 'in-progress' ? 'all' : 'in-progress');
                        setShowTaskFilterMenu(false);
                      }}
                      className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-md border ${
                        taskStatusFilter === 'in-progress' 
                          ? 'bg-white/10 border-purple-400/50 hover:bg-white/15' 
                          : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
                      }`}
                      style={{ minHeight: '110px' }}
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-500 shadow-xl">
                          <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl blur-xl opacity-50"></div>
                          <Clock className="w-6 h-6 text-white relative z-10" />
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-white">En progreso</div>
                          <div className="text-xs text-white/60 font-medium">{taskStats.inProgress}</div>
                        </div>
                      </div>
                      {taskStatusFilter === 'in-progress' && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setTaskStatusFilter(taskStatusFilter === 'completed' ? 'all' : 'completed');
                        setShowTaskFilterMenu(false);
                      }}
                      className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-md border ${
                        taskStatusFilter === 'completed' 
                          ? 'bg-white/10 border-purple-400/50 hover:bg-white/15' 
                          : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
                      }`}
                      style={{ minHeight: '110px' }}
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-green-500 shadow-xl">
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl blur-xl opacity-50"></div>
                          <CheckCircle2 className="w-6 h-6 text-white relative z-10" />
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-white">Completadas</div>
                          <div className="text-xs text-white/60 font-medium">{taskStats.completed}</div>
                        </div>
                      </div>
                      {taskStatusFilter === 'completed' && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>

                    {/* Filtros por Tipo */}
                    <button
                      onClick={() => {
                        setTaskTypeFilter(taskTypeFilter === 'boolean' ? 'all' : 'boolean');
                        setShowTaskFilterMenu(false);
                      }}
                      className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-md border ${
                        taskTypeFilter === 'boolean' 
                          ? 'bg-white/10 border-purple-400/50 hover:bg-white/15' 
                          : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
                      }`}
                      style={{ minHeight: '110px' }}
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-500 shadow-xl">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl blur-xl opacity-50"></div>
                          <ToggleLeft className="w-6 h-6 text-white relative z-10" />
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-white">Booleanas</div>
                          <div className="text-xs text-white/60 font-medium">
                            {projectTasks.filter(t => t.type === 'boolean').length}
                          </div>
                        </div>
                      </div>
                      {taskTypeFilter === 'boolean' && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setTaskTypeFilter(taskTypeFilter === 'numeric' ? 'all' : 'numeric');
                        setShowTaskFilterMenu(false);
                      }}
                      className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-md border ${
                        taskTypeFilter === 'numeric' 
                          ? 'bg-white/10 border-purple-400/50 hover:bg-white/15' 
                          : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
                      }`}
                      style={{ minHeight: '110px' }}
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-500 shadow-xl">
                          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl blur-xl opacity-50"></div>
                          <Hash className="w-6 h-6 text-white relative z-10" />
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-white">Numéricas</div>
                          <div className="text-xs text-white/60 font-medium">
                            {projectTasks.filter(t => t.type === 'numeric').length}
                          </div>
                        </div>
                      </div>
                      {taskTypeFilter === 'numeric' && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setTaskTypeFilter(taskTypeFilter === 'subjective' ? 'all' : 'subjective');
                        setShowTaskFilterMenu(false);
                      }}
                      className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-md border ${
                        taskTypeFilter === 'subjective' 
                          ? 'bg-white/10 border-purple-400/50 hover:bg-white/15' 
                          : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
                      }`}
                      style={{ minHeight: '110px' }}
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-pink-500 to-rose-500 shadow-xl">
                          <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl blur-xl opacity-50"></div>
                          <Star className="w-6 h-6 text-white relative z-10" />
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-white">Subjetivas</div>
                          <div className="text-xs text-white/60 font-medium">
                            {projectTasks.filter(t => t.type === 'subjective').length}
                          </div>
                        </div>
                      </div>
                      {taskTypeFilter === 'subjective' && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  </div>
                )}

                {/* Lista de tareas filtradas cuando hay búsqueda */}
                {taskSearchQuery && (
                  <div className="max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                      {projectTasks
                        .filter(task => task.title.toLowerCase().includes(taskSearchQuery.toLowerCase()))
                        .slice(0, 8)
                        .map((task) => (
                          <button
                            key={task.id}
                            onClick={() => {
                              setShowTaskFilterMenu(false);
                              setTaskSearchQuery('');
                            }}
                            className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/8 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center gap-3 text-left"
                          >
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${iconGradient} flex items-center justify-center shadow-lg`}>
                              {task.type === 'boolean' && <ToggleLeft className="w-4 h-4 text-white" />}
                              {task.type === 'numeric' && <Hash className="w-4 h-4 text-white" />}
                              {task.type === 'subjective' && <Star className="w-4 h-4 text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-white truncate">
                                {task.title}
                              </div>
                              <div className="text-xs text-white/50 font-medium">
                                {task.type === 'boolean' ? 'Booleana' : 
                                 task.type === 'numeric' ? 'Numérica' : 'Subjetiva'}
                              </div>
                            </div>
                          </button>
                        ))}
                    </div>
                    
                    {/* Mensaje si no hay resultados */}
                    {projectTasks.filter(task => task.title.toLowerCase().includes(taskSearchQuery.toLowerCase())).length === 0 && (
                      <div className="text-center py-12">
                        <div className="text-white/40 text-sm font-medium">
                          No se encontraron tareas
                        </div>
                        <div className="text-white/30 text-xs mt-1">
                          con &quot;{taskSearchQuery}&quot;
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Personalización del Proyecto */}
      {showCustomizeModal && (
        <FullScreenStyleModal
          isOpen={showCustomizeModal}
          onClose={() => setShowCustomizeModal(false)}
          type="project"
          title={project.title}
          currentIcon={project.icon || 'Target'}
          currentColorScheme={effectiveColorScheme}
          onSave={(data) => {
            // Actualizar título si cambió
            if (data.title && data.title !== project.title && onEditProjectTitle) {
              onEditProjectTitle(project.id, data.title);
            }
            // Actualizar icono y color - SIEMPRE actualizar para establecer colores propios
            if (onCustomizeProject) {
              onCustomizeProject(
                project.id, 
                data.icon || project.icon || 'Target', 
                data.colorScheme || effectiveColorScheme, // Usar el color efectivo actual si no se cambió
                data.title || project.title
              );
            }
            setShowCustomizeModal(false);
          }}
        />
      )}
    </div>
  );
}