'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FixedHomeScreen from './FixedHomeScreen';
import ShareModal from './ShareModal';
import TestPanel from './TestPanel';
import QuickHelp from './QuickHelp';
import AnalyticsDashboard from './AnalyticsDashboard';
import PremiumProfileScreen from './PremiumProfileScreen';
import TimeReportScreen from './TimeReportScreen';
import { Project, Folder, DailyTask, ReminderDestination, QuickCaptureDestination, Reminder, MetricType } from '@/types';
import { optimizedDailyTasks, getOptimizedProjectsWithProgress, getOptimizedFoldersWithProgress } from '@/lib/optimizedMockData';
import { USERS } from '@/lib/centralizedData';
import { getUserGradient } from '@/lib/userColors';
import PremiumDailyTasksPage from './PremiumDailyTasksPage';
import { useConnectedHandlers } from '@/hooks/useConnectedHandlers';
import { useAuth } from '@/hooks/useAuth';
import { useUniversalData } from '@/hooks/useUniversalData';
import AuthScreen from './AuthScreen';
import { Clock } from 'lucide-react';
import { TimeTrackingProvider } from '@/contexts/TimeTrackingContext';

export default function AppContainer() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'verify'>('login');
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string>('');
  const [guestMode, setGuestMode] = useState(false);

  // Debug logs para ver cambios de estado
  console.log('🏠 NewAppContainer render - isAuthenticated:', isAuthenticated, 'authLoading:', authLoading, 'authMode:', authMode, 'guestMode:', guestMode);

  // Si no está autenticado, mostrar pantalla de login
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated && !guestMode) {
    const handleAuthSuccess = () => {
      console.log('🎉 Auth exitosa, el usuario debería estar autenticado pronto');
      // El hook useAuth se actualizará automáticamente cuando la sesión cambie
    };
    
    const handleGuestMode = () => {
      console.log('👤 Modo invitado activado');
      setGuestMode(true);
    };
    
    const handleModeChange = (newMode: 'login' | 'register' | 'verify') => {
      console.log('🔄 Cambiando modo de auth a:', newMode);
      setAuthMode(newMode);
    };
    
    const handlePendingEmailChange = (email: string) => {
      console.log('📧 Email pendiente de verificación:', email);
      setPendingVerificationEmail(email);
    };
    
    return (
      <AuthScreen 
        onAuthSuccess={handleGuestMode}
        mode={authMode}
        onModeChange={handleModeChange}
        pendingEmail={pendingVerificationEmail}
        onPendingEmailChange={handlePendingEmailChange}
      />
    );
  }

  // Renderizar app (autenticado o modo invitado)
  // Usar la variable 'user' que ya está definida al inicio del componente
  const userId = user?.id || (guestMode ? 'guest' : null);
  
  console.log('🔐 AppContainer: userId for TimeTracking:', userId, 'user:', user, 'guestMode:', guestMode);
  
  return (
    <TimeTrackingProvider userId={userId}>
      <AuthenticatedApp isGuestMode={guestMode} />
    </TimeTrackingProvider>
  );
}

