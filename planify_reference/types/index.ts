// Types for the Productivity App - Flexible interfaces

export interface Project {
  id: string;
  title: string;
  description?: string;
  progress: number;
  status?: 'active' | 'completed' | 'paused';
  createdAt?: string;
  updatedAt?: string;
  folderId?: string;
  colorScheme?: string;
  icon?: string;
  items?: number;
  completedItems?: number;
  mode?: 'normal' | 'challenge' | 'competition';
  challengeConfig?: {
    totalDays: number;
    resetOnMiss: boolean;
    daysCompleted: string[]; // ['2025-10-16', '2025-10-17']
    currentStreak: number;
    startDate?: string;
    reward?: string; // Premio o castigo al completar/fallar el reto
  };
  competitionConfig?: {
    deadline?: string;
    participants: Array<{
      userId: string;
      userName: string;
      progress: number; // 0-100
      lastUpdate?: string;
    }>;
    stake?: string;
    winner?: string;
  };
  [key: string]: any; // Allow any additional properties
}

export interface Folder {
  id: string;
  name: string;
  description?: string;
  color?: string;
  colorScheme?: string;
  icon?: string;
  progress?: number;
  mode?: 'fixed' | 'cyclic' | 'ephemeral'; // Nuevo: modo de la carpeta
  lastResetDate?: string; // Para carpetas cíclicas
  createdAt?: string;
  updatedAt?: string;
  projectIds?: string[];
  items?: number;
  [key: string]: any; // Allow any additional properties
}

export interface DailyTask {
  id: string;
  title: string;
  type: 'boolean' | 'numeric' | 'text' | 'subjective';
  completed?: boolean;
  streak?: number;
  target?: number;
  current?: number;
  dailyTarget?: number; // Meta diaria (para carpetas cíclicas)
  currentDaily?: number; // Progreso diario actual (para carpetas cíclicas)
  totalTarget?: number; // Meta total acumulativa (para carpetas cíclicas)
  totalProgress?: number; // Progreso total acumulado (para carpetas cíclicas)
  score0to1?: number;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
  projectId?: string;
  folderId?: string;
  colorScheme?: string;
  icon?: string;
  [key: string]: any; // Allow any additional properties
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  completed?: boolean;
  projectId?: string;
  folderId?: string;
  [key: string]: any; // Allow any additional properties
}

export type ReminderPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ReminderStatus = 'pending' | 'completed';
export type ReminderType = 'note' | 'appointment' | 'task' | 'recurring' | 'one-time' | 'event' | string;
export type NavigationView = 'home' | 'folders' | 'ideas' | 'calendar' | 'reminders' | 'profile';

export type ReminderDestination = 'global' | 'project' | 'folder' | 'reminder' | 'calendar';
export type QuickCaptureDestination = 'tasks' | 'projects' | 'ideas' | 'reminders' | 'reminder';
export type MetricType = 'progress' | 'productivity' | 'completion' | 'streak';

export interface SharePermissions {
  canEdit?: boolean;
  canDelete?: boolean;
  canShare?: boolean;
  canAddMembers?: boolean;
  [key: string]: any;
}

export interface ShareSettings {
  isShared: boolean;
  shareLevel: 'view' | 'edit' | 'comment' | string;
  allowedUsers?: User[];
  permissions?: SharePermissions;
  [key: string]: any;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  avatar?: string; // Añadido para mockData
  team?: string;   // Nombre del equipo referencial
  [key: string]: any;
}

export interface Task {
  id: string;
  title: string;
  type: 'boolean' | 'numeric' | 'text' | 'subjective' | string;
  done?: boolean;            // Para tareas completadas tipo subjetivo
  completed?: boolean;       // Compatibilidad
  target?: number;           // Para métricas numéricas
  current?: number;          // Progreso numérico actual
  unit?: string;             // Unidad (fichas, palabras, etc.)
  priority?: 'alta' | 'media' | 'baja' | string;
  score0to1?: number;        // Métrica subjetiva 0..1
  assignedTo?: User[];       // Asignaciones múltiples
  shareSettings?: ShareSettings; // Config de compartición
  updatedAt?: string;
  [key: string]: any;        // Permitir extensiones flexibles
}

export interface Module {
  id: string;
  title: string;
  weight?: number;  // Peso relativo para cálculo de progreso
  tasks: Task[];
  [key: string]: any;
}

