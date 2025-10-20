'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Folder, Project, DailyTask } from '@/types';
import TarjetasGlassmorphism from './TarjetasGlassmorphism';
import PremiumCreateFolderModal from './PremiumCreateFolderModal';
import CircularMenu from './BankingBottomNavigation';
import AdaptiveNavigation from './AdaptiveNavigation';
import { Plus, Search, FolderOpen, Filter, ChevronDown, CheckCircle, Clock, TrendingUp, Zap, Sparkles, Target } from 'lucide-react';

interface FoldersScreenProps {
  folders: Folder[];
  projects: Project[];
  dailyTasks: DailyTask[];
  onFolderOpen?: (folder: Folder) => void;
  onCustomizeFolder?: (folderId: string, icon: string, colorScheme: string) => void;
  onEditFolderTitle?: (folderId: string, newTitle: string) => void;
  onTeamUpdate?: (folderId: string, updates: any) => void;
  onCreateFolder?: (folderData: any) => void;
  onCreateProject?: (projectData: any) => void;
  onDeleteFolder?: (folder: Folder) => void;
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
  onCreateFolder,
  onCreateProject,
  onDeleteFolder,
  currentView = 'folders',
  onNavigate
}: FoldersScreenProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('todas');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const headerFilterMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Menú de filtros elegante - optimizado con useMemo
  const filterOptions = useMemo(() => [
    { 
      id: 'todas', 
      label: 'Todas las carpetas', 
      icon: Target, 
      count: folders.length,
      gradient: 'from-indigo-500 to-purple-500' 
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
      id: 'completadas', 
      label: 'Completadas', 
      icon: CheckCircle, 
      count: folders.filter(f => getAverageProgress(f) === 100).length,
      gradient: 'from-emerald-500 to-green-500' 
    },
    { 
      id: 'no-iniciadas', 
      label: 'No iniciadas', 
      icon: Filter, 
      count: folders.filter(f => getAverageProgress(f) === 0).length,
      gradient: 'from-slate-500 to-gray-600' 
    },
    { 
      id: 'mas-trabajadas', 
      label: 'Más trabajadas', 
      icon: TrendingUp, 
      count: folders.filter(f => getWorkIntensity(f) >= 5).length,
      gradient: 'from-pink-500 to-rose-500' 
    },
    { 
      id: 'activas', 
      label: 'Activas', 
      icon: Zap, 
      count: folders.filter(f => getDaysActive(f) >= 3).length,
      gradient: 'from-cyan-500 to-blue-500' 
    },
    { 
      id: 'recientes', 
      label: 'Recientes', 
      icon: Sparkles, 
      count: folders.filter(f => isRecent(f)).length,
      gradient: 'from-violet-500 to-purple-600' 
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
      case 'activas':
        result = folders.filter(f => getDaysActive(f) >= 3);
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

  const handleCreateFolder = () => {
    setShowCreateModal(true);
  };

  const handleCreateFolderDirect = () => {
    if (onCreateFolder) {
      const newFolder = {
        title: 'Nueva Carpeta',
        icon: 'FolderOpen',
        colorScheme: 'from-indigo-500 to-purple-500',
        description: '',
        createdAt: new Date().toISOString(),
        projectCount: 0
      };
      onCreateFolder(newFolder);
    }
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
        colorScheme: parentFolder?.colorScheme || 'default', // Heredar color de la carpeta
        createdAt: new Date().toISOString()
      };
      onCreateProject(newProject);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(236,72,153,0.15),rgba(255,255,255,0))]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.2),rgba(255,255,255,0))]"></div>
        </div>

        <div className="relative z-10 pt-16 md:pt-20 px-3 md:px-6">
          <div className="max-w-6xl mx-auto">
            {/* PREMIUM CARPETAS HEADER - MOBILE OPTIMIZED - Exacto como ProjectDetailScreen */}
            <div className="text-center mb-6 md:mb-8">
              {/* Large Folder Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-2xl sm:rounded-3xl md:rounded-4xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 shadow-2xl border-2 border-white border-opacity-30 mb-4 md:mb-6 backdrop-blur-xl relative overflow-hidden">
                {/* Glass effect overlay */}
                <div className="absolute inset-0 bg-white bg-opacity-20 backdrop-blur-sm"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20"></div>
                <FolderOpen className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-white drop-shadow-lg relative z-10" />
              </div>
              
              {/* Folder Title */}
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold !text-white mb-2 leading-tight px-2" style={{ color: '#ffffff !important' }}>
                Carpetas
              </h1>
              
              {/* Folder Description */}
              <p className="!text-white opacity-70 text-sm md:text-base font-medium mb-4 md:mb-6 px-4 max-w-2xl mx-auto leading-relaxed" style={{ color: '#ffffff !important' }}>
                {activeFolders} carpeta{activeFolders !== 1 ? 's' : ''} • {totalProjects} proyecto{totalProjects !== 1 ? 's' : ''} • {Math.round((completedTasks/totalTasks)*100) || 0}% completado
              </p>
              
              {/* PROGRESS CHIPS - Solo iconos, súper minimalistas */}
              <div className="flex justify-center gap-3 mb-4 md:mb-6">
                <button
                  onClick={() => setActiveFilter(activeFilter === 'activas' ? 'todas' : 'activas')}
                  className={`relative group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                    activeFilter === 'activas'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-110 ring-2 ring-white/30'
                      : 'bg-white/[0.08] backdrop-blur-sm border border-white/[0.15] text-white/70 hover:bg-white/[0.15] hover:scale-105 hover:text-white'
                  }`}
                  title={`Activas (${activeFolders})`}
                >
                  <FolderOpen className="w-4 h-4" />
                  {activeFolders > 0 && (
                    <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {activeFolders}
                    </div>
                  )}
                </button>
                
                <button
                  onClick={() => setActiveFilter(activeFilter === 'completadas' ? 'todas' : 'completadas')}
                  className={`relative group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                    activeFilter === 'completadas'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-110 ring-2 ring-white/30'
                      : 'bg-white/[0.08] backdrop-blur-sm border border-white/[0.15] text-white/70 hover:bg-white/[0.15] hover:scale-105 hover:text-white'
                  }`}
                  title="Completadas"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => setActiveFilter(activeFilter === 'mas-trabajadas' ? 'todas' : 'mas-trabajadas')}
                  className={`relative group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                    activeFilter === 'mas-trabajadas'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-110 ring-2 ring-white/30'
                      : 'bg-white/[0.08] backdrop-blur-sm border border-white/[0.15] text-white/70 hover:bg-white/[0.15] hover:scale-105 hover:text-white'
                  }`}
                  title="Más trabajadas"
                >
                  <TrendingUp className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Carpetas Section - Réplica exacta del estilo de Tareas */}
            <div className="mb-6 sm:mb-8">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                {/* Carpetas Header - Estilo minimalista exacto */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Icono de carpetas */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                      <FolderOpen className="w-6 h-6" />
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-white truncate">Mis Carpetas</h3>
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <span className="text-white">{activeFolders} carpetas activas</span>
                        {totalProjects > 0 && (
                          <>
                            <span className="text-white/50">•</span>
                            <span className="font-medium text-white">
                              {totalProjects} proyectos
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="relative" ref={headerFilterMenuRef}>
                      <button
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                        className={`p-2 ${
                          showFilterMenu || activeFilter !== 'todas'
                            ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-400'
                            : 'bg-white/[0.04] border-white/[0.08] text-white/60 hover:text-white/80'
                        } border hover:bg-white/[0.08] hover:border-white/[0.15] rounded-lg transition-all duration-200 flex items-center justify-center group`}
                        title="Filtros"
                      >
                        <Filter className="w-4 h-4 group-hover:scale-105 transition-transform duration-200" />
                      </button>

                      {/* Filter Dropdown */}
                      {showFilterMenu && (
                        <div className="absolute top-full right-0 mt-2 w-60 bg-white/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden">
                          <div className="py-2">
                            {filterOptions.map((option) => (
                              <button
                                key={option.id}
                                onClick={() => {
                                  setActiveFilter(option.id);
                                  setShowFilterMenu(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-200 text-left ${
                                  activeFilter === option.id ? 'bg-gradient-to-r from-purple-50 to-blue-50' : ''
                                }`}
                              >
                                <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${option.gradient} flex items-center justify-center`}>
                                  <option.icon className="w-3 h-3 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="text-gray-900 font-semibold text-sm">{option.label}</div>
                                  <div className="text-gray-600 text-xs">{option.count} elemento{option.count !== 1 ? 's' : ''}</div>
                                </div>
                                {activeFilter === option.id && (
                                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setShowSearchBar(!showSearchBar);
                        if (!showSearchBar) {
                          setSearchQuery('');
                        }
                      }}
                      className={`p-2 ${
                        showSearchBar || searchQuery
                          ? 'bg-blue-500/20 border-blue-400/30 text-blue-400'
                          : 'bg-white/[0.04] border-white/[0.08] text-white/60 hover:text-white/80'
                      } border hover:bg-white/[0.08] hover:border-white/[0.15] rounded-lg transition-all duration-200 flex items-center justify-center group`}
                      title="Buscar"
                    >
                      <Search className="w-4 h-4 group-hover:scale-105 transition-transform duration-200" />
                    </button>
                    
                    <button
                      onClick={handleCreateFolderDirect}
                      className="p-2.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white hover:shadow-lg transition-all duration-200 hover:scale-105"
                      title="Nueva carpeta"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Barra de búsqueda expandible */}
                {showSearchBar && (
                  <div className="mb-6">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3">
                      <div className="flex items-center gap-3">
                        <Search className="w-4 h-4 text-white/50 flex-shrink-0" />
                        <input
                          ref={searchInputRef}
                          type="text"
                          placeholder="Buscar carpetas..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="flex-1 bg-transparent text-white placeholder-white/50 text-sm outline-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              setShowSearchBar(false);
                              setSearchQuery('');
                            }
                          }}
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-200 flex-shrink-0"
                          >
                            <span className="text-white/70 text-xs">×</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Folders Grid dentro de la tarjeta */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {filteredFolders.map((folder) => (
                    <TarjetasGlassmorphism
                      key={folder.id}
                      folder={folder}
                      projects={projects.filter(p => p.folderId === folder.id)}
                      dailyTasks={dailyTasks}
                      onOpen={() => onFolderOpen && onFolderOpen(folder)}
                      onCustomize={onCustomizeFolder}
                      onEditTitle={onEditFolderTitle}
                      onTeamUpdate={onTeamUpdate}
                      onAddProject={handleCreateProject}
                      onDelete={onDeleteFolder}
                    />
                  ))}
                </div>

                {/* Empty State dentro de la tarjeta */}
                {folders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 mb-4">
                      <FolderOpen className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Crea tu primera carpeta</h3>
                    <p className="text-white/60 mb-6 max-w-md mx-auto">
                      Organiza tu proyecto en carpetas específicas y comienza a hacer progreso
                    </p>
                    <button
                      onClick={handleCreateFolderDirect}
                      className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105"
                    >
                      Crear primera carpeta
                    </button>
                  </div>
                ) : filteredFolders.length === 0 && (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-bold text-white mb-3">
                      {searchQuery ? 'No se encontraron resultados' : 'No hay carpetas en este filtro'}
                    </h3>
                    <p className="text-white/60 mb-6 max-w-md mx-auto">
                      {searchQuery 
                        ? `No encontramos carpetas que coincidan con "${searchQuery}"`
                        : 'Prueba con otro filtro o crea una nueva carpeta.'
                      }
                    </p>
                    <div className="flex gap-3 justify-center">
                      {searchQuery && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setShowSearchBar(false);
                          }}
                          className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg"
                        >
                          Limpiar Búsqueda
                        </button>
                      )}
                      <button
                        onClick={handleCreateFolderDirect}
                        className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg"
                      >
                        Crear Carpeta
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>


        </div>
      </div>

      {/* Create Folder Modal */}
      {showCreateModal && (
        <PremiumCreateFolderModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateFolderSubmit}
        />
      )}

      {/* Circular Menu Navigation */}
      <CircularMenu 
        currentView="folders" 
        onNavigate={(view) => {
          console.log('Navigate to:', view);
          if (onNavigate) {
            onNavigate(view);
          }
        }} 
      />

    </>
  );
}