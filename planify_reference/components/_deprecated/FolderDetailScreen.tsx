'use client';

import { useState } from 'react';
import { Folder, Project, DailyTask } from '@/types';
import ProjectCard from './ProjectCard';
import ProjectDetailScreen from './ProjectDetailScreen';
import CircularMenu from './BankingBottomNavigation';
import { 
  ArrowLeft, Plus, Grid, List, Search,
  MoreVertical, Edit3, Archive, FolderOpen, Trash2,
  Users
} from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface FolderDetailScreenProps {
  folder: Folder;
  projects: Project[];
  dailyTasks?: DailyTask[];
  onBack: () => void;
  onAddProject?: () => void;
  onEditFolder?: (folder: Folder) => void;
  onArchiveFolder?: (folder: Folder) => void;
  onDeleteFolder?: (folder: Folder) => void;
  onCustomizeProject?: (projectId: string, icon: string, colorScheme: string, title?: string) => void;
  onOpenProject?: (project: Project) => void;
  onAddTask?: (projectId: string, taskData?: any) => void;
  onToggleDailyTask?: (taskId: string, value?: number) => void;
  onUpdateDailyTask?: (taskId: string, value: number) => void;
  onEditDailyTask?: (task: DailyTask) => void;
  onDeleteDailyTask?: (taskId: string) => void;
  onArchiveProject?: (projectId: string) => void;
  onDeleteProject?: (projectId: string) => void;
  onEditProjectTitle?: (projectId: string, newTitle: string) => void;
  onEditFolderTitle?: (folderId: string, newTitle: string) => void;
  onShareProject?: (project: Project) => void;
  onUpdateProject?: (projectId: string, updates: Partial<Project>) => void;
  currentView?: 'home' | 'folders' | 'calendar' | 'reminders' | 'profile' | 'ideas';
  onNavigate?: (view: 'home' | 'folders' | 'projects' | 'calendar' | 'reminders' | 'profile' | 'ideas') => void;
}

