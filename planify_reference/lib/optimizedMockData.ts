import { Project, Folder, DailyTask, MetricType, Task, Module } from '@/types';

// ============== PROYECTOS MODERNOS Y REALISTAS ==============

// Proyecto 1: E-commerce App Development
const ecommerceModules: Module[] = [
  {
    id: 'ecom-frontend',
    title: 'Frontend UI/UX',
    weight: 1.5,
    tasks: [
      {
        id: 'ecom-1',
        title: 'Landing page responsive',
        type: 'subjective' as MetricType,
        score0to1: 0.85,
        priority: 'alta',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'ecom-2', 
        title: 'Product gallery component',
        type: 'subjective' as MetricType,
        score0to1: 0.70,
        priority: 'alta',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'ecom-3',
        title: 'Shopping cart functionality',
        type: 'subjective' as MetricType,
        done: true,
        score0to1: 1.0,
        priority: 'alta',
        updatedAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 'ecom-backend',
    title: 'Backend & API',
    weight: 1.3,
    tasks: [
      {
        id: 'ecom-4',
        title: 'User authentication API',
        type: 'subjective' as MetricType,
        done: true,
        score0to1: 1.0,
        priority: 'alta',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'ecom-5',
        title: 'Payment integration',
        type: 'subjective' as MetricType,
        score0to1: 0.40,
        priority: 'media',
        updatedAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 'ecom-testing',
    title: 'Testing & Deploy',
    weight: 1.0,
    tasks: [
      {
        id: 'ecom-6',
        title: 'Unit tests coverage',
        type: 'numeric' as MetricType,
        target: 80,
        current: 65,
        unit: '%',
        priority: 'media',
        updatedAt: new Date().toISOString()
      }
    ]
  }
];

// Proyecto 2: Personal Fitness Journey
const fitnessModules: Module[] = [
  {
    id: 'fitness-cardio',
    title: 'Cardio Training',
    weight: 1.2,
    tasks: [
      {
        id: 'fit-1',
        title: 'Morning runs',
        type: 'numeric' as MetricType,
        target: 30,
        current: 18,
        unit: 'days',
        priority: 'alta',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'fit-2',
        title: '5K run achievement',
        type: 'subjective' as MetricType,
        score0to1: 0.3,
        priority: 'media',
        updatedAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 'fitness-strength',
    title: 'Strength Training',
    weight: 1.0,
    tasks: [
      {
        id: 'fit-3',
        title: 'Weight training sessions',
        type: 'numeric' as MetricType,
        target: 20,
        current: 12,
        unit: 'sessions',
        priority: 'alta',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'fit-4',
        title: 'Form improvement',
        type: 'subjective' as MetricType,
        score0to1: 0.75,
        priority: 'media',
        updatedAt: new Date().toISOString()
      }
    ]
  }
];

// ============== PROYECTOS OPTIMIZADOS ==============
export const optimizedProjects: Project[] = [
  // PROYECTOS COMPLETADOS PARA DEMO
  {
    id: 'project-demo-1',
    title: 'Landing Page Corporativa',
    subtitle: 'Diseño + Desarrollo + Deploy',
    description: 'Página de aterrizaje moderna con animaciones y formulario de contacto',
    progress: 100,
    items: 8,
    streak: 15,
    badge: 'Completado' as const,
    icon: 'Star',
    colorScheme: 'sunset',
    folderId: 'folder-demo-completed',
    modules: [],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'project-demo-2', 
    title: 'Sistema de Autenticación',
    subtitle: 'JWT + OAuth + Seguridad',
    description: 'Sistema completo de autenticación con múltiples proveedores',
    progress: 100,
    items: 12,
    streak: 20,
    badge: 'Completado' as const,
    icon: 'Lock',
    colorScheme: 'sunset',
    folderId: 'folder-demo-completed',
    modules: [],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'project-demo-3',
    title: 'Dashboard Analytics',
    subtitle: 'Métricas + Gráficos + Reports',
    description: 'Panel de control con visualizaciones avanzadas y reportes automatizados',
    progress: 100,
    items: 10,
    streak: 18,
    badge: 'Completado' as const,
    icon: 'BarChart3',
    colorScheme: 'sunset',
    folderId: 'folder-demo-completed',
    modules: [],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ecommerce-2024',
    title: 'E-commerce Platform',
    subtitle: 'Full-stack web application',
    description: 'Modern e-commerce platform with React, Node.js, and Stripe integration',
    progress: 68,
    items: 6,
    streak: 8,
    badge: 'Prioritario' as const,
    icon: 'Code',
    colorScheme: 'electric-blue',
    folderId: 'work-projects',
    modules: ecommerceModules,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fitness-journey-2024',
    title: 'Fitness Transformation',
    subtitle: 'Health & wellness goals',
    description: 'Personal fitness journey focused on cardio and strength training',
    progress: 45,
    items: 4,
    streak: 12,
    badge: 'Prioritario' as const,
    icon: 'Dumbbell',
    colorScheme: 'electric-green',
    folderId: 'personal-goals',
    modules: fitnessModules,
    updatedAt: new Date().toISOString()
  },
  // Proyectos de Testing & QA
  {
    id: 'mobile-app-testing',
    title: 'Mobile App Testing',
    subtitle: 'iOS & Android QA',
    description: 'Comprehensive testing suite for mobile applications across platforms',
    progress: 73,
    items: 8,
    streak: 5,
    badge: 'Prioritario' as const,
    icon: 'Smartphone',
    colorScheme: 'electric-purple',
    folderId: 'testing-qa',
    modules: [],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'documentation-review',
    title: 'Documentation Review',
    subtitle: 'Technical writing',
    description: 'Complete review and update of technical documentation and user guides',
    progress: 25,
    items: 12,
    streak: 2,
    badge: undefined,
    icon: 'BookOpen',
    colorScheme: 'electric-orange',
    folderId: 'testing-qa',
    modules: [],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'automation-suite',
    title: 'Test Automation Suite',
    subtitle: 'Selenium & Cypress',
    description: 'Automated testing framework for web applications using modern tools',
    progress: 88,
    items: 15,
    streak: 14,
    badge: 'Completado' as const,
    icon: 'Zap',
    colorScheme: 'electric-gold',
    folderId: 'testing-qa',
    modules: [],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'user-feedback',
    title: 'User Feedback Analysis',
    subtitle: 'UX Research',
    description: 'Analysis and categorization of user feedback from multiple channels',
    progress: 56,
    items: 7,
    streak: 8,
    badge: 'Pausa' as const,
    icon: 'Users',
    colorScheme: 'electric-teal',
    folderId: 'testing-qa',
    modules: [],
    updatedAt: new Date().toISOString()
  }
];

// ============== CARPETAS OPTIMIZADAS ==============
export const optimizedFolders: Folder[] = [
  // CARPETA DEMO CON PROYECTOS COMPLETADOS
  {
    id: 'folder-demo-completed',
    name: 'Proyectos Q3 Completados',
    description: 'Carpeta de demostración con varios proyectos ya completados',
    icon: 'Trophy',
    colorScheme: 'sunset',
    projectIds: ['project-demo-1', 'project-demo-2', 'project-demo-3'],
    createdAt: new Date('2024-07-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'work-projects',
    name: 'Work Projects',
    description: 'Professional development and work-related projects',
    icon: 'briefcase',
    colorScheme: 'electric-blue',
    projectIds: ['ecommerce-2024'],
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'personal-goals',
    name: 'Personal Development',
    description: 'Health, fitness, and personal growth objectives',
    icon: 'heart',
    colorScheme: 'electric-green',
    projectIds: ['fitness-journey-2024'],
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'testing-qa',
    name: 'Testing & QA',
    description: 'Quality assurance and testing projects with diverse task types',
    icon: 'shield',
    colorScheme: 'electric-purple',
    projectIds: ['mobile-app-testing', 'documentation-review', 'automation-suite', 'user-feedback'],
    createdAt: new Date('2024-03-01').toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// ============== TAREAS DIARIAS OPTIMIZADAS ==============
export const optimizedDailyTasks: DailyTask[] = [
  // Tareas del proyecto E-commerce
  {
    id: 'ecom-task-1',
    title: 'Revisar diseño de landing page',
    description: 'Evaluar la responsividad y UX de la página principal',
    type: 'subjective',
    score0to1: 0.8,
    streak: 3,
    priority: 'alta',
    category: 'E-commerce Platform',
    projectId: 'ecommerce-2024',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ecom-task-2',
    title: 'Implementar autenticación',
    description: 'Completar sistema de login y registro',
    type: 'boolean',
    completed: true,
    streak: 1,
    priority: 'alta',
    category: 'E-commerce Platform',
    projectId: 'ecommerce-2024',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ecom-task-3',
    title: 'Leer libro "Clean Architecture" - 500 páginas',
    description: 'Estudio completo del libro de Robert Martin sobre arquitectura de software para mejorar el diseño del sistema',
    type: 'numeric',
    current: 150,
    target: 500,
    unit: 'páginas',
    streak: 5,
    priority: 'media',
    category: 'Estudio',
    projectId: 'ecommerce-2024',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ecom-task-12',
    title: 'Leer artículo - 50 páginas',
    description: 'Lectura rápida de documentación técnica',
    type: 'numeric',
    current: 25,
    target: 50,
    unit: 'páginas',
    streak: 2,
    priority: 'baja',
    category: 'Estudio',
    projectId: 'ecommerce-2024',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ecom-task-7',
    title: 'Análisis completo de arquitectura del sistema',
    description: 'Evaluación exhaustiva de la arquitectura actual del sistema, identificación de puntos críticos de mejora, análisis de performance, evaluación de escalabilidad y propuesta detallada de optimizaciones con roadmap de implementación',
    type: 'subjective',
    score0to1: 0.3,
    streak: 1,
    priority: 'alta',
    category: 'Arquitectura',
    projectId: 'ecommerce-2024',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ecom-task-8',
    title: 'Revisar UI',
    description: 'Checkeo rápido',
    type: 'subjective',
    score0to1: 0.9,
    streak: 1,
    priority: 'baja',
    category: 'UI',
    projectId: 'ecommerce-2024',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ecom-task-9',
    title: 'Estudiar "Design Patterns" - 1200 páginas',
    description: 'Lectura completa del libro clásico de Gang of Four sobre patrones de diseño, incluye análisis profundo de cada patrón con implementaciones prácticas',
    type: 'numeric',
    current: 300,
    target: 1200,
    unit: 'páginas',
    streak: 15,
    priority: 'alta',
    category: 'Estudio Avanzado',
    projectId: 'ecommerce-2024',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ecom-task-4',
    title: 'Checklist - Verificar enlaces',
    description: 'Verificar que todos los enlaces del sitio funcionen correctamente',
    type: 'boolean',
    completed: false,
    streak: 0,
    priority: 'baja',
    category: 'Testing',
    projectId: 'ecommerce-2024',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ecom-task-5',
    title: 'Tests unitarios',
    description: 'Cobertura de tests para funcionalidades críticas',
    type: 'numeric',
    target: 80,
    current: 65,
    unit: '%',
    streak: 7,
    priority: 'media',
    category: 'E-commerce Platform',
    projectId: 'ecommerce-2024',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ecom-task-6',
    title: 'Configurar payment gateway',
    description: 'Integrar Stripe para pagos online',
    type: 'boolean',
    completed: false,
    streak: 0,
    priority: 'alta',
    category: 'E-commerce Platform',
    projectId: 'ecommerce-2024',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ecom-task-10',
    title: 'Optimizar rendimiento',
    description: 'Mejorar tiempo de carga de páginas',
    type: 'subjective',
    score0to1: 0.6,
    streak: 2,
    priority: 'media',
    category: 'E-commerce Platform',
    projectId: 'ecommerce-2024',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ecom-task-11',
    title: 'Deploy a producción',
    description: 'Subir la aplicación al servidor de producción',
    type: 'boolean',
    completed: false,
    streak: 0,
    priority: 'baja',
    category: 'E-commerce Platform',
    projectId: 'ecommerce-2024',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Tareas del proyecto Fitness
  {
    id: 'fitness-task-1',
    title: 'Rutina de cardio matutina',
    description: 'Correr o caminar 30 minutos cada mañana',
    type: 'numeric',
    target: 30,
    current: 25,
    unit: 'minutos',
    streak: 12,
    priority: 'alta',
    category: 'Fitness Transformation',
    projectId: 'fitness-journey-2024',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fitness-task-2',
    title: 'Entrenamiento de fuerza',
    description: 'Sesión de pesas y ejercicios de resistencia',
    type: 'boolean',
    completed: true,
    streak: 8,
    priority: 'alta',
    category: 'Fitness Transformation',
    projectId: 'fitness-journey-2024',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fitness-task-3',
    title: 'Nivel de energía diario',
    description: 'Autoevaluación del nivel de energía del 1 al 10',
    type: 'subjective',
    score0to1: 0.7,
    streak: 15,
    priority: 'media',
    category: 'Fitness Transformation',
    projectId: 'fitness-journey-2024',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fitness-task-4',
    title: 'Hidratación',
    description: 'Beber al menos 2 litros de agua al día',
    type: 'numeric',
    target: 2000,
    current: 1800,
    unit: 'ml',
    streak: 20,
    priority: 'media',
    category: 'Fitness Transformation',
    projectId: 'fitness-journey-2024',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // =========== TAREAS PARA PROYECTOS DE TESTING & QA ===========

  // Mobile App Testing - Tareas de tipo mixto
  {
    id: 'mobile-test-1',
    title: 'Pruebas de UI en iOS',
    description: 'Verificar interfaz en iPhone 12, 13, y 14',
    type: 'boolean',
    completed: true,
    streak: 1,
    priority: 'alta',
    category: 'Mobile Testing',
    projectId: 'mobile-app-testing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mobile-test-2',
    title: 'Tests de performance',
    description: 'Medir tiempo de carga y respuesta',
    type: 'numeric',
    target: 50,
    current: 34,
    unit: 'tests',
    streak: 3,
    priority: 'alta',
    category: 'Mobile Testing',
    projectId: 'mobile-app-testing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mobile-test-3',
    title: 'Calidad de UX móvil',
    description: 'Evaluar experiencia de usuario en dispositivos',
    type: 'subjective',
    score0to1: 0.85,
    streak: 5,
    priority: 'media',
    category: 'Mobile Testing',
    projectId: 'mobile-app-testing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Documentation Review - Libro de 1200 páginas para testing pesos
  {
    id: 'docs-review-1',
    title: 'Revisar manual técnico completo',
    description: 'Revisión exhaustiva del manual de 1200 páginas de la API',
    type: 'numeric',
    target: 1200,
    current: 300,
    unit: 'páginas',
    streak: 2,
    priority: 'alta',
    category: 'Documentation',
    projectId: 'documentation-review',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'docs-review-2',
    title: 'Actualizar guías de usuario',
    description: 'Revisar y actualizar documentación de usuario',
    type: 'boolean',
    completed: false,
    streak: 0,
    priority: 'media',
    category: 'Documentation',
    projectId: 'documentation-review',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'docs-review-3',
    title: 'Calidad de la documentación',
    description: 'Evaluar claridad y completitud del contenido',
    type: 'subjective',
    score0to1: 0.4,
    streak: 1,
    priority: 'media',
    category: 'Documentation',
    projectId: 'documentation-review',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Test Automation Suite - Muchas pruebas automáticas
  {
    id: 'automation-1',
    title: 'Scripts de Selenium',
    description: 'Desarrollar scripts automatizados para web testing',
    type: 'numeric',
    target: 100,
    current: 92,
    unit: 'scripts',
    streak: 14,
    priority: 'alta',
    category: 'Automation',
    projectId: 'automation-suite',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'automation-2',
    title: 'Tests de regresión completos',
    description: 'Configurar suite completa de regresión',
    type: 'boolean',
    completed: true,
    streak: 8,
    priority: 'alta',
    category: 'Automation',
    projectId: 'automation-suite',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'automation-3',
    title: 'Configurar CI/CD pipeline',
    description: 'Integrar tests en pipeline de deployment',
    type: 'boolean',
    completed: true,
    streak: 5,
    priority: 'alta',
    category: 'Automation',
    projectId: 'automation-suite',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'automation-4',
    title: 'Estabilidad del framework',
    description: 'Evaluar confiabilidad y mantenibilidad',
    type: 'subjective',
    score0to1: 0.95,
    streak: 12,
    priority: 'media',
    category: 'Automation',
    projectId: 'automation-suite',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // User Feedback Analysis - Análisis cualitativo
  {
    id: 'feedback-1',
    title: 'Procesar encuestas de satisfacción',
    description: 'Analizar 500 respuestas de usuarios',
    type: 'numeric',
    target: 500,
    current: 280,
    unit: 'encuestas',
    streak: 8,
    priority: 'media',
    category: 'UX Research',
    projectId: 'user-feedback',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'feedback-2',
    title: 'Clasificar feedback negativo',
    description: 'Categorizar y priorizar issues reportados',
    type: 'boolean',
    completed: false,
    streak: 0,
    priority: 'alta',
    category: 'UX Research',
    projectId: 'user-feedback',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'feedback-3',
    title: 'Insights de experiencia usuario',
    description: 'Evaluar patrones y tendencias en feedback',
    type: 'subjective',
    score0to1: 0.7,
    streak: 6,
    priority: 'media',
    category: 'UX Research',
    projectId: 'user-feedback',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Tareas generales (sin proyecto específico)
  {
    id: 'daily-learning',
    title: 'Aprender algo nuevo',
    description: 'Leer artículos, ver tutoriales, o practicar habilidades',
    type: 'boolean',
    completed: false,
    streak: 3,
    priority: 'media',
    category: 'Crecimiento personal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// ============== ESTADÍSTICAS CALCULADAS ==============
export const calculateProjectProgress = (project: Project): number => {
  if (!project.modules || project.modules.length === 0) return 0;
  
  let totalWeight = 0;
  let weightedProgress = 0;
  
  project.modules.forEach((module: Module) => {
    const moduleWeight = module.weight || 1;
    const moduleProgress = calculateModuleProgress(module);
    
    totalWeight += moduleWeight;
    weightedProgress += moduleProgress * moduleWeight;
  });
  
  return totalWeight > 0 ? Math.round(weightedProgress / totalWeight) : 0;
};

export const calculateModuleProgress = (module: Module): number => {
  if (!module.tasks || module.tasks.length === 0) return 0;
  
  let totalProgress = 0;
  
  module.tasks.forEach((task: Task) => {
    switch (task.type) {
      case 'subjective':
        if (task.score0to1 !== undefined) {
          totalProgress += task.score0to1 * 100;
        }
        break;
      case 'numeric':
        if (task.target && task.current !== undefined) {
          totalProgress += Math.min(100, (task.current / task.target) * 100);
        }
        break;
    }
  });
  
  return Math.round(totalProgress / module.tasks.length);
};

// ============== ACTUALIZADOR DE PROGRESO ==============
export const updateProjectProgress = (project: Project): Project => {
  const newProgress = calculateProjectProgress(project);
  const newItems = project.modules?.reduce((total: number, module: Module) => total + module.tasks.length, 0) || 0;

  return {
    ...project,
    progress: newProgress,
    items: newItems,
    updatedAt: new Date().toISOString()
  };
};

// Actualizar progreso de proyectos
export const getOptimizedProjectsWithProgress = (): Project[] => {
  return optimizedProjects.map(updateProjectProgress);
};

export const getOptimizedFoldersWithProgress = (): Folder[] => {
  const projects = getOptimizedProjectsWithProgress();
  
  return optimizedFolders.map(folder => {
    const folderProjects = projects.filter(p => p.folderId === folder.id);

    return {
      ...folder,
      projectIds: folderProjects.map(p => p.id),
      updatedAt: new Date().toISOString()
    };
  });
};