function AuthenticatedApp({ isGuestMode = false }: { isGuestMode?: boolean }) {
  const router = useRouter();
  const { user } = useAuth();
  
  // Estados principales optimizados - Solo datos limpios y realistas
  // Helper: heredar asignaciones desde folder -> project -> tasks
  const inheritAssignments = (folder: any, project: any) => {
    return project.assignedTo && project.assignedTo.length > 0
      ? project.assignedTo
      : (folder.assignedTo || []);
  };

  // Crear carpeta demo avanzada si no existe
  const createDemoData = () => {
    const demoFolderId = 'demo-carpeta-equipos';
    const travelFolderId = 'viaje-europa-2025';
    const baseFolders = getOptimizedFoldersWithProgress();
    const existingDemo = baseFolders.find(f => f.id === demoFolderId);
    const existingTravel = baseFolders.find(f => f.id === travelFolderId);
    if (existingDemo && existingTravel) return { folders: baseFolders, projects: getOptimizedProjectsWithProgress(), tasks: optimizedDailyTasks };

  const demoMembers = [USERS.ANA, USERS.CARLOS, USERS.MARIA];
  const travelTeam = [USERS.ANA, USERS.CARLOS, USERS.MARIA, USERS.JUAN || USERS?.CARLOS]; // fallback si no existe JUAN
    const demoProjects: Project[] = [
      {
        id: 'demo-proj-app',
        title: 'App Mobile MVP',
        description: 'Construcción de MVP con onboarding y métricas',
        progress: 0,
        items: 0,
        folderId: demoFolderId,
        assignedTo: demoMembers,
        modules: [],
        updatedAt: new Date().toISOString()
      },
      {
        id: 'demo-proj-backend',
        title: 'API & Auth Service',
        description: 'Endpoints + autenticación OAuth',
        progress: 0,
        items: 0,
        folderId: demoFolderId,
        assignedTo: demoMembers.slice(0,2),
        modules: [],
        updatedAt: new Date().toISOString()
      }
    ];

    const demoFolder: Folder = {
      id: demoFolderId,
      name: 'Operación Plataforma 2025',
      description: 'Carpeta demo con herencia completa de equipo y colores',
      icon: 'Rocket',
      colorScheme: 'electric-pink',
      projectIds: demoProjects.map(p => p.id),
      assignedTo: demoMembers.map(m => ({ ...m })),
      team: {
        id: 'demo-team',
        name: 'Task Force Plataforma',
        description: 'Equipo cross-funcional',
        members: demoMembers,
        color: 'gradient',
        icon: 'Rocket',
        createdAt: new Date().toISOString()
      },
      shareSettings: {
        isShared: true,
        shareLevel: 'admin',
        allowedUsers: demoMembers,
        permissions: { canEdit: true, canDelete: true, canShare: true, canAddMembers: true }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as any;

    // Tareas con herencia desde proyectos y fallback a carpeta
    const demoTasks: DailyTask[] = [
      {
        id: 'demo-task-1',
        title: 'Diseñar flujo Onboarding',
        type: 'boolean',
        completed: false,
        streak: 0,
        projectId: 'demo-proj-app',
        assignedTo: inheritAssignments(demoFolder, demoProjects[0]),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'demo-task-2',
        title: 'Definir esquema base de datos',
        type: 'subjective',
        score0to1: 0.2,
        streak: 0,
        projectId: 'demo-proj-backend',
        assignedTo: inheritAssignments(demoFolder, demoProjects[1]),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ] as any;

    // -------- Carpeta de Viaje (Nueva Demo) --------
    const travelProjects: Project[] = [
      {
        id: 'travel-proj-vuelos',
        title: 'Reservar Vuelos',
        description: 'Comparar precios, elegir fechas y comprar boletos',
        progress: 0,
        items: 0,
        folderId: travelFolderId,
        assignedTo: [travelTeam[0], travelTeam[1]], // 2 personas
        modules: [],
        icon: 'Plane',
        colorScheme: 'neon-blue',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'travel-proj-hospedaje',
        title: 'Hospedaje Europa',
        description: 'Reservar hoteles / Airbnbs en cada ciudad',
        progress: 0,
        items: 0,
        folderId: travelFolderId,
        assignedTo: [travelTeam[2]], // 1 persona
        modules: [],
        icon: 'BedDouble',
        colorScheme: 'sunset',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'travel-proj-itinerario',
        title: 'Itinerario Diario',
        description: 'Armar plan día a día con actividades y traslados',
        progress: 0,
        items: 0,
        folderId: travelFolderId,
        assignedTo: travelTeam, // todos
        modules: [],
        icon: 'Map',
        colorScheme: 'forest',
        updatedAt: new Date().toISOString()
      }
    ];

    const travelFolder: Folder = {
      id: travelFolderId,
      name: 'Viaje Europa 2025',
      description: 'Plan maestro para viaje por varias ciudades europeas',
      icon: 'Globe2',
      colorScheme: 'ocean',
      projectIds: travelProjects.map(p => p.id),
      assignedTo: travelTeam.map(m => ({ ...m })),
      team: {
        id: 'travel-team',
        name: 'Equipo Viaje',
        description: 'Coordinación logística y experiencias',
        members: travelTeam,
        color: 'gradient',
        icon: 'Globe2',
        createdAt: new Date().toISOString()
      },
      shareSettings: {
        isShared: true,
        shareLevel: 'editor',
        allowedUsers: travelTeam,
        permissions: { canEdit: true, canDelete: false, canShare: true, canAddMembers: true }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as any;

    const daysAgo = (n:number) => {
      const d = new Date();
      d.setDate(d.getDate()-n);
      return d.toISOString().split('T')[0];
    };
    const daysAhead = (n:number) => {
      const d = new Date();
      d.setDate(d.getDate()+n);
      return d.toISOString().split('T')[0];
    };

    const travelTasks: DailyTask[] = [
      {
        id: 'travel-task-buscar-precios',
        title: 'Buscar precios comparativos',
        type: 'boolean',
        completed: true,
        projectId: 'travel-proj-vuelos',
        assignedTo: [travelTeam[0]],
        dueDate: daysAgo(3), // completada pero vencía hace 3 días
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'travel-task-comprar-boletos',
        title: 'Comprar boletos ida/vuelta',
        type: 'boolean',
        completed: false,
        projectId: 'travel-proj-vuelos',
        assignedTo: [travelTeam[0], travelTeam[1]],
        dueDate: daysAhead(1),
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'travel-task-alojamiento-paris',
        title: 'Reservar alojamiento París',
        type: 'subjective',
        score0to1: 0.4,
        projectId: 'travel-proj-hospedaje',
        assignedTo: [travelTeam[2]],
        dueDate: daysAhead(5),
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'travel-task-itinerario-d1',
        title: 'Borrador Día 1',
        type: 'numeric',
        current: 2,
        target: 5,
        projectId: 'travel-proj-itinerario',
        assignedTo: [travelTeam[0], travelTeam[2]],
        dueDate: daysAhead(2),
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'travel-task-itinerario-d2',
        title: 'Borrador Día 2',
        type: 'numeric',
        current: 0,
        target: 5,
        projectId: 'travel-proj-itinerario',
        assignedTo: [travelTeam[1]],
        dueDate: daysAhead(4),
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'travel-task-documentacion',
        title: 'Verificar pasaportes y visados',
        type: 'boolean',
        completed: false,
        projectId: 'travel-proj-itinerario',
        assignedTo: travelTeam,
        dueDate: daysAhead(7),
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'travel-task-seguro',
        title: 'Contratar seguro de viaje',
        type: 'subjective',
        score0to1: 0.1,
        projectId: 'travel-proj-vuelos',
        assignedTo: [travelTeam[1]],
        dueDate: daysAhead(3),
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'travel-task-presupuesto',
        title: 'Definir presupuesto diario',
        type: 'numeric',
        current: 150,
        target: 600,
        unit: 'EUR',
        projectId: 'travel-proj-itinerario',
        assignedTo: [travelTeam[0], travelTeam[3] || travelTeam[1]],
        dueDate: daysAhead(6),
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'travel-task-checklist-equipaje',
        title: 'Checklist equipaje esencial',
        type: 'boolean',
        completed: false,
        projectId: 'travel-proj-hospedaje',
        assignedTo: [travelTeam[2], travelTeam[0]],
        dueDate: daysAhead(8),
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
    ] as any;

    return {
      folders: [...baseFolders, demoFolder, travelFolder],
      projects: [...getOptimizedProjectsWithProgress(), ...demoProjects, ...travelProjects],
      tasks: [...optimizedDailyTasks, ...demoTasks, ...travelTasks]
    };
  };

  // Usar el sistema de base de datos universal con autenticación
  const {
    folders,
    projects, 
    tasks: dailyTasks,
    isLoaded,
    updateFolders: setFolders,
    updateProjects: setProjects,
    updateTasks: setDailyTasks,
    reloadData,
    exportData,
    importData,
    createGoogleDriveBackup,
    restoreFromGoogleDriveBackup
  } = useUniversalData(isGuestMode, user?.id);
  
  // Limpiar títulos problemáticos cuando se cargan los proyectos
  useEffect(() => {
    if (projects && projects.length > 0) {
      const needsCleaning = projects.some(p => p.title && p.title.startsWith('project-') && p.title.includes('-'));
      
      if (needsCleaning) {
        console.log('🧹 Limpiando títulos problemáticos de proyectos...');
        setProjects(prev => prev.map(project => {
          if (project.title && project.title.startsWith('project-') && project.title.includes('-')) {
            // Generar nombre correcto basado en la carpeta
            const projectsInSameFolder = prev.filter(p => p.folderId === project.folderId && p.id !== project.id);
            const projectNumber = projectsInSameFolder.length + 1;
            const newTitle = project.folderId ? `Proyecto ${projectNumber}` : `Proyecto ${projectNumber}`;
            
            console.log(`🔄 Corrigiendo título: ${project.title} → ${newTitle}`);
            return {
              ...project,
              title: newTitle,
              updatedAt: new Date().toISOString()
            };
          }
          return project;
        }));
      }
    }
  }, [projects.length, setProjects]); // Solo cuando cambia la cantidad de proyectos
  
  // Connected handlers para todas las funcionalidades
  const connectedHandlers = useConnectedHandlers({
    projects,
    folders,
    dailyTasks,
    setProjects,
    setFolders,
    setDailyTasks
  });
  
  // Motivational card state
  // MotivationalCard removido a petición del usuario
  
  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareItem, setShareItem] = useState<{ item: Project | Folder | DailyTask; type: 'project' | 'folder' | 'task' } | null>(null);
  
  // First task of day tracking
  // Flags de primera tarea/proyecto removidos

  // Listener para atajos de teclado
  useEffect(() => {
    // Listener for test panel (Ctrl+Shift+T) and help (Ctrl+Shift+H)
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        setShowTestPanel(true);
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'H') {
        e.preventDefault();
        setShowQuickHelp(true);
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowAnalyticsDashboard(true);
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setShowProfilePanel(true);
      }
    };
    
    window.addEventListener('keydown', handleKeydown);
    
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, []);
  
  // Daily tasks page state
  const [showDailyTasksPage, setShowDailyTasksPage] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [showQuickHelp, setShowQuickHelp] = useState(false);
  const [showAnalyticsDashboard, setShowAnalyticsDashboard] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [showTimeReport, setShowTimeReport] = useState(false);
  
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: '1',
      title: 'Cita con Dr. García',
      description: 'Consulta de rutina',
      priority: 'high',
      status: 'pending',
      destination: 'calendar',
      type: 'appointment',
      startDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // En 2 horas
      allDay: false,
      patientInfo: {
        name: 'María González',
        phone: '+34 666 123 456',
        email: 'maria@email.com',
        notes: 'Primera consulta - revisar historial médico'
      },
      alarm: {
        enabled: true,
        dateTime: new Date(Date.now() + 1.5 * 60 * 60 * 1000), // 30 min antes
        sound: 'default',
        vibration: true,
        advance: 30
      },
      tags: ['salud', 'consulta'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Reunión semanal del equipo',
      description: 'Revisar avances y planificar próxima semana',
      priority: 'medium',
      status: 'pending',
      destination: 'calendar',
      type: 'recurring',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
      endDate: new Date(Date.now() + 25 * 60 * 60 * 1000), // 1 hora después
      allDay: false,
      recurrence: {
        type: 'weekly',
        interval: 1,
        daysOfWeek: [1], // Lunes
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 3 meses
      },
      alarm: {
        enabled: true,
        dateTime: new Date(Date.now() + 23.75 * 60 * 60 * 1000), // 15 min antes
        advance: 15
      },
      tags: ['trabajo', 'equipo'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Ideas para el proyecto',
      description: 'Lluvia de ideas creativas para mejorar la UI del calendario',
      priority: 'low',
      status: 'pending',
      destination: 'project',
      type: 'note',
      startDate: new Date(),
      allDay: true,
      targetProjectId: 'proj1',
      tags: ['ideas', 'creativo'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '4',
      title: 'Cumpleaños de Ana',
      description: 'No olvidar felicitarla y enviar regalo',
      priority: 'medium',
      status: 'pending',
      destination: 'calendar',
      type: 'one-time',
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // En 5 días
      allDay: true,
      alarm: {
        enabled: true,
        dateTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 1 día antes
        advance: 1440 // 24 horas antes
      },
      tags: ['personal', 'cumpleaños'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '5',
      title: 'Tomar vitaminas',
      description: 'Rutina diaria de suplementos',
      priority: 'medium',
      status: 'pending',
      destination: 'reminder',
      type: 'recurring',
      startDate: new Date(),
      allDay: false,
      recurrence: {
        type: 'daily',
        interval: 1
      },
      alarm: {
        enabled: true,
        dateTime: new Date(new Date().setHours(8, 0, 0, 0)), // 8:00 AM
        repeat: 'daily'
      },
      tags: ['salud', 'rutina'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '6',
      title: 'Cita con Juan Pérez',
      description: 'Seguimiento de tratamiento',
      priority: 'high',
      status: 'pending',
      destination: 'calendar',
      type: 'appointment',
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // En 3 días
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 1 hora después
      allDay: false,
      patientInfo: {
        name: 'Juan Pérez',
        phone: '+34 677 987 654',
        notes: 'Paciente con diabetes - control mensual'
      },
      alarm: {
        enabled: true,
        advance: 30
      },
      tags: ['paciente', 'seguimiento'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);
  
  const globalStreak = 15; // Mock data

  const handleProjectOpen = (project: Project) => {
    console.log('Open project:', project.title);
  };

  // Accepts either a single taskData object or an array for bulk creation
  const handleAddTask = (projectId: string, taskData?: any | any[]) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    console.log('Add task to project:', project.title, taskData);
    if (!taskData) return;

    // Array-ify
    const payloadArray = Array.isArray(taskData) ? taskData : [taskData];

    // Generate a robust unique ID
    const uid = () => {
      try {
        // @ts-ignore
        if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
      } catch {}
      return `task-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    };

    // Resolve inheritance: folder -> project -> task override
    const folder = folders.find(f => f.id === project.folderId);
    const inheritedIcon = (payload: any) => payload.icon || project.icon || folder?.icon || 'Target';
    const inheritedColor = (payload: any) => payload.colorScheme || project.colorScheme || folder?.colorScheme || 'default';

    // Build all new DailyTask objects
    const newTasks: DailyTask[] = payloadArray.map((payload: any) => ({
      id: uid(),
      title: payload.title,
      type: payload.type,
      completed: payload.type === 'boolean' ? false : undefined,
      current: payload.type === 'numeric' ? 0 : undefined,
      target: payload.type === 'numeric' ? payload.target : undefined,
      unit: payload.type === 'numeric' ? payload.unit : undefined,
      score0to1: payload.type === 'subjective' ? 0 : undefined,
      icon: inheritedIcon(payload),
      colorScheme: inheritedColor(payload),
      resetTime: '00:00',
      streak: 0,
      lastCompletedDate: undefined,
      priority: payload.priority,
      category: payload.category || project.title,
      description: payload.description, // Solo usar descripción si existe
      projectId: project.id,
      estimatedDuration: payload.estimatedDuration, // Duración estimada para countdown
      dueDate: payload.dueDate, // Fecha límite
      dueTime: payload.dueTime, // Hora límite
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    // Commit all in a single state update and recalc progress once
    setDailyTasks(prevDaily => {
      const nextDaily = [...newTasks, ...prevDaily];

      setProjects(prev => prev.map(p => {
        if (p.id === project.id) {
          const projectTasks = nextDaily.filter(task => task.projectId === p.id);
          const taskCount = projectTasks.length;
          if (taskCount === 0) return { ...p, items: 1, updatedAt: new Date().toISOString() };

          const completedTasks = projectTasks.filter(task => {
            if (task.type === 'boolean') return task.completed;
            if (task.type === 'numeric') return (task.current || 0) >= (task.target || 1);
            if (task.type === 'subjective') return (task.score0to1 || 0) >= 0.7;
            return false;
          });
          const completionPercentage = Math.round((completedTasks.length / taskCount) * 100);
          return { ...p, items: taskCount, progress: completionPercentage, updatedAt: new Date().toISOString() };
        }
        return p;
      }));

      return nextDaily;
    });
  };

  const handleMarkOnePercent = (project: Project) => {
    console.log('Mark 1% progress for project:', project.title);
    
    const newProgress = Math.min(100, project.progress + 1);
    
    // Show motivational card for milestone progress
    // Motivational milestone removido
    
    // Update project progress
    setProjects(prevProjects => 
      prevProjects.map(p => 
        p.id === project.id 
          ? { 
              ...p, 
              progress: newProgress,
              streak: newProgress > p.progress ? p.streak + 1 : p.streak,
              badge: newProgress >= 100 ? 'Completado' : p.badge,
              updatedAt: new Date().toISOString()
            }
          : p
      )
    );

    // Show project start card if it's the first progress
    // Mensaje de inicio de proyecto removido
  };

  const handleArchiveProject = (project: Project) => {
    console.log('Archive project:', project.title);
    setProjects(prev => prev.map(p => 
      p.id === project.id 
        ? { ...p, badge: 'Pausa', updatedAt: new Date().toISOString() }
        : p
    ));
  };

  const handleQuickCapture = (destination: ReminderDestination, text: string, data: any) => {
    console.log('Quick capture:', { destination, text, data });
    
    if (destination === 'reminder') {
      // Create new reminder
      const newReminder: Reminder = {
        id: `reminder-${Date.now()}`,
        title: text,
        description: data.description,
        priority: data.priority || 'medium',
        status: 'pending',
        destination,
        type: data.type || 'task',
        startDate: data.startDate || new Date(),
        endDate: data.endDate,
        allDay: data.allDay || false,
        alarm: data.alarm,
        recurrence: data.recurrence,
        patientInfo: data.patientInfo,
        targetProjectId: data.targetProjectId,
        targetFolderId: data.targetFolderId,
        tags: data.tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setReminders(prev => [newReminder, ...prev]);
    }
    // TODO: Handle other destinations (project, folder, calendar)
  };

  const handleCustomizeProject = (projectId: string, icon: string, colorScheme: string, title?: string) => {
    console.log('🎨 NewAppContainer - Customize project:', { projectId, icon, colorScheme, title });
    setProjects(prevProjects => {
      const newProjects = prevProjects.map(p => 
        p.id === projectId 
          ? { 
              ...p, 
              icon: icon || p.icon || 'Target', 
              colorScheme: colorScheme || 'default', // SIEMPRE establecer un colorScheme
              ...(title && title !== p.title ? { title, updatedAt: new Date().toISOString() } : {}),
              updatedAt: new Date().toISOString() // SIEMPRE actualizar timestamp para forzar re-render
            }
          : p
      );
      console.log('🎨 NewAppContainer - Proyectos actualizados:', newProjects.find(p => p.id === projectId));
      return newProjects;
    });
  };

  const handleUpdateProject = (projectId: string, updates: Partial<Project>) => {
    console.log('Update project:', { projectId, updates });
    setProjects(prevProjects => 
      prevProjects.map(p => 
        p.id === projectId 
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p
      )
    );
  };

  const handleCustomizeFolder = (folderId: string, icon: string, colorScheme: string) => {
    console.log('Customize folder:', { folderId, icon, colorScheme });
    setFolders(prevFolders => 
      prevFolders.map(f => 
        f.id === folderId 
          ? { ...f, icon, colorScheme }
          : f
      )
    );
  };

  // CRUD Handlers for Folders
  const handleCreateFolder = (folderData: any) => {
    console.log('🏷️ Creating folder with full data:', {
      name: folderData.name,
      assignedUsers: folderData.assignedTo?.length || 0,
      team: folderData.team?.name || 'No team',
      projects: folderData.projects?.length || 0
    });
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: folderData.name,
      description: folderData.description || '',
      icon: folderData.icon,
      colorScheme: folderData.colorScheme || 'default',
      projectIds: folderData.projects?.map((p: any) => p.id) || [],
      assignedTo: folderData.assignedTo || [],
      team: folderData.team,
      shareSettings: folderData.shareSettings,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setFolders(prev => [newFolder, ...prev]);

    // Add associated projects if any
    if (folderData.projects && folderData.projects.length > 0) {
      console.log('📦 handleCreateFolder: Creando proyectos incluidos:', folderData.projects);
      const newProjects = folderData.projects.map((projectData: any) => {
        const finalProjectId = projectData.id || `project-${Date.now()}-${projectData.title?.length || 0}`;
        console.log('🆔 handleCreateFolder: ID del proyecto:', {
          providedId: projectData.id,
          finalId: finalProjectId,
          title: projectData.title
        });
        return {
        id: finalProjectId, // Respetar ID proporcionado
        title: projectData.title,
        description: projectData.description || '',
        progress: 0,
        items: projectData.tasks?.length || 0,
        totalTasks: projectData.tasks?.length || 0,
        completedTasks: 0,
  icon: folderData.icon, // FORZAR herencia de carpeta
  colorScheme: (folderData.colorScheme && typeof folderData.colorScheme === 'string') ? folderData.colorScheme : 'default', // FORZAR herencia de carpeta
        priority: projectData.priority || 'medium',
        startDate: projectData.startDate,
        endDate: projectData.endDate,
        tags: projectData.tags || [],
        modules: projectData.tasks ? [{
          id: `module-${Date.now()}`,
          title: "Tareas principales",
          tasks: projectData.tasks.map((task: any) => ({
            id: task.id,
            title: task.title,
            // Conservar el tipo real desde QuickProjectCreator
            type: task.type || 'boolean',
            // Conservar metadatos para reconciliación/render
            target: task.target,
            unit: task.unit,
            dueDate: task.dueDate,
            dueTime: task.dueTime,
            estimatedDuration: task.estimatedDuration,
            done: false,
            priority: 'media' as const,
            assignedTo: folderData.assignedTo || [], // Heredar equipo de carpeta
            shareSettings: folderData.shareSettings,
            updatedAt: new Date().toISOString()
          }))
        }] : [],
        folderId: newFolder.id, // ¡IMPORTANTE! Conectar proyecto con carpeta
        assignedTo: folderData.assignedTo || [], // Heredar equipo de carpeta
        team: folderData.team, // Heredar equipo de carpeta
        shareSettings: folderData.shareSettings,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      });
      setProjects(prev => [...prev, ...newProjects]);
      
      // CREAR DAILYTASKS PARA CADA PROYECTO
      newProjects.forEach((project: any) => {
        if (project.modules && project.modules.length > 0) {
          project.modules.forEach((module: any) => {
            if (module.tasks && module.tasks.length > 0) {
              module.tasks.forEach((task: any) => {
                console.log('📋 handleCreateFolder: Creando DailyTask con projectId:', project.id);
                const dailyTaskData = {
                  title: task.title,
                  type: task.type || 'boolean',
                  icon: 'Target',
                  colorScheme: project.colorScheme || 'purple-modern',
                  resetTime: '00:00',
                  projectId: project.id, // Asociar la DailyTask al proyecto
                  // Copiar metadatos si existen
                  target: task.target,
                  unit: task.unit,
                  dueDate: task.dueDate,
                  dueTime: task.dueTime,
                  estimatedDuration: task.estimatedDuration
                };
                handleCreateDailyTask(dailyTaskData);
              });
            }
          });
        }
      });
    }
  };

  const handleEditFolder = async (folderId: string, folderData: any) => {
    console.log('🔄 Editing folder:', folderId, folderData);
    
    // Crear carpeta actualizada
    const updatedFolder = {
      ...folderData,
      id: folderId,
      updatedAt: new Date().toISOString()
    };
    
    // Actualizar usando la función del hook que también sincroniza con Google Drive
    await setFolders((prev: Folder[]) => prev.map((folder: Folder) => 
      folder.id === folderId 
        ? { 
            ...folder, 
            ...updatedFolder,
          }
        : folder
    ));
    
    console.log('✅ Folder updated locally and synced to Google Drive');
  };

  const handleDeleteFolder = (folderId: string) => {
    console.log('Deleting folder:', folderId);
    setFolders(prev => prev.filter(folder => folder.id !== folderId));
  };

  // CRUD Handlers for Projects
  const handleCreateProject = (projectData: any) => {
    console.log('🚀 Creating project with data:', {
      title: projectData.title,
      folderId: projectData.folderId,
      assignedUsers: projectData.assignedTo?.length || 0,
      team: projectData.team?.name || 'No team'
    });
    
    // Generar nombre automático si no hay título
    const getProjectDisplayName = () => {
      if (projectData.title && projectData.title.trim() && projectData.title !== 'Nuevo Proyecto') {
        return projectData.title;
      }
      
      // Si el proyecto pertenece a una carpeta, contar solo los proyectos de esa carpeta
      if (projectData.folderId) {
        const projectsInFolder = projects.filter(p => p.folderId === projectData.folderId);
        const projectNumber = projectsInFolder.length + 1;
        return `Proyecto ${projectNumber}`;
      }
      
      // Si no pertenece a ninguna carpeta, contar proyectos sin carpeta
      const projectsWithoutFolder = projects.filter(p => !p.folderId);
      const projectNumber = projectsWithoutFolder.length + 1;
      return `Proyecto ${projectNumber}`;
    };
    
    // Buscar carpeta padre para heredar equipo Y COLOR
    const parentFolder = projectData.folderId ? 
      folders.find(f => f.id === projectData.folderId) : null;

    const inheritedColor = (parentFolder?.colorScheme && typeof parentFolder.colorScheme === 'string') 
      ? parentFolder.colorScheme 
      : (projectData.colorScheme && typeof projectData.colorScheme === 'string') 
        ? projectData.colorScheme 
        : 'default';

    console.log('🎨 Herencia de color:', {
      parentFolderId: projectData.folderId,
      parentFolderColor: parentFolder?.colorScheme || parentFolder?.color,
      projectColor: projectData.colorScheme,
      inheritedColor
    });

    const newProject: Project = {
      id: projectData.id || `project-${Date.now()}`, // Usar ID proporcionado o generar uno nuevo
      title: getProjectDisplayName(),
      progress: 0,
      items: 0, // Se calculará automáticamente
      streak: 0,
      badge: undefined,
      modules: projectData.modules || [],
      // Heredar icono desde la carpeta si el proyecto no define uno, con posibilidad de sobrescribir
      icon: projectData.icon || parentFolder?.icon || 'Target',
  colorScheme: inheritedColor, // HEREDAR color de la carpeta padre
  color: inheritedColor, // También legacy color
      folderId: projectData.folderId,
      assignedTo: parentFolder?.assignedTo || projectData.assignedTo || [],
      team: parentFolder?.team || projectData.team,
      shareSettings: parentFolder?.shareSettings || projectData.shareSettings,
      updatedAt: new Date().toISOString()
    };

    // VERIFICACIÓN ADICIONAL: Asegurar que el título nunca sea un ID
    if (newProject.title.startsWith('project-') && newProject.title.includes('-')) {
      newProject.title = projectData.folderId ? `Proyecto ${projects.filter(p => p.folderId === projectData.folderId).length + 1}` : `Proyecto ${projects.filter(p => !p.folderId).length + 1}`;
    }

    console.log('📝 Created new project:', {
      id: newProject.id,
      title: newProject.title,
      originalTitle: projectData.title,
      folderId: projectData.folderId,
      projectsInFolderCount: projectData.folderId ? projects.filter(p => p.folderId === projectData.folderId).length : 'no folder'
    });
    
    setProjects(prev => [newProject, ...prev]);
    
    // CREAR DAILYTASKS SI EL PROYECTO TIENE MÓDULOS CON TAREAS
    if (newProject.modules && newProject.modules.length > 0) {
      newProject.modules.forEach((module: any) => {
        if (module.tasks && module.tasks.length > 0) {
          module.tasks.forEach((task: any) => {
            console.log('📋 handleCreateProject: Creando DailyTask con projectId:', newProject.id);
            const dailyTaskData = {
              title: task.title,
              type: task.type || 'boolean',
              icon: 'Target',
              colorScheme: newProject.colorScheme || 'purple-modern',
              resetTime: '00:00',
              projectId: newProject.id, // Asociar la DailyTask al proyecto
              // Copiar metadatos si existen
              target: task.target,
              unit: task.unit,
              dueDate: task.dueDate,
              dueTime: task.dueTime,
              estimatedDuration: task.estimatedDuration
            };
            handleCreateDailyTask(dailyTaskData);
          });
        }
      });
    }
    
    // Update folder if project is assigned to one
    if (projectData.folderId) {
      setFolders(prev => prev.map(folder => 
        folder.id === projectData.folderId
          ? { 
              ...folder, 
              projectIds: [...(folder.projectIds || []), newProject.id],
              updatedAt: new Date().toISOString()
            }
          : folder
      ));
    }
  };

  const handleEditProject = (projectId: string, projectData: any) => {
    console.log('Editing project:', projectId, projectData);
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { 
            ...project, 
            ...projectData,
            updatedAt: new Date().toISOString()
          }
        : project
    ));
  };

  const handleDeleteProject = (projectId: string) => {
    console.log('Deleting project:', projectId);
    setProjects(prev => prev.filter(project => project.id !== projectId));
    
    // Remove project from folders
    setFolders(prev => prev.map(folder => ({
      ...folder,
      projectIds: (folder.projectIds || []).filter((id: string) => id !== projectId),
      updatedAt: new Date().toISOString()
    })));
  };

  // Edit Title Handlers
  const handleEditProjectTitle = (projectId: string, newTitle: string) => {
    console.log('🔧 Editing project title:', { projectId, newTitle, timestamp: new Date().toISOString() });
    
    setProjects(prev => {
      const updatedProjects = prev.map(project => 
        project.id === projectId 
          ? { 
              ...project, 
              title: newTitle.trim() || 'Sin nombre',
              updatedAt: new Date().toISOString()
            }
          : project
      );
      
      const updatedProject = updatedProjects.find(p => p.id === projectId);
      console.log('🔄 Updated project after title edit:', {
        id: updatedProject?.id,
        oldTitle: prev.find(p => p.id === projectId)?.title,
        newTitle: updatedProject?.title,
        success: updatedProject?.title === (newTitle.trim() || 'Sin nombre')
      });
      
      return [...updatedProjects]; // Force new array reference
    });
  };

  // Handle project mode changes (challenge, competition, normal)
  const handleProjectModeChange = (projectId: string, mode: 'normal' | 'challenge' | 'competition', config?: any) => {
    console.log('🎯 Changing project mode:', { projectId, mode, config, timestamp: new Date().toISOString() });
    
    setProjects(prev => {
      const updatedProjects = prev.map(project => {
        if (project.id === projectId) {
          const updatedProject = {
            ...project,
            mode,
            updatedAt: new Date().toISOString()
          };

          // Add specific config based on mode
          if (mode === 'challenge' && config) {
            updatedProject.challengeConfig = config;
            delete (updatedProject as any).competitionConfig; // Remove competition config
          } else if (mode === 'competition' && config) {
            updatedProject.competitionConfig = config;
            delete (updatedProject as any).challengeConfig; // Remove challenge config
          } else if (mode === 'normal') {
            // Remove both configs for normal mode
            delete (updatedProject as any).challengeConfig;
            delete (updatedProject as any).competitionConfig;
          }

          console.log('🔄 Updated project mode:', {
            id: updatedProject.id,
            oldMode: project.mode || 'normal',
            newMode: updatedProject.mode,
            config: mode === 'challenge' ? updatedProject.challengeConfig : mode === 'competition' ? updatedProject.competitionConfig : 'none'
          });

          return updatedProject;
        }
        return project;
      });

      return [...updatedProjects]; // Force new array reference
    });
  };

  // Handle competition progress updates
  const handleUpdateCompetitionProgress = (projectId: string, userId: string, progress: number) => {
    console.log('🏆 Updating competition progress:', { projectId, userId, progress, timestamp: new Date().toISOString() });
    
    setProjects(prev => {
      const updatedProjects = prev.map(project => {
        if (project.id === projectId && project.competitionConfig) {
          const updatedConfig = {
            ...project.competitionConfig,
            participants: project.competitionConfig.participants.map(participant => 
              participant.userId === userId 
                ? { ...participant, progress, lastUpdate: new Date().toISOString() }
                : participant
            )
          };

          console.log('🔄 Updated competition participant:', {
            projectId,
            userId,
            oldProgress: project.competitionConfig.participants.find(p => p.userId === userId)?.progress,
            newProgress: progress
          });

          return {
            ...project,
            competitionConfig: updatedConfig,
            updatedAt: new Date().toISOString()
          };
        }
        return project;
      });

      return [...updatedProjects];
    });
  };

  // Update challenge progress when tasks are completed
  const updateChallengeProgress = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project || project.mode !== 'challenge' || !project.challengeConfig) return;

    const projectTasks = dailyTasks.filter(task => task.projectId === projectId);
    if (projectTasks.length === 0) return;

    // Calculate current project progress
    let totalProgress = 0;
    let totalWeight = 0;
    
    projectTasks.forEach(task => {
      let progress = 0;
      let weight = 1;
      
      if (task.type === 'boolean') {
        progress = task.completed ? 100 : 0;
      } else if (task.type === 'numeric') {
        progress = task.target && task.target > 0 ? Math.min(100, ((task.current || 0) / task.target) * 100) : 0;
      } else if (task.type === 'subjective') {
        progress = (task.score0to1 || 0) * 100;
      }
      
      totalProgress += progress * weight;
      totalWeight += weight;
    });
    
    const projectProgress = totalWeight > 0 ? (totalProgress / totalWeight) : 0;
    const todayString = new Date().toISOString().split('T')[0];
    
    // If project is 100% complete today, mark the day as completed
    if (projectProgress >= 100) {
      setProjects(prev => prev.map(proj => {
        if (proj.id === projectId && proj.challengeConfig) {
          const daysCompleted = proj.challengeConfig.daysCompleted || [];
          const isAlreadyMarked = daysCompleted.includes(todayString);
          
          if (!isAlreadyMarked) {
            const newDaysCompleted = [...daysCompleted, todayString];
            const newStreak = proj.challengeConfig.currentStreak + 1;
            
            console.log('🎯 Challenge day completed!', {
              projectId,
              day: todayString,
              newStreak,
              totalDays: proj.challengeConfig.totalDays
            });
            
            return {
              ...proj,
              challengeConfig: {
                ...proj.challengeConfig,
                daysCompleted: newDaysCompleted,
                currentStreak: newStreak
              },
              updatedAt: new Date().toISOString()
            };
          }
        }
        return proj;
      }));
    }
  };

  // Check for challenge resets (when a day is missed) - SOLO EN MODO ESTRICTO
  const checkChallengeReset = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split('T')[0];
    
    setProjects(prev => prev.map(project => {
      if (project.mode === 'challenge' && project.challengeConfig && project.challengeConfig.resetOnMiss) {
        const { daysCompleted, currentStreak } = project.challengeConfig;
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];
        
        // MODO ESTRICTO: Si se perdió ayer y no se ha completado hoy, resetear TODO
        if (currentStreak > 0 && !daysCompleted.includes(yesterdayString) && !daysCompleted.includes(todayString)) {
          console.log('🔄 MODO ESTRICTO - Challenge reset debido a día perdido:', {
            projectId: project.id,
            missedDay: yesterdayString,
            oldStreak: currentStreak,
            daysLost: daysCompleted.length
          });
          
          return {
            ...project,
            challengeConfig: {
              ...project.challengeConfig,
              currentStreak: 0,
              daysCompleted: [] // Borrar todo el progreso en modo estricto
            },
            updatedAt: new Date().toISOString()
          };
        }
      }
      return project;
    }));
  };

  // Run challenge reset check daily
  useEffect(() => {
    checkChallengeReset();
    
    // Set up daily check at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timeout = setTimeout(() => {
      checkChallengeReset();
      
      // Set up daily interval
      const interval = setInterval(checkChallengeReset, 24 * 60 * 60 * 1000);
      return () => clearInterval(interval);
    }, timeUntilMidnight);
    
    return () => clearTimeout(timeout);
  }, []);

  // Enhanced task handlers that trigger challenge updates
  const enhancedToggleTask = (taskId: string, value?: number) => {
    const task = dailyTasks.find(t => t.id === taskId);
    if (!task) return;
    
    setDailyTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { 
            ...t, 
            completed: t.type === 'boolean' ? !t.completed : t.completed,
            streak: t.type === 'boolean' && !t.completed ? (t.streak || 0) + 1 : t.streak,
            lastCompletedDate: t.type === 'boolean' && !t.completed ? new Date().toISOString().split('T')[0] : t.lastCompletedDate,
            updatedAt: new Date().toISOString()
          }
        : t
    ));
    
    // Update challenge progress if task belongs to a challenge project
    if (task.projectId) {
      setTimeout(() => updateChallengeProgress(task.projectId!), 100);
    }
  };

  const enhancedUpdateTask = (taskId: string, value: number) => {
    const task = dailyTasks.find(t => t.id === taskId);
    if (!task) return;
    
    setDailyTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { 
            ...t, 
            current: t.type === 'numeric' ? value : t.current,
            score0to1: t.type === 'subjective' ? value : t.score0to1,
            updatedAt: new Date().toISOString()
          }
        : t
    ));
    
    // Update challenge progress if task belongs to a challenge project
    if (task.projectId) {
      setTimeout(() => updateChallengeProgress(task.projectId!), 100);
    }
  };

  const handleEditFolderTitle = (folderId: string, newTitle: string) => {
    console.log('🔄 Editing folder title:', folderId, newTitle);
    const updatedFolders = folders.map(folder => 
      folder.id === folderId 
        ? { 
            ...folder, 
            name: newTitle,
            updatedAt: new Date().toISOString()
          }
        : folder
    );
    // Forzar actualización inmediata del estado
    setFolders([...updatedFolders]);
  };

  const handleTeamUpdate = (folderId: string, updates: any) => {
    console.log('🔄 Updating folder team:', folderId, updates);
    console.log('📋 Updates contain assignedTo:', updates.assignedTo);
    setFolders(prev => {
      const updated = prev.map(folder => 
        folder.id === folderId 
          ? { 
              ...folder,
              ...updates,
              updatedAt: new Date().toISOString()
            }
          : folder
      );
      console.log('✅ Folder updated:', updated.find(f => f.id === folderId));
      return updated;
    });
  };

  const handleModeChange = (folderId: string, mode: 'fixed' | 'cyclic' | 'ephemeral') => {
    console.log(`🔄 [handleModeChange] Cambiando modo de carpeta ${folderId} a:`, mode);
    console.log(`🔄 [handleModeChange] Carpetas actuales:`, folders.length);
    
    setFolders(prev => {
      const updated = prev.map(folder => 
        folder.id === folderId 
          ? { 
              ...folder,
              mode,
              lastResetDate: mode === 'cyclic' ? new Date().toISOString() : undefined,
              updatedAt: new Date().toISOString()
            }
          : folder
      );
      console.log(`✅ [handleModeChange] Carpetas actualizadas. Modo nuevo para ${folderId}:`, 
        updated.find(f => f.id === folderId)?.mode);
      return updated;
    });
  };

  // CRUD Handlers for Daily Tasks
  const handleCreateDailyTask = (taskData: any) => {
    console.log('Creating daily task:', taskData);
    const newTask: DailyTask = {
      id: `task-${Date.now()}`,
      title: taskData.title,
      type: taskData.type,
      completed: taskData.type === 'boolean' ? false : undefined,
      current: taskData.type === 'numeric' ? 0 : undefined,
      target: taskData.type === 'numeric' ? taskData.target : undefined,
      unit: taskData.type === 'numeric' ? taskData.unit : undefined,
      score0to1: taskData.type === 'subjective' ? 0 : undefined,
      icon: taskData.icon,
      colorScheme: taskData.colorScheme,
      resetTime: taskData.resetTime || '00:00',
      // Asociaciones opcionales para render en vistas por proyecto/carpeta
      projectId: taskData.projectId,
      folderId: taskData.folderId,
      // Campos adicionales si vienen del creador rápido
      description: taskData.description,
      priority: taskData.priority,
      category: taskData.category,
      streak: 0,
      lastCompletedDate: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setDailyTasks(prev => [newTask, ...prev]);
  };

  const handleEditDailyTask = (taskId: string, taskData: any) => {
    console.log('Editing daily task:', taskId, taskData);
    setDailyTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            ...taskData,
            updatedAt: new Date().toISOString()
          }
        : task
    ));
  };

  const handleDeleteDailyTask = (taskId: string) => {
    console.log('Deleting daily task:', taskId);
    setDailyTasks(prev => prev.filter(task => task.id !== taskId));
  };

  // Reconciler: asegurar que cada tarea de módulos de proyectos tenga su DailyTask asociada
  // Esto corrige datos antiguos donde las tareas se crearon sin projectId y garantiza render en ProjectDetailScreen
  useEffect(() => {
    try {
      projects.forEach((project: any) => {
        const moduleTasks = (project.modules || []).flatMap((m: any) => m.tasks || []);
        moduleTasks.forEach((task: any) => {
          const existing = dailyTasks.find(dt => dt.projectId === project.id && dt.title === task.title);
          if (!existing) {
            console.log('🛠 Reconciler: creando DailyTask faltante para proyecto', project.id, 'tarea', task.title);
            handleCreateDailyTask({
              title: task.title,
              type: task.type || 'boolean',
              icon: project.icon || 'Target',
              colorScheme: project.colorScheme || 'purple-modern',
              resetTime: '00:00',
              projectId: project.id,
              target: task.target,
              unit: task.unit,
              dueDate: task.dueDate,
              dueTime: task.dueTime,
              estimatedDuration: task.estimatedDuration
            });
          } else {
            // Si existe pero no respeta tipo/metadata, actualizarlo para que se muestren controles correctos
            const needsTypeUpdate = task.type && existing.type !== task.type;
            const needsTarget = task.type === 'numeric' && (existing.target !== task.target || existing.unit !== task.unit);
            const needsDates = (!!task.dueDate && existing.dueDate !== task.dueDate) || (!!task.dueTime && existing.dueTime !== task.dueTime);
            const needsDuration = !!task.estimatedDuration && existing.estimatedDuration !== task.estimatedDuration;
            if (needsTypeUpdate || needsTarget || needsDates || needsDuration) {
              console.log('🛠 Reconciler: actualizando DailyTask', existing.id, 'para respetar tipo/metadata del módulo');
              handleEditDailyTask(existing.id, {
                type: task.type || existing.type,
                target: task.type === 'numeric' ? task.target : existing.target,
                unit: task.type === 'numeric' ? task.unit : existing.unit,
                dueDate: task.dueDate ?? existing.dueDate,
                dueTime: task.dueTime ?? existing.dueTime,
                estimatedDuration: task.estimatedDuration ?? existing.estimatedDuration,
                projectId: project.id
              });
            }
          }
        });
      });
    } catch (e) {
      console.warn('Reconciler error:', e);
    }
  }, [projects, dailyTasks]);

  // Sincronizar desde DailyTasks hacia los módulos del proyecto (arreglo legacy):
  useEffect(() => {
    try {
      let changed = false;
      const nextProjects = projects.map((project: any) => {
        if (!project.modules) return project;
        const newModules = project.modules.map((mod: any) => {
          if (!mod.tasks) return mod;
          const newTasks = mod.tasks.map((t: any) => {
            const dt = dailyTasks.find(d => d.projectId === project.id && d.title === t.title);
            if (dt) {
              const typeDiff = t.type !== dt.type;
              const targetDiff = dt.type === 'numeric' && (t.target !== dt.target || t.unit !== dt.unit);
              const dateDiff = (t.dueDate !== dt.dueDate) || (t.dueTime !== dt.dueTime);
              const durationDiff = t.estimatedDuration !== dt.estimatedDuration;
              if (typeDiff || targetDiff || dateDiff || durationDiff) {
                changed = true;
                return {
                  ...t,
                  type: dt.type,
                  target: dt.type === 'numeric' ? dt.target : undefined,
                  unit: dt.type === 'numeric' ? dt.unit : undefined,
                  dueDate: dt.dueDate,
                  dueTime: dt.dueTime,
                  estimatedDuration: dt.estimatedDuration
                };
              }
            }
            return t;
          });
          return newTasks !== mod.tasks ? { ...mod, tasks: newTasks } : mod;
        });
        return newModules !== project.modules ? { ...project, modules: newModules } : project;
      });
      if (changed) {
        setProjects(nextProjects as any);
      }
    } catch (e) {
      console.warn('Sync modules from DailyTasks error:', e);
    }
  }, [dailyTasks]);

  // Share functions
  const handleShareProject = (project: Project) => {
    setShareItem({ item: project, type: 'project' });
    setShowShareModal(true);
  };

  const handleShareFolder = (folder: Folder) => {
    setShareItem({ item: folder, type: 'folder' });
    setShowShareModal(true);
  };

  const handleShareTask = (task: DailyTask) => {
    setShareItem({ item: task, type: 'task' });
    setShowShareModal(true);
  };

  const handleShare = (shareData: any) => {
    console.log('Sharing:', shareData);
    // Here you would implement the actual sharing logic
    // For now, we'll just log it
    

    const itemName = shareData.itemId;
    const userCount = shareData.invitedUsers?.length || 0;
    
    if (shareData.itemType === 'project') {

    } else if (shareData.itemType === 'folder') {

    } else {

    }
  };

  // Show daily tasks page if requested
  if (showDailyTasksPage) {
    return (
      <PremiumDailyTasksPage
        dailyTasks={dailyTasks}
        onBack={() => setShowDailyTasksPage(false)}
        onToggleTask={enhancedToggleTask}
        onUpdateTask={enhancedUpdateTask}
        onEditTask={(task: DailyTask) => {
          setDailyTasks(prev => prev.map(t => t.id === task.id ? { ...task, updatedAt: new Date().toISOString() } : t));
        }}
        onDeleteTask={(taskId: string) => {
          setDailyTasks(prev => prev.filter(t => t.id !== taskId));
        }}
        onCreateTask={() => {
          console.log('Crear nueva tarea diaria');
        }}
      />
    );
  }

  // Handler for QuickCapture compatible with NewHomeScreen
  const handleNewHomeQuickCapture = (destination: QuickCaptureDestination, text: string, data: any) => {
    console.log('Quick capture:', { destination, text, data });
    // Convert QuickCaptureDestination to ReminderDestination if needed
    // You can implement the conversion logic here
  };

  return (
    <>
      {/* Banner de modo invitado */}
      {isGuestMode && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 to-red-500 text-white text-center py-2 text-sm font-medium">
          🚀 Modo Invitado - Los datos son temporales | 
          <button 
            onClick={() => window.location.reload()} 
            className="ml-2 underline hover:no-underline"
          >
            Registrarse
          </button>
        </div>
      )}
      
      <div className={`${isGuestMode ? 'pt-10' : ''}`}>
        <FixedHomeScreen
      folders={folders}
      dailyTasks={dailyTasks}
      projects={projects}
      reminders={reminders}
      globalStreak={globalStreak}
      onProjectOpen={handleProjectOpen}
      onFolderOpen={(folder: Folder) => console.log('Open folder:', folder.name)}
      onAddTask={handleAddTask}
      onMarkOnePercent={handleMarkOnePercent}
      onEditProject={connectedHandlers.handleEditProject}
      onArchiveProject={connectedHandlers.handleArchiveProject}
      onQuickCapture={handleQuickCapture}
      onCustomizeProject={handleCustomizeProject}
      onCustomizeFolder={connectedHandlers.handleCustomizeFolder}
      onToggleDailyTask={enhancedToggleTask}
      onUpdateDailyTask={enhancedUpdateTask}
      onAddDailyTask={() => {
        if (typeof window !== 'undefined' && (window as any).openTaskModal) {
          (window as any).openTaskModal();
        }
      }}
      newRecognitionsCount={2}
      onChestOpen={() => console.log('Open recognition chest')}
      onAnalyticsOpen={() => setShowAnalyticsDashboard(true)}
      onProfileOpen={() => setShowProfilePanel(true)}
      onAddReminder={() => console.log('Add reminder')}
      onEditReminder={(reminder: Reminder) => console.log('Edit reminder:', reminder)}
      onDeleteReminder={(reminderId: string) => {
        setReminders(prev => prev.filter(r => r.id !== reminderId));
      }}
      onToggleCompleteReminder={(reminderId: string) => {
        setReminders(prev => prev.map(r => 
          r.id === reminderId 
            ? { ...r, status: r.status === 'completed' ? 'pending' : 'completed', completedAt: r.status === 'pending' ? new Date().toISOString() : undefined }
            : r
        ));
      }}
      onToggleAlarmReminder={(reminderId: string) => {
        setReminders(prev => prev.map(r => 
          r.id === reminderId 
            ? { ...r, alarm: r.alarm ? { ...r.alarm, enabled: !r.alarm.enabled } : undefined }
            : r
        ));
      }}
      onCreateFolder={handleCreateFolder}
      onEditFolder={connectedHandlers.handleEditFolderById}
      onDeleteFolder={connectedHandlers.handleDeleteFolderById}
      onCreateProject={handleCreateProject}
      onDeleteProject={connectedHandlers.handleDeleteProjectById}
      onUpdateProject={handleUpdateProject}
      onCreateDailyTask={handleCreateDailyTask}
      onEditDailyTask={connectedHandlers.handleEditDailyTaskById}
      onDeleteDailyTask={connectedHandlers.handleDeleteDailyTask}
      onEditProjectTitle={handleEditProjectTitle}
      onEditFolderTitle={handleEditFolderTitle}
      onTeamUpdate={handleTeamUpdate}
      onModeChange={handleModeChange}
      onProjectModeChange={handleProjectModeChange}
      onUpdateCompetitionProgress={handleUpdateCompetitionProgress}
      onShareProject={handleShareProject}
      onShareFolder={handleShareFolder}
      onShareTask={handleShareTask}
    />
    {/* Motivational Card */}

    {/* Share Modal */}
    <ShareModal
      isOpen={showShareModal}
      onClose={() => setShowShareModal(false)}
      item={shareItem?.item || null}
      itemType={shareItem?.type || 'project'}
      onShare={handleShare}
    />

    {/* Test Panel */}
    <TestPanel
      isOpen={showTestPanel}
      onClose={() => setShowTestPanel(false)}
    />

    {/* Quick Help */}
    <QuickHelp
      isOpen={showQuickHelp}
      onClose={() => setShowQuickHelp(false)}
    />

    {/* Analytics Dashboard */}
    <AnalyticsDashboard
      isOpen={showAnalyticsDashboard}
      onClose={() => setShowAnalyticsDashboard(false)}
      projects={projects}
      folders={folders}
      dailyTasks={dailyTasks}
    />

    {/* Premium Profile Screen Modal */}
    <PremiumProfileScreen
      isOpen={showProfilePanel}
      onClose={() => setShowProfilePanel(false)}
      onBack={() => setShowProfilePanel(false)}
      onNavigate={(view: any) => {
        setShowProfilePanel(false);
        // Aquí puedes manejar navegación si es necesario
        console.log('Navegando a:', view);
      }}
      exportData={exportData}
      importData={importData}
      isGuestMode={isGuestMode}
      userId={user?.id}
    />

    {/* Time Report Screen */}
    <TimeReportScreen
      isOpen={showTimeReport}
      onClose={() => setShowTimeReport(false)}
      folders={folders}
      projects={projects}
      tasks={dailyTasks}
    />

    {/* Floating Time Report Button */}
    <button
      onClick={() => setShowTimeReport(true)}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 shadow-2xl hover:shadow-purple-500/50 flex items-center justify-center group hover:scale-110 transition-all duration-300 border border-white/20"
      title="Ver Resumen de Tiempo"
    >
      <Clock className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-slate-900" />
    </button>

    </div>
    </>
  );
}