export interface Recognition {
  id: string;
  title: string;
  icon: string; // Puede ser emoji o nombre de icono
  date: string; // ISO date
  scope: 'global' | 'project' | string;
  projectId?: string;
  [key: string]: any;
}

export interface Team {
  id: string;
  name: string;
  description?: string; // Añadido para mockData
  members: User[];
  projects?: Project[]; // Hacer opcionales para flexibilidad
  folders?: Folder[];
  color?: string;
  icon?: string;
  createdAt?: string;
  [key: string]: any;
}

// Notes system types
export interface ChecklistItem {
  id: string;
  text: string;
  completed?: boolean;
  createdAt?: string;
  [key: string]: any;
}

export interface NoteCategory {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  description?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface NoteTag {
  id: string;
  name: string;
  color?: string;
  useCount?: number;
  createdAt?: string;
  [key: string]: any;
}

export interface Note {
  id: string;
  title: string;
  content?: string;
  type: 'text' | 'checklist' | 'image' | 'voice' | 'sketch' | 'link' | 'mindmap' | string;
  categoryId?: string;
  tags?: string[];
  linkedProjects?: string[];
  linkedFolders?: string[];
  linkedTasks?: string[];
  isPinned?: boolean;
  isArchived?: boolean;
  isFavorite?: boolean;
  reminderDate?: string;
  backgroundColor?: string;
  checklist?: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

// Milestones types
export interface MilestoneMessage {
  threshold: number;
  icon: string;
  title: string;
  body: string;
}

// ============================================
// 🎯 TIME TRACKING SYSTEM - Sistema de medición de tiempo
// ============================================

export interface TimeSession {
  id: string;
  startTime: string; // ISO string
  endTime?: string; // ISO string, undefined si está corriendo
  duration: number; // segundos totales
  pausedAt?: string; // ISO string, si está pausado
  pausedDuration: number; // segundos totales pausados
  isPaused: boolean;
  isRunning: boolean;
  pausedBy?: string; // userId del admin que pausó
  [key: string]: any;
}

export interface TimeTracking {
  totalTimeSpent: number; // segundos totales trabajados
  estimatedTimeRemaining?: number; // segundos estimados que faltan
  currentSession?: TimeSession; // sesión activa actual
  sessions: TimeSession[]; // historial de sesiones
  startedAt?: string; // primera vez que se inició
  completedAt?: string; // cuando se completó todo
  lastWorkedAt?: string; // última vez que se trabajó
  workVelocity?: number; // velocidad de trabajo (progreso/hora)
  predictedCompletionDate?: string; // fecha estimada de finalización
  [key: string]: any;
}

export interface FolderTimeTracking extends TimeTracking {
  folderId: string;
  projectsCompleted: number;
  projectsTotal: number;
  tasksCompleted: number;
  tasksTotal: number;
  canPause: boolean; // solo admin puede pausar
  [key: string]: any;
}

export interface ProjectTimeTracking extends TimeTracking {
  projectId: string;
  tasksCompleted: number;
  tasksTotal: number;
  phase: number; // fase actual del proyecto
  phaseMode?: 'close-and-new' | 'continue-adding'; // modo cuando se da play
  nextPhaseProjectId?: string; // ID del proyecto fase 2 si se creó
  [key: string]: any;
}

export interface TaskTimeTracking extends TimeTracking {
  taskId: string;
  mustPlayToComplete: boolean; // obligatorio dar play para completar
  hasPlayedAtLeastOnce: boolean; // si ya se dio play alguna vez
  estimatedDuration?: number; // duración estimada (de QuickTaskComposer)
  actualDuration?: number; // duración real trabajada
  dueDate?: string; // fecha límite
  timeUntilDue?: number; // segundos hasta la fecha límite
  isOverdue: boolean; // si ya pasó la fecha límite
  [key: string]: any;
}

// Estadísticas y métricas avanzadas
export interface WorkVelocityMetrics {
  itemsCompletedPerHour: number;
  averageTimePerTask: number; // segundos
  productivityTrend: 'increasing' | 'stable' | 'decreasing';
  peakProductivityHours: number[]; // horas del día más productivas
  [key: string]: any;
}

export interface TimeReport {
  id: string;
  type: 'folder' | 'project' | 'task';
  itemId: string;
  itemTitle: string;
  tracking: TimeTracking;
  metrics: WorkVelocityMetrics;
  createdAt: string;
  [key: string]: any;
}