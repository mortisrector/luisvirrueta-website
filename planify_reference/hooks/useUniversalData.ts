'use client';

import { useState, useEffect } from 'react';
import { Project, Folder, DailyTask } from '@/types';
import { UniversalDatabase } from '@/lib/database';

export function useUniversalData(isGuestMode: boolean = false, userId?: string) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Función para cargar datos de demo
  const loadDemoData = () => {
    const demoFolders: Folder[] = [
      {
        id: 'demo-folder-1',
        name: 'Proyectos Personales',
        colorScheme: 'electric-blue',
        icon: 'FolderOpen',
        projectIds: ['demo-project-1']
      },
      {
        id: 'demo-folder-2', 
        name: 'Trabajo',
        colorScheme: 'electric-green',
        icon: 'Briefcase',
        projectIds: ['demo-project-2']
      }
    ];

    const demoProjects: Project[] = [
      {
        id: 'demo-project-1',
        name: 'Aprender Next.js',
        title: 'Aprender Next.js',
        folder: 'demo-folder-1',
        status: 'active',
        progress: 65,
        colorScheme: 'electric-blue'
      },
      {
        id: 'demo-project-2',
        name: 'App de Productividad',
        title: 'App de Productividad',
        folder: 'demo-folder-2', 
        status: 'active',
        progress: 80,
        colorScheme: 'electric-green'
      }
    ];

    const demoTasks: DailyTask[] = [
      {
        id: 'demo-task-1',
        title: 'Hacer ejercicio',
        type: 'boolean',
        completed: false,
        streak: 3,
        target: 1,
        icon: '💪'
      },
      {
        id: 'demo-task-2',
        title: 'Leer 30 minutos',
        type: 'boolean', 
        completed: false,
        streak: 5,
        target: 1,
        icon: '📚'
      }
    ];

    setFolders(demoFolders);
    setProjects(demoProjects);
    setTasks(demoTasks);
  };

  // Cargar datos al inicializar
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Limpieza preventiva: si NO estamos en modo invitado, eliminar claves de demo/por defecto
        // para evitar que datos antiguos de sesiones previas vuelvan a aparecer ("phantom data").
        try {
          if (!isGuestMode) {
            const demoKeys = [
              'folders_guest', 'projects_guest', 'tasks_guest',
              'folders_default', 'projects_default', 'tasks_default'
            ];
            demoKeys.forEach(k => localStorage.removeItem(k));
          }
        } catch (purgeError) {
          console.warn('No se pudieron purgar claves de demo/localStorage:', purgeError);
        }

        // Primero intentar cargar desde localStorage para velocidad
        const storageKey = isGuestMode 
          ? 'folders_guest' 
          : userId 
            ? `folders_${userId}` 
            : 'folders_default';
        
        const projectsStorageKey = isGuestMode 
          ? 'projects_guest' 
          : userId 
            ? `projects_${userId}` 
            : 'projects_default';
            
        const tasksStorageKey = isGuestMode 
          ? 'tasks_guest' 
          : userId 
            ? `tasks_${userId}` 
            : 'tasks_default';

        let foldersData: Folder[] = [];
        let projectsData: Project[] = [];
        let tasksData: DailyTask[] = [];

        if (isGuestMode) {
          // Invitado: preferimos localStorage por velocidad y persistencia local del demo
          try {
            const savedFolders = localStorage.getItem(storageKey);
            const savedProjects = localStorage.getItem(projectsStorageKey);
            const savedTasks = localStorage.getItem(tasksStorageKey);
            
            if (savedFolders) {
              foldersData = JSON.parse(savedFolders);
              console.log('✅ [Guest] Folders desde localStorage:', foldersData.length);
            }
            if (savedProjects) {
              projectsData = JSON.parse(savedProjects);
              console.log('✅ [Guest] Projects desde localStorage:', projectsData.length);
            }
            if (savedTasks) {
              tasksData = JSON.parse(savedTasks);
              console.log('✅ [Guest] Tasks desde localStorage:', tasksData.length);
            }
          } catch (localStorageError) {
            console.error('Error loading from localStorage (guest):', localStorageError);
          }

          // Fallback a base de datos si todo está vacío
          if (foldersData.length === 0 && projectsData.length === 0 && tasksData.length === 0) {
            console.log('📡 [Guest] Fallback a base de datos...');
            const [dbFolders, dbProjects, dbTasks] = await Promise.all([
              UniversalDatabase.getFolders(),
              UniversalDatabase.getProjects(),
              UniversalDatabase.getTasks()
            ]);
            foldersData = dbFolders || [];
            projectsData = dbProjects || [];
            tasksData = dbTasks || [];
          }
        } else {
          // Usuario autenticado: el servidor es la fuente de la verdad
          console.log('📡 [Auth] Cargando primero desde base de datos...');
          const [dbFolders, dbProjects, dbTasks] = await Promise.all([
            UniversalDatabase.getFolders(),
            UniversalDatabase.getProjects(),
            UniversalDatabase.getTasks()
          ]);
          foldersData = dbFolders || [];
          projectsData = dbProjects || [];
          tasksData = dbTasks || [];

          // Espejar SIEMPRE en localStorage para mantener consistencia y eliminar fantasma
          try {
            localStorage.setItem(storageKey, JSON.stringify(foldersData));
            localStorage.setItem(projectsStorageKey, JSON.stringify(projectsData));
            localStorage.setItem(tasksStorageKey, JSON.stringify(tasksData));
            console.log('💾 [Auth] Sincronizado localStorage desde DB');
          } catch (syncErr) {
            console.warn('No se pudo sincronizar localStorage desde DB:', syncErr);
          }

          // Si DB devolvió vacío y LOCAL tenía datos antiguos, ya quedaron sobrescritos con [] arriba
          // Si DB devolvió datos, ahora localStorage refleja exactamente el servidor
        }

        setFolders(foldersData);
        setProjects(projectsData);
        setTasks(tasksData);
        
        // Si no hay datos y estamos en modo invitado, cargar datos de demo (opt-in solo en guest)
        if (
          isGuestMode &&
          foldersData.length === 0 &&
          projectsData.length === 0 &&
          tasksData.length === 0
        ) {
          console.log('🎯 Cargando datos de demo (solo modo invitado)');
          loadDemoData();
        }
        
      } catch (error) {
        console.error('Error loading universal data:', error);
      } finally {
        setIsLoading(false);
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  // Funciones para actualizar y persistir folders
  const updateFolders = async (newFolders: Folder[] | ((prev: Folder[]) => Folder[])) => {
    const updatedFolders = typeof newFolders === 'function' ? newFolders(folders) : newFolders;
    setFolders(updatedFolders);
    
    // 1. SIEMPRE guardar en localStorage para velocidad (ambos modos)
    try {
      const storageKey = isGuestMode 
        ? 'folders_guest' 
        : userId 
          ? `folders_${userId}` 
          : 'folders_default';
      console.log(`💾 [1/3] Guardando folders en localStorage (${isGuestMode ? 'modo invitado' : `usuario: ${userId}`})`);
      localStorage.setItem(storageKey, JSON.stringify(updatedFolders));
    } catch (error) {
      console.error('❌ Error saving folders to localStorage:', error);
    }
    
    // 2. Guardar en archivos JSON locales (backup primario)
    try {
      console.log('💾 [2/3] Guardando folders en archivos JSON locales');
      const response = await fetch('/api/data/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFolders)
      });
      if (response.ok) {
        console.log('✅ Folders guardadas en JSON local');
      }
    } catch (error) {
      console.error('❌ Error saving folders to local JSON:', error);
    }
    
    // 3. TAMBIÉN guardar en Google Drive si está conectado
    try {
      console.log('💾 [3/3] Intentando guardar en Google Drive');
      await UniversalDatabase.saveFolders(updatedFolders);
    } catch (error) {
      console.error('⚠️ Error saving folders to Google Drive (usando backup local):', error);
    }
  };

  // Funciones para actualizar y persistir projects
  const updateProjects = async (newProjects: Project[] | ((prev: Project[]) => Project[])) => {
    const updatedProjects = typeof newProjects === 'function' ? newProjects(projects) : newProjects;
    setProjects(updatedProjects);
    
    // 1. SIEMPRE guardar en localStorage para velocidad
    try {
      const storageKey = isGuestMode 
        ? 'projects_guest' 
        : userId 
          ? `projects_${userId}` 
          : 'projects_default';
      console.log(`💾 [1/3] Guardando projects en localStorage`);
      localStorage.setItem(storageKey, JSON.stringify(updatedProjects));
    } catch (error) {
      console.error('❌ Error saving projects to localStorage:', error);
    }
    
    // 2. Guardar en archivos JSON locales (backup primario)
    try {
      console.log('💾 [2/3] Guardando projects en archivos JSON locales');
      const response = await fetch('/api/data/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProjects)
      });
      if (response.ok) {
        console.log('✅ Projects guardados en JSON local');
      }
    } catch (error) {
      console.error('❌ Error saving projects to local JSON:', error);
    }
    
    // 3. TAMBIÉN guardar en Google Drive si está conectado
    try {
      console.log('💾 [3/3] Intentando guardar en Google Drive');
      await UniversalDatabase.saveProjects(updatedProjects);
    } catch (error) {
      console.error('⚠️ Error saving projects to Google Drive (usando backup local):', error);
    }
  };

  // Funciones para actualizar y persistir tasks
  const updateTasks = async (newTasks: DailyTask[] | ((prev: DailyTask[]) => DailyTask[])) => {
    const updatedTasks = typeof newTasks === 'function' ? newTasks(tasks) : newTasks;
    setTasks(updatedTasks);
    
    // 1. SIEMPRE guardar en localStorage para velocidad
    try {
      const storageKey = isGuestMode 
        ? 'tasks_guest' 
        : userId 
          ? `tasks_${userId}` 
          : 'tasks_default';
      console.log(`💾 [1/3] Guardando tasks en localStorage`);
      localStorage.setItem(storageKey, JSON.stringify(updatedTasks));
    } catch (error) {
      console.error('❌ Error saving tasks to localStorage:', error);
    }
    
    // 2. Guardar en archivos JSON locales (backup primario)
    try {
      console.log('💾 [2/3] Guardando tasks en archivos JSON locales');
      const response = await fetch('/api/data/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTasks)
      });
      if (response.ok) {
        console.log('✅ Tasks guardadas en JSON local');
      }
    } catch (error) {
      console.error('❌ Error saving tasks to local JSON:', error);
    }
    
    // 3. TAMBIÉN guardar en Google Drive si está conectado
    try {
      console.log('💾 [3/3] Intentando guardar en Google Drive');
      await UniversalDatabase.saveTasks(updatedTasks);
    } catch (error) {
      console.error('⚠️ Error saving tasks to Google Drive (usando backup local):', error);
    }
  };

  // Función para recargar datos desde la base de datos
  const reloadData = async () => {
    setIsLoading(true);
    try {
      // SIEMPRE cargar de localStorage para velocidad (ambos modos)
      const getStorageKey = (base: string) => {
        if (isGuestMode) {
          return `${base}_guest`;
        }
        return userId ? `${base}_${userId}` : `${base}_default`;
      };

      const storageKeys = {
        folders: getStorageKey('folders'),
        projects: getStorageKey('projects'),
        tasks: getStorageKey('tasks')
      };

      console.log(`💾 Cargando datos de localStorage (${isGuestMode ? 'modo invitado' : `usuario: ${userId}`})`);
      
      const savedFolders = localStorage.getItem(storageKeys.folders);
      const savedProjects = localStorage.getItem(storageKeys.projects);
      const savedTasks = localStorage.getItem(storageKeys.tasks);

      setFolders(savedFolders ? JSON.parse(savedFolders) : []);
      setProjects(savedProjects ? JSON.parse(savedProjects) : []);
      setTasks(savedTasks ? JSON.parse(savedTasks) : []);

      // Google Drive solo se usará para crear/restaurar backups, no para carga diaria
    } catch (error) {
      console.error('Error reloading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para exportar datos (backup)
  const exportData = () => {
    return {
      folders,
      projects,
      tasks,
      exportDate: new Date().toISOString()
    };
  };

  // Función ESPECÍFICA para crear backup en Google Drive (solo usuarios registrados)
  const createGoogleDriveBackup = async (): Promise<boolean> => {
    if (isGuestMode) {
      console.warn('⚠️ Backup a Google Drive no disponible en modo invitado');
      return false;
    }

    try {
      console.log('☁️ Creando backup en Google Drive...');
      await Promise.all([
        UniversalDatabase.saveFolders(folders),
        UniversalDatabase.saveProjects(projects),
        UniversalDatabase.saveTasks(tasks)
      ]);
      console.log('✅ Backup creado exitosamente en Google Drive');
      return true;
    } catch (error) {
      console.error('❌ Error creando backup en Google Drive:', error);
      return false;
    }
  };

  // Función para restaurar backup desde Google Drive (solo usuarios registrados)
  const restoreFromGoogleDriveBackup = async (): Promise<boolean> => {
    if (isGuestMode) {
      console.warn('⚠️ Restauración desde Google Drive no disponible en modo invitado');
      return false;
    }

    try {
      console.log('☁️ Restaurando backup desde Google Drive...');
      const [foldersData, projectsData, tasksData] = await Promise.all([
        UniversalDatabase.getFolders(),
        UniversalDatabase.getProjects(),
        UniversalDatabase.getTasks()
      ]);

      // Actualizar datos locales con los del backup
      setFolders(foldersData);
      setProjects(projectsData);
      setTasks(tasksData);

      // También guardar en localStorage para velocidad futura
      const getStorageKey = (base: string) => {
        return userId ? `${base}_${userId}` : `${base}_default`;
      };

      const storageKeys = {
        folders: getStorageKey('folders'),
        projects: getStorageKey('projects'), 
        tasks: getStorageKey('tasks')
      };

      localStorage.setItem(storageKeys.folders, JSON.stringify(foldersData));
      localStorage.setItem(storageKeys.projects, JSON.stringify(projectsData));
      localStorage.setItem(storageKeys.tasks, JSON.stringify(tasksData));

      console.log('✅ Backup restaurado exitosamente desde Google Drive');
      return true;
    } catch (error) {
      console.error('❌ Error restaurando backup desde Google Drive:', error);
      return false;
    }
  };

  // Función para importar datos (restore)
  const importData = async (data: { folders: Folder[], projects: Project[], tasks: DailyTask[] }): Promise<boolean> => {
    try {
      await updateFolders(data.folders);
      await updateProjects(data.projects);
      await updateTasks(data.tasks);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  };

  return {
    // Datos
    folders,
    projects,
    tasks,
    isLoaded,
    isLoading,
    
    // Funciones de actualización
    updateFolders,
    updateProjects,
    updateTasks,
    
    // Utilidades
    reloadData,
    exportData,
    importData,
    
    // Google Drive específico (solo usuarios registrados)
    createGoogleDriveBackup,
    restoreFromGoogleDriveBackup
  };
}