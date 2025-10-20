import { Project, Task, Module, Recognition, User, Team, ShareSettings } from '@/types';

// Fecha fija para evitar hydration errors
const FIXED_DATE = '2024-01-15T10:00:00.000Z';

// Usuarios mock para el sistema de asignación
export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Ana García',
    email: 'ana@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
    role: 'owner',
    team: 'Desarrollo'
  },
  {
    id: 'user-2',
    name: 'Carlos López',
    email: 'carlos@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
  role: 'member',
    team: 'Desarrollo'
  },
  {
    id: 'user-3',
    name: 'María Silva',
    email: 'maria@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
  role: 'member',
    team: 'Diseño'
  },
  {
    id: 'user-4',
    name: 'David Chen',
    email: 'david@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    role: 'viewer',
    team: 'Marketing'
  },
  {
    id: 'user-5',
    name: 'Sofia Rodriguez',
    email: 'sofia@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',
  role: 'member',
    team: 'Desarrollo'
  },
  {
    id: 'user-6',
    name: 'Miguel Torres',
    email: 'miguel@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel',
    role: 'owner',
    team: 'Diseño'
  }
];

// Equipos mock
export const mockTeams: Team[] = [
  {
    id: 'team-1',
    name: 'Desarrollo',
    description: 'Equipo de desarrollo frontend y backend',
    members: [mockUsers[0], mockUsers[1], mockUsers[4]],
    color: 'blue',
    icon: 'Code',
    createdAt: new Date().toISOString()
  },
  {
    id: 'team-2', 
    name: 'Diseño',
    description: 'Equipo de diseño UX/UI',
    members: [mockUsers[2], mockUsers[5]],
    color: 'purple',
    icon: 'Camera',
    createdAt: new Date().toISOString()
  },
  {
    id: 'team-3',
    name: 'Marketing',
    description: 'Equipo de marketing y contenido',
    members: [mockUsers[3]],
    color: 'green',
    icon: 'Star',
    createdAt: new Date().toISOString()
  }
];

// Datos de ejemplo para las tareas de música
const musicTasks: Task[] = [
  // Módulo Diapasón
  {
    id: 'task-1',
    title: 'Memorizar notas en 6 cuerdas',
    type: 'numeric',
    target: 120,
    current: 35,
    unit: 'fichas',
    priority: 'alta',
    assignedTo: [mockUsers[0]], // Ana García
    updatedAt: '2025-10-01T10:00:00Z'
  },
  {
    id: 'task-2',
    title: 'Reconocimiento auditivo básico',
    type: 'subjective',
    score0to1: 0.4,
    priority: 'media',
    updatedAt: '2025-10-01T09:30:00Z'
  },
  // Módulo Acordes
  {
    id: 'task-3',
    title: '5 posturas mayores clean',
    type: 'numeric',
    target: 5,
    current: 2,
    unit: 'posturas',
    priority: 'alta',
    assignedTo: [mockUsers[1]], // Carlos López
    updatedAt: '2025-10-01T11:00:00Z'
  },
  {
    id: 'task-4',
    title: 'Transiciones fluidas',
    type: 'subjective',
    done: false,
    priority: 'media',
    updatedAt: '2025-09-30T18:00:00Z'
  },
  // Módulo Ritmo
  {
    id: 'task-5',
    title: 'Metrónomo 10 min diarios',
    type: 'numeric',
    target: 300,
    current: 40,
    unit: 'min/mes',
    priority: 'media',
    updatedAt: '2025-10-01T08:00:00Z'
  }
];

const musicModules: Module[] = [
  {
    id: 'module-1',
    title: 'Diapasón',
    weight: 1,
    tasks: musicTasks.slice(0, 2)
  },
  {
    id: 'module-2',
    title: 'Acordes',
    weight: 1.2, // Mayor peso al foco actual
    tasks: musicTasks.slice(2, 4)
  },
  {
    id: 'module-3',
    title: 'Ritmo',
    weight: 1,
    tasks: musicTasks.slice(4, 5)
  }
];

// Otros proyectos con estructura simplificada
const bookModules: Module[] = [
  {
    id: 'book-module-1',
    title: 'Capítulos 1-5',
    tasks: [
      {
        id: 'book-task-1',
        title: 'Esqueleto narrativo',
        type: 'subjective',
        score0to1: 0.8,
        priority: 'alta',
        updatedAt: '2025-10-01T14:00:00Z'
      },
      {
        id: 'book-task-2',
        title: 'Redacción Cap 1-2',
        type: 'numeric',
        target: 10000,
        current: 7200,
        unit: 'palabras',
        priority: 'alta',
        updatedAt: '2025-10-01T16:00:00Z'
      }
    ]
  },
  {
    id: 'book-module-2',
    title: 'Capítulos 6-10',
    tasks: [
      {
        id: 'book-task-3',
        title: 'Desarrollo de personajes',
        type: 'subjective',
        score0to1: 0.3,
        priority: 'media',
        updatedAt: '2025-09-29T12:00:00Z'
      }
    ]
  }
];

