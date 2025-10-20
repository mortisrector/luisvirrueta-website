'use client';

import { useState, useEffect, useRef } from 'react';
import { Project, Folder, DailyTask } from '@/types';
import { useFolderProgress } from '@/hooks/useProgressCalculation';
import { calculateProjectProgress } from '@/lib/progressCalculation';
import { capitalizeFirst } from '@/utils/textUtils';
import { ArrowLeft, Search, Plus, Grid, List, Star, TrendingUp, Activity, Filter, Palette, X, Users, CheckCircle, FolderOpen, Play, Pause, Trophy, Layers, Eye, Target, Medal } from 'lucide-react';
import { getSoftColorScheme, getAccentColors as getLibAccentColors, ALL_COLOR_SCHEMES, getColorSchemeGradient } from '@/lib/colorSchemes';
import * as Icons from 'lucide-react';
import FullScreenStyleModal from '@/components/FullScreenStyleModal';
import ShareModal from '@/components/ShareModal';
import ProjectModeModal from '@/components/ProjectModeModal';
import { useTimeTracking } from '@/contexts/TimeTrackingContext';

// Función actualizada para usar el sistema centralizado de colores
const getColorScheme = (scheme: string): string => {
  // Usar gradiente vibrante para que el encabezado tenga la misma intensidad que los botones
  return getColorSchemeGradient(scheme);
};

// Obtener colores de acento para elementos UI (ahora usa el sistema centralizado)
const getAccentColors = (scheme: string) => {
  return getLibAccentColors(scheme);
};

// Función para obtener el icono de la carpeta
const getFolderIcon = (iconName?: string) => {
  if (!iconName) return Icons.FolderOpen;
  
  // Buscar el icono en Icons de Lucide
  const IconComponent = (Icons as any)[iconName];
  return IconComponent || Icons.FolderOpen;
};

// Función para obtener el icono según el modo del proyecto
const getProjectModeIcon = (mode?: string) => {
  switch (mode) {
    case 'challenge':
      return Trophy;
    case 'competition':
      return Medal;
    case 'normal':
    default:
      return Target;
  }
};

interface FolderProjectsScreenProps {
  folder: Folder;
  projects: Project[];
  dailyTasks: DailyTask[];
  onBack: () => void;
  onOpenProject: (project: Project) => void;
  onCustomizeProject?: (projectId: string, icon: string, colorScheme: string, title?: string) => void;
  onDeleteProject?: (projectId: string) => void;
  onEditProjectTitle?: (projectId: string, newTitle: string) => void;
  onShareProject?: (projectId: string, shareData: any) => void;
  onAddTask?: (projectId: string, taskData?: any) => void;
  onCreateProject?: () => void;
  onCustomizeFolder?: (folderId: string, icon: string, colorScheme: string, title?: string) => void;
  onUpdateProject?: (projectId: string, updates: Partial<Project>) => void;
  onEditFolderTitle?: (folderId: string, newTitle: string) => void;
  onProjectModeChange?: (projectId: string, mode: 'normal' | 'challenge' | 'competition', config?: any) => void;
  allFolders?: Folder[]; // Nueva prop para contar carpetas
}

