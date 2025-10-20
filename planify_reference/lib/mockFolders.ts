import { Folder, DailyTask, Project } from '@/types';
import { USERS, TEAMS, COMMON_ASSIGNMENTS, DataHelpers } from '@/lib/centralizedData';

// Fecha fija para evitar hydration errors
const FIXED_DATE = DataHelpers.getFixedDate();

// Datos de carpetas de ejemplo
export const mockFolders: Folder[] = [
  // CARPETA CON PROYECTOS COMPLETADOS - PARA DEMO
  {
    id: 'folder-demo-completed',
    name: 'Proyectos Q3 Completados',
    description: 'Carpeta de demostración con varios proyectos ya completados',
    icon: 'Trophy',
    colorScheme: 'sunset',
    projectIds: ['project-demo-1', 'project-demo-2', 'project-demo-3'],
    assignedTo: [USERS.ANA, USERS.CARLOS, USERS.MARIA, USERS.MIGUEL], 
    team: {
      id: 'team-demo',
      name: 'Equipo Éxitos',
      description: 'Equipo con logros destacados',
      members: [USERS.ANA, USERS.CARLOS, USERS.MARIA, USERS.MIGUEL],
      color: 'orange',
      icon: 'Trophy',
      createdAt: FIXED_DATE
    },
    shareSettings: {
      isShared: true,
      shareLevel: 'view',
      allowedUsers: [USERS.ANA, USERS.CARLOS, USERS.MARIA, USERS.MIGUEL],
      permissions: {
        canEdit: true,
        canDelete: true,
        canShare: true,
        canAddMembers: true
      }
    },
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
  },
  {
    id: 'folder-1',
    name: 'Desarrollo Personal Pro',
    description: 'Sistema completo de desarrollo personal con múltiples tipos de tareas y métricas avanzadas',
    icon: 'Brain',
    colorScheme: 'cosmic',
    projectIds: ['project-1', 'project-2', 'project-dev-personal'],
    assignedTo: COMMON_ASSIGNMENTS.FULL_DEV_TEAM, // Múltiples colaboradores
    team: {
      id: 'team-1',
      name: 'Desarrollo',
      description: 'Equipo de desarrollo',
      members: COMMON_ASSIGNMENTS.FULL_DEV_TEAM,
      color: 'blue',
      icon: 'Code',
      createdAt: FIXED_DATE
    },
    shareSettings: {
      isShared: true,
      shareLevel: 'edit',
      allowedUsers: COMMON_ASSIGNMENTS.FULL_DEV_TEAM,
      permissions: {
        canEdit: true,
        canDelete: false,
        canShare: true,
        canAddMembers: true
      }
    },
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
  },
  {
    id: 'folder-2', 
    name: 'Fitness & Salud',
    description: 'Ejercicio, nutrición y bienestar',
    icon: 'Dumbbell',
    colorScheme: 'forest',
    projectIds: ['project-3'],
    assignedTo: [USERS.CARLOS, USERS.MARIA], // Carlos López y María Silva
    shareSettings: {
      isShared: true,
      shareLevel: 'view',
      allowedUsers: [USERS.CARLOS, USERS.MARIA],
      permissions: {
        canEdit: true,
        canDelete: false,
        canShare: false,
        canAddMembers: false
      }
    },
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
  },
  {
    id: 'folder-3',
    name: 'Creatividad',
    description: 'Proyectos artísticos y creativos', 
    icon: 'Camera',
    colorScheme: 'sunset',
    projectIds: ['project-4'],
    assignedTo: [USERS.MARIA, USERS.MIGUEL], // Equipo de diseño
    team: {
      id: 'team-2',
      name: 'Diseño',
      description: 'Equipo de diseño UX/UI',
      members: [USERS.MARIA, USERS.MIGUEL],
      color: 'purple',
      icon: 'Camera',
      createdAt: FIXED_DATE
    },
    shareSettings: {
      isShared: false,
      shareLevel: 'admin',
      permissions: {
        canEdit: true,
        canDelete: true,
        canShare: true,
        canAddMembers: true
      }
    },
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
  },
  {
    id: 'folder-4',
    name: 'Tecnología',
    description: 'Programación y tecnología',
    icon: 'Code',
    colorScheme: 'ocean',
    projectIds: ['project-5'],
    assignedTo: [USERS.ANA, USERS.SOFIA], // Ana y Sofia
    shareSettings: {
      isShared: true,
      shareLevel: 'edit',
      isPublic: false,
      allowedUsers: COMMON_ASSIGNMENTS.FULL_DEV_TEAM,
      permissions: {
        canEdit: true,
        canDelete: true,
        canShare: true,
        canAddMembers: false
      }
    },
    createdAt: FIXED_DATE, 
    updatedAt: FIXED_DATE,
  },
  
  // Nueva carpeta ejemplo con todas las funcionalidades
  {
    id: 'folder-5',
    name: 'Proyecto Planify Premium',
    description: 'Desarrollo completo de la app con múltiples colaboradores y equipos',
    icon: 'Rocket',
    colorScheme: 'cosmic',
    projectIds: ['project-6', 'project-7', 'project-8'],
    assignedTo: [USERS.ANA, USERS.CARLOS, USERS.MARIA, USERS.SOFIA, USERS.MIGUEL], // Múltiples colaboradores
    team: {
      id: 'team-full',
      name: 'Equipo Completo',
      description: 'Equipo multidisciplinario completo',
      members: [USERS.ANA, USERS.CARLOS, USERS.MARIA, USERS.SOFIA, USERS.MIGUEL],
      color: 'gradient',
      icon: 'Crown',
      createdAt: FIXED_DATE
    },
    shareSettings: {
      isShared: true,
      shareLevel: 'admin',
      isPublic: false,
      allowedUsers: [USERS.ANA, USERS.CARLOS, USERS.MARIA, USERS.SOFIA, USERS.MIGUEL],
      allowedTeams: [TEAMS.DESARROLLO, TEAMS.DISENO],
      permissions: {
        canEdit: true,
        canDelete: true,
        canShare: true,
        canAddMembers: true
      }
    },
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
  },

  // CARPETA DE CONTROL LABORAL
  {
    id: 'folder-empresa',
    name: 'Control de Empleados',
    description: 'Sistema de seguimiento y control de tareas empresariales con limitaciones de tiempo',
    icon: 'Shield',
    colorScheme: 'ocean',
    projectIds: ['project-onboarding', 'project-ventas-q4'],
    assignedTo: [USERS.ANA, USERS.CARLOS, USERS.MARIA, USERS.JUAN], // Jefe + empleados
    team: {
      id: 'team-empresa',
      name: 'Equipos Corporativo',
      description: 'Control administrativo empresarial',
      members: [USERS.ANA, USERS.CARLOS, USERS.MARIA, USERS.JUAN],
      color: 'blue',
      icon: 'Shield',
      createdAt: FIXED_DATE
    },
    shareSettings: {
      isShared: true,
      shareLevel: 'admin',
      isPublic: false,
      allowedUsers: [USERS.ANA], // Solo el administrador
      permissions: {
        canEdit: false,
        canDelete: false,
        canShare: false,
        canAddMembers: false
      }
    },
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
  },



];