const planifyModules: Module[] = [
  {
    id: 'planify-module-1',
    title: 'UI Components',
    tasks: [
      {
        id: 'planify-task-1',
        title: 'HomeScreen + ProjectCard',
        type: 'subjective',
        done: true,
        priority: 'alta',
        updatedAt: '2025-10-01T12:00:00Z'
      },
      {
        id: 'planify-task-2',
        title: 'Quick Capture Modal',
        type: 'subjective',
        score0to1: 0.9,
        priority: 'alta',
        updatedAt: '2025-10-01T15:00:00Z'
      }
    ]
  },
  {
    id: 'planify-module-2',
    title: 'Logic & State',
    tasks: [
      {
        id: 'planify-task-3',
        title: 'Progress calculations',
        type: 'subjective',
        score0to1: 0.7,
        priority: 'media',
        updatedAt: '2025-10-01T11:30:00Z'
      }
    ]
  }
];

const portfolioModules: Module[] = [
  {
    id: 'portfolio-module-1',
    title: 'Selección',
    tasks: [
      {
        id: 'portfolio-task-1',
        title: 'Curar mejores fotos',
        type: 'numeric',
        target: 50,
        current: 8,
        unit: 'fotos',
        priority: 'alta',
        updatedAt: '2025-09-30T10:00:00Z'
      }
    ]
  },
  {
    id: 'portfolio-module-2',
    title: 'Edición',
    tasks: [
      {
        id: 'portfolio-task-2',
        title: 'Post-procesado básico',
        type: 'subjective',
        score0to1: 0.2,
        priority: 'baja',
        updatedAt: '2025-09-28T16:00:00Z'
      }
    ]
  }
];

