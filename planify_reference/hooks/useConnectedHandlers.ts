/**
 * Hook con handlers completos para conectar todas las funcionalidades de la app
 * Implementa todas las funciones que están definidas en interfaces pero no conectadas
 */

import { useState, useCallback } from 'react';
import { Project, Folder, DailyTask } from '@/types';

interface UseConnectedHandlersProps {
  projects: Project[];
  folders: Folder[];
  dailyTasks: DailyTask[];
  setProjects: (newProjects: Project[] | ((prev: Project[]) => Project[])) => Promise<void>;
  setFolders: (newFolders: Folder[] | ((prev: Folder[]) => Folder[])) => Promise<void>;
  setDailyTasks: (newTasks: DailyTask[] | ((prev: DailyTask[]) => DailyTask[])) => Promise<void>;
  onNotify?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const useConnectedHandlers = ({
  projects,
  folders,
  dailyTasks,
  setProjects,
  setFolders,
  setDailyTasks,
  onNotify
}: UseConnectedHandlersProps) => {

  // Project Handlers
  const handleEditProject = useCallback((project: Project) => {
    console.log('✏️ Editing project:', project.title);
    onNotify?.(`Editando proyecto: ${project.title}`, 'info');
    
    // Aquí podrías abrir un modal de edición
    // Por ahora solo registramos la acción
  }, [onNotify]);

  const handleDeleteProjectById = useCallback((projectId: string) => {
    console.log('🗑️ Deleting project by ID:', projectId);
    
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    setProjects(prev => prev.filter(p => p.id !== projectId));
    
    // Remove from folders
    setFolders(prev => prev.map(folder => ({
      ...folder,
      projectIds: (folder.projectIds || []).filter(id => id !== projectId),
      updatedAt: new Date().toISOString()
    })));
    
    onNotify?.(`Proyecto "${project.title}" eliminado`, 'success');
  }, [setProjects, setFolders, projects, onNotify]);

  const handleDeleteProject = useCallback((project: Project) => {
    console.log('🗑️ Deleting project:', project.title);
    
    setProjects(prev => prev.filter(p => p.id !== project.id));
    
    // Remove from folders
    setFolders(prev => prev.map(folder => ({
      ...folder,
      projectIds: (folder.projectIds || []).filter(id => id !== project.id),
      updatedAt: new Date().toISOString()
    })));
    
    onNotify?.(`Proyecto "${project.title}" eliminado`, 'success');
  }, [setProjects, setFolders, onNotify]);

  const handleCustomizeProject = useCallback((projectId: string, icon: string, colorScheme: string) => {
    console.log('🎨 Customizing project:', projectId, { icon, colorScheme });
    
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { 
            ...project, 
            icon,
            colorScheme: colorScheme || 'default',
            updatedAt: new Date().toISOString()
          }
        : project
    ));
    
    const project = projects.find(p => p.id === projectId);
    onNotify?.(`Proyecto "${project?.title}" personalizado`, 'success');
  }, [setProjects, projects, onNotify]);

  const handleArchiveProject = useCallback((project: Project) => {
    console.log('📦 Archiving project:', project.title);
    
    setProjects(prev => prev.map(p => 
      p.id === project.id 
        ? { 
            ...p, 
            archived: true,
            updatedAt: new Date().toISOString()
          }
        : p
    ));
    
    onNotify?.(`Proyecto "${project.title}" archivado`, 'info');
  }, [setProjects, onNotify]);

  // Folder Handlers
  const handleEditFolder = useCallback((folder: Folder) => {
    console.log('✏️ Editing folder:', folder.name);
    onNotify?.(`Editando carpeta: ${folder.name}`, 'info');
    
    // Aquí podrías abrir un modal de edición
  }, [onNotify]);

  const handleEditFolderById = useCallback((folderId: string, folderData: any) => {
    console.log('✏️ Editing folder by ID:', folderId, folderData);
    
    setFolders(prev => prev.map(folder => 
      folder.id === folderId 
        ? { 
            ...folder, 
            ...folderData,
            updatedAt: new Date().toISOString()
          }
        : folder
    ));
    
    const folder = folders.find(f => f.id === folderId);
    onNotify?.(`Carpeta "${folder?.name}" actualizada`, 'success');
  }, [setFolders, folders, onNotify]);

  const handleDeleteFolder = useCallback((folder: Folder) => {
    console.log('🗑️ Deleting folder:', folder.name);
    
    // Move projects out of folder
    setProjects(prev => prev.map(project => 
      (folder.projectIds || []).includes(project.id)
        ? { ...project, folderId: undefined, updatedAt: new Date().toISOString() }
        : project
    ));
    
    // Delete folder
    setFolders(prev => prev.filter(f => f.id !== folder.id));
    
    onNotify?.(`Carpeta "${folder.name}" eliminada`, 'success');
  }, [setProjects, setFolders, onNotify]);

  const handleDeleteFolderById = useCallback((folderId: string) => {
    console.log('🗑️ Deleting folder by ID:', folderId);
    
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;
    
    // Move projects out of folder
    setProjects(prev => prev.map(project => 
      (folder.projectIds || []).includes(project.id)
        ? { ...project, folderId: undefined, updatedAt: new Date().toISOString() }
        : project
    ));
    
    // Delete folder
    setFolders(prev => prev.filter(f => f.id !== folderId));
    
    onNotify?.(`Carpeta "${folder.name}" eliminada`, 'success');
  }, [setProjects, setFolders, folders, onNotify]);

  const handleCustomizeFolder = useCallback(async (folderId: string, icon: string, colorScheme: string) => {
    console.log('🎨 Customizing folder:', folderId, { icon, colorScheme });
    
    console.log('📂 Folders ANTES de actualizar:', folders.map(f => ({ 
      id: f.id, 
      name: f.name, 
      colorScheme: f.colorScheme,
      color: f.color 
    })));
    
    await setFolders(prev => {
      const updated = prev.map(folder => 
        folder.id === folderId 
          ? { 
              ...folder, 
              icon,
              colorScheme: colorScheme || 'default',
              updatedAt: new Date().toISOString()
            }
          : folder
      );
      
      console.log('📂 Folders DESPUÉS de actualizar:', updated.map(f => ({ 
        id: f.id, 
        name: f.name, 
        colorScheme: f.colorScheme,
        color: f.color 
      })));
      
      return updated;
    });
    
    // También actualizar proyectos asociados para mantener consistencia visual
    console.log('🎨 Actualizando proyectos de la carpeta:', folderId, 'con color:', colorScheme);
    
    await setProjects(prev => {
      const updated = prev.map(project => 
        project.folderId === folderId
          ? {
              ...project,
              icon: project.icon || icon, // Solo si el proyecto no tiene su propio icono
              colorScheme: colorScheme || 'default', // SIEMPRE heredar el color de la carpeta
              color: colorScheme || 'default', // También actualizar legacy color
              updatedAt: new Date().toISOString()
            }
          : project
      );
      
      console.log('📊 Proyectos actualizados:', updated.filter(p => p.folderId === folderId).map(p => ({
        id: p.id,
        name: p.name || p.title,
        colorScheme: p.colorScheme,
        folderId: p.folderId
      })));
      
      return updated;
    });
    
    const folder = folders.find(f => f.id === folderId);
    onNotify?.(`Carpeta "${folder?.name}" personalizada`, 'success');
  }, [setFolders, setProjects, folders, onNotify]);

  const handleArchiveFolder = useCallback((folder: Folder) => {
    console.log('📦 Archiving folder:', folder.name);
    
    setFolders(prev => prev.map(f => 
      f.id === folder.id 
        ? { 
            ...f, 
            archived: true,
            updatedAt: new Date().toISOString()
          }
        : f
    ));
    
    onNotify?.(`Carpeta "${folder.name}" archivada`, 'info');
  }, [setFolders, onNotify]);

  // Task Management Handlers
  const handleAddTask = useCallback((projectId: string, taskData?: any) => {
    console.log('➕ Adding task to project:', projectId, taskData);
    
    const newTask = {
      id: `task-${Date.now()}`,
      title: taskData?.title || 'Nueva tarea',
      type: taskData?.type || 'subjective' as const,
      done: false,
      priority: taskData?.priority || 'media' as const,
      assignedTo: taskData?.assignedTo || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? {
            ...project,
            modules: project.modules?.length > 0 ? 
              project.modules.map((module: any) => ({
                ...module,
                tasks: [...module.tasks, newTask]
              })) :
              [{
                id: `module-${Date.now()}`,
                title: 'Tareas Principales',
                tasks: [newTask]
              }],
            items: (project.items || 0) + 1,
            updatedAt: new Date().toISOString()
          }
        : project
    ));
    
    const project = projects.find(p => p.id === projectId);
    onNotify?.(`Tarea agregada a "${project?.title}"`, 'success');
  }, [setProjects, projects, onNotify]);

  // Team Management
  const handleTeamUpdate = useCallback((itemId: string, updates: any) => {
    console.log('👥 Updating team for:', itemId, updates);
    
    // Update folders
    setFolders(prev => prev.map(folder => 
      folder.id === itemId 
        ? { 
            ...folder,
            assignedTo: updates.assignedTo || folder.assignedTo,
            team: updates.team || folder.team,
            shareSettings: updates.shareSettings || folder.shareSettings,
            updatedAt: new Date().toISOString()
          }
        : folder
    ));
    
    // Update projects
    setProjects(prev => prev.map(project => 
      project.id === itemId 
        ? { 
            ...project,
            assignedTo: updates.assignedTo || project.assignedTo,
            team: updates.team || project.team,
            shareSettings: updates.shareSettings || project.shareSettings,
            updatedAt: new Date().toISOString()
          }
        : project
    ));
    
    onNotify?.('Equipo actualizado exitosamente', 'success');
  }, [setFolders, setProjects, onNotify]);

  // Daily Task Handlers
  const handleEditDailyTask = useCallback((task: DailyTask) => {
    console.log('✏️ Editing daily task:', task.title);
    onNotify?.(`Editando tarea: ${task.title}`, 'info');
  }, [onNotify]);

  const handleEditDailyTaskById = useCallback((taskId: string, taskData: any) => {
    console.log('✏️ Editing daily task by ID:', taskId, taskData);
    
    setDailyTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            ...taskData,
            updatedAt: new Date().toISOString()
          }
        : task
    ));
    
    const task = dailyTasks.find(t => t.id === taskId);
    onNotify?.(`Tarea "${task?.title}" actualizada`, 'success');
  }, [setDailyTasks, dailyTasks, onNotify]);

  const handleDeleteDailyTask = useCallback((taskId: string) => {
    console.log('🗑️ Deleting daily task:', taskId);
    
    const task = dailyTasks.find(t => t.id === taskId);
    setDailyTasks(prev => prev.filter(t => t.id !== taskId));
    
    onNotify?.(`Tarea "${task?.title}" eliminada`, 'success');
  }, [setDailyTasks, dailyTasks, onNotify]);

  const handleToggleDailyTask = useCallback((taskId: string, value?: number) => {
    console.log('✅ Toggling daily task:', taskId, value);
    
    setDailyTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task;
      
      if (task.type === 'boolean') {
        const newCompleted = !task.completed;
        return {
          ...task,
          completed: newCompleted,
          streak: newCompleted ? (task.streak || 0) + 1 : task.streak,
          lastCompletedDate: newCompleted ? new Date().toISOString().split('T')[0] : task.lastCompletedDate,
          updatedAt: new Date().toISOString()
        };
      } else if (task.type === 'numeric' && value !== undefined) {
        return {
          ...task,
          current: value,
          updatedAt: new Date().toISOString()
        };
      } else if (task.type === 'subjective' && value !== undefined) {
        return {
          ...task,
          score0to1: value,
          updatedAt: new Date().toISOString()
        };
      }
      
      return task;
    }));
    
    const task = dailyTasks.find(t => t.id === taskId);
    onNotify?.(`Tarea "${task?.title}" actualizada`, 'success');
  }, [setDailyTasks, dailyTasks, onNotify]);

  // Export/Import Handlers
  const handleExportData = useCallback(() => {
    console.log('📤 Exporting data...');
    
    const exportData = {
      projects,
      folders,
      dailyTasks,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `planify-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    onNotify?.('Datos exportados exitosamente', 'success');
  }, [projects, folders, dailyTasks, onNotify]);

  const handleShareStats = useCallback(() => {
    console.log('📊 Sharing stats...');
    
    const stats = {
      totalProjects: projects.length,
      completedProjects: projects.filter(p => p.progress === 100).length,
      totalFolders: folders.length,
      totalDailyTasks: dailyTasks.length,
      completedDailyTasks: dailyTasks.filter(t => t.completed || (t.current && t.target && t.current >= t.target)).length,
      averageProgress: projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length || 0
    };
    
    const shareText = `🚀 Mi progreso en Planify:
📁 ${stats.totalFolders} carpetas organizadas
📋 ${stats.totalProjects} proyectos (${stats.completedProjects} completados)
✅ ${stats.completedDailyTasks}/${stats.totalDailyTasks} tareas diarias
📈 ${Math.round(stats.averageProgress)}% progreso promedio

¡Mantente productivo con Planify! 💪`;

    if (navigator.share) {
      navigator.share({
        title: 'Mi progreso en Planify',
        text: shareText
      });
    } else {
      navigator.clipboard.writeText(shareText);
      onNotify?.('Estadísticas copiadas al portapapeles', 'success');
    }
  }, [projects, folders, dailyTasks, onNotify]);

  return {
    // Project handlers
    handleEditProject,
    handleDeleteProject,
    handleDeleteProjectById,
    handleCustomizeProject,
    handleArchiveProject,
    handleAddTask,
    
    // Folder handlers
    handleEditFolder,
    handleEditFolderById,
    handleDeleteFolder,
    handleDeleteFolderById,
    handleCustomizeFolder,
    handleArchiveFolder,
    
    // Team management
    handleTeamUpdate,
    
    // Daily task handlers
    handleEditDailyTask,
    handleEditDailyTaskById,
    handleDeleteDailyTask,
    handleToggleDailyTask,
    
    // Export/Share handlers
    handleExportData,
    handleShareStats
  };
};