export default function FolderDetailScreen({
  folder,
  projects,
  dailyTasks = [],
  onBack,
  onAddProject,
  onEditFolder,
  onArchiveFolder,
  onDeleteFolder,
  onCustomizeProject,
  onOpenProject,
  onAddTask,
  onToggleDailyTask,
  onUpdateDailyTask,
  onEditDailyTask,
  onDeleteDailyTask,
  onArchiveProject,
  onDeleteProject,
  onEditProjectTitle,
  onEditFolderTitle,
  onShareProject,
  onUpdateProject,
  currentView = 'folders',
  onNavigate
}: FolderDetailScreenProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'updated'>('updated');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const folderProjects = projects.filter(p => p.folderId === folder.id);
  
  const filteredProjects = folderProjects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.title.localeCompare(b.title);
      case 'progress':
        return b.progress - a.progress;
      case 'updated': {
        const bTime = new Date(b.updatedAt || b.createdAt || new Date().toISOString()).getTime();
        const aTime = new Date(a.updatedAt || a.createdAt || new Date().toISOString()).getTime();
        return bTime - aTime;
      }
      default:
        return 0;
    }
  });
  
  const getColorScheme = () => {
    const scheme = folder.colorScheme || 'default';
    const colorSchemes = {
      default: 'from-indigo-500 to-purple-500',
      sunset: 'from-orange-500 to-pink-500',
      ocean: 'from-blue-500 to-cyan-500',
      forest: 'from-green-500 to-emerald-500',
      cosmic: 'from-purple-500 to-indigo-500',
      fire: 'from-red-500 to-orange-500',
      gold: 'from-yellow-500 to-orange-500'
    };
    return colorSchemes[scheme as keyof typeof colorSchemes] || colorSchemes.default;
  };
  
  const gradientColors = getColorScheme();
  
  const stats = {
    total: folderProjects.length,
    completed: folderProjects.filter(p => p.progress >= 100).length,
    inProgress: folderProjects.filter(p => p.progress > 0 && p.progress < 100).length,
    averageProgress: folderProjects.length > 0 
      ? Math.round(folderProjects.reduce((sum, p) => sum + p.progress, 0) / folderProjects.length)
      : 0
  };

  // El FolderDetailScreen ya no maneja ProjectDetailScreen internamente
  // Esa responsabilidad se delega al FixedHomeScreen parent

  return (
    <>
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="h-full flex flex-col pb-20">
          {/* Header Optimizado - Mobile First */}
          <header className="sticky top-0 z-20 backdrop-blur-xl bg-slate-900/80 border-b border-white/10">
            <div className="px-4 py-4">
              {/* Primera fila: Navegación y acciones */}
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={onBack}
                  className="p-2 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4 text-white" />
                </button>
                
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-bold text-white truncate">
                    {folder.name}
                  </h1>
                  {folder.description && (
                    <p className="text-white/60 text-xs truncate">
                      {folder.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={onAddProject}
                    className={`p-2 rounded-xl bg-gradient-to-r ${gradientColors} text-white hover:scale-105 transition-all duration-300`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="p-2 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300"
                  >
                    {viewMode === 'grid' ? <List className="w-4 h-4 text-white" /> : <Grid className="w-4 h-4 text-white" />}
                  </button>
                  
                  <button
                    onClick={() => setShowActions(!showActions)}
                    className="p-2 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300"
                  >
                    <MoreVertical className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Segunda fila: Búsqueda compacta */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="text"
                  placeholder="Buscar proyectos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all text-sm"
                />
              </div>

              {/* Tercera fila: Stats compactos */}
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center p-2 rounded-lg bg-white/10">
                  <div className="text-sm font-bold text-white">{stats.total}</div>
                  <div className="text-xs text-white/60">Total</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-emerald-500/20">
                  <div className="text-sm font-bold text-white">{stats.completed}</div>
                  <div className="text-xs text-emerald-300">Hechos</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-yellow-500/20">
                  <div className="text-sm font-bold text-white">{stats.inProgress}</div>
                  <div className="text-xs text-yellow-300">Activos</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-purple-500/20">
                  <div className="text-sm font-bold text-white">{stats.averageProgress}%</div>
                  <div className="text-xs text-purple-300">Promedio</div>
                </div>
              </div>
            </div>

            {/* Menú de acciones desplegable */}
            {showActions && (
              <>
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setShowActions(false)}
                />
                <div className="absolute top-full right-4 mt-2 w-48 backdrop-blur-3xl bg-black/40 border border-white/30 rounded-2xl overflow-hidden z-30">
                  <button
                    onClick={() => {
                      onEditFolder?.(folder);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Editar Carpeta</span>
                  </button>
                  <button
                    onClick={() => {
                      onArchiveFolder?.(folder);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                  >
                    <Archive className="w-4 h-4" />
                    <span>Archivar</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </>
            )}
          </header>

          {/* Main Content */}
          <main className="flex-1 px-4 py-4 overflow-auto">
            {sortedProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className={`w-16 h-16 bg-gradient-to-br ${gradientColors} rounded-full flex items-center justify-center mb-4 shadow-2xl`}>
                  <FolderOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {folderProjects.length === 0 ? 'Carpeta vacía' : 'No se encontraron proyectos'}
                </h3>
                <p className="text-white/60 text-sm mb-4">
                  {folderProjects.length === 0 
                    ? 'Agrega tu primer proyecto para comenzar'
                    : 'Intenta cambiar los términos de búsqueda'
                  }
                </p>
                
                {folderProjects.length === 0 && onAddProject && (
                  <button
                    onClick={onAddProject}
                    className={`px-6 py-3 bg-gradient-to-r ${gradientColors} rounded-2xl text-white font-medium hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2`}
                  >
                    <Plus className="w-5 h-5" />
                    Crear primer proyecto
                  </button>
                )}
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-3"
              }>
                {sortedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    folderMembers={folder?.assignedTo || []}
                    onOpenProject={() => {
                      if (onOpenProject) {
                        onOpenProject(project);
                      }
                    }}
                    onCustomize={onCustomizeProject ? (projectId: string, icon: string, colorScheme: string, title?: string) => onCustomizeProject(projectId, icon, colorScheme, title) : undefined}
                    onDelete={onDeleteProject ? () => onDeleteProject(project.id) : undefined}
                    onEditTitle={onEditProjectTitle ? (newTitle: string) => onEditProjectTitle(project.id, newTitle) : undefined}
                    onAddTask={onAddTask}
                    onShare={onShareProject ? () => onShareProject(project) : undefined}
                    onTeamUpdate={(projectId: string, updates: any) => {
                      if (onUpdateProject) {
                        onUpdateProject(projectId, updates);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
      
      {/* Navigation */}
      <CircularMenu 
        currentView={currentView} 
        onNavigate={(view) => {
          if (view !== 'folders') {
            // Si navega a otra sección, volver al HomeScreen principal
            onNavigate?.(view);
          }
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          onDeleteFolder?.(folder);
          setShowDeleteConfirm(false);
          onBack();
        }}
        itemName={folder.name}
        itemType="carpeta"
        warningMessage={folderProjects.length > 0 ? 
          `Esta carpeta contiene ${folderProjects.length} proyecto${folderProjects.length > 1 ? 's' : ''}. Al eliminarla, también se eliminarán todos los proyectos.` : 
          undefined
        }
      />
    </>
  );
}