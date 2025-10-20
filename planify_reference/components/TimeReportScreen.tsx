'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, FolderOpen, Briefcase, CheckSquare, ChevronDown, ChevronRight, Calendar, TrendingUp, Play } from 'lucide-react';
import { useTimeTracking } from '@/contexts/TimeTrackingContext';
import { Folder as FolderType, Project, DailyTask } from '@/types';

interface TimeReportScreenProps {
  isOpen: boolean;
  onClose: () => void;
  folders?: FolderType[];
  projects?: Project[];
  tasks?: DailyTask[];
}

const TimeReportScreen: React.FC<TimeReportScreenProps> = ({ 
  isOpen, 
  onClose,
  folders: allFolders = [],
  projects: allProjects = [],
  tasks: allTasks = []
}) => {
  const [mounted, setMounted] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | 'all'>('all');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [forceUpdate, setForceUpdate] = useState(0);
  
  const {
    getFolderTracking,
    getProjectTracking,
    getTaskTracking,
    formatDuration,
  } = useTimeTracking();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Actualizar cada 100ms para cronómetros en tiempo real
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      setForceUpdate(prev => prev + 1);
    }, 100);
    
    return () => clearInterval(interval);
  }, [isOpen]);

  // Auto-expandir todo al abrir
  useEffect(() => {
    if (!isOpen) return;
    
    // Expandir carpetas con tracking
    const foldersToExpand = allFolders
      .filter(f => hasFolderTracking(f.id))
      .map(f => f.id);
    
    // Expandir proyectos que tienen tracking O que tienen tareas con tracking
    const projectsToExpand = allProjects
      .filter(p => {
        const hasOwnTracking = hasProjectTracking(p.id);
        const hasTasksWithTracking = allTasks.some(t => t.projectId === p.id && hasTaskTracking(t.id));
        return hasOwnTracking || hasTasksWithTracking;
      })
      .map(p => p.id);
    
    setExpandedFolders(new Set(foldersToExpand));
    setExpandedProjects(new Set(projectsToExpand));
  }, [isOpen, allTasks, allProjects, allFolders]);

  if (!mounted || !isOpen) return null;

  // DEBUG: Ver todas las tareas que llegan al modal
  console.log('🎯 TODAS las tareas en TimeReportScreen:', {
    totalTasks: allTasks.length,
    tasks: allTasks.map(t => ({
      id: t.id,
      title: t.title,
      projectId: t.projectId,
      type: t.type
    })),
    totalProjects: allProjects.length,
    projects: allProjects.map(p => ({
      id: p.id,
      title: p.title
    }))
  });

  // Función para verificar si un elemento está activo (Play presionado)
  const isFolderActive = (folderId: string) => {
    const tracking = getFolderTracking(folderId);
    return tracking?.currentSession?.isRunning && !tracking?.currentSession?.isPaused;
  };

  const isProjectActive = (projectId: string) => {
    const tracking = getProjectTracking(projectId);
    return tracking?.currentSession?.isRunning && !tracking?.currentSession?.isPaused;
  };

  const isTaskActive = (taskId: string) => {
    const tracking = getTaskTracking(taskId);
    return tracking?.currentSession?.isRunning && !tracking?.currentSession?.isPaused;
  };

  // Función para verificar si un elemento tiene tracking (activo O completado)
  const hasFolderTracking = (folderId: string) => {
    const tracking = getFolderTracking(folderId);
    return tracking && (tracking.sessions.length > 0 || tracking.currentSession);
  };

  const hasProjectTracking = (projectId: string) => {
    const tracking = getProjectTracking(projectId);
    return tracking && (tracking.sessions.length > 0 || tracking.currentSession);
  };

  const hasTaskTracking = (taskId: string) => {
    const tracking = getTaskTracking(taskId);
    return tracking && (tracking.sessions.length > 0 || tracking.currentSession);
  };

  // Obtener TODAS las carpetas con tracking (activas O completadas)
  const foldersWithTracking = allFolders.filter(f => hasFolderTracking(f.id));
  
  // Obtener carpetas que tienen proyectos con tracking
  const foldersWithProjectTracking = allFolders.filter(f => 
    allProjects.some(p => p.folderId === f.id && hasProjectTracking(p.id))
  );

  // Obtener carpetas que tienen tareas con tracking
  const foldersWithTaskTracking = allFolders.filter(f =>
    allTasks.some(t => t.projectId && allProjects.find(p => p.id === t.projectId && p.folderId === f.id) && hasTaskTracking(t.id))
  );

  // Combinar todas las carpetas relevantes
  const allRelevantFolders = Array.from(new Set([
    ...foldersWithTracking,
    ...foldersWithProjectTracking,
    ...foldersWithTaskTracking
  ]));

  // Proyectos sin carpeta que tienen tracking
  const projectsWithoutFolder = allProjects.filter(p => !p.folderId && hasProjectTracking(p.id));

  // Tareas sin proyecto que tienen tracking
  const tasksWithoutProject = allTasks.filter(t => !t.projectId && hasTaskTracking(t.id));

  // Filtrar según selección del dropdown
  const displayFolders = selectedFolderId === 'all' 
    ? allRelevantFolders 
    : allRelevantFolders.filter(f => f.id === selectedFolderId);

  const displayProjectsWithoutFolder = selectedFolderId === 'all' ? projectsWithoutFolder : [];
  const displayTasksWithoutProject = selectedFolderId === 'all' ? tasksWithoutProject : [];

  // Contar elementos activos totales
  const totalActive = allFolders.filter(f => isFolderActive(f.id)).length + 
    allProjects.filter(p => isProjectActive(p.id)).length + 
    allTasks.filter(t => isTaskActive(t.id)).length;
  
  // Contar elementos con tracking (activos + completados)
  const totalWithTracking = allRelevantFolders.length + 
    allProjects.filter(p => hasProjectTracking(p.id)).length + 
    allTasks.filter(t => hasTaskTracking(t.id)).length;

  // Toggle funciones
  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm">
      <div className="h-full w-full flex flex-col bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 border-b border-white/10">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-white">Resumen de Tiempo</h2>
                <p className="text-purple-100 text-xs sm:text-sm mt-0.5">
                  {totalActive > 0 ? (
                    <>{totalActive} {totalActive === 1 ? 'activo' : 'activos'} • </>
                  ) : null}
                  {totalWithTracking} {totalWithTracking === 1 ? 'elemento' : 'elementos'} total
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200 backdrop-blur-sm group"
            >
              <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>

          {/* Selector de Carpeta */}
          <div className="px-4 sm:px-6 pb-4">
            <div className="relative">
              <select
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium appearance-none cursor-pointer hover:bg-white/15 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="all" className="bg-slate-800 text-white">
                  📊 Todas las carpetas ({allRelevantFolders.length})
                </option>
                {allRelevantFolders.map(folder => (
                  <option key={folder.id} value={folder.id} className="bg-slate-800 text-white">
                    📁 {folder.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Content - Vista Jerárquica */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Carpetas con sus proyectos y tareas */}
          {displayFolders.map(folder => {
            const folderTracking = getFolderTracking(folder.id);
            const isFolderRunning = isFolderActive(folder.id);
            const folderProjects = allProjects.filter(p => p.folderId === folder.id);
            const activeProjectsInFolder = folderProjects.filter(p => isProjectActive(p.id));
            const isExpanded = expandedFolders.has(folder.id);

            return (
              <div key={folder.id} className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10 overflow-hidden">
                
                {/* Carpeta Header */}
                <div 
                  className={`p-4 cursor-pointer hover:bg-white/5 transition-all duration-200 ${
                    isFolderRunning ? 'bg-purple-500/10' : ''
                  }`}
                  onClick={() => toggleFolder(folder.id)}
                >
                  <div className="flex items-start gap-3">
                    <button className="mt-1 shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-purple-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-purple-400" />
                      )}
                    </button>
                    
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                      <FolderOpen className="w-5 h-5 text-purple-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-bold text-lg truncate">{folder.name}</h3>
                        {isFolderRunning ? (
                          <span className="px-2 py-1 rounded-md bg-green-500/30 border border-green-500/50 text-green-200 text-xs font-semibold flex items-center gap-1 shrink-0">
                            <Play className="w-3 h-3 fill-current" />
                            Activa
                          </span>
                        ) : folderTracking?.sessions && folderTracking.sessions.length > 0 && (
                          <span className="px-2 py-1 rounded-md bg-gray-500/30 border border-gray-500/50 text-gray-200 text-xs font-semibold shrink-0">
                            ✓ Completada
                          </span>
                        )}
                      </div>
                      
                      {/* Estadísticas de la carpeta */}
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        {isFolderRunning && folderTracking && (
                          <>
                            <span className="text-white font-bold">
                              {formatDuration(folderTracking.totalTimeSpent)}
                            </span>
                            <span className="text-gray-400">tiempo total</span>
                          </>
                        )}
                        {activeProjectsInFolder.length > 0 && (
                          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-xs">
                            {activeProjectsInFolder.length} {activeProjectsInFolder.length === 1 ? 'proyecto' : 'proyectos'}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 mt-2">
                        {folderTracking?.startedAt && (
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Calendar className="w-3 h-3" />
                            <span>Inicio: {new Date(folderTracking.startedAt).toLocaleString('es-ES', { 
                              day: '2-digit', 
                              month: '2-digit',
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}</span>
                          </div>
                        )}
                        
                        {/* Fecha de fin (si está completada) */}
                        {!isFolderRunning && folderTracking?.sessions && folderTracking.sessions.length > 0 && folderTracking.sessions[folderTracking.sessions.length - 1].endTime && (
                          <div className="flex items-center gap-2 text-xs text-purple-400">
                            <CheckSquare className="w-3 h-3" />
                            <span>Fin: {new Date(folderTracking.sessions[folderTracking.sessions.length - 1].endTime!).toLocaleString('es-ES', { 
                              day: '2-digit', 
                              month: '2-digit',
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Proyectos de la carpeta (expandidos) */}
                {isExpanded && (
                  <div className="border-t border-white/10 bg-black/20 p-3 space-y-2">
                    {folderProjects.filter(p => hasProjectTracking(p.id)).map(project => {
                      const projectTracking = getProjectTracking(project.id);
                      const isProjectRunning = isProjectActive(project.id);
                      const projectTasks = allTasks.filter(t => t.projectId === project.id);
                      const activeTasksInProject = projectTasks.filter(t => isTaskActive(t.id));
                      const tasksWithTracking = projectTasks.filter(t => hasTaskTracking(t.id));
                      const isProjectExpanded = expandedProjects.has(project.id);

                      // DEBUG: Ver qué pasa con las tareas
                      console.log(`🔍 Proyecto "${project.title}" (${project.id}):`, {
                        totalTasks: projectTasks.length,
                        tasksWithTracking: tasksWithTracking.length,
                        isExpanded: isProjectExpanded,
                        allTasksInSystem: allTasks.length,
                        tasksDetails: projectTasks.map(t => ({
                          id: t.id,
                          title: t.title,
                          projectId: t.projectId,
                          hasTracking: hasTaskTracking(t.id)
                        }))
                      });

                      return (
                        <div key={project.id} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                          
                          {/* Proyecto Header */}
                          <div 
                            className={`p-3 cursor-pointer hover:bg-white/5 transition-all duration-200 ${
                              isProjectRunning ? 'bg-blue-500/10' : ''
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleProject(project.id);
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <button className="mt-0.5 shrink-0">
                                {isProjectExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-blue-400" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-blue-400" />
                                )}
                              </button>
                              
                              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                                <Briefcase className="w-4 h-4 text-blue-400" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-white font-semibold truncate">{project.title}</h4>
                                  {isProjectRunning ? (
                                    <span className="px-2 py-0.5 rounded bg-green-500/30 border border-green-500/50 text-green-200 text-xs font-semibold flex items-center gap-1 shrink-0">
                                      <Play className="w-2.5 h-2.5 fill-current" />
                                      Activo
                                    </span>
                                  ) : projectTracking?.sessions && projectTracking.sessions.length > 0 && (
                                    <span className="px-2 py-0.5 rounded bg-gray-500/30 border border-gray-500/50 text-gray-200 text-xs font-semibold shrink-0">
                                      ✓ Completado
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                  {projectTracking && (
                                    <>
                                      <span className="text-white font-bold text-sm">
                                        {formatDuration(projectTracking.totalTimeSpent)}
                                      </span>
                                      <span className="text-gray-400 text-xs">tiempo</span>
                                    </>
                                  )}
                                  {tasksWithTracking.length > 0 && (
                                    <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-300 text-xs">
                                      {activeTasksInProject.length > 0 && `${activeTasksInProject.length} activa${activeTasksInProject.length > 1 ? 's' : ''} • `}
                                      {tasksWithTracking.length} {tasksWithTracking.length === 1 ? 'tarea' : 'tareas'} total
                                    </span>
                                  )}
                                </div>

                                <div className="space-y-1 mt-1">
                                  {projectTracking?.startedAt && (
                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                      <Calendar className="w-3 h-3" />
                                      <span>Inicio: {new Date(projectTracking.startedAt).toLocaleString('es-ES', { 
                                        day: '2-digit', 
                                        month: '2-digit',
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}</span>
                                    </div>
                                  )}
                                  
                                  {/* Fecha de fin (si está completado) */}
                                  {!isProjectRunning && projectTracking?.sessions && projectTracking.sessions.length > 0 && projectTracking.sessions[projectTracking.sessions.length - 1].endTime && (
                                    <div className="flex items-center gap-1 text-xs text-blue-400">
                                      <CheckSquare className="w-3 h-3" />
                                      <span>Fin: {new Date(projectTracking.sessions[projectTracking.sessions.length - 1].endTime!).toLocaleString('es-ES', { 
                                        day: '2-digit', 
                                        month: '2-digit',
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Tareas del proyecto (expandidas) */}
                          {isProjectExpanded && projectTasks.length > 0 && (
                            <div className="border-t border-white/10 bg-black/20 p-2 space-y-2">
                              {projectTasks.map(task => {
                                // DEBUG: Log para cada tarea
                                console.log(`📝 Tarea "${task.title}":`, {
                                  id: task.id,
                                  projectId: task.projectId,
                                  hasTracking: hasTaskTracking(task.id),
                                  tracking: getTaskTracking(task.id)
                                });
                                const taskTracking = getTaskTracking(task.id);
                                const isTaskRunning = isTaskActive(task.id);
                                const lastSession = taskTracking?.sessions[taskTracking.sessions.length - 1];
                                const isCompleted = !isTaskRunning && taskTracking?.sessions && taskTracking.sessions.length > 0;

                                return (
                                  <div 
                                    key={task.id} 
                                    className={`p-3 rounded-lg border border-white/10 ${
                                      isTaskRunning ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5'
                                    }`}
                                  >
                                    <div className="flex items-start gap-2">
                                      <div className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                                        <CheckSquare className="w-3.5 h-3.5 text-green-400" />
                                      </div>
                                      
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <h5 className="text-white font-medium text-sm truncate">{task.title}</h5>
                                          {isTaskRunning ? (
                                            <span className="px-2 py-0.5 rounded bg-green-500/40 border border-green-500/60 text-green-100 text-xs font-bold flex items-center gap-1 shrink-0 animate-pulse">
                                              <Play className="w-2 h-2 fill-current" />
                                              EN CURSO
                                            </span>
                                          ) : isCompleted && (
                                            <span className="px-2 py-0.5 rounded bg-gray-500/30 border border-gray-500/50 text-gray-200 text-xs font-semibold shrink-0">
                                              ✓ Completado
                                            </span>
                                          )}
                                        </div>
                                        
                                        {/* Información de tiempo - Mostrar siempre si hay tracking */}
                                        <div className="space-y-1">
                                          {taskTracking ? (
                                            <>
                                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                                <span className="text-white font-bold">
                                                  {formatDuration(taskTracking.totalTimeSpent)}
                                                </span>
                                                <span className="text-gray-400">tiempo total</span>
                                              </div>
                                              
                                              {/* Fecha de inicio */}
                                              {taskTracking.startedAt && (
                                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                                  <Calendar className="w-3 h-3" />
                                                  <span>Inicio: {new Date(taskTracking.startedAt).toLocaleString('es-ES', { 
                                                    day: '2-digit', 
                                                    month: '2-digit',
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                  })}</span>
                                                </div>
                                              )}
                                              
                                              {/* Fecha de fin (si está completada) */}
                                              {isCompleted && lastSession?.endTime && (
                                                <div className="flex items-center gap-1 text-xs text-green-400">
                                                  <CheckSquare className="w-3 h-3" />
                                                  <span>Fin: {new Date(lastSession.endTime).toLocaleString('es-ES', { 
                                                    day: '2-digit', 
                                                    month: '2-digit',
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                  })}</span>
                                                </div>
                                              )}
                                            </>
                                          ) : (
                                            <div className="text-xs text-red-400">
                                              ⚠️ Sin tracking disponible
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Proyectos sin carpeta */}
          {displayProjectsWithoutFolder.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-white font-bold text-lg flex items-center gap-2 px-2">
                <Briefcase className="w-5 h-5 text-blue-400" />
                Proyectos sin carpeta
              </h3>
              {displayProjectsWithoutFolder.map(project => {
                const projectTracking = getProjectTracking(project.id);
                const projectTasks = allTasks.filter(t => t.projectId === project.id && isTaskActive(t.id));

                return (
                  <div key={project.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-2">{project.title}</h4>
                        {projectTracking && (
                          <div className="text-sm">
                            <span className="text-white font-bold">{formatDuration(projectTracking.totalTimeSpent)}</span>
                            <span className="text-gray-400 ml-2">en progreso</span>
                          </div>
                        )}
                        {projectTasks.length > 0 && (
                          <div className="mt-2 text-xs text-gray-400">
                            {projectTasks.length} {projectTasks.length === 1 ? 'tarea activa' : 'tareas activas'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tareas sin proyecto */}
          {displayTasksWithoutProject.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-white font-bold text-lg flex items-center gap-2 px-2">
                <CheckSquare className="w-5 h-5 text-green-400" />
                Tareas independientes
              </h3>
              {displayTasksWithoutProject.map(task => {
                const taskTracking = getTaskTracking(task.id);

                return (
                  <div key={task.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <CheckSquare className="w-4 h-4 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-2">{task.title}</h4>
                        {taskTracking && (
                          <div className="text-sm">
                            <span className="text-white font-bold">{formatDuration(taskTracking.totalTimeSpent)}</span>
                            <span className="text-gray-400 ml-2">en curso</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Estado vacío */}
          {totalActive === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 mx-auto mb-4 flex items-center justify-center">
                <Clock className="w-10 h-10 text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No hay seguimiento activo
              </h3>
              <p className="text-gray-400 max-w-md mx-auto text-sm px-4">
                Presiona el botón <Play className="w-4 h-4 inline-block mx-1" /> Play en cualquier carpeta, proyecto o tarea para comenzar a registrar tiempo
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default TimeReportScreen;