// Datos de tareas diarias de ejemplo
export const mockDailyTasks: DailyTask[] = [
  {
    id: 'daily-1',
    title: 'Meditar',
    type: 'boolean',
    completed: false,
    icon: 'Moon',
    colorScheme: 'cosmic',
    resetTime: '00:00',
    streak: 5,
    lastCompletedDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
  },
  {
    id: 'daily-2',
    title: 'Ejercicio', 
    type: 'numeric',
    current: 2,
    target: 3,
    unit: 'sets',
    icon: 'Dumbbell',
    colorScheme: 'forest',
    resetTime: '00:00',
    streak: 12,
    lastCompletedDate: FIXED_DATE,
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
  },
  {
    id: 'daily-3',
    title: 'Estado de ánimo',
    type: 'subjective', 
    score0to1: 0.8, // 4/5 stars
    icon: 'Heart',
    colorScheme: 'sunset',
    resetTime: '00:00',
    streak: 3,
    lastCompletedDate: FIXED_DATE,
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
  },
  {
    id: 'daily-4',
    title: 'Leer',
    type: 'numeric',
    current: 0,
    target: 30,
    unit: 'minutos',
    icon: 'BookOpen',
    colorScheme: 'gold',
    resetTime: '00:00',
    streak: 0,
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
  }
];

