'use client';

import { useState } from 'react';
import { Project, DailyTask } from '@/types';
import ProjectCard from '@/components/ProjectCard';
import { ArrowLeft, Search, Plus, Grid, List } from 'lucide-react';

interface ProjectsScreenProps {
  projects: Project[];
  dailyTasks?: DailyTask[];
  onBack: () => void;
  onOpenProject: (project: Project) => void;
  onCustomizeProject?: (projectId: string, icon: string, colorScheme: string, title?: string) => void;
  onDeleteProject?: (projectId: string) => void;
  onEditProjectTitle?: (projectId: string, newTitle: string) => void;
  onShareProject?: (projectId: string, shareData: any) => void;
  onAddTask?: (projectId: string, taskData?: any) => void;
  onCreateProject?: () => void;
}

export default function ProjectsScreen({
  projects,
  dailyTasks = [],
  onBack,
  onOpenProject,
  onCustomizeProject,
  onDeleteProject,
  onEditProjectTitle,
  onShareProject,
  onAddTask,
  onCreateProject
}: ProjectsScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Calcular estadísticas
  const totalTasks = dailyTasks.length;
  const completedTasks = dailyTasks.filter(task => task.status === 'completed').length;
  const activeProjects = projects.filter(p => p.progress < 100).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 opacity-5"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-full blur-3xl opacity-10 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl opacity-15 translate-x-1/3 translate-y-1/3"></div>
      </div>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="fixed top-3 md:top-6 left-3 md:left-6 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white bg-opacity-90 hover:bg-opacity-100 active:scale-95 transition-all duration-200 flex items-center justify-center shadow-lg border border-blue-200 z-50 backdrop-blur-xl"
      >
        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
      </button>

      {/* Main Content */}
      <div className="relative z-10 pt-16 md:pt-20 px-3 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* PREMIUM PROJECT HEADER - EXACTO COMO LA IMAGEN */}
          <div className="text-center mb-6 md:mb-8">
            {/* Large Project Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-2xl sm:rounded-3xl md:rounded-4xl bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 shadow-2xl border-2 border-white border-opacity-30 mb-4 md:mb-6 backdrop-blur-xl relative overflow-hidden">
              {/* Glass effect overlay */}
              <div className="absolute inset-0 bg-white bg-opacity-20 backdrop-blur-sm"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20"></div>
              <Grid className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-white drop-shadow-lg relative z-10" />
            </div>
            
            {/* Project Title */}
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold !text-white mb-2 leading-tight px-2" style={{ color: '#ffffff !important' }}>
              Proyectos
            </h1>
            
            {/* Project Description */}
            {projects.length > 0 && (
              <p className="!text-white opacity-70 text-sm md:text-base font-medium mb-4 md:mb-6 px-4 max-w-2xl mx-auto leading-relaxed" style={{ color: '#ffffff !important' }}>
                {projects.length} proyecto{projects.length !== 1 ? 's' : ''} • {activeProjects} activo{activeProjects !== 1 ? 's' : ''} • {Math.round((completedTasks/totalTasks)*100) || 0}% completado
              </p>
            )}
            
            {/* PROGRESS CHIPS - Solo iconos, súper minimalistas */}
            <div className="flex justify-center gap-3 mb-4 md:mb-6">
              <button
                className="relative group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 bg-white/[0.08] backdrop-blur-sm border border-white/[0.15] text-white/70 hover:bg-white/[0.15] hover:scale-105 hover:text-white"
                title={`Activos (${activeProjects})`}
              >
                <Grid className="w-4 h-4" />
                {activeProjects > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {activeProjects}
                  </div>
                )}
              </button>
              
              <button
                className="relative group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 bg-white/[0.08] backdrop-blur-sm border border-white/[0.15] text-white/70 hover:bg-white/[0.15] hover:scale-105 hover:text-white"
                title="Completados"
              >
                <List className="w-4 h-4" />
                {projects.filter(p => p.progress >= 100).length > 0 && (
                  <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {projects.filter(p => p.progress >= 100).length}
                  </div>
                )}
              </button>
              
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`relative group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                  showSearch
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg scale-110 ring-2 ring-white/30'
                    : 'bg-white/[0.08] backdrop-blur-sm border border-white/[0.15] text-white/70 hover:bg-white/[0.15] hover:scale-105 hover:text-white'
                }`}
                title="Buscar"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tasks Section - Réplica exacta del estilo de Tareas Diarias */}
          <div className="mb-6 sm:mb-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              {/* Tasks Header - Estilo minimalista */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Icono del proyecto */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                    <Grid className="w-6 h-6" />
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-white truncate">Proyectos</h3>
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <span className="text-white">{filteredProjects.length} de {projects.length} mostrados</span>
                      {projects.length > 0 && (
                        <>
                          <span className="text-white/50">•</span>
                          <span className="font-medium text-white">
                            {Math.round((projects.filter(p => p.progress >= 100).length / projects.length) * 100) || 0}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setShowSearch(!showSearch)}
                    className={`p-2 ${
                      showSearch || searchTerm
                        ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-400'
                        : 'bg-white/[0.04] border-white/[0.08] text-white/60 hover:text-white/80'
                    } border hover:bg-white/[0.08] hover:border-white/[0.15] rounded-lg transition-all duration-200 flex items-center justify-center group`}
                    title="Filtros"
                  >
                    <Search className="w-4 h-4 group-hover:scale-105 transition-transform duration-200" />
                  </button>
                  
                  {onCreateProject && (
                    <button
                      onClick={onCreateProject}
                      className="p-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white hover:shadow-lg transition-all duration-200 hover:scale-105"
                      title="Nueva tarea"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Barra de búsqueda expandible */}
              {showSearch && (
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
                            setShowSearch(false);
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

              {/* Projects Grid dentro de la tarjeta */}
              {filteredProjects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 mb-4">
                    <Grid className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Crea tu primer proyecto</h3>
                  <p className="text-white/60 mb-6 max-w-md mx-auto">
                    Organiza tus tareas en proyectos específicos y comienza a hacer progreso
                  </p>
                  {onCreateProject && (
                    <button
                      onClick={onCreateProject}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105"
                    >
                      Crear primer proyecto
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      dailyTasks={dailyTasks}
                      onOpenProject={() => onOpenProject(project)}
                      onCustomize={onCustomizeProject}
                      onDelete={onDeleteProject ? () => onDeleteProject(project.id) : undefined}
                      onEditTitle={onEditProjectTitle ? (newTitle: string) => onEditProjectTitle(project.id, newTitle) : undefined}
                      onAddTask={onAddTask}
                      onShare={onShareProject ? () => onShareProject(project.id, {}) : undefined}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
