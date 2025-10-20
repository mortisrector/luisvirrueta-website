'use client';

import { useState, useEffect, useCallback } from 'react';
import { Project, Folder, DailyTask } from '@/types';
import { UniversalDatabase } from '@/lib/database';
import { useGoogleDrive } from './useGoogleDrive';
import { useAuth } from './useAuth';

export function useUniversalData() {
  const { user } = useAuth();
  const { driveStatus, syncData, loadData } = useGoogleDrive();
  
  const [folders, setFolders] = useState<Folder[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastLocalChange, setLastLocalChange] = useState<Date | null>(null);

  // Cargar datos al inicializar
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);

        // Si el usuario está conectado a Google Drive, cargar desde ahí primero
        if (user?.driveConnected && driveStatus.isConnected) {
          console.log('🔄 Cargando datos desde Google Drive...');
          const driveResult = await loadData();
          
          if (driveResult.success && driveResult.data) {
            setFolders(driveResult.data.folders || []);
            setProjects(driveResult.data.projects || []);
            setTasks(driveResult.data.tasks || []);
            console.log('✅ Datos cargados desde Google Drive');
          } else {
            // Fallback a datos locales si falla Google Drive
            await loadLocalData();
          }
        } else {
          // Cargar datos locales si no hay conexión a Drive
          await loadLocalData();
        }
        
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback a datos locales en caso de error
        await loadLocalData();
      } finally {
        setIsLoading(false);
        setIsLoaded(true);
      }
    };

    const loadLocalData = async () => {
      console.log('📂 Cargando datos locales...');
      const [foldersData, projectsData, tasksData] = await Promise.all([
        UniversalDatabase.getFolders(),
        UniversalDatabase.getProjects(),
        UniversalDatabase.getTasks()
      ]);

      setFolders(foldersData);
      setProjects(projectsData);
      setTasks(tasksData);
      console.log('✅ Datos locales cargados');
    };

    if (user) {
      loadInitialData();
    }
  }, [user, driveStatus.isConnected, loadData]);

  // Función para sincronizar cambios con Google Drive
  const syncWithDrive = useCallback(async () => {
    if (!user?.driveConnected || !driveStatus.isConnected) {
      return;
    }

    try {
      const result = await syncData({
        folders,
        projects,
        tasks
      });

      if (result.success) {
        console.log('✅ Sincronización automática completada');
      } else if (result.requiresReauth) {
        console.log('⚠️ Se requiere reautenticación con Google Drive');
      }
    } catch (error) {
      console.error('Error en sincronización automática:', error);
    }
  }, [user, driveStatus.isConnected, folders, projects, tasks, syncData]);

  // Sincronización automática después de cambios locales
  useEffect(() => {
    if (lastLocalChange && user?.driveConnected) {
      const syncTimeout = setTimeout(() => {
        syncWithDrive();
      }, 2000); // Sincronizar 2 segundos después del último cambio

      return () => clearTimeout(syncTimeout);
    }
  }, [lastLocalChange, syncWithDrive, user]);

  // Funciones para actualizar datos con sincronización
  const updateFolders = async (newFolders: Folder[] | ((prev: Folder[]) => Folder[])) => {
    const updatedFolders = typeof newFolders === 'function' ? newFolders(folders) : newFolders;
    setFolders(updatedFolders);
    setLastLocalChange(new Date());
    
    // Guardar localmente primero (para respuesta inmediata)
    try {
      await UniversalDatabase.saveFolders(updatedFolders);
    } catch (error) {
      console.error('Error saving folders locally:', error);
    }
  };

  const updateProjects = async (newProjects: Project[] | ((prev: Project[]) => Project[])) => {
    const updatedProjects = typeof newProjects === 'function' ? newProjects(projects) : newProjects;
    setProjects(updatedProjects);
    setLastLocalChange(new Date());
    
    try {
      await UniversalDatabase.saveProjects(updatedProjects);
    } catch (error) {
      console.error('Error saving projects locally:', error);
    }
  };

  const updateTasks = async (newTasks: DailyTask[] | ((prev: DailyTask[]) => DailyTask[])) => {
    const updatedTasks = typeof newTasks === 'function' ? newTasks(tasks) : newTasks;
    setTasks(updatedTasks);
    setLastLocalChange(new Date());
    
    try {
      await UniversalDatabase.saveTasks(updatedTasks);
    } catch (error) {
      console.error('Error saving tasks locally:', error);
    }
  };

  // Funciones para manejo individual de elementos
  const addFolder = async (folder: Omit<Folder, 'id'>) => {
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name: folder.name || 'Nueva Carpeta',
      ...folder,
    };
    await updateFolders(prev => [...prev, newFolder]);
    return newFolder;
  };

  const updateFolder = async (id: string, updates: Partial<Folder>) => {
    await updateFolders(prev => 
      prev.map(folder => folder.id === id ? { ...folder, ...updates } : folder)
    );
  };

  const deleteFolder = async (id: string) => {
    await updateFolders(prev => prev.filter(folder => folder.id !== id));
    // También eliminar proyectos de esa carpeta
    await updateProjects(prev => prev.filter(project => project.folderId !== id));
  };

  const addProject = async (project: Omit<Project, 'id'>) => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      title: project.title || 'Nuevo Proyecto',
      progress: project.progress || 0,
      ...project,
    };
    await updateProjects(prev => [...prev, newProject]);
    return newProject;
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    await updateProjects(prev => 
      prev.map(project => project.id === id ? { ...project, ...updates } : project)
    );
  };

  const deleteProject = async (id: string) => {
    await updateProjects(prev => prev.filter(project => project.id !== id));
    // También eliminar tareas de ese proyecto
    await updateTasks(prev => prev.filter(task => task.projectId !== id));
  };

  const addTask = async (task: Omit<DailyTask, 'id'>) => {
    const newTask: DailyTask = {
      id: crypto.randomUUID(),
      title: task.title || 'Nueva Tarea',
      type: task.type || 'subjective',
      ...task,
    };
    await updateTasks(prev => [...prev, newTask]);
    return newTask;
  };

  const updateTask = async (id: string, updates: Partial<DailyTask>) => {
    await updateTasks(prev => 
      prev.map(task => task.id === id ? { ...task, ...updates } : task)
    );
  };

  const deleteTask = async (id: string) => {
    await updateTasks(prev => prev.filter(task => task.id !== id));
  };

  // Función para forzar sincronización manual
  const forceSyncWithDrive = async () => {
    if (!user?.driveConnected) {
      throw new Error('No conectado a Google Drive');
    }

    const result = await syncData({
      folders,
      projects,
      tasks
    });

    return result;
  };

  // Función para exportar datos (para backups)
  const exportData = () => {
    return {
      folders,
      projects,
      tasks,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
  };

  // Función para importar datos
  const importData = async (data: any) => {
    if (data.folders) setFolders(data.folders);
    if (data.projects) setProjects(data.projects);
    if (data.tasks) setTasks(data.tasks);
    
    // Guardar localmente
    await Promise.all([
      data.folders ? UniversalDatabase.saveFolders(data.folders) : Promise.resolve(),
      data.projects ? UniversalDatabase.saveProjects(data.projects) : Promise.resolve(),
      data.tasks ? UniversalDatabase.saveTasks(data.tasks) : Promise.resolve()
    ]);

    // Marcar para sincronización
    setLastLocalChange(new Date());
  };

  return {
    // Datos
    folders,
    projects,
    tasks,
    
    // Estados
    isLoading,
    isLoaded,
    driveStatus,
    
    // Funciones de actualización masiva
    updateFolders,
    updateProjects,
    updateTasks,
    
    // Funciones CRUD para folders
    addFolder,
    updateFolder,
    deleteFolder,
    
    // Funciones CRUD para projects
    addProject,
    updateProject,
    deleteProject,
    
    // Funciones CRUD para tasks
    addTask,
    updateTask,
    deleteTask,
    
    // Funciones de sincronización
    forceSyncWithDrive,
    syncWithDrive,
    
    // Funciones de importación/exportación
    exportData,
    importData
  };
}