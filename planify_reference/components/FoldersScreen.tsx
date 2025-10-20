'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Folder, Project, DailyTask } from '@/types';
import UltraPremiumFolderModal from './UltraPremiumFolderModal';
import QuickProjectCreator from './QuickProjectCreator';
import InlineNavigationBar from './InlineNavigationBar';
import FullScreenStyleModal from './FullScreenStyleModal';
import ShareModal from './ShareModal';
import ProjectLifecycleModal from './ProjectLifecycleModal';
import { capitalizeFirst } from '@/utils/textUtils';
import { Plus, Search, FolderOpen, Filter, ChevronDown, CheckCircle, Clock, TrendingUp, Zap, Sparkles, Target, Home, X, Lock, Play, Pause, FolderPlus, Users, Eye } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useTimeTracking } from '@/contexts/TimeTrackingContext';
// (revert) keep prototypes static for now

interface FoldersScreenProps {
  folders: Folder[];
  projects: Project[];
  dailyTasks: DailyTask[];
  onFolderOpen?: (folder: Folder) => void;
  onCustomizeFolder?: (folderId: string, icon: string, colorScheme: string) => void;
  onEditFolderTitle?: (folderId: string, newTitle: string) => void;
  onTeamUpdate?: (folderId: string, updates: any) => void;
  onModeChange?: (folderId: string, mode: 'fixed' | 'cyclic' | 'ephemeral') => void;
  onCreateFolder?: (folderData: any) => void;
  onCreateProject?: (projectData: any) => void;
  onCreateDailyTask?: (taskData: any) => void;
  onDeleteFolder?: (folder: Folder) => void;
  onStartFocusMode?: (folderId: string) => void; // Nueva prop para los botones Play
  currentView?: 'home' | 'folders' | 'projects' | 'calendar' | 'reminders' | 'profile' | 'ideas';
  onNavigate?: (view: 'home' | 'folders' | 'projects' | 'calendar' | 'reminders' | 'profile' | 'ideas') => void;
}

