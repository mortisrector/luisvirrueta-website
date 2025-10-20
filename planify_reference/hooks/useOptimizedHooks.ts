// Hooks optimizados para reducir la duplicación de useState y lógica común
// Centraliza patrones repetitivos en la aplicación

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Project } from '../types';

// ===========================================
// HOOKS DE ESTADO OPTIMIZADOS
// ===========================================

/**
 * Hook para manejar estados booleanos con toggle optimizado
 * Reemplaza: useState(false) + función toggle
 */
export function useToggle(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => setValue(prev => !prev), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  
  return {
    value,
    toggle,
    setTrue,
    setFalse,
    setValue
  };
}

/**
 * Hook para manejar strings con reset optimizado
 * Reemplaza: useState('') + lógica de reset
 */
export function useInputState(initialValue: string = '') {
  const [value, setValue] = useState(initialValue);
  
  const reset = useCallback(() => setValue(initialValue), [initialValue]);
  const clear = useCallback(() => setValue(''), []);
  
  return {
    value,
    setValue,
    reset,
    clear
  };
}

/**
 * Hook para manejar arrays con operaciones optimizadas
 * Reemplaza: useState([]) + funciones de manipulación
 */
export function useArrayState<T>(initialValue: T[] = []) {
  const [items, setItems] = useState<T[]>(initialValue);
  
  const add = useCallback((item: T) => {
    setItems(prev => [...prev, item]);
  }, []);
  
  const remove = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  const removeById = useCallback((id: string | number, idKey: keyof T = 'id' as keyof T) => {
    setItems(prev => prev.filter(item => item[idKey] !== id));
  }, []);
  
  const update = useCallback((index: number, newItem: T) => {
    setItems(prev => prev.map((item, i) => i === index ? newItem : item));
  }, []);
  
  const clear = useCallback(() => setItems([]), []);
  const reset = useCallback(() => setItems(initialValue), [initialValue]);
  
  return {
    items,
    setItems,
    add,
    remove,
    removeById,
    update,
    clear,
    reset,
    count: items.length,
    isEmpty: items.length === 0
  };
}

/**
 * Hook para manejar estado de carga con manejo de errores
 * Reemplaza: useState(false) para loading + useState(null) para error
 */
export function useAsyncState<T = any>() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);
  
  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunction();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);
  
  return {
    isLoading,
    error,
    data,
    execute,
    reset
  };
}

// ===========================================
// HOOKS DE PROYECTO OPTIMIZADOS
// ===========================================

/**
 * Hook para buscar y manipular proyectos optimizado
 * Reemplaza las múltiples funciones getProject dispersas
 */
export function useProjectOperations(projects: Project[]) {
  const projectsMap = useMemo(() => {
    return new Map(projects.map(project => [project.id, project]));
  }, [projects]);
  
  const getProject = useCallback((id: string): Project | undefined => {
    return projectsMap.get(id);
  }, [projectsMap]);
  
  const getProjectsByFolder = useCallback((folderId: string): Project[] => {
    return projects.filter(project => project.folderId === folderId);
  }, [projects]);
  
  const getProjectsByBadge = useCallback((badge: Project['badge']): Project[] => {
    return projects.filter(project => project.badge === badge);
  }, [projects]);
  
  const getProjectProgress = useCallback((id: string): number => {
    const project = getProject(id);
    if (!project) return 0;
    return project.progress || 0;
  }, [getProject]);
  
  const searchProjects = useCallback((query: string): Project[] => {
    const lowercaseQuery = query.toLowerCase();
    return projects.filter(project => 
      project.title.toLowerCase().includes(lowercaseQuery) ||
      project.description?.toLowerCase().includes(lowercaseQuery)
    );
  }, [projects]);
  
  return {
    getProject,
    getProjectsByFolder,
    getProjectsByBadge,
    getProjectProgress,
    searchProjects,
    projectsCount: projects.length,
    projectsMap
  };
}

/**
 * Hook para manejar formularios con validación optimizada
 * Reemplaza múltiples useState para campos de formulario
 */
export function useFormState<T extends Record<string, any>>(
  initialState: T,
  validators?: Partial<Record<keyof T, (value: any) => string | null>>
) {
  const [values, setValues] = useState<T>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  
  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Validar si existe validator para este campo
    if (validators && validators[field]) {
      const error = validators[field]!(value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  }, [validators]);
  
  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);
  
  const reset = useCallback(() => {
    setValues(initialState);
    setErrors({});
    setTouched({});
  }, [initialState]);
  
  const validate = useCallback(() => {
    if (!validators) return true;
    
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;
    
    for (const field in validators) {
      const validator = validators[field];
      if (validator) {
        const error = validator(values[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }
    }
    
    setErrors(newErrors);
    return isValid;
  }, [validators, values]);
  
  const isFormValid = useMemo(() => {
    return Object.values(errors).every(error => !error);
  }, [errors]);
  
  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    reset,
    validate,
    isFormValid
  };
}

// ===========================================
// HOOKS DE UI OPTIMIZADOS
// ===========================================

/**
 * Hook para manejar modales con estado optimizado
 * Reemplaza múltiples useState para modales
 */
export function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  
  const open = useCallback((modalData?: any) => {
    setData(modalData || null);
    setIsOpen(true);
  }, []);
  
  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);
  
  return {
    isOpen,
    data,
    open,
    close
  };
}

/**
 * Hook para manejar contadores con límites
 * Reemplaza useState(0) + lógica de incremento/decremento
 */
export function useCounter(initialValue: number = 0, min?: number, max?: number) {
  const [count, setCount] = useState(initialValue);
  
  const increment = useCallback(() => {
    setCount(prev => {
      const newValue = prev + 1;
      return max !== undefined ? Math.min(newValue, max) : newValue;
    });
  }, [max]);
  
  const decrement = useCallback(() => {
    setCount(prev => {
      const newValue = prev - 1;
      return min !== undefined ? Math.max(newValue, min) : newValue;
    });
  }, [min]);
  
  const reset = useCallback(() => setCount(initialValue), [initialValue]);
  
  return {
    count,
    increment,
    decrement,
    reset,
    setCount
  };
}

export default {
  useToggle,
  useInputState,
  useArrayState,
  useAsyncState,
  useProjectOperations,
  useFormState,
  useModal,
  useCounter
};