export const mockProjects: Project[] = [
  // PROYECTOS COMPLETADOS PARA DEMO
  {
    id: 'project-demo-1',
    title: 'Landing Page Corporativa',
    subtitle: 'Diseño + Desarrollo + Deploy',
    progress: 100,
    items: 8,
    streak: 15,
    badge: 'Completado',
    modules: [],
    updatedAt: '2025-10-01T09:00:00Z',
    icon: '🌟',
    colorScheme: 'sunset',
    assignedTo: [mockUsers[0], mockUsers[1]] // Ana y Carlos
  },
  {
    id: 'project-demo-2', 
    title: 'Sistema de Autenticación',
    subtitle: 'JWT + OAuth + Seguridad',
    progress: 100,
    items: 12,
    streak: 20,
    badge: 'Completado',
    modules: [],
    updatedAt: '2025-09-28T14:00:00Z',
    icon: '🔐',
    colorScheme: 'sunset',
    assignedTo: [mockUsers[1], mockUsers[4]] // Carlos y Sofia
  },
  {
    id: 'project-demo-3',
    title: 'Dashboard Analytics',
    subtitle: 'Métricas + Gráficos + Reports',
    progress: 100,
    items: 10,
    streak: 18,
    badge: 'Completado',
    modules: [],
    updatedAt: '2025-09-25T16:30:00Z',
    icon: '📊',
    colorScheme: 'sunset',
    assignedTo: [mockUsers[2], mockUsers[5]] // María y Miguel
  },
  {
    id: 'p1',
    title: 'Música',
    subtitle: 'Diapasón • Acordes • Ritmo',
    progress: 32, // Será recalculado automáticamente
    items: 5,
    streak: 5,
    modules: musicModules,
    updatedAt: '2025-10-01T11:00:00Z',
    icon: '🎸',
    colorScheme: 'sunset',
    assignedTo: [mockUsers[0], mockUsers[4]] // Ana García y Sofia
  },
  {
    id: 'p2',
    title: 'Libro — Cap. 1 a 10',
    subtitle: 'Esqueleto + redacción',
    progress: 55,
    items: 3,
    streak: 12,
    badge: 'Prioritario',
    modules: bookModules,
    updatedAt: '2025-10-01T16:00:00Z',
    icon: '📚',
    colorScheme: 'forest',
    assignedTo: [mockUsers[2], mockUsers[5]] // María Silva y Miguel Torres
  },
  {
    id: 'p3',
    title: 'Planify v0',
    subtitle: 'Home + Modal + Cofre',
    progress: 85,
    items: 3,
    streak: 7,
    modules: planifyModules,
    updatedAt: '2025-10-01T15:00:00Z',
    icon: '💻',
    colorScheme: 'cosmic'
  },
  {
    id: 'p4',
    title: 'Portafolio Foto',
    subtitle: 'Selección y edición',
    progress: 12,
    items: 2,
    streak: 2,
    modules: portfolioModules,
    updatedAt: '2025-09-30T16:00:00Z',
    icon: '📸',
    colorScheme: 'ocean'
  },

  // Proyectos para carpeta ejemplo "Proyecto Planify Premium"
  {
    id: 'project-6',
    title: 'Frontend Components',
    subtitle: 'UI/UX • Responsive Design',
    progress: 78,
    items: 12,
    streak: 15,
    badge: 'Prioritario',
    modules: [
      {
        id: 'frontend-module-1',
        title: 'Core Components',
        tasks: [
          {
            id: 'frontend-task-1',
            title: 'FolderCard redesign',
            type: 'subjective',
            done: true,
            priority: 'alta',
            assignedTo: [mockUsers[0], mockUsers[2]], // Ana y María (Frontend + Design)
            updatedAt: '2025-10-01T10:00:00Z'
          },
          {
            id: 'frontend-task-2',
            title: 'Collaboration system',
            type: 'numeric',
            target: 8,
            current: 6,
            unit: 'components',
            priority: 'alta',
            assignedTo: [mockUsers[0], mockUsers[4]], // Ana y Sofia
            updatedAt: '2025-10-01T14:00:00Z'
          }
        ]
      }
    ],
    updatedAt: '2025-10-01T14:00:00Z',
    icon: 'Code',
    colorScheme: 'cosmic',
    folderId: 'folder-5',
    assignedTo: [mockUsers[0], mockUsers[2], mockUsers[4]], // Frontend team
    team: mockTeams[0]
  },
  {
    id: 'project-7',
    title: 'Backend & API',
    subtitle: 'Database • Authentication • Sharing',
    progress: 45,
    items: 8,
    streak: 8,
    modules: [
      {
        id: 'backend-module-1',
        title: 'User Management',
        tasks: [
          {
            id: 'backend-task-1',
            title: 'Multi-user authentication',
            type: 'subjective',
            score0to1: 0.7,
            priority: 'alta',
            assignedTo: [mockUsers[1], mockUsers[4]], // Carlos y Sofia
            shareSettings: {
              isShared: true,
              shareLevel: 'edit',
              permissions: { canEdit: true, canDelete: false, canShare: true, canAddMembers: false }
            },
            updatedAt: '2025-10-01T09:00:00Z'
          },
          {
            id: 'backend-task-2',
            title: 'Team collaboration endpoints',
            type: 'numeric',
            target: 15,
            current: 8,
            unit: 'endpoints',
            priority: 'media',
            assignedTo: [mockUsers[1]], // Carlos
            updatedAt: '2025-10-01T11:00:00Z'
          }
        ]
      }
    ],
    updatedAt: '2025-10-01T11:00:00Z',
    icon: 'Shield',
    colorScheme: 'forest',
    folderId: 'folder-5',
    assignedTo: [mockUsers[1], mockUsers[4]] // Backend team
  },
  {
    id: 'project-8',
    title: 'UX/UI Design System',
    subtitle: 'Brand • Components • Guidelines',
    progress: 92,
    items: 6,
    streak: 12,
    badge: 'Completado',
    modules: [
      {
        id: 'design-module-1',
        title: 'Visual Identity',
        tasks: [
          {
            id: 'design-task-1',
            title: 'Component library',
            type: 'subjective',
            done: true,
            priority: 'alta',
            assignedTo: [mockUsers[2], mockUsers[5]], // Design team complete
            shareSettings: {
              isShared: true,
              shareLevel: 'view',
              allowedUsers: [mockUsers[0], mockUsers[1], mockUsers[4]], // Share with dev team
              permissions: { canEdit: false, canDelete: false, canShare: true, canAddMembers: false }
            },
            updatedAt: '2025-10-01T16:00:00Z'
          },
          {
            id: 'design-task-2',
            title: 'Glassmorphism effects',
            type: 'subjective',
            score0to1: 0.95,
            priority: 'media',
            assignedTo: [mockUsers[2]], // María
            updatedAt: '2025-10-01T12:00:00Z'
          }
        ]
      }
    ],
    updatedAt: '2025-10-01T16:00:00Z',
    icon: 'Palette',
    colorScheme: 'sunset',
    folderId: 'folder-5',
    assignedTo: [mockUsers[2], mockUsers[5]], // Design team
    team: mockTeams[1]
  }
];

export const mockRecognitions: Recognition[] = [
  {
    id: 'rec-1',
    title: 'Primer 1%',
    icon: '🌟',
    date: '2025-09-15T10:00:00Z',
    scope: 'global'
  },
  {
    id: 'rec-2',
    title: '10% — Rumbo trazado',
    icon: '🧭',
    date: '2025-09-20T14:30:00Z',
    scope: 'project',
    projectId: 'p2'
  },
  {
    id: 'rec-3',
    title: 'Racha 7 días',
    icon: '🔥',
    date: '2025-09-28T09:00:00Z',
    scope: 'global'
  },
  {
    id: 'rec-4',
    title: '20% — Sistema en marcha',
    icon: '⚙️',
    date: '2025-09-30T16:15:00Z',
    scope: 'project',
    projectId: 'p1'
  },
  {
    id: 'rec-5',
    title: '50% — Mitad conquistada',
    icon: '🚀',
    date: '2025-10-01T12:00:00Z',
    scope: 'project',
    projectId: 'p2'
  }
];

export const globalStreak = 7; // Días consecutivos con progreso