export default function FoldersScreen({
  folders,
  projects,
  dailyTasks,
  onFolderOpen,
  onCustomizeFolder,
  onEditFolderTitle,
  onTeamUpdate,
  onModeChange,
  onCreateFolder,
  onCreateProject,
  onCreateDailyTask,
  onDeleteFolder,
  onStartFocusMode,
  currentView = 'folders',
  onNavigate
}: FoldersScreenProps) {
  // Hook de time tracking
  const { 
    startFolderTracking, 
    stopFolderTracking, 
    getFolderTracking 
  } = useTimeTracking();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuickProjectCreator, setShowQuickProjectCreator] = useState(false);
  const [activeFilter, setActiveFilter] = useState('todas');
  const [newlyCreatedFolderId, setNewlyCreatedFolderId] = useState<string | null>(null);
  const prevFolderCountRef = useRef((folders || []).length);
  const newFolderRef = useRef<HTMLDivElement>(null);
  
  // Estados para carpetas destacadas
  const [showCustomizeFeatured1, setShowCustomizeFeatured1] = useState(false);
  const [showCustomizeFeatured2, setShowCustomizeFeatured2] = useState(false);
  const [showShareFeatured1, setShowShareFeatured1] = useState(false);
  const [showShareFeatured2, setShowShareFeatured2] = useState(false);
  const [showLifecycleFeatured1, setShowLifecycleFeatured1] = useState(false);
  const [showLifecycleFeatured2, setShowLifecycleFeatured2] = useState(false);
  
  // Estados para color e icono dinámico de carpetas destacadas
  const [featured1Icon, setFeatured1Icon] = useState('FolderOpen');
  const [featured1Color, setFeatured1Color] = useState('vibrant-purple');
  const [featured1Name, setFeatured1Name] = useState('Carpeta Prototipo');
  const [featured2Icon, setFeatured2Icon] = useState('FolderOpen');
  const [featured2Color, setFeatured2Color] = useState('vibrant-cyan');
  const [featured2Name, setFeatured2Name] = useState('Carpeta Diseño UI');
  
  // Estados para modales de carpetas reales
  const [customizingFolderId, setCustomizingFolderId] = useState<string | null>(null);
  const [sharingFolderId, setSharingFolderId] = useState<string | null>(null);
  const [lifecycleFolderId, setLifecycleFolderId] = useState<string | null>(null);
  
  // Estado para feedback visual al abrir carpeta (estilo filtros)
  const [selectedFolderFeedback, setSelectedFolderFeedback] = useState<{
    icon: any;
    gradient: string;
    label: string;
  } | null>(null);

  // Detectar nueva carpeta por aumento en cantidad y seleccionar la más reciente
  useEffect(() => {
    const currentCount = (folders || []).length;
    if (currentCount > prevFolderCountRef.current && currentCount > 0) {
      // Encontrar la carpeta más reciente por createdAt
      const newest = [...folders].sort((a, b) => {
        const ta = new Date(a.createdAt || 0).getTime();
        const tb = new Date(b.createdAt || 0).getTime();
        return tb - ta;
      })[0];
      if (newest) {
        setNewlyCreatedFolderId(newest.id);
        // Hacer scroll a la nueva carpeta y enfocar el input después de un breve delay
        setTimeout(() => {
          if (newFolderRef.current) {
            newFolderRef.current.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
            // Buscar el input dentro del elemento y seleccionarlo
            const input = newFolderRef.current.querySelector('input[type="text"]') as HTMLInputElement;
            if (input) {
              setTimeout(() => {
                input.focus();
                input.select();
              }, 300); // Esperar a que termine el scroll
            }
          }
        }, 100);
      }
    }
    prevFolderCountRef.current = currentCount;
  }, [folders]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const headerFilterMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  // (revert) removing prototype wiring state
  
  // Estado para animación de feedback visual al seleccionar filtro
  const [selectedFilterFeedback, setSelectedFilterFeedback] = useState<{
    icon: any;
    gradient: string;
    label: string;
  } | null>(null);

  // Cerrar el menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerFilterMenuRef.current && !headerFilterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Enfocar input de búsqueda cuando se abre
  useEffect(() => {
    if (showSearchBar && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearchBar]);

  // Calcular estadísticas dinámicas globales
  const totalProjects = projects.length;
  const totalTasks = dailyTasks.length;
  const activeFolders = folders.filter(f => {
    const folderProjects = projects.filter(p => p.folderId === f.id);
    return folderProjects.length > 0;
  }).length;
  
  const completedTasks = dailyTasks.filter(task => {
    if (task.type === 'boolean') return task.completed;
    if (task.type === 'numeric') return (task.current || 0) >= (task.target || 1);
    if (task.type === 'subjective') return (task.score0to1 || 0) >= 0.8;
    return false;
  }).length;

  const todayActivity = dailyTasks.filter(task => {
    const today = new Date().toDateString();
    const safeTime = task.updatedAt || task.createdAt || new Date().toISOString();
    const taskDate = new Date(safeTime).toDateString();
    return taskDate === today;
  }).length;

  // Algoritmo de seguimiento por días
  const getDaysActive = (folder: Folder) => {
    const folderTasks = dailyTasks.filter(task => {
      const taskProject = projects.find(p => p.id === task.projectId);
      return taskProject?.folderId === folder.id;
    });
    
    const uniqueDays = new Set(folderTasks.map(task => {
      const safeTime = task.updatedAt || task.createdAt || new Date().toISOString();
      return new Date(safeTime).toDateString();
    }));
    return uniqueDays.size;
  };

  const getWorkIntensity = (folder: Folder) => {
    const folderTasks = dailyTasks.filter(task => {
      const taskProject = projects.find(p => p.id === task.projectId);
      return taskProject?.folderId === folder.id;
    });
    
    const recentActivity = folderTasks.filter(task => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const safeTime = task.updatedAt || task.createdAt || new Date().toISOString();
      return new Date(safeTime) > sevenDaysAgo;
    });
    
    return recentActivity.length;
  };

  // Funciones auxiliares para los filtros
  const getAverageProgress = (folder: Folder) => {
    const folderProjects = projects.filter(p => p.folderId === folder.id);
    if (folderProjects.length === 0) return 0;
    
    // Calcular progreso manualmente sin usar el hook dentro de una función
    const totalTasks = folderProjects.reduce((acc, project) => {
      return acc + dailyTasks.filter(task => task.projectId === project.id).length;
    }, 0);
    
    const completedTasks = folderProjects.reduce((acc, project) => {
      const projectTasks = dailyTasks.filter(task => task.projectId === project.id);
      return acc + projectTasks.filter(task => {
        if (task.type === 'boolean') return task.completed;
        if (task.type === 'numeric') return (task.current || 0) >= (task.target || 1);
        if (task.type === 'subjective') return (task.score0to1 || 0) >= 0.8;
        return false;
      }).length;
    }, 0);
    
    if (totalTasks === 0) return 0;
    const progress = (completedTasks / totalTasks) * 100;
    return Math.round(progress * 10) / 10;
  };

  const isRecent = (folder: Folder) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return new Date(folder.createdAt || Date.now()) > oneWeekAgo;
  };

  const isAbandoned = (folder: Folder) => {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const lastActivity = dailyTasks
      .filter(task => {
        const taskProject = projects.find(p => p.id === task.projectId);
        return taskProject?.folderId === folder.id;
      })
      .sort((a, b) => {
        const bt = b.updatedAt || b.createdAt || new Date().toISOString();
        const at = a.updatedAt || a.createdAt || new Date().toISOString();
        return new Date(bt).getTime() - new Date(at).getTime();
      })[0];
    if (!lastActivity) return true;
    const lastTime = lastActivity.updatedAt || lastActivity.createdAt || new Date().toISOString();
    return new Date(lastTime) < twoWeeksAgo;
  };

  const handleCreateFolderSubmit = (folderData: any) => {
    if (onCreateFolder) {
      onCreateFolder(folderData);
    }
    setShowCreateModal(false);
  };

  // Función para manejar selección de filtro con feedback visual
  const handleFilterSelect = (option: { id: string; icon: any; gradient: string; label: string }) => {
    // Mostrar feedback visual
    setSelectedFilterFeedback({
      icon: option.icon,
      gradient: option.gradient,
      label: option.label
    });
    
    // Aplicar el filtro
    setActiveFilter(option.id as any);
    setShowFilterMenu(false);
    
    // Ocultar feedback después de 800ms
    setTimeout(() => {
      setSelectedFilterFeedback(null);
    }, 800);
  };

  // Menú de filtros elegante - optimizado con useMemo - ORDEN UX/UI OPTIMIZADO
  const filterOptions = useMemo(() => [
    { 
      id: 'todas', 
      label: 'Todas', 
      icon: Target, 
      count: folders.length,
      gradient: 'from-indigo-500 to-purple-500' 
    },
    { 
      id: 'recientes', 
      label: 'Recientes', 
      icon: Sparkles, 
      count: folders.filter(f => isRecent(f)).length,
      gradient: 'from-violet-500 to-purple-600' 
    },
    { 
      id: 'en-progreso', 
      label: 'En progreso', 
      icon: Clock, 
      count: folders.filter(f => {
        const progress = getAverageProgress(f);
        return progress > 0 && progress < 100;
      }).length,
      gradient: 'from-amber-500 to-orange-500' 
    },
    { 
      id: 'mas-trabajadas', 
      label: 'Más trabajadas', 
      icon: TrendingUp, 
      count: folders.filter(f => getWorkIntensity(f) >= 5).length,
      gradient: 'from-pink-500 to-rose-500' 
    },
    { 
      id: 'completadas', 
      label: 'Completadas', 
      icon: CheckCircle, 
      count: folders.filter(f => getAverageProgress(f) === 100).length,
      gradient: 'from-emerald-500 to-green-500' 
    },
    { 
      id: 'menos-trabajadas', 
      label: 'Menos trabajadas', 
      icon: Zap, 
      count: folders.filter(f => getWorkIntensity(f) < 2 && getWorkIntensity(f) > 0).length,
      gradient: 'from-cyan-500 to-blue-500' 
    },
    { 
      id: 'no-iniciadas', 
      label: 'No iniciadas', 
      icon: Filter, 
      count: folders.filter(f => getAverageProgress(f) === 0).length,
      gradient: 'from-slate-500 to-gray-600' 
    }
  ], [folders, projects, dailyTasks]);

  const currentFilter = useMemo(() => 
    filterOptions.find(f => f.id === activeFilter) || filterOptions[0],
    [filterOptions, activeFilter]
  );

  // Filtros dinámicos con algoritmos complejos y búsqueda - optimizado
  const filteredFolders = useMemo(() => {
    let result = folders;

    // Aplicar filtro por categoría
    switch (activeFilter) {
      case 'no-iniciadas':
        result = folders.filter(f => getAverageProgress(f) === 0);
        break;
      case 'en-progreso':
        result = folders.filter(f => {
          const progress = getAverageProgress(f);
          return progress > 0 && progress < 100;
        });
        break;
      case 'completadas':
        result = folders.filter(f => getAverageProgress(f) === 100);
        break;
      case 'mas-trabajadas':
        result = [...folders].sort((a, b) => getWorkIntensity(b) - getWorkIntensity(a));
        break;
      case 'menos-trabajadas':
        result = [...folders].sort((a, b) => getWorkIntensity(a) - getWorkIntensity(b));
        break;
      case 'abandonadas':
        result = folders.filter(f => isAbandoned(f));
        break;
      case 'recientes':
        result = folders.filter(f => isRecent(f));
        break;
      default:
        result = folders;
    }

    // Aplicar búsqueda si hay query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(folder => {
        // Buscar en nombre de carpeta
        if (folder.name.toLowerCase().includes(query)) return true;
        
        // Buscar en proyectos de la carpeta
        const folderProjects = projects.filter(p => p.folderId === folder.id);
        return folderProjects.some(project => 
          project.title.toLowerCase().includes(query) ||
          (project.description && project.description.toLowerCase().includes(query))
        );
      });
    }

    return result;
  }, [folders, projects, activeFilter, searchQuery]);

  // Calcular el progreso global basado en TODAS las tareas de TODAS las carpetas
  const globalFoldersProgress = useMemo(() => {
    if (folders.length === 0) return 0;
    
    // Obtener todas las tareas de todos los proyectos de todas las carpetas
    let totalTasksCount = 0;
    let completedTasksCount = 0;
    
    folders.forEach(folder => {
      const folderProjects = projects.filter(p => p.folderId === folder.id);
      
      folderProjects.forEach(project => {
        const projectTasks = dailyTasks.filter(task => task.projectId === project.id);
        
        totalTasksCount += projectTasks.length;
        
        completedTasksCount += projectTasks.filter(task => {
          if (task.type === 'boolean') return task.completed;
          if (task.type === 'numeric') return (task.current || 0) >= (task.target || 1);
          if (task.type === 'subjective') return (task.score0to1 || 0) >= 0.8;
          return false;
        }).length;
      });
    });
    
    if (totalTasksCount === 0) return 0;
    return (completedTasksCount / totalTasksCount) * 100;
  }, [folders, projects, dailyTasks]);

  const handleCreateFolder = () => {
    setShowCreateModal(true);
  };

  // Generar nombre secuencial "Carpeta N"
  const getNextFolderName = () => {
    const numbers = new Set<number>();
    for (const f of folders || []) {
      const match1 = /^\s*Carpeta\s+(\d+)\s*$/i.exec(f.name || '');
      if (match1) {
        numbers.add(parseInt(match1[1], 10));
        continue;
      }
      const match2 = /^\s*(\d+)\s*$/.exec(f.name || '');
      if (match2) {
        numbers.add(parseInt(match2[1], 10));
      }
    }
    // Empezar desde el número total de carpetas + 1, o desde 1 si no hay carpetas
    let n = Math.max(1, (folders || []).length + 1);
    while (numbers.has(n)) n++;
    return `Carpeta ${n}`;
  };

  const handleCreateFolderDirect = () => {
    if (onCreateFolder) {
      const folderId = crypto.randomUUID();
      const newFolder = {
        id: folderId,
        name: getNextFolderName(),
        icon: 'FolderOpen',
        colorScheme: 'default',
        description: '',
        createdAt: new Date().toISOString(),
        projectCount: 0
      };
      setNewlyCreatedFolderId(folderId);
      onCreateFolder(newFolder);
    }
  };

  const handleQuickProjectCreation = (projectData: {
    name: string;
    folderId: string;
    folderName?: string;
    tasks: any[];
  }) => {
    console.log('📋 FoldersScreen: Recibiendo datos del proyecto', projectData);
    
    // Función para crear DailyTasks con projectId
    const createDailyTasksForProject = (projectId: string) => {
      if (onCreateDailyTask && projectData.tasks.length > 0) {
        console.log('📋 Creando DailyTasks individuales con projectId:', projectId, projectData.tasks.length);
        projectData.tasks.forEach(task => {
          const dailyTaskData = {
            title: task.title,
            type: task.type === 'boolean' ? 'boolean' : task.type,
            target: task.target,
            unit: task.unit,
            icon: task.icon || 'Target',
            colorScheme: task.colorScheme || 'purple-modern',
            resetTime: '00:00',
            projectId: projectId // Asociar la DailyTask al proyecto
          };
          console.log('📋 Creando DailyTask con projectId:', dailyTaskData);
          onCreateDailyTask(dailyTaskData);
        });
      }
    };
    
    // Si se va a crear una nueva carpeta
    if (projectData.folderId === 'new' && projectData.folderName) {
      console.log('🆕 Creando nueva carpeta:', projectData.folderName);
      const folderId = crypto.randomUUID();
      const projectId = `project-${Date.now()}`; // Usar el mismo formato que NewAppContainer
      
      const newFolder = {
        name: projectData.folderName,
        description: `Carpeta creada para el proyecto ${projectData.name}`,
        icon: 'FolderOpen',
        colorScheme: 'purple-modern',
        projects: [{
          id: projectId, // Asignar el ID al proyecto
          title: projectData.name,
          description: `Proyecto creado rápidamente con ${projectData.tasks.length} tareas`,
          icon: 'Target',
          colorScheme: 'purple-modern',
          tasks: projectData.tasks.map((task, index) => ({
            id: crypto.randomUUID(),
            title: task.title,
            description: task.description || '',
            type: task.type,
            target: task.target,
            unit: task.unit,
            dueDate: task.dueDate,
            dueTime: task.dueTime,
            estimatedDuration: task.estimatedDuration,
            completed: false,
            priority: task.priority || 'media',
            createdAt: new Date().toISOString(),
            order: index
          }))
        }]
      };
      
      console.log('📁 Datos de la nueva carpeta con proyecto:', newFolder);
      
      // Crear la carpeta con el proyecto incluido
      if (onCreateFolder) {
        console.log('✅ Llamando onCreateFolder con proyecto incluido');
        onCreateFolder(newFolder);
        // Las DailyTasks se crearán automáticamente en NewAppContainer
        
        // Pequeño delay para asegurar que la carpeta y proyecto se creen antes de cerrar
        setTimeout(() => {
          setShowQuickProjectCreator(false);
        }, 200);
      } else {
        console.error('❌ onCreateFolder no está disponible');
        setShowQuickProjectCreator(false);
      }
      return;
    } else {
      console.log('📂 Creando proyecto en carpeta existente:', projectData.folderId);
      // Crear proyecto en carpeta existente
      if (onCreateProject) {
        const projectId = `project-${Date.now()}`; // Generar ID con el mismo formato que NewAppContainer
        const newProject = {
          id: projectId, // Asignar ID al proyecto
          title: projectData.name,
          folderId: projectData.folderId,
          description: `Proyecto creado rápidamente con ${projectData.tasks.length} tareas`,
          icon: 'Target',
          colorScheme: 'purple-modern',
          modules: [{
            id: crypto.randomUUID(),
            title: "Tareas principales",
            tasks: projectData.tasks.map((task, index) => ({
              id: crypto.randomUUID(),
              title: task.title,
              description: task.description || '',
              // Conservar tipo original (boolean, numeric, subjective)
              type: task.type,
              target: task.target,
              unit: task.unit,
              dueDate: task.dueDate,
              dueTime: task.dueTime,
              estimatedDuration: task.estimatedDuration,
              done: false,
              priority: task.priority || 'media',
              createdAt: new Date().toISOString(),
              order: index
            }))
          }]
        };
        console.log('🎯 Datos del nuevo proyecto (carpeta existente):', newProject);
        console.log('✅ Llamando onCreateProject');
        onCreateProject(newProject);
        // Las DailyTasks se crearán automáticamente en NewAppContainer
        
        // Pequeño delay para asegurar que el proyecto se cree antes de cualquier navegación
        setTimeout(() => {
          setShowQuickProjectCreator(false);
        }, 200);
      } else {
        console.error('❌ onCreateProject no está disponible');
        setShowQuickProjectCreator(false);
      }
      return;
    }
    
    setShowQuickProjectCreator(false);
  };

  const handleCreateProject = (folderId: string) => {
    if (onCreateProject) {
      // Buscar la carpeta padre para heredar su color
      const parentFolder = folders.find(f => f.id === folderId);
      const newProject = {
        title: 'Nuevo Proyecto',
        folderId: folderId,
        progress: 0,
        description: '',
        colorScheme: parentFolder?.colorScheme && typeof parentFolder.colorScheme === 'string' ? parentFolder.colorScheme : 'default', // Heredar color de la carpeta
        createdAt: new Date().toISOString()
      };
      onCreateProject(newProject);
    }
  };

  // Helper para obtener gradientes de color
  const getColorGradient = (colorScheme: string) => {
    // Gradientes principales para iconos (más vibrantes)
    const gradients: Record<string, string> = {
      // Colores base de la imagen
      'vibrant-purple': 'from-purple-500 via-purple-600 to-violet-700',
      'vibrant-cyan': 'from-cyan-400 via-cyan-500 to-teal-600',
      
      // Morados vibrantes
      'electric-purple': 'from-purple-400 via-violet-500 to-purple-700',
      'royal-purple': 'from-indigo-500 via-purple-600 to-violet-700',
      'cosmic-purple': 'from-violet-500 via-purple-600 to-fuchsia-700',
      'neon-purple': 'from-purple-400 via-fuchsia-500 to-purple-600',
      'deep-violet': 'from-violet-600 via-purple-700 to-indigo-800',
      
      // Cyans y turquesas
      'electric-cyan': 'from-cyan-300 via-cyan-500 to-blue-600',
      'ocean-turquoise': 'from-teal-400 via-cyan-500 to-blue-600',
      'neon-teal': 'from-emerald-400 via-teal-500 to-cyan-600',
      'aqua-blue': 'from-sky-400 via-cyan-500 to-teal-600',
      'tropical-cyan': 'from-cyan-400 via-teal-500 to-emerald-600',
      
      // Rosas y magentas
      'hot-pink': 'from-pink-400 via-pink-500 to-rose-600',
      'electric-magenta': 'from-fuchsia-400 via-pink-500 to-purple-600',
      'neon-rose': 'from-rose-400 via-pink-500 to-fuchsia-600',
      'vibrant-pink': 'from-pink-500 via-rose-500 to-red-600',
      
      // Azules eléctricos
      'electric-blue': 'from-blue-400 via-blue-500 to-indigo-600',
      'neon-blue': 'from-sky-400 via-blue-500 to-violet-600',
      'royal-blue': 'from-blue-500 via-indigo-600 to-purple-700',
      'sapphire-blue': 'from-blue-600 via-blue-700 to-indigo-800',
      
      // Verdes vibrantes
      'electric-green': 'from-green-400 via-emerald-500 to-teal-600',
      'neon-lime': 'from-lime-400 via-green-500 to-emerald-600',
      'forest-emerald': 'from-emerald-500 via-green-600 to-teal-700',
      'jade-green': 'from-teal-400 via-emerald-500 to-green-600',
      
      // Cálidos
      'electric-orange': 'from-orange-400 via-orange-500 to-red-600',
      'sunset-orange': 'from-yellow-400 via-orange-500 to-red-600',
      'golden-yellow': 'from-yellow-400 via-amber-500 to-orange-600',
      'fire-orange': 'from-orange-500 via-red-500 to-pink-600',
      
      // Especiales
      'aurora-borealis': 'from-green-400 via-cyan-500 to-purple-600',
      'sunset-dream': 'from-orange-400 via-pink-500 to-purple-600',
      'ocean-sunset': 'from-cyan-400 via-blue-500 to-purple-600',
      'rainbow-bridge': 'from-pink-400 via-purple-500 to-cyan-600',
      'cosmic-nebula': 'from-indigo-400 via-purple-500 to-pink-600',
      'electric-storm': 'from-blue-400 via-cyan-500 to-teal-600',
      'neon-nights': 'from-fuchsia-400 via-purple-500 to-blue-600',
      'crystal-prism': 'from-violet-400 via-blue-500 to-cyan-600',
      
      // Naturales
      'mountain-stone': 'from-slate-400 via-gray-500 to-zinc-600',
      'forest-moss': 'from-stone-400 via-green-600 to-emerald-700',
      'desert-sand': 'from-amber-300 via-yellow-400 to-orange-500',
      'ocean-depth': 'from-slate-600 via-blue-700 to-indigo-800',
      'autumn-leaves': 'from-orange-600 via-red-600 to-yellow-600',
      'winter-frost': 'from-blue-100 via-slate-200 to-gray-300',
      
      // Urbanos
      'neon-city': 'from-purple-500 via-pink-400 to-cyan-400',
      'chrome-steel': 'from-gray-400 via-slate-500 to-zinc-600',
      'led-blue': 'from-blue-300 via-cyan-400 to-sky-500',
      'traffic-light': 'from-red-500 via-yellow-400 to-green-500',
      'hologram': 'from-purple-300 via-blue-400 to-cyan-300',
      'matrix-green': 'from-green-600 via-lime-500 to-emerald-400',
      
      // Lifestyle
      'strawberry-cream': 'from-red-300 via-pink-300 to-rose-200',
      'mint-chocolate': 'from-green-300 via-emerald-400 to-stone-600',
      'caramel-latte': 'from-amber-400 via-orange-300 to-yellow-200',
      'blueberry-pie': 'from-blue-400 via-indigo-500 to-purple-400',
      'lavender-honey': 'from-purple-200 via-violet-300 to-yellow-200',
      'mango-passion': 'from-yellow-400 via-orange-400 to-red-400',
      
      // Místicos
      'moonlight-silver': 'from-slate-300 via-blue-200 to-indigo-300',
      'golden-aura': 'from-yellow-500 via-amber-400 to-orange-400',
      'crystal-meditation': 'from-violet-200 via-purple-300 to-blue-200',
      'sage-wisdom': 'from-green-300 via-teal-400 to-cyan-300',
      'phoenix-fire': 'from-red-600 via-orange-500 to-yellow-400',
      'deep-space': 'from-indigo-900 via-purple-800 to-blue-900',
      
      // Artísticos
      'watercolor-dream': 'from-blue-200 via-purple-200 to-pink-200',
      'oil-painting': 'from-red-500 via-orange-600 to-yellow-500',
      'pastel-rainbow': 'from-pink-200 via-blue-200 to-green-200',
      'graffiti-wall': 'from-lime-400 via-cyan-500 to-fuchsia-500',
      'vintage-sepia': 'from-amber-600 via-orange-700 to-red-800',
      'neon-art': 'from-green-400 via-pink-500 to-blue-500',
      
      // Premium
      'diamond-white': 'from-gray-100 via-slate-200 to-zinc-300',
      'platinum-silver': 'from-slate-400 via-gray-300 to-zinc-400',
      'rose-gold': 'from-pink-300 via-rose-400 to-orange-300',
      'champagne-bubbles': 'from-yellow-200 via-amber-300 to-orange-200',
      'black-pearl': 'from-gray-800 via-slate-700 to-zinc-800',
      'royal-velvet': 'from-purple-800 via-indigo-700 to-violet-800',
      
      // Futuristas
      'cyber-punk': 'from-fuchsia-500 via-purple-600 to-cyan-500',
      'quantum-blue': 'from-blue-600 via-indigo-700 to-purple-600',
      'laser-red': 'from-red-600 via-pink-500 to-rose-500',
      'plasma-green': 'from-lime-500 via-green-600 to-emerald-600',
      'holographic': 'from-cyan-400 via-purple-500 to-pink-400',
      'digital-orange': 'from-orange-500 via-red-500 to-pink-500',
      
      // Fallbacks para colores antiguos
      'purple-modern': 'from-purple-500 via-purple-600 to-violet-700',
      'cyan-modern': 'from-cyan-400 via-cyan-500 to-teal-600',
      'default': 'from-purple-500 via-purple-600 to-violet-700'
    };
    return gradients[colorScheme] || gradients.default;
  };

  const getProgressGradient = (colorScheme: string) => {
    // Gradientes para barras de progreso (más simples, 2 colores)
    const gradients: Record<string, string> = {
      // Colores base
      'vibrant-purple': 'from-purple-500 to-violet-600',
      'vibrant-cyan': 'from-cyan-400 to-teal-500',
      
      // Morados
      'electric-purple': 'from-purple-400 to-violet-600',
      'royal-purple': 'from-indigo-500 to-violet-600',
      'cosmic-purple': 'from-violet-500 to-fuchsia-600',
      'neon-purple': 'from-purple-400 to-fuchsia-500',
      'deep-violet': 'from-violet-600 to-indigo-700',
      
      // Cyans
      'electric-cyan': 'from-cyan-400 to-blue-500',
      'ocean-turquoise': 'from-teal-400 to-blue-500',
      'neon-teal': 'from-emerald-400 to-cyan-500',
      'aqua-blue': 'from-sky-400 to-teal-500',
      'tropical-cyan': 'from-cyan-400 to-emerald-500',
      
      // Rosas
      'hot-pink': 'from-pink-400 to-rose-500',
      'electric-magenta': 'from-fuchsia-400 to-purple-500',
      'neon-rose': 'from-rose-400 to-fuchsia-500',
      'vibrant-pink': 'from-pink-500 to-red-500',
      
      // Azules
      'electric-blue': 'from-blue-400 to-indigo-500',
      'neon-blue': 'from-sky-400 to-violet-500',
      'royal-blue': 'from-blue-500 to-purple-600',
      'sapphire-blue': 'from-blue-600 to-indigo-700',
      
      // Verdes
      'electric-green': 'from-green-400 to-teal-500',
      'neon-lime': 'from-lime-400 to-emerald-500',
      'forest-emerald': 'from-emerald-500 to-teal-600',
      'jade-green': 'from-teal-400 to-green-500',
      
      // Cálidos
      'electric-orange': 'from-orange-400 to-red-500',
      'sunset-orange': 'from-yellow-400 to-red-500',
      'golden-yellow': 'from-yellow-400 to-orange-500',
      'fire-orange': 'from-orange-500 to-pink-500',
      
      // Especiales
      'aurora-borealis': 'from-green-400 to-purple-500',
      'sunset-dream': 'from-orange-400 to-purple-500',
      'ocean-sunset': 'from-cyan-400 to-purple-500',
      'rainbow-bridge': 'from-pink-400 to-cyan-500',
      'cosmic-nebula': 'from-indigo-400 to-pink-500',
      'electric-storm': 'from-blue-400 to-teal-500',
      'neon-nights': 'from-fuchsia-400 to-blue-500',
      'crystal-prism': 'from-violet-400 to-cyan-500',
      
      // Naturales
      'mountain-stone': 'from-slate-400 to-zinc-500',
      'forest-moss': 'from-stone-400 to-emerald-600',
      'desert-sand': 'from-amber-300 to-orange-400',
      'ocean-depth': 'from-slate-600 to-indigo-700',
      'autumn-leaves': 'from-orange-600 to-yellow-500',
      'winter-frost': 'from-blue-100 to-gray-200',
      
      // Urbanos
      'neon-city': 'from-purple-500 to-cyan-400',
      'chrome-steel': 'from-gray-400 to-zinc-500',
      'led-blue': 'from-blue-300 to-sky-400',
      'traffic-light': 'from-red-500 to-green-500',
      'hologram': 'from-purple-300 to-cyan-300',
      'matrix-green': 'from-green-600 to-emerald-400',
      
      // Lifestyle
      'strawberry-cream': 'from-red-300 to-rose-200',
      'mint-chocolate': 'from-green-300 to-stone-500',
      'caramel-latte': 'from-amber-400 to-yellow-200',
      'blueberry-pie': 'from-blue-400 to-purple-400',
      'lavender-honey': 'from-purple-200 to-yellow-200',
      'mango-passion': 'from-yellow-400 to-red-400',
      
      // Místicos
      'moonlight-silver': 'from-slate-300 to-indigo-300',
      'golden-aura': 'from-yellow-500 to-orange-400',
      'crystal-meditation': 'from-violet-200 to-blue-200',
      'sage-wisdom': 'from-green-300 to-cyan-300',
      'phoenix-fire': 'from-red-600 to-yellow-400',
      'deep-space': 'from-indigo-900 to-blue-800',
      
      // Artísticos
      'watercolor-dream': 'from-blue-200 to-pink-200',
      'oil-painting': 'from-red-500 to-yellow-500',
      'pastel-rainbow': 'from-pink-200 to-green-200',
      'graffiti-wall': 'from-lime-400 to-fuchsia-500',
      'vintage-sepia': 'from-amber-600 to-red-700',
      'neon-art': 'from-green-400 to-blue-500',
      
      // Premium
      'diamond-white': 'from-gray-100 to-zinc-200',
      'platinum-silver': 'from-slate-400 to-zinc-400',
      'rose-gold': 'from-pink-300 to-orange-300',
      'champagne-bubbles': 'from-yellow-200 to-orange-200',
      'black-pearl': 'from-gray-800 to-zinc-700',
      'royal-velvet': 'from-purple-800 to-violet-700',
      
      // Futuristas
      'cyber-punk': 'from-fuchsia-500 to-cyan-500',
      'quantum-blue': 'from-blue-600 to-purple-600',
      'laser-red': 'from-red-600 to-rose-500',
      'plasma-green': 'from-lime-500 to-emerald-600',
      'holographic': 'from-cyan-400 to-pink-400',
      'digital-orange': 'from-orange-500 to-pink-500',
      
      // Fallbacks
      'purple-modern': 'from-purple-500 to-violet-600',
      'cyan-modern': 'from-cyan-400 to-teal-500',
      'default': 'from-purple-500 to-violet-600'
    };
    return gradients[colorScheme] || gradients.default;
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(236,72,153,0.15),rgba(255,255,255,0))]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.2),rgba(255,255,255,0))]"></div>
        </div>

        <div className="relative z-10 pt-8 md:pt-12 px-2 sm:px-3 md:px-6">
          <div className="max-w-6xl mx-auto">
            {/* PREMIUM CARPETAS HEADER - IGUAL A QUICK PROJECT */}
            <div className="text-center mb-8 md:mb-10">
              {/* Icono principal con glow effect */}
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 flex items-center justify-center mb-5 shadow-2xl shadow-purple-500/50 mx-auto">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-400 to-purple-500 blur-xl opacity-50"></div>
                <FolderOpen className="w-9 h-9 text-white relative z-10" />
              </div>

              {/* Título y subtítulo estilo Quick Project */}
              <h1 className="text-white font-bold text-2xl mb-1 tracking-tight">Carpetas</h1>
              <p className="text-white/50 text-sm">Proyectos ordenados</p>
              
              {/* PROGRESS CHIPS - botones circulares minimalistas */}
              <div className="flex justify-center gap-3 mt-5 mb-4 md:mb-6">
                {/* Botón Home - AL INICIO */}
                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('home');
                  }}
                  className="relative group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 bg-white/[0.08] backdrop-blur-sm border border-white/[0.15] text-white/70 hover:bg-white/[0.15] hover:scale-105 hover:text-white"
                  title="Volver a Inicio"
                >
                  <Home className="w-4 h-4" />
                </button>

                {/* Botón Fusionado: Búsqueda + Filtros - CIRCULAR */}
                <div className="relative" ref={headerFilterMenuRef}>
                  <button
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className={`relative group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                      showFilterMenu || activeFilter !== 'todas' || searchQuery
                        ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg scale-110 ring-2 ring-white/30'
                        : 'bg-white/[0.08] backdrop-blur-sm border border-white/[0.15] text-white/70 hover:bg-white/[0.15] hover:scale-105 hover:text-white'
                    }`}
                    title="Búsqueda y Filtros"
                  >
                    <Filter className="w-4 h-4" />
                    {/* Indicador activo */}
                    {(activeFilter !== 'todas' || searchQuery) && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse border border-white shadow-lg" />
                    )}
                  </button>

                  {/* Modal de Filtros - EXACTAMENTE IGUAL A QUICK PROJECT */}
                  {showFilterMenu && (
                    <div className="fixed inset-0 z-[1000] bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 animate-in fade-in duration-300">
                      {/* Overlay con efecto de cristal y animación */}
                      <div className="absolute inset-0 bg-black/30 backdrop-blur-3xl animate-in fade-in duration-500"></div>
                      
                      {/* Patrón de fondo sutil */}
                      <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
                      
                      <div className="absolute inset-0 flex flex-col animate-in slide-in-from-bottom-4 duration-500">
                        
                        {/* Header Premium - IGUAL A QUICK PROJECT */}
                        <div className="relative flex flex-col items-center justify-center pt-10 pb-6">
                          {/* Icono principal con glow effect */}
                          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-400 via-violet-500 to-indigo-500 flex items-center justify-center mb-5 shadow-2xl shadow-purple-500/50">
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-400 to-violet-500 blur-xl opacity-50"></div>
                            <Filter className="w-9 h-9 text-white relative z-10" />
                          </div>
                          
                          <h1 className="text-white font-bold text-2xl mb-1 tracking-tight">Filtrar Carpetas</h1>
                          <p className="text-white/50 text-sm">
                            Encuentra lo que buscas rápidamente
                          </p>
                          
                          {/* Botón cerrar flotante en esquina superior derecha */}
                          <div className="absolute top-6 right-6">
                            <button 
                              onClick={() => setShowFilterMenu(false)}
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
                            {/* Barra de Búsqueda - ESTILO QUICK PROJECT */}
                            <div className="relative">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 z-10" />
                              <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar carpetas..."
                                className="w-full bg-white/5 backdrop-blur-md border border-white/10 text-white placeholder-white/30 pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300 text-base font-medium"
                              />
                              {searchQuery && (
                                <button
                                  onClick={() => setSearchQuery('')}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all border border-white/10 z-10"
                                >
                                  <X className="w-4 h-4 text-white/60" />
                                </button>
                              )}
                            </div>

                          {/* Grid de filtros - SOLO SI NO HAY BÚSQUEDA - ESTILO QUICK PROJECT */}
                          {!searchQuery && (
                            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                              {filterOptions.map((option) => {
                                const isSelected = activeFilter === option.id;
                                return (
                                  <button
                                    key={option.id}
                                    onClick={() => handleFilterSelect(option)}
                                    className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-md border ${
                                      isSelected 
                                        ? 'bg-white/10 border-purple-400/50 hover:bg-white/15' 
                                        : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
                                    }`}
                                    style={{
                                      minHeight: '110px'
                                    }}
                                  >
                                    {/* Icono centrado arriba con glow effect HERMOSO */}
                                    <div className="flex flex-col items-center text-center space-y-3">
                                      <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${option.gradient} shadow-xl`}>
                                        {/* Resplandor HERMOSO detrás del icono - IGUAL AL HEADER */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${option.gradient} rounded-2xl blur-xl opacity-50`}></div>
                                        
                                        {/* Ícono con resplandor */}
                                        <option.icon className="w-6 h-6 text-white relative z-10" />
                                      </div>
                                      
                                      {/* Texto centrado debajo */}
                                      <div className="space-y-1">
                                        <div className="text-sm font-semibold text-white">
                                          {option.label}
                                        </div>
                                        <div className="text-xs text-white/60 font-medium">
                                          {option.count}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Checkmark cuando está seleccionado */}
                                    {isSelected && (
                                      <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                                        <CheckCircle className="w-3 h-3 text-white" />
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* Lista de carpetas filtradas cuando hay búsqueda */}
                          {searchQuery && (
                            <div className="max-h-96 overflow-y-auto">
                              <div className="space-y-2">
                                {filteredFolders
                                  .filter(folder => folder.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                  .slice(0, 8)
                                  .map((folder) => (
                                    <button
                                      key={folder.id}
                                      onClick={() => {
                                        // Aquí puedes agregar la lógica para seleccionar la carpeta
                                        setShowFilterMenu(false);
                                        setSearchQuery('');
                                      }}
                                      className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/8 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center gap-3 text-left"
                                    >
                                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
                                        <FolderOpen className="w-4 h-4 text-white" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-white truncate">
                                          {folder.name}
                                        </div>
                                        <div className="text-xs text-white/50 font-medium">
                                          {folder.projects?.length || 0} proyectos
                                        </div>
                                      </div>
                                    </button>
                                  ))}
                              </div>
                              
                              {/* Mensaje si no hay resultados */}
                              {filteredFolders.filter(folder => folder.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                                <div className="text-center py-12">
                                  <div className="text-white/40 text-sm font-medium">
                                    No se encontraron carpetas
                                  </div>
                                  <div className="text-white/30 text-xs mt-1">
                                    con &quot;{searchQuery}&quot;
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
                </div>
                
                {/* Botón de Creación Rápida de Proyectos */}
                <button
                  onClick={() => setShowQuickProjectCreator(true)}
                  className="relative group flex items-center justify-center w-10 h-10 rounded-full overflow-hidden transition-all duration-300 bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg hover:scale-110 hover:shadow-2xl ring-2 ring-white/20"
                  title="Crear Proyecto Rápido"
                >
                  {/* Glow interno suave */}
                  <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-purple-300/30 via-fuchsia-300/20 to-indigo-300/30 blur-md opacity-60"></span>
                  {/* Radial highlight interno para volumen */}
                  <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.35),transparent_55%)]"></span>
                  {/* Luminiscencia degradada giratoria */}
                  <span className="pointer-events-none absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,rgba(255,255,255,0.25),rgba(255,255,255,0)_30%,rgba(255,255,255,0.25)_60%,rgba(255,255,255,0)_90%)] animate-[spin_2.8s_linear_infinite]"></span>
                  {/* Sheen sutil al hover */}
                  <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/35 to-transparent translate-x-[-160%] group-hover:translate-x-[160%] transition-transform duration-700"></span>

                  <Zap className="w-4 h-4 relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                </button>
                
                {/* Botón de Crear (Nueva carpeta) */}
                <button
                  onClick={handleCreateFolderDirect}
                  className="relative group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg hover:scale-110 hover:shadow-xl ring-2 ring-white/20"
                  title="Nueva carpeta"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Carpetas Section - Réplica exacta del estilo de Tareas */}
            <div className="mb-6 sm:mb-8">
              {/* Folders - TODAS CON DISEÑO HORIZONTAL - AL MISMO NIVEL QUE LAS DESTACADAS */}
              <div className="mb-6 space-y-6">
                {filteredFolders.map((folder) => {
                  const IconComponent = (Icons as any)[folder.icon || 'FolderOpen'] || FolderOpen;
                  const gradient = getColorGradient(folder.colorScheme || 'vibrant-purple');
                  const progressGradient = getProgressGradient(folder.colorScheme || 'vibrant-purple');
                  
                  // Calcular progreso de la carpeta
                  const folderProjects = projects.filter(p => p.folderId === folder.id);
                  const projectCount = folderProjects.length;
                  const folderTasks = dailyTasks.filter(task => {
                    const taskProject = projects.find(p => p.id === task.projectId);
                    return taskProject?.folderId === folder.id;
                  });
                  const completedCount = folderTasks.filter(task => {
                    if (task.type === 'boolean') return task.completed;
                    if (task.type === 'numeric') return (task.current || 0) >= (task.target || 1);
                    if (task.type === 'subjective') return (task.score0to1 || 0) >= 0.8;
                    return false;
                  }).length;
                  const totalCount = folderTasks.length;
                  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
                  const isNewFolder = newlyCreatedFolderId === folder.id;
                  
                  return (
                    <div
                      key={folder.id}
                      ref={isNewFolder ? newFolderRef : null}
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        const clickedElement = target.tagName.toLowerCase();
                        if (clickedElement === 'button' || clickedElement === 'input' || clickedElement === 'svg' || clickedElement === 'path') {
                          return;
                        }
                        if (target.closest('button') || target.closest('input') || target.hasAttribute('data-editable') || target.closest('[data-editable]')) {
                          return;
                        }
                        
                        // Activar feedback visual estilo filtros (más rápido)
                        setSelectedFolderFeedback({
                          icon: IconComponent,
                          gradient: gradient,
                          label: folder.name
                        });
                        
                        // Navegar rápido para transición zen fluida
                        setTimeout(() => {
                          if (onFolderOpen) {
                            onFolderOpen(folder);
                          }
                          // Limpiar feedback después de navegar
                          setTimeout(() => {
                            setSelectedFolderFeedback(null);
                          }, 200);
                        }, 180); // Transición zen rápida (350ms total)
                      }}
                      className="relative rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden transition-all hover:bg-white/[0.07] hover:scale-[1.01] cursor-pointer group"
                    >
                      {/* Botón eliminar */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onDeleteFolder) {
                            onDeleteFolder(folder);
                          }
                        }}
                        className="absolute top-3 right-3 z-20 w-7 h-7 rounded-xl bg-white/10 hover:bg-red-500/20 backdrop-blur-md border border-white/20 hover:border-red-400/40 transition-all duration-300 flex items-center justify-center shadow-lg"
                        title="Eliminar carpeta"
                      >
                        <X className="w-4 h-4 text-white/70 hover:text-red-400 transition-colors" />
                      </button>

                      {/* Glow sutil de fondo */}
                      <div className="absolute inset-0 -z-0 pointer-events-none">
                        <div className={`absolute -inset-24 bg-gradient-to-br ${gradient} opacity-10 blur-3xl`} />
                      </div>

                      {/* Contenido principal: icono + info */}
                      <div className="p-6 grid grid-cols-[auto_1fr] gap-5 items-center">
                        {/* Icono - clickeable para personalizar */}
                        <button
                          data-editable
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setCustomizingFolderId(folder.id);
                          }}
                          className="relative cursor-pointer hover:scale-105 transition-transform"
                          title="Click para personalizar"
                        >
                          <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-xl`}>
                            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} blur-xl opacity-50`} />
                            <IconComponent className="w-7 h-7 text-white relative z-10" />
                          </div>
                        </button>

                        {/* Info principal */}
                        <div className="min-w-0">
                          {/* Título - editable CON AUTOFOCUS */}
                          <input
                            data-editable
                            type="text"
                            value={folder.name}
                            onChange={(e) => {
                              if (onEditFolderTitle) {
                                onEditFolderTitle(folder.id, capitalizeFirst(e.target.value));
                              }
                            }}
                            onBlur={(e) => {
                              if (onEditFolderTitle && e.target.value.trim()) {
                                onEditFolderTitle(folder.id, capitalizeFirst(e.target.value.trim()));
                              }
                              if (newlyCreatedFolderId === folder.id) {
                                setNewlyCreatedFolderId(null);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.currentTarget.blur();
                              }
                              e.stopPropagation();
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              // Seleccionar todo el texto al hacer click
                              e.currentTarget.select();
                            }}
                            onFocus={(e) => {
                              e.stopPropagation();
                              // Seleccionar todo el texto al recibir focus
                              e.currentTarget.select();
                            }}
                            className="text-white font-bold text-lg leading-tight truncate bg-transparent border-none outline-none focus:bg-white/10 focus:px-2 focus:py-1 focus:rounded-lg transition-all w-full cursor-text"
                            autoFocus={isNewFolder}
                          />
                          {/* Meta compacta con iconos */}
                          <div className="mt-2 flex items-center gap-4 text-xs text-white/60 pointer-events-none">
                            <span className="inline-flex items-center gap-1.5 font-medium">
                              <FolderOpen className="w-3.5 h-3.5 opacity-75" />
                              <span className="text-white/80">{projectCount}</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 font-medium">
                              <CheckCircle className="w-3.5 h-3.5 opacity-75" />
                              <span className="text-white/80">{completedCount}</span>
                            </span>
                          </div>
                          {/* Progreso premium con porcentaje flotante */}
                          <div className="mt-4 pointer-events-none">
                            <div className="relative w-full h-2.5 rounded-full bg-white/8 border border-white/15 shadow-inner overflow-visible">
                              <div 
                                className={`h-full bg-gradient-to-r ${progressGradient} transition-all duration-700 ease-out rounded-full shadow-lg`} 
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              ></div>
                              {/* Círculo porcentaje flotante */}
                              {progress > 0 && (
                                <div 
                                  className="absolute -top-8 transform -translate-x-1/2 transition-all duration-700 ease-out z-10"
                                  style={{ left: `${Math.min(progress, 100)}%` }}
                                >
                                  <div className={`relative px-2.5 py-1 rounded-full bg-gradient-to-r ${progressGradient} shadow-lg border border-white/20`}>
                                    <span className="text-white text-xs font-semibold drop-shadow-sm">{Math.round(progress)}%</span>
                                    <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-r ${progressGradient} rotate-45 border-r border-b border-white/20`}></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Divider sutil */}
                      <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent mx-6 pointer-events-none" />

                      {/* Footer: estados + equipo */}
                      <div className="px-5 py-4 flex items-center justify-between border-t border-white/5">
                        <div className="flex items-center gap-2.5 text-white/70">
                          {/* Botón de modo - ELEGANTE Y SUTIL CON COLORES DE LA CARPETA */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setLifecycleFolderId(folder.id);
                            }}
                            className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:scale-105 transition-all duration-300 group overflow-hidden" 
                            title="Configurar ciclo de vida del proyecto"
                          >
                            {/* Borde gradiente sutil con pseudo-elemento */}
                            <span className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-20 transition-all duration-300`}></span>
                            <span className={`absolute inset-0 rounded-xl ring-1 ring-inset bg-gradient-to-br ${gradient} opacity-20 group-hover:opacity-40 transition-all duration-300`} style={{ WebkitMaskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', padding: '1px' }}></span>
                            {/* Glow sutil al hover */}
                            <span className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradient} blur-md opacity-0 group-hover:opacity-30 transition-all duration-300 -z-10`}></span>
                            {/* Icono con gradiente en el fill */}
                            <Lock className="w-4 h-4 relative z-10 text-white/60 group-hover:text-white transition-all duration-300" />
                          </button>
                          {/* Botón de miembros - ELEGANTE Y SUTIL CON COLORES DE LA CARPETA */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setSharingFolderId(folder.id);
                            }}
                            className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:scale-105 transition-all duration-300 group overflow-hidden" 
                            title="Gestionar miembros del equipo"
                          >
                            {/* Borde gradiente sutil con pseudo-elemento */}
                            <span className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-20 transition-all duration-300`}></span>
                            <span className={`absolute inset-0 rounded-xl ring-1 ring-inset bg-gradient-to-br ${gradient} opacity-20 group-hover:opacity-40 transition-all duration-300`} style={{ WebkitMaskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', padding: '1px' }}></span>
                            {/* Glow sutil al hover */}
                            <span className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradient} blur-md opacity-0 group-hover:opacity-30 transition-all duration-300 -z-10`}></span>
                            {/* Icono con gradiente en el fill */}
                            <Users className="w-4 h-4 relative z-10 text-white/60 group-hover:text-white transition-all duration-300" />
                          </button>
                        </div>
                        
                        {/* Centro: Call to action - Ajustado para no superponerse */}
                        <div className="flex-1 flex items-center justify-center px-2">
                          <span className="text-white/40 text-xs transition-colors duration-200 whitespace-nowrap inline-flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5" />
                            Ver proyectos
                          </span>
                        </div>
                        
                        {/* Espaciador derecho */}
                        <div className="w-[72px]"></div>
                      </div>
                      
                      {/* Botón Play flotante */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          const tracking = getFolderTracking(folder.id);
                          if (!tracking?.currentSession?.isRunning) {
                            startFolderTracking(folder.id);
                          } else {
                            stopFolderTracking(folder.id);
                          }
                        }}
                        className={`absolute bottom-0 right-0 w-14 h-12 rounded-tl-2xl bg-gradient-to-br ${
                          getFolderTracking(folder.id)?.currentSession?.isRunning 
                            ? 'from-purple-600/90 to-purple-800/90' 
                            : gradient
                        } flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:w-16 hover:h-14 border-l-2 border-t-2 border-white/20`}
                        title={getFolderTracking(folder.id)?.currentSession?.isRunning ? "Detener tracking" : "Iniciar modo focus"}
                      >
                        {getFolderTracking(folder.id)?.currentSession?.isRunning ? (
                          <Pause className="w-6 h-6 text-white drop-shadow-md" fill="white" />
                        ) : (
                          <Play className="w-6 h-6 text-white drop-shadow-md" fill="white" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Botón Nueva Carpeta estilo QuickProject - PRO */}
              <div className="mb-6">
                <button
                  onClick={() => {
                    console.log('✅ Creando nueva carpeta destacada');
                    const newFolder = {
                      id: Date.now().toString(),
                      name: 'Nueva Carpeta',
                      description: 'Carpeta creada desde destacadas',
                      colorScheme: 'vibrant-purple',
                      icon: 'FolderPlus',
                      createdAt: new Date().toISOString(),
                      featured: true,
                      progress: 0,
                      totalTasks: 0,
                      completedTasks: 0
                    };
                    
                    if (onCreateFolder) {
                      onCreateFolder(newFolder);
                    } else {
                      // Fallback: agregar directamente a folders
                      const updatedFolders = [...folders, newFolder];
                      // Aquí podrías llamar un callback para actualizar folders
                      console.log('Nueva carpeta creada:', newFolder);
                    }
                  }}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/10 hover:border-white/20 rounded-2xl text-white/40 hover:text-white/70 transition-all duration-300 flex items-center justify-center gap-3 group hover:scale-[1.02]"
                >
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 group-hover:from-indigo-500/30 group-hover:to-purple-500/30 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                    <FolderPlus className="w-5 h-5 text-white/60 group-hover:text-white/80" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-base font-semibold text-white/70 group-hover:text-white">Nueva Carpeta</span>
                    <span className="text-sm text-white/40 group-hover:text-white/60">Crea una carpeta destacada personalizada</span>
                  </div>
                </button>
              </div>
            </div>
          </div>


        </div>
      </div>

      {/* Create Folder Modal */}
      {showCreateModal && (
        <UltraPremiumFolderModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateFolderSubmit}
        />
      )}

      {/* Quick Project Creator Modal */}
      {showQuickProjectCreator && (
        <QuickProjectCreator
          isOpen={showQuickProjectCreator}
          onClose={() => setShowQuickProjectCreator(false)}
          onCreateProject={handleQuickProjectCreation}
          existingFolders={folders.map(folder => ({
            id: folder.id,
            name: folder.name,
            icon: folder.icon || 'folder',
            colorScheme: folder.colorScheme || 'blue'
          }))}
          onCreateDailyTask={onCreateDailyTask}
          existingProjects={(() => {
            // 1) Solo con folderId válidos
            const withFolder = projects.filter(p => !!p.folderId);
            // 2) Ordenar por actualizado más reciente primero
            withFolder.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
            // 3) Deduplicar por ID
            const byId = new Map<string, typeof withFolder[number]>();
            for (const p of withFolder) {
              if (!byId.has(p.id)) byId.set(p.id, p);
            }
            // 4) Colapsar por nombre: mantener el más reciente de cada nombre
            const byName = new Map<string, typeof withFolder[number]>();
            for (const p of byId.values()) {
              const key = (p.title || '').trim().toLowerCase();
              if (!key) continue;
              if (!byName.has(key)) byName.set(key, p);
            }
            // 5) Limitar a 10
            const finalList = Array.from(byName.values()).slice(0, 10);
            // 6) Mapear a shape requerido por QuickProjectCreator
            return finalList.map(project => ({
              id: project.id,
              name: project.title,
              folderId: project.folderId!,
              folderName: folders.find(f => f.id === project.folderId)?.name
            }));
          })()}
        />
      )}

      {/* Modal de personalización para Featured 1 */}
      {showCustomizeFeatured1 && (
        <FullScreenStyleModal
          isOpen={showCustomizeFeatured1}
          onClose={() => setShowCustomizeFeatured1(false)}
          type="folder"
          title={featured1Name}
          currentIcon={featured1Icon}
          currentColorScheme={featured1Color}
          onSave={(data: any) => {
            console.log('✅ Personalizando featured-1:', data);
            // Actualizar estados locales para reflejar cambios inmediatamente
            if (data.icon) setFeatured1Icon(data.icon);
            if (data.colorScheme) setFeatured1Color(data.colorScheme);
            if (data.title) setFeatured1Name(data.title);
            
            // Llamar callbacks del padre
            if (onCustomizeFolder && (data.icon || data.colorScheme)) {
              onCustomizeFolder('featured-1', data.icon || featured1Icon, data.colorScheme || featured1Color);
            }
            if (data.title && onEditFolderTitle) {
              onEditFolderTitle('featured-1', data.title);
            }
            setShowCustomizeFeatured1(false);
          }}
        />
      )}

      {/* Modal de personalización para Featured 2 */}
      {showCustomizeFeatured2 && (
        <FullScreenStyleModal
          isOpen={showCustomizeFeatured2}
          onClose={() => setShowCustomizeFeatured2(false)}
          type="folder"
          title={featured2Name}
          currentIcon={featured2Icon}
          currentColorScheme={featured2Color}
          onSave={(data: any) => {
            console.log('✅ Personalizando featured-2:', data);
            // Actualizar estados locales para reflejar cambios inmediatamente
            if (data.icon) setFeatured2Icon(data.icon);
            if (data.colorScheme) setFeatured2Color(data.colorScheme);
            if (data.title) setFeatured2Name(data.title);
            
            // Llamar callbacks del padre
            if (onCustomizeFolder && (data.icon || data.colorScheme)) {
              onCustomizeFolder('featured-2', data.icon || featured2Icon, data.colorScheme || featured2Color);
            }
            if (data.title && onEditFolderTitle) {
              onEditFolderTitle('featured-2', data.title);
            }
            setShowCustomizeFeatured2(false);
          }}
        />
      )}

      {/* Modal de compartir para Featured 1 */}
      {showShareFeatured1 && (
        <ShareModal
          isOpen={showShareFeatured1}
          onClose={() => setShowShareFeatured1(false)}
          item={{
            id: 'featured-1',
            name: 'Carpeta Prototipo',
            icon: 'FolderOpen',
            colorScheme: 'purple-modern',
            description: '',
            createdAt: new Date().toISOString(),
            projectCount: 1
          }}
          itemType="folder"
          onShare={(shareData) => {
            console.log('✅ Compartiendo featured-1:', shareData);
            setShowShareFeatured1(false);
          }}
        />
      )}

      {/* Modal de compartir para Featured 2 */}
      {showShareFeatured2 && (
        <ShareModal
          isOpen={showShareFeatured2}
          onClose={() => setShowShareFeatured2(false)}
          item={{
            id: 'featured-2',
            name: 'Carpeta Diseño UI',
            icon: 'FolderOpen',
            colorScheme: 'cyan-modern',
            description: '',
            createdAt: new Date().toISOString(),
            projectCount: 3
          }}
          itemType="folder"
          onShare={(shareData) => {
            console.log('✅ Compartiendo featured-2:', shareData);
            setShowShareFeatured2(false);
          }}
        />
      )}

      {/* Modal de ciclo de vida para Featured 1 */}
      {showLifecycleFeatured1 && (
        <ProjectLifecycleModal
          isOpen={showLifecycleFeatured1}
          projectTitle={featured1Name}
          currentLifecycle={null}
          onClose={() => setShowLifecycleFeatured1(false)}
          onSelectLifecycle={(lifecycle, config) => {
            console.log('✅ Ciclo de vida seleccionado para featured-1:', lifecycle, config);
            if (onModeChange) {
              onModeChange('featured-1', lifecycle);
            }
            setShowLifecycleFeatured1(false);
          }}
        />
      )}

      {/* Modal de ciclo de vida para Featured 2 */}
      {showLifecycleFeatured2 && (
        <ProjectLifecycleModal
          isOpen={showLifecycleFeatured2}
          projectTitle={featured2Name}
          currentLifecycle={null}
          onClose={() => setShowLifecycleFeatured2(false)}
          onSelectLifecycle={(lifecycle, config) => {
            console.log('✅ Ciclo de vida seleccionado para featured-2:', lifecycle, config);
            if (onModeChange) {
              onModeChange('featured-2', lifecycle);
            }
            setShowLifecycleFeatured2(false);
          }}
        />
      )}

      {/* Feedback visual al seleccionar filtro - ANIMACIÓN CENTRADA */}
      {selectedFilterFeedback && (
        <>
          {/* Backdrop opaco que acompaña la animación */}
          <div className="fixed inset-0 z-[1999] bg-black/60 animate-fadeInOut pointer-events-none"></div>
          
          {/* Icono centrado */}
          <div className="fixed inset-0 z-[2000] pointer-events-none flex items-center justify-center">
            <div className="animate-filterFeedback">
              <div className="relative">
                {/* Resplandor grande detrás */}
                <div 
                  className={`absolute -inset-8 bg-gradient-to-br ${selectedFilterFeedback.gradient} rounded-full blur-3xl opacity-40`}
                ></div>
                
                {/* Icono principal con brillo */}
                <div className={`relative w-28 h-28 rounded-3xl bg-gradient-to-br ${selectedFilterFeedback.gradient} flex items-center justify-center shadow-2xl`}>
                  {/* Resplandor interno igual al header */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${selectedFilterFeedback.gradient} rounded-3xl blur-xl opacity-50`}></div>
                  
                  <selectedFilterFeedback.icon className="w-14 h-14 text-white relative z-10 drop-shadow-2xl" />
                </div>
                
                {/* Label debajo */}
                <div className="mt-3 text-center">
                  <p className="text-white font-bold text-lg drop-shadow-2xl">
                    {selectedFilterFeedback.label}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Feedback visual al seleccionar CARPETA - ANIMACIÓN ZEN (rápida y fluida) */}
      {selectedFolderFeedback && (
        <>
          {/* Backdrop SUAVE - no tan opaco para transición zen */}
          <div className="fixed inset-0 z-[1999] bg-black/75 animate-fadeInOutFast pointer-events-none"></div>
          
          {/* Icono que sube desde el centro hasta la posición del header */}
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[2000] pointer-events-none">
            <div className="animate-slideUpToHeader">
              {/* MISMO TAMAÑO Y ESTILO QUE EL HEADER (w-20 h-20 rounded-3xl) */}
              <div className={`relative w-20 h-20 rounded-3xl bg-gradient-to-br ${selectedFolderFeedback.gradient} flex items-center justify-center shadow-2xl`}>
                {/* Resplandor interno igual al header */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${selectedFolderFeedback.gradient} blur-xl opacity-50`}></div>
                
                <selectedFolderFeedback.icon className="w-9 h-9 text-white relative z-10" />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modales para carpetas reales */}
      {customizingFolderId && (
        <FullScreenStyleModal
          isOpen={true}
          onClose={() => setCustomizingFolderId(null)}
          type="folder"
          currentIcon={folders.find(f => f.id === customizingFolderId)?.icon || 'FolderOpen'}
          currentColorScheme={folders.find(f => f.id === customizingFolderId)?.colorScheme || 'default'}
          onSave={(data) => {
            if (onCustomizeFolder) {
              onCustomizeFolder(customizingFolderId, data.icon, data.colorScheme);
            }
            setCustomizingFolderId(null);
          }}
        />
      )}

      {sharingFolderId && (() => {
        const folder = folders.find(f => f.id === sharingFolderId);
        if (!folder) return null;
        return (
          <ShareModal
            isOpen={true}
            onClose={() => setSharingFolderId(null)}
            item={folder}
            itemType="folder"
            onShare={(shareData) => {
              console.log('✅ Compartiendo carpeta:', sharingFolderId, shareData);
              setSharingFolderId(null);
            }}
          />
        );
      })()}

      {lifecycleFolderId && (
        <ProjectLifecycleModal
          isOpen={true}
          projectTitle={folders.find(f => f.id === lifecycleFolderId)?.name || ''}
          currentLifecycle={null}
          onClose={() => setLifecycleFolderId(null)}
          onSelectLifecycle={(lifecycle, config) => {
            console.log('✅ Ciclo de vida seleccionado:', lifecycleFolderId, lifecycle, config);
            if (onModeChange) {
              onModeChange(lifecycleFolderId, lifecycle);
            }
            setLifecycleFolderId(null);
          }}
        />
      )}

    </>
  );
}