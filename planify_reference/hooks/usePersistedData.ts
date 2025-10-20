'use client';

import { useState, useEffect } from 'react';
import { Project, Folder, DailyTask } from '@/types';
import { optimizedDailyTasks, getOptimizedProjectsWithProgress, getOptimizedFoldersWithProgress } from '@/lib/optimizedMockData';

const STORAGE_KEYS = {
  FOLDERS: 'krab_folders',
  PROJECTS: 'krab_projects', 
  TASKS: 'krab_tasks'
};

export function usePersistedData() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar datos al inicializar
  useEffect(() => {
    try {
      // Intentar cargar desde localStorage
      const savedFolders = localStorage.getItem(STORAGE_KEYS.FOLDERS);
      const savedProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      const savedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);

      if (savedFolders && savedProjects && savedTasks) {
        // Si hay datos guardados, usarlos
        setFolders(JSON.parse(savedFolders));
        setProjects(JSON.parse(savedProjects));
        setTasks(JSON.parse(savedTasks));
      } else {
        // Si no hay datos guardados, usar datos mock iniciales
        const initialFolders = getOptimizedFoldersWithProgress();
        const initialProjects = getOptimizedProjectsWithProgress();
        const initialTasks = optimizedDailyTasks;

        setFolders(initialFolders);
        setProjects(initialProjects);
        setTasks(initialTasks);

        // Guardar los datos iniciales
        localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(initialFolders));
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(initialProjects));
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(initialTasks));
      }
    } catch (error) {
      console.error('Error loading persisted data:', error);
      // Fallback a datos mock si hay error
      setFolders(getOptimizedFoldersWithProgress());
      setProjects(getOptimizedProjectsWithProgress());
      setTasks(optimizedDailyTasks);
    }
    
    setIsLoaded(true);
  }, []);

  // Funciones para actualizar y persistir folders
  const updateFolders = (newFolders: Folder[] | ((prev: Folder[]) => Folder[])) => {
    const updatedFolders = typeof newFolders === 'function' ? newFolders(folders) : newFolders;
    setFolders(updatedFolders);
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(updatedFolders));
  };

  // Funciones para actualizar y persistir projects
  const updateProjects = (newProjects: Project[] | ((prev: Project[]) => Project[])) => {
    const updatedProjects = typeof newProjects === 'function' ? newProjects(projects) : newProjects;
    setProjects(updatedProjects);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updatedProjects));
  };

  // Funciones para actualizar y persistir tasks
  const updateTasks = (newTasks: DailyTask[] | ((prev: DailyTask[]) => DailyTask[])) => {
    const updatedTasks = typeof newTasks === 'function' ? newTasks(tasks) : newTasks;
    setTasks(updatedTasks);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks));
  };

  // Función para reset completo (útil para desarrollo/testing)
  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEYS.FOLDERS);
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    
    const initialFolders = getOptimizedFoldersWithProgress();
    const initialProjects = getOptimizedProjectsWithProgress();
    const initialTasks = optimizedDailyTasks;

    setFolders(initialFolders);
    setProjects(initialProjects);
    setTasks(initialTasks);

    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(initialFolders));
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(initialProjects));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(initialTasks));
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

  // Función para importar datos (restore)
  const importData = (data: { folders: Folder[], projects: Project[], tasks: DailyTask[] }) => {
    updateFolders(data.folders);
    updateProjects(data.projects);
    updateTasks(data.tasks);
  };

  return {
    // Datos
    folders,
    projects,
    tasks,
    isLoaded,
    
    // Funciones de actualización
    updateFolders,
    updateProjects,
    updateTasks,
    
    // Utilidades
    resetAllData,
    exportData,
    importData
  };
}