// Actualizar proyectos existentes con folderId
export const mockProjectsWithFolders: Project[] = [
  {
    id: 'project-1',
    title: 'Aprender Guitarra',
    subtitle: 'Desde principiante a intermedio',
    progress: 35,
    items: 45,
    streak: 7,
    badge: 'Prioritario',
    modules: [],
    updatedAt: FIXED_DATE,
    icon: 'Music',
    colorScheme: 'sunset',
    folderId: 'folder-1'
  },
  {
    id: 'project-2',
    title: 'Curso de Inglés',
    subtitle: 'Mejorar conversación',
    progress: 72,
    items: 28,
    streak: 12,
    modules: [],
    updatedAt: FIXED_DATE,
    icon: 'BookOpen',
    colorScheme: 'ocean',
    folderId: 'folder-1'
  },
  {
    id: 'project-3',
    title: 'Rutina Gimnasio',
    subtitle: 'Fuerza y resistencia',
    progress: 58,
    items: 24,
    streak: 5,
    modules: [],
    updatedAt: FIXED_DATE,
    icon: 'Dumbbell',
    colorScheme: 'forest',
    folderId: 'folder-2'
  },
  {
    id: 'project-4',
    title: 'Fotografía Digital',
    subtitle: 'Técnicas avanzadas',
    progress: 23,
    items: 35,
    streak: 3,
    modules: [],
    updatedAt: FIXED_DATE,
    icon: 'Camera', 
    colorScheme: 'sunset',
    folderId: 'folder-3'
  },
  {
    id: 'project-5',
    title: 'Desarrollo Web',
    subtitle: 'React y TypeScript',
    progress: 89,
    items: 42,
    streak: 15,
    badge: 'Prioritario',
    modules: [],
    updatedAt: FIXED_DATE,
    icon: 'Code',
    colorScheme: 'cosmic',
    folderId: 'folder-4'
  },
  // Proyectos para "Proyecto Planify Premium" con equipos heredados
  {
    id: 'project-6',
    title: 'Frontend Architecture',
    subtitle: 'UI/UX y componentes reutilizables',
    progress: 45,
    items: 28,
    streak: 8,
    badge: 'Prioritario',
    modules: [],
    updatedAt: FIXED_DATE,
    icon: 'Palette',
    colorScheme: 'sunset',
    folderId: 'folder-5',
    assignedTo: [USERS.ANA, USERS.MARIA], // Ana y María (Frontend/Design)
    team: {
      id: 'team-frontend',
      name: 'Frontend Team',
      description: 'Equipo de desarrollo frontend',
      members: [USERS.ANA, USERS.MARIA],
      color: 'orange',
      icon: 'Palette',
      createdAt: FIXED_DATE
    }
  },
  {
    id: 'project-7', 
    title: 'Backend Services',
    subtitle: 'API REST y microservicios',
    progress: 67,
    items: 35,
    streak: 12,
    badge: 'Prioritario',
    modules: [],
    updatedAt: FIXED_DATE,
    icon: 'Server',
    colorScheme: 'ocean',
    folderId: 'folder-5',
    assignedTo: [USERS.CARLOS, USERS.SOFIA, USERS.MIGUEL], // Carlos, Sofia, Miguel (Backend)
    team: {
      id: 'team-backend',
      name: 'Backend Team', 
      description: 'Equipo de desarrollo backend',
      members: [USERS.CARLOS, USERS.SOFIA, USERS.MIGUEL],
      color: 'blue',
      icon: 'Server',
      createdAt: FIXED_DATE
    }
  },
  {
    id: 'project-8',
    title: 'DevOps & Deployment',
    subtitle: 'CI/CD y infraestructura',
    progress: 23,
    items: 18,
    streak: 3,
    modules: [],
    updatedAt: FIXED_DATE,
    icon: 'Zap',
    colorScheme: 'cosmic',
    folderId: 'folder-5',
    assignedTo: [USERS.MIGUEL, USERS.CARLOS], // Miguel y Carlos (DevOps)
    team: {
      id: 'team-devops',
      name: 'DevOps Team',
      description: 'Equipo de DevOps e infraestructura', 
      members: [USERS.MIGUEL, USERS.CARLOS],
      color: 'purple',
      icon: 'Zap',
      createdAt: FIXED_DATE
    }
  },

  // PROYECTO COMPLETO DE DESARROLLO PERSONAL
  {
    id: 'project-dev-personal',
    title: 'Desarrollo Personal Completo',
    subtitle: 'Sistema integral de crecimiento personal con múltiples métricas',
    progress: 65,
    items: 42,
    streak: 15,
    modules: [
      {
        id: 'module-fitness',
        title: 'Condición Física',
        weight: 1.2,
        tasks: [
          {
            id: 'task-cardio',
            title: 'Sesiones de cardio semanales',
            type: 'numeric',
            target: 4,
            current: 3,
            unit: 'sesiones',
            priority: 'alta',
            assignedTo: [USERS.ANA],
            updatedAt: FIXED_DATE
          },
          {
            id: 'task-strength',
            title: 'Entrenamientos de fuerza',
            type: 'numeric', 
            target: 3,
            current: 2,
            unit: 'entrenamientos',
            priority: 'alta',
            assignedTo: [USERS.ANA],
            updatedAt: FIXED_DATE
          },
          {
            id: 'task-steps',
            title: 'Pasos diarios',
            type: 'numeric',
            target: 10000,
            current: 8500,
            unit: 'pasos',
            priority: 'media',
            assignedTo: [USERS.ANA],
            updatedAt: FIXED_DATE
          }
        ]
      },
      {
        id: 'module-learning',
        title: 'Aprendizaje Continuo',
        weight: 1.0,
        tasks: [
          {
            id: 'task-reading',
            title: 'Páginas leídas',
            type: 'numeric',
            target: 50,
            current: 35,
            unit: 'páginas',
            priority: 'alta',
            assignedTo: [USERS.ANA],
            updatedAt: FIXED_DATE
          },
          {
            id: 'task-courses',
            title: 'Cursos online completados',
            type: 'numeric',
            target: 2,
            current: 1,
            unit: 'cursos',
            priority: 'media',
            assignedTo: [USERS.ANA],
            updatedAt: FIXED_DATE
          },
          {
            id: 'task-practice',
            title: 'Horas de práctica de programación',
            type: 'numeric',
            target: 20,
            current: 14,
            unit: 'horas',
            priority: 'alta',
            assignedTo: [USERS.ANA],
            updatedAt: FIXED_DATE
          }
        ]
      },
      {
        id: 'module-skills',
        title: 'Habilidades Personales',
        weight: 0.8,
        tasks: [
          {
            id: 'task-communication',
            title: 'Habilidad de comunicación',
            type: 'subjective',
            score0to1: 0.75,
            priority: 'alta',
            assignedTo: [USERS.ANA],
            updatedAt: FIXED_DATE
          },
          {
            id: 'task-leadership',
            title: 'Liderazgo',
            type: 'subjective',
            score0to1: 0.60,
            priority: 'media',
            assignedTo: [USERS.ANA],
            updatedAt: FIXED_DATE
          },
          {
            id: 'task-creativity',
            title: 'Creatividad',
            type: 'subjective',
            score0to1: 0.80,
            priority: 'baja',
            assignedTo: [USERS.ANA],
            updatedAt: FIXED_DATE
          }
        ]
      },
      {
        id: 'module-habits',
        title: 'Hábitos Diarios',
        weight: 1.1,
        tasks: [
          {
            id: 'task-meditation',
            title: 'Meditación matutina',
            type: 'subjective',
            done: true,
            priority: 'alta',
            assignedTo: [USERS.ANA],
            updatedAt: FIXED_DATE
          },
          {
            id: 'task-journaling',
            title: 'Escribir en diario',
            type: 'subjective',
            done: false,
            priority: 'media',
            assignedTo: [USERS.ANA],
            updatedAt: FIXED_DATE
          },
          {
            id: 'task-planning',
            title: 'Planificación del día',
            type: 'subjective',
            done: true,
            priority: 'alta',
            assignedTo: [USERS.ANA],
            updatedAt: FIXED_DATE
          },
          {
            id: 'task-reflection',
            title: 'Reflexión nocturna',
            type: 'subjective',
            done: false,
            priority: 'media',
            assignedTo: [USERS.ANA],
            updatedAt: FIXED_DATE
          }
        ]
      }
    ],
    updatedAt: FIXED_DATE,
    icon: 'Brain',
    colorScheme: 'cosmic',
    folderId: 'folder-1',
    assignedTo: [USERS.ANA],
    team: {
      id: 'team-personal',
      name: 'Desarrollo Personal',
      description: 'Equipo enfocado en crecimiento personal',
      members: [USERS.ANA],
      color: 'purple',
      icon: 'Brain',
      createdAt: FIXED_DATE
    }
  },

  // PROYECTO DE ONBOARDING EMPRESARIAL
  {
    id: 'project-onboarding',
    title: 'Proceso de Onboarding Q4',
    subtitle: 'Integración de nuevos empleados - Plazo: 30 días',
    progress: 45,
    items: 28,
    streak: 5,
    modules: [
      {
        id: 'module-documentacion',
        title: 'Documentación Obligatoria',
        weight: 1.5,
        tasks: [
          {
            id: 'task-contrato',
            title: 'Firmar contrato de trabajo',
            type: 'subjective',
            done: true,
            priority: 'alta',
            assignedTo: [USERS.CARLOS],
            updatedAt: FIXED_DATE
          },
          {
            id: 'task-politicas',
            title: 'Leer políticas de la empresa',
            type: 'subjective',
            done: false,
            priority: 'alta',
            assignedTo: [USERS.CARLOS],
            updatedAt: FIXED_DATE
          },
          {
            id: 'task-seguridad',
            title: 'Completar curso de seguridad',
            type: 'subjective',
            done: false,
            priority: 'alta',
            assignedTo: [USERS.CARLOS],
            updatedAt: FIXED_DATE
          }
        ]
      },
      {
        id: 'module-capacitacion',
        title: 'Capacitación Técnica',
        weight: 2.0,
        tasks: [
          {
            id: 'task-sistemas',
            title: 'Horas de capacitación en sistemas',
            type: 'numeric',
            target: 40,
            current: 18,
            unit: 'horas',
            priority: 'alta',
            assignedTo: [USERS.CARLOS],
            updatedAt: FIXED_DATE
          },
          {
            id: 'task-evaluacion',
            title: 'Evaluaciones completadas',
            type: 'numeric',
            target: 5,
            current: 2,
            unit: 'evaluaciones',
            priority: 'alta',
            assignedTo: [USERS.CARLOS],
            updatedAt: FIXED_DATE
          }
        ]
      }
    ],
    updatedAt: FIXED_DATE,
    icon: 'Shield',
    colorScheme: 'ocean',
    folderId: 'folder-empresa',
    assignedTo: [USERS.CARLOS],
    team: {
      id: 'team-onboarding',
      name: 'Nuevos Ingresos',
      description: 'Empleados en proceso de onboarding',
      members: [USERS.CARLOS],
      color: 'blue',
      icon: 'Shield',
      createdAt: FIXED_DATE
    }
  },

  // PROYECTO DE VENTAS EMPRESARIAL
  {
    id: 'project-ventas-q4',
    title: 'Objetivos de Ventas Q4',
    subtitle: 'Metas trimestrales del equipo de ventas - Límite: 31 dic',
    progress: 67,
    items: 15,
    streak: 12,
    modules: [
      {
        id: 'module-prospecting',
        title: 'Prospección de Clientes',
        weight: 1.2,
        tasks: [
          {
            id: 'task-calls',
            title: 'Llamadas realizadas',
            type: 'numeric',
            target: 200,
            current: 134,
            unit: 'llamadas',
            priority: 'alta',
            assignedTo: [USERS.MARIA],
            updatedAt: FIXED_DATE
          },
          {
            id: 'task-meetings',
            title: 'Reuniones programadas',
            type: 'numeric',
            target: 50,
            current: 33,
            unit: 'reuniones',
            priority: 'alta',
            assignedTo: [USERS.MARIA],
            updatedAt: FIXED_DATE
          }
        ]
      },
      {
        id: 'module-cierre',
        title: 'Cierre de Ventas',
        weight: 2.0,
        tasks: [
          {
            id: 'task-propuestas',
            title: 'Propuestas enviadas',
            type: 'numeric',
            target: 25,
            current: 18,
            unit: 'propuestas',
            priority: 'alta',
            assignedTo: [USERS.MARIA],
            updatedAt: FIXED_DATE
          },
          {
            id: 'task-ventas',
            title: 'Ventas cerradas',
            type: 'numeric',
            target: 12,
            current: 8,
            unit: 'ventas',
            priority: 'alta',
            assignedTo: [USERS.MARIA],
            updatedAt: FIXED_DATE
          }
        ]
      }
    ],
    updatedAt: FIXED_DATE,
    icon: 'Target',
    colorScheme: 'forest',
    folderId: 'folder-empresa',
    assignedTo: [USERS.MARIA],
    team: {
      id: 'team-ventas',
      name: 'Equipo de Ventas',
      description: 'Representantes de ventas Q4',
      members: [USERS.MARIA, USERS.JUAN],
      color: 'green',
      icon: 'Target',
      createdAt: FIXED_DATE
    }
  },



];