export default function FolderProjectsScreen({
  folder,
  projects,
  dailyTasks,
  onBack,
  onOpenProject,
  onCustomizeProject,
  onDeleteProject,
  onEditProjectTitle,
  onShareProject,
  onAddTask,
  onCreateProject,
  onCustomizeFolder,
  onUpdateProject,
  onEditFolderTitle,
  onProjectModeChange,
  allFolders = [] // Nueva prop opcional
}: FolderProjectsScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newlyCreatedProjectId, setNewlyCreatedProjectId] = useState<string | null>(null);
  
  // Hook de time tracking
  const { 
    startProjectTracking, 
    stopProjectTracking, 
    getProjectTracking 
  } = useTimeTracking();
  
  // Modal states para proyectos
  const [customizingProjectId, setCustomizingProjectId] = useState<string | null>(null);
  const [sharingProjectId, setSharingProjectId] = useState<string | null>(null);
  const [modeProjectId, setModeProjectId] = useState<string | null>(null);
  const prevProjectCountRef = useRef((projects || []).length);
  const newProjectRef = useRef<HTMLInputElement>(null);

  // Funciones para edición de títulos
  const startEditingProject = (projectId: string, currentTitle: string) => {
    setEditingProjectId(projectId);
    setTempProjectTitle(currentTitle);
  };

  const saveProjectTitle = (projectId: string) => {
    if (onEditProjectTitle && tempProjectTitle.trim()) {
      onEditProjectTitle(projectId, capitalizeFirst(tempProjectTitle.trim()));
    }
    setEditingProjectId(null);
    setTempProjectTitle('');
  };

  const cancelEditingProject = () => {
    setEditingProjectId(null);
    setTempProjectTitle('');
  };
  
  // Estado para feedback visual al abrir proyecto (estilo filtros)
  // Estado para edición temporal de títulos
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [tempProjectTitle, setTempProjectTitle] = useState<string>('');

  // Estado para feedback visual al abrir proyecto (estilo filtros)
  const [selectedProjectFeedback, setSelectedProjectFeedback] = useState<{
    icon: any;
    gradient: string;
    label: string;
  } | null>(null);

  // Detectar nuevo proyecto por aumento en cantidad y seleccionar el más reciente
  useEffect(() => {
    const currentCount = (projects || []).length;
    if (currentCount > prevProjectCountRef.current && currentCount > 0) {
      const newest = [...projects].sort((a, b) => {
        const ta = new Date(a.createdAt || 0).getTime();
        const tb = new Date(b.createdAt || 0).getTime();
        return tb - ta;
      })[0];
      if (newest) {
        setNewlyCreatedProjectId(newest.id);
      }
    }
    prevProjectCountRef.current = currentCount;
  }, [projects]);

  // Auto-focus en el input del nuevo proyecto
  useEffect(() => {
    if (newlyCreatedProjectId && newProjectRef.current) {
      // Primero scroll hacia el elemento
      setTimeout(() => {
        newProjectRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 100);
      
      // Luego focus y select después de que termine el scroll
      setTimeout(() => {
        newProjectRef.current?.focus();
        newProjectRef.current?.select();
      }, 300);
    }
  }, [newlyCreatedProjectId]);

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Usar el sistema dinámico de progreso
  const folderProgress = useFolderProgress(folder, filteredProjects, dailyTasks);
  const totalProgress = Math.round(folderProgress.progress * 10) / 10; // 1 decimal exacto
  
  // Calcular proyectos completados dinámicamente
  const completedProjects = filteredProjects.filter(project => {
    const tasksForProject = dailyTasks.filter(task => task.projectId === project.id);
    if (tasksForProject.length === 0) return project.progress >= 100; // Fallback a progreso estático si no hay tareas
    
    const projectProgress = calculateProjectProgress(project.id, tasksForProject);
    return projectProgress.progress >= 100;
  }).length;

  // Generar nombre de carpeta con numeración automática si no tiene nombre
  const getFolderDisplayName = () => {
    if (folder.name && folder.name.trim()) {
      return folder.name;
    }
    
    // Si tenemos la lista de todas las carpetas, calcular el índice real
    if (allFolders.length > 0) {
      // Ordenar TODAS las carpetas por ID para mantener un orden consistente
      const sortedFolders = [...allFolders].sort((a, b) => a.id.localeCompare(b.id));
      
      // Encontrar el índice de esta carpeta entre TODAS las carpetas
      const folderIndex = sortedFolders.findIndex(f => f.id === folder.id);
      const folderNumber = folderIndex >= 0 ? folderIndex + 1 : allFolders.length + 1;
      
      console.log(`Carpeta ${folder.id}: índice ${folderIndex}, número ${folderNumber}, total carpetas: ${allFolders.length}`);
      
      return `Carpeta ${folderNumber}`;
    }
    
    // Fallback si no tenemos la lista completa
    return 'Carpeta 1';
  };

  // Obtener el esquema de color correcto (usar exactamente la misma lógica que TarCarpetas)
  const getFolderColorScheme = () => {
    // Asegurar que siempre devolvemos un nombre de esquema válido definido en ALL_COLOR_SCHEMES
    const fallback = 'default';
    if (!folder) return fallback;
    const candidate = folder.colorScheme || (folder as any).color || fallback;
    const isValid = ALL_COLOR_SCHEMES.some(s => s.name === candidate);
    return isValid ? candidate : fallback;
  };
  
  const folderColorScheme = getFolderColorScheme();
  const folderGradient = getColorSchemeGradient(folderColorScheme); // Usar gradiente vibrante directamente
  // const accentColors = getAccentColors(folderColorScheme);
  const FolderIcon = getFolderIcon(folder.icon);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden animate-fadeInScreen">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${folderGradient} opacity-5`}></div>
        <div className={`absolute top-0 left-0 w-96 h-96 bg-gradient-to-br ${folderGradient} rounded-full blur-3xl opacity-10 -translate-x-1/2 -translate-y-1/2`}></div>
        <div className={`absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br ${folderGradient} rounded-full blur-3xl opacity-15 translate-x-1/3 translate-y-1/3`}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-8 md:pt-12 px-2 sm:px-3 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* PREMIUM HEADER - EXACTAMENTE IGUAL A CARPETAS - Hereda nombre y color de carpeta */}
          <div className="text-center mb-8 md:mb-10">
            {/* Icono principal con glow effect - heredado de la carpeta */}
            <div className={`relative w-20 h-20 rounded-3xl bg-gradient-to-br ${folderGradient} flex items-center justify-center mb-5 shadow-2xl mx-auto`}>
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${folderGradient} blur-xl opacity-50`}></div>
              <FolderIcon className="w-9 h-9 text-white relative z-10" />
            </div>

            {/* Título y subtítulo estilo Carpetas - hereda nombre de carpeta */}
            <h1 className="text-white font-bold text-2xl mb-1 tracking-tight">{folder.name}</h1>
            <p className="text-white/50 text-sm">Proyectos de la carpeta</p>
            
            {/* PROGRESS CHIPS - botones circulares minimalistas - IGUAL A CARPETAS */}
            <div className="flex justify-center gap-3 mt-5 mb-4 md:mb-6">
              {/* Botón Regresar - AL INICIO */}
              <button
                onClick={onBack}
                className="relative group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 bg-white/[0.08] backdrop-blur-sm border border-white/[0.15] text-white/70 hover:bg-white/[0.15] hover:scale-105 hover:text-white"
                title="Regresar a Carpetas"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              
              {/* Botón de Crear (Nuevo proyecto) */}
              {onCreateProject && (
                <button
                  onClick={onCreateProject}
                  className={`relative group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 bg-gradient-to-r ${folderGradient} text-white shadow-lg hover:scale-110 hover:shadow-xl ring-2 ring-white/20`}
                  title="Nuevo proyecto"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Projects Section - Estilo igual que Carpetas */}
          <div className="mb-6 sm:mb-8">
            {/* Barra de búsqueda expandible */}
            {showFilters && (
              <div className="mb-6">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <Search className="w-4 h-4 text-white/50 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Buscar proyectos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 bg-transparent text-white placeholder-white/50 text-sm outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setShowFilters(false);
                          setSearchTerm('');
                        }
                      }}
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-200 flex-shrink-0"
                      >
                        <span className="text-white/70 text-xs">×</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Projects - DISEÑO HORIZONTAL COMO CARPETAS */}
            {filteredProjects.length === 0 ? (
              <div className="mb-6">
                {/* Botón Nuevo Proyecto - EXACTO A NUEVA CARPETA */}
                {onCreateProject && (
                  <button
                    onClick={onCreateProject}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/10 hover:border-white/20 rounded-2xl text-white/40 hover:text-white/70 transition-all duration-300 flex items-center justify-center gap-3 group hover:scale-[1.02]"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 group-hover:from-indigo-500/30 group-hover:to-purple-500/30 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                      <Plus className="w-5 h-5 text-white/60 group-hover:text-white/80" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-base font-semibold text-white/70 group-hover:text-white">Nuevo Proyecto</span>
                      <span className="text-sm text-white/40 group-hover:text-white/60">Crea un proyecto destacado personalizado</span>
                    </div>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredProjects.map((project) => {
                  // Usar color heredado de la carpeta o el propio del proyecto
                  const projectColor = project.colorScheme || folder.colorScheme || 'default';
                  const projectGradient = getColorSchemeGradient(projectColor);
                  const ProjectIcon = project.icon ? (Icons as any)[project.icon] || Icons.Target : Icons.Target;
                  
                  // Calcular progreso del proyecto
                  const projectTasks = dailyTasks.filter(task => task.projectId === project.id);
                  const completedTasks = projectTasks.filter(task => {
                    if (task.type === 'boolean') return task.completed;
                    if (task.type === 'numeric') return (task.current || 0) >= (task.target || 1);
                    if (task.type === 'subjective') return (task.score0to1 || 0) >= 0.8;
                    return false;
                  }).length;
                  const totalTasks = projectTasks.length;
                  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
                  const isNewProject = newlyCreatedProjectId === project.id;

                  return (
                    <div
                      key={project.id}
                      onClick={() => {
                        // Activar feedback visual - transición zen rápida y fluida
                        setSelectedProjectFeedback({
                          icon: ProjectIcon,
                          gradient: projectGradient,
                          label: project.title
                        });
                        
                        // Navegar rápido para transición zen fluida
                        setTimeout(() => {
                          onOpenProject(project);
                          // Limpiar feedback después de navegar
                          setTimeout(() => {
                            setSelectedProjectFeedback(null);
                          }, 200);
                        }, 180); // Transición zen rápida (350ms total)
                      }}
                      className="relative rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden transition-all hover:bg-white/[0.07] hover:scale-[1.01] cursor-pointer group"
                    >
                      {/* Botón eliminar */}
                      {onDeleteProject && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteProject(project.id);
                          }}
                          className="absolute top-3 right-3 z-20 w-7 h-7 rounded-xl bg-white/10 hover:bg-red-500/20 backdrop-blur-md border border-white/20 hover:border-red-400/40 transition-all duration-300 flex items-center justify-center shadow-lg"
                          title="Eliminar proyecto"
                        >
                          <X className="w-4 h-4 text-white/70 hover:text-red-400 transition-colors" />
                        </button>
                      )}

                      {/* Glow sutil de fondo */}
                      <div className="absolute inset-0 -z-0 pointer-events-none">
                        <div className={`absolute -inset-24 bg-gradient-to-br ${projectGradient} opacity-10 blur-3xl`} />
                      </div>

                      {/* Contenido principal: icono + info */}
                      <div className="p-6 grid grid-cols-[auto_1fr] gap-5 items-center">
                        {/* Icono del proyecto - clickeable para personalizar */}
                        <button
                          data-editable
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setCustomizingProjectId(project.id);
                          }}
                          className="relative cursor-pointer hover:scale-105 transition-transform"
                          title="Click para personalizar"
                        >
                          <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${projectGradient} flex items-center justify-center shadow-xl`}>
                            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${projectGradient} blur-xl opacity-50`} />
                            <ProjectIcon className="w-7 h-7 text-white relative z-10" />
                          </div>
                        </button>

                        {/* Info principal */}
                        <div className="min-w-0">
                          {/* Título editable */}
                          <input
                            ref={isNewProject ? newProjectRef : null}
                            type="text"
                            value={editingProjectId === project.id ? tempProjectTitle : project.title}
                            onFocus={(e) => {
                              if (editingProjectId !== project.id) {
                                startEditingProject(project.id, project.title);
                              }
                              e.stopPropagation();
                              e.currentTarget.select();
                            }}
                            onChange={(e) => {
                              if (editingProjectId === project.id) {
                                setTempProjectTitle(e.target.value);
                              }
                            }}
                            onBlur={(e) => {
                              if (editingProjectId === project.id) {
                                saveProjectTitle(project.id);
                              }
                              if (newlyCreatedProjectId === project.id) {
                                setNewlyCreatedProjectId(null);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                if (editingProjectId === project.id) {
                                  saveProjectTitle(project.id);
                                }
                                e.currentTarget.blur();
                              }
                              if (e.key === 'Escape') {
                                cancelEditingProject();
                              }
                              e.stopPropagation();
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              if (editingProjectId !== project.id) {
                                startEditingProject(project.id, project.title);
                              }
                              e.currentTarget.select();
                            }}
                            className="text-white font-bold text-lg leading-tight truncate bg-transparent border-none outline-none focus:bg-white/10 focus:px-2 focus:py-1 focus:rounded-lg transition-all w-full cursor-text"
                            autoFocus={isNewProject}
                          />
                          
                          {/* Meta: tareas completadas */}
                          <div className="mt-2 flex items-center gap-4 text-xs text-white/60 pointer-events-none">
                            <span className="inline-flex items-center gap-1.5 font-medium">
                              <Activity className="w-3.5 h-3.5 opacity-75" />
                              <span className="text-white/80">{totalTasks} tareas</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 font-medium">
                              <Star className="w-3.5 h-3.5 opacity-75" />
                              <span className="text-white/80">{completedTasks} completadas</span>
                            </span>
                          </div>

                          {/* Barra de progreso */}
                          <div className="mt-4 pointer-events-none">
                            <div className="relative w-full h-2.5 rounded-full bg-white/8 border border-white/15 shadow-inner overflow-visible">
                              <div 
                                className={`h-full bg-gradient-to-r ${projectGradient} transition-all duration-700 ease-out rounded-full shadow-lg`} 
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              ></div>
                              {progress > 0 && (
                                <div 
                                  className="absolute -top-8 transform -translate-x-1/2 transition-all duration-700 ease-out z-10"
                                  style={{ left: `${Math.min(progress, 100)}%` }}
                                >
                                  <div className={`relative px-2.5 py-1 rounded-full bg-gradient-to-r ${projectGradient} shadow-lg border border-white/20`}>
                                    <span className="text-white text-xs font-semibold drop-shadow-sm">{Math.round(progress)}%</span>
                                    <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-r ${projectGradient} rotate-45 border-r border-b border-white/20`}></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent mx-6 pointer-events-none" />

                      {/* Footer: botones de acción - 2 sistemas completos - ELEGANTE Y SUTIL */}
                      <div className="px-5 py-4 flex items-center justify-between border-t border-white/5">
                        <div className="flex items-center gap-2.5 text-white/70">
                          {/* Mode button - Modo Premium (Normal/Reto/Competición) con Fases integradas - ELEGANTE CON COLORES DEL PROYECTO */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setModeProjectId(project.id);
                            }}
                            className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:scale-105 transition-all duration-300 group overflow-hidden" 
                            title="Configurar modo del proyecto"
                          >
                            {/* Borde gradiente sutil con pseudo-elemento */}
                            <span className={`absolute inset-0 rounded-xl bg-gradient-to-br ${projectGradient} opacity-0 group-hover:opacity-20 transition-all duration-300`}></span>
                            <span className={`absolute inset-0 rounded-xl ring-1 ring-inset bg-gradient-to-br ${projectGradient} opacity-20 group-hover:opacity-40 transition-all duration-300`} style={{ WebkitMaskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', padding: '1px' }}></span>
                            {/* Glow sutil al hover */}
                            <span className={`absolute inset-0 rounded-xl bg-gradient-to-br ${projectGradient} blur-md opacity-0 group-hover:opacity-30 transition-all duration-300 -z-10`}></span>
                            {/* Icono dinámico según el modo del proyecto */}
                            {(() => {
                              const ModeIcon = getProjectModeIcon(project.mode);
                              return <ModeIcon className="w-4 h-4 relative z-10 text-white/60 group-hover:text-white transition-all duration-300" />;
                            })()}
                          </button>
                          
                          {/* Users/Share button - ELEGANTE CON COLORES DEL PROYECTO */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSharingProjectId(project.id);
                            }}
                            className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:scale-105 transition-all duration-300 group overflow-hidden" 
                            title="Compartir proyecto"
                          >
                            {/* Borde gradiente sutil con pseudo-elemento */}
                            <span className={`absolute inset-0 rounded-xl bg-gradient-to-br ${projectGradient} opacity-0 group-hover:opacity-20 transition-all duration-300`}></span>
                            <span className={`absolute inset-0 rounded-xl ring-1 ring-inset bg-gradient-to-br ${projectGradient} opacity-20 group-hover:opacity-40 transition-all duration-300`} style={{ WebkitMaskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', padding: '1px' }}></span>
                            {/* Glow sutil al hover */}
                            <span className={`absolute inset-0 rounded-xl bg-gradient-to-br ${projectGradient} blur-md opacity-0 group-hover:opacity-30 transition-all duration-300 -z-10`}></span>
                            {/* Icono con gradiente en el fill */}
                            <Users className="w-4 h-4 relative z-10 text-white/60 group-hover:text-white transition-all duration-300" />
                          </button>
                        </div>
                        
                        {/* Centro: Call to action - Ajustado para no superponerse */}
                        <div className="flex-1 flex items-center justify-center px-2">
                          <span className="text-white/40 text-xs transition-colors duration-200 whitespace-nowrap inline-flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5" />
                            Ver tareas
                          </span>
                        </div>
                        
                        {/* Espaciador derecho - Ajustado para 2 botones */}
                        <div className="w-[86px]"></div>
                      </div>
                      
                      {/* Botón Play/Pause flotante - inferior derecha - Tracking directo como carpetas */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const tracking = getProjectTracking(project.id);
                          if (!tracking?.currentSession?.isRunning) {
                            // Iniciar tracking en modo 'continue-adding' por defecto
                            startProjectTracking(project.id, 'continue-adding');
                          } else {
                            stopProjectTracking(project.id);
                          }
                        }}
                        className={`absolute bottom-0 right-0 w-14 h-12 rounded-tl-2xl bg-gradient-to-br ${
                          getProjectTracking(project.id)?.currentSession?.isRunning 
                            ? 'from-purple-600/90 to-purple-800/90' 
                            : projectGradient
                        } flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:w-16 hover:h-14 border-l-2 border-t-2 border-white/20`}
                        title={getProjectTracking(project.id)?.currentSession?.isRunning ? "Detener tracking" : "Iniciar tracking"}
                      >
                        {getProjectTracking(project.id)?.currentSession?.isRunning ? (
                          <Pause className="w-6 h-6 text-white drop-shadow-md" fill="white" />
                        ) : (
                          <Play className="w-6 h-6 text-white drop-shadow-md" fill="white" />
                        )}
                      </button>
                    </div>
                  );
                })}

                {/* Botón Nuevo Proyecto al final - EXACTO A NUEVA CARPETA */}
                {onCreateProject && (
                  <button
                    onClick={onCreateProject}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/10 hover:border-white/20 rounded-2xl text-white/40 hover:text-white/70 transition-all duration-300 flex items-center justify-center gap-3 group hover:scale-[1.02]"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 group-hover:from-indigo-500/30 group-hover:to-purple-500/30 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                      <Plus className="w-5 h-5 text-white/60 group-hover:text-white/80" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-base font-semibold text-white/70 group-hover:text-white">Nuevo Proyecto</span>
                      <span className="text-sm text-white/40 group-hover:text-white/60">Crea un proyecto destacado personalizado</span>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Color Picker Modal */}
      {showColorPicker && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Personalizar Carpeta</h3>
              <button
                onClick={() => setShowColorPicker(false)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
              >
                <Icons.X size={20} />
              </button>
            </div>
            
            {/* Color Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 mb-6">
              {ALL_COLOR_SCHEMES.map((scheme) => (
                <button
                  key={scheme.name}
                  onClick={() => {
                    if (onCustomizeFolder) {
                      onCustomizeFolder(folder.id, folder.icon || 'FolderOpen', scheme.name);
                    }
                    setShowColorPicker(false);
                  }}
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${scheme.gradient} shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 border-2 ${
                    folder.colorScheme === scheme.name ? 'border-white' : 'border-white/20'
                  }`}
                  title={scheme.name}
                />
              ))}
            </div>
            
            {/* Icon Grid */}
            <div className="border-t border-white/20 pt-6">
              <h4 className="text-lg font-semibold text-white mb-4">Iconos</h4>
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3">
                {[
                  'FolderOpen', 'Briefcase', 'Target', 'Star', 'Zap', 'Heart',
                  'Trophy', 'Rocket', 'Crown', 'Diamond', 'Gem', 'Award',
                  'Shield', 'Bookmark', 'Flag', 'Gift', 'Lightbulb', 'Coffee',
                  'Camera', 'Music', 'Gamepad', 'Palette', 'Book', 'Globe'
                ].map((iconName) => {
                  const IconComponent = (Icons as any)[iconName] || Icons.FolderOpen;
                  return (
                    <button
                      key={iconName}
                      onClick={() => {
                        if (onCustomizeFolder) {
                          onCustomizeFolder(folder.id, iconName, folder.colorScheme || 'blue');
                        }
                        setShowColorPicker(false);
                      }}
                      className={`w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-200 border-2 ${
                        folder.icon === iconName ? 'border-white bg-white/20' : 'border-white/20'
                      }`}
                    >
                      <IconComponent size={20} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Modals */}
      {customizingProjectId && (() => {
        const project = projects.find(p => p.id === customizingProjectId);
        const currentColor = project ? (project.colorScheme || folder.colorScheme || 'default') : 'default';
        return project ? (
          <FullScreenStyleModal
            isOpen={true}
            onClose={() => setCustomizingProjectId(null)}
            type="project"
            title={project.title}
            currentIcon={project.icon || 'Target'}
            currentColorScheme={currentColor}
            onSave={(data) => {
              console.log('🎨 FolderProjectsScreen - Modal onSave:', data);
              // Actualizar título si cambió
              if (data.title && data.title !== project.title && onEditProjectTitle) {
                onEditProjectTitle(project.id, capitalizeFirst(data.title));
              }
              // Actualizar icono y color - SIEMPRE para establecer valores propios
              if (onCustomizeProject) {
                const currentColor = project.colorScheme || folder.colorScheme || 'default';
                onCustomizeProject(
                  project.id,
                  data.icon || project.icon || 'Target',
                  data.colorScheme || currentColor,
                  data.title || project.title
                );
              }
              setCustomizingProjectId(null);
            }}
          />
        ) : null;
      })()}

      {sharingProjectId && (() => {
        const project = projects.find(p => p.id === sharingProjectId);
        return project ? (
          <ShareModal
            isOpen={true}
            onClose={() => setSharingProjectId(null)}
            item={project}
            itemType="project"
            onShare={(shareData) => {
              console.log('Compartiendo proyecto:', shareData);
              setSharingProjectId(null);
            }}
          />
        ) : null;
      })()}

      {/* Project Mode Modal - Modo Premium (Normal/Reto/Competición con Fases integradas) */}
      {modeProjectId && (() => {
        const project = projects.find(p => p.id === modeProjectId);
        return project ? (
          <ProjectModeModal
            isOpen={true}
            project={project}
            teamMembers={[]} // Aquí deberías pasar los miembros del equipo si los tienes
            onClose={() => setModeProjectId(null)}
            onSelectMode={(mode, config) => {
              console.log('Configurando modo premium del proyecto:', mode, config);
              // Llamar a la prop para actualizar el proyecto
              if (onProjectModeChange) {
                onProjectModeChange(project.id, mode, config);
              }
              setModeProjectId(null);
            }}
          />
        ) : null;
      })()}
      
      {/* Feedback visual al seleccionar PROYECTO - ANIMACIÓN ZEN (rápida y fluida) */}
      {selectedProjectFeedback && (
        <>
          {/* Backdrop SUAVE - no tan opaco para transición zen */}
          <div className="fixed inset-0 z-[1999] bg-black/75 animate-fadeInOutFast pointer-events-none"></div>
          
          {/* Icono que sube desde el centro hasta la posición del header */}
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[2000] pointer-events-none">
            <div className="animate-slideUpToHeader">
              {/* MISMO TAMAÑO Y ESTILO QUE EL HEADER DEL PROYECTO (w-16 h-16 rounded-2xl) */}
              <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedProjectFeedback.gradient} flex items-center justify-center shadow-xl`}>
                {/* Resplandor interno igual al header */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${selectedProjectFeedback.gradient} blur-xl opacity-50`}></div>
                
                <selectedProjectFeedback.icon className="w-7 h-7 text-white relative z-10" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
    </>
  );
}