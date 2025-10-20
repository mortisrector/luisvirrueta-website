'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Hash, Star, X, ArrowLeft, RotateCcw, Folder, FolderPlus, FolderOpen, Plus, Target, Zap, Calendar, Timer, ChevronDown, Save, Clock } from 'lucide-react';
import { capitalizeFirst } from '@/utils/textUtils';

type TaskType = 'boolean' | 'numeric' | 'subjective';

export interface QuickProjectTask {
  title: string;
  description?: string;
  type: TaskType;
  priority?: 'baja' | 'media' | 'alta';
  target?: number;
  unit?: string;
  dueDate?: string;
  dueTime?: string;
  estimatedDuration?: number;
}

interface Folder {
  id: string;
  name: string;
  icon: string;
  colorScheme: string;
}

interface Project {
  id: string;
  name: string;
  folderId?: string;
  folderName?: string;
}

interface QuickProjectCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (projectData: {
    name: string;
    folderId: string;
    folderName?: string;
    tasks: QuickProjectTask[];
  }) => void;
  existingFolders: Folder[];
  onCreateDailyTask?: (taskData: any) => void;
  existingProjects?: Project[];
}

const TYPE_ICONS: Record<TaskType, any> = {
  boolean: CheckCircle2,
  numeric: Hash,
  subjective: Star
};

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const getCurrentTime = () => {
  const now = new Date();
  return now.toTimeString().slice(0, 5);
};

type Line = { 
  id: string; 
  text: string; 
  type: TaskType; 
  target?: number; 
  unit?: string;
  dueDate?: string;
  dueTime?: string;
  dueDateEnabled?: boolean;
  durationEnabled?: boolean;
  durationMinutes?: number;
  durationHours?: number;
  durationDays?: number;
  durationMonths?: number;
  durationYears?: number;
  showAdvancedDuration?: boolean;
};

export default function QuickProjectCreator({
  isOpen,
  onClose,
  onCreateProject,
  existingFolders,
  onCreateDailyTask,
  existingProjects = [],
}: QuickProjectCreatorProps) {
  const [projectName, setProjectName] = useState('');
  const [lines, setLines] = useState<Line[]>([{ 
    id: crypto.randomUUID(), 
    text: '', 
    type: 'boolean',
    dueDateEnabled: false,
    durationEnabled: false
  }]);
  
  // Modo de destino: 'project' para anexar a proyecto existente, 'folder' para crear nuevo
  const [destinationMode, setDestinationMode] = useState<'project' | 'folder'>('folder');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  // UX mejorado: selector por botones
  const [existingFolderFilter, setExistingFolderFilter] = useState<string>('');
  const [newFolderMode, setNewFolderMode] = useState<boolean>(false);
  const [confirmReset, setConfirmReset] = useState(false);
  
  // Control de flujo de 2 páginas
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      console.log('🎨 QuickProjectCreator: Abriendo modal, reseteando estado');
      setProjectName('');
      setLines([{ 
        id: crypto.randomUUID(), 
        text: '', 
        type: 'boolean',
        dueDateEnabled: false,
        durationEnabled: false
      }]);
      setDestinationMode('folder');
      setSelectedFolderId('');
      setNewFolderName('');
      setSelectedProjectId('');
      setExistingFolderFilter('');
      setNewFolderMode(false);
      setConfirmReset(false);
      setCurrentStep(1); // Siempre empezar en página 1
      
      setTimeout(() => {
        const firstTextarea = containerRef.current?.querySelector('textarea');
        if (firstTextarea) {
          (firstTextarea as HTMLTextAreaElement).focus();
        }
      }, 100);
    } else {
      console.log('🎨 QuickProjectCreator: Cerrando modal');
    }
  }, [isOpen]);

  // Smart defaults: preseleccionar carpeta/proyecto cuando aplique
  useEffect(() => {
    if (!isOpen) return;
    if (destinationMode === 'project' && existingProjects.length > 0) {
      // Si no hay carpeta elegida, usar la del primer proyecto
      if (!existingFolderFilter) {
        const firstWithFolder = existingProjects.find(p => !!p.folderId);
        if (firstWithFolder?.folderId) setExistingFolderFilter(firstWithFolder.folderId);
      } else {
        // Si hay solo un proyecto en esa carpeta, autoseleccionarlo
        const candidates = existingProjects.filter(p => p.folderId === existingFolderFilter);
        if (candidates.length === 1 && !selectedProjectId) {
          setSelectedProjectId(candidates[0].id);
        }
      }
    }
  }, [isOpen, destinationMode, existingProjects, existingFolderFilter, selectedProjectId]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if ((e.ctrlKey || (e as any).metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  if (!isOpen) return null;

  const autoGrow = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const setLineText = (id: string, text: string) => {
    const capitalizedText = text.length > 0 
      ? text.charAt(0).toUpperCase() + text.slice(1)
      : text;
    setLines(prev => prev.map(l => (l.id === id ? { ...l, text: capitalizedText } : l)));
  };

  const setLineType = (id: string, type: TaskType) => {
    setLines(prev => prev.map(l => (l.id === id ? { ...l, type } : l)));
  };

  const setLineTarget = (id: string, target: number | undefined) => {
    setLines(prev => prev.map(l => (l.id === id ? { ...l, target } : l)));
  };

  const setLineUnit = (id: string, unit: string | undefined) => {
    setLines(prev => prev.map(l => (l.id === id ? { ...l, unit } : l)));
  };

  const addLineAfter = (id: string) => {
    const newLine: Line = { 
      id: crypto.randomUUID(), 
      text: '', 
      type: 'boolean',
      dueDateEnabled: false,
      durationEnabled: false
    };
    setLines(prev => {
      const idx = prev.findIndex(l => l.id === id);
      return [...prev.slice(0, idx + 1), newLine, ...prev.slice(idx + 1)];
    });
    
    setTimeout(() => {
      const textareas = containerRef.current?.querySelectorAll('textarea');
      const targetIdx = lines.findIndex(l => l.id === id) + 1;
      if (textareas && textareas[targetIdx]) {
        const targetTextarea = textareas[targetIdx] as HTMLTextAreaElement;
        targetTextarea.focus();
        
        // Scroll suave hacia el elemento activo
        try {
          const card = targetTextarea?.closest('.rounded-2xl');
          if (card && typeof (card as any).scrollIntoView === 'function') {
            (card as HTMLElement).scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center', // Centrar verticalmente para mejor visibilidad
              inline: 'nearest' 
            });
          }
        } catch (err) {
          // Silenciar error de scroll en caso de que el elemento no esté disponible
        }
      }
    }, 50);
  };

  const removeLine = (id: string, focusPrevious: boolean = false) => {
    if (lines.length === 1) return;
    
    const currentIdx = lines.findIndex(l => l.id === id);
    setLines(prev => prev.filter(l => l.id !== id));
    
    // Si se solicita, enfocar el textarea anterior
    if (focusPrevious && currentIdx > 0) {
      setTimeout(() => {
        const textareas = containerRef.current?.querySelectorAll('textarea');
        if (textareas && textareas[currentIdx - 1]) {
          const prevTextarea = textareas[currentIdx - 1] as HTMLTextAreaElement;
          prevTextarea.focus();
          // Posicionar cursor al final
          prevTextarea.selectionStart = prevTextarea.value.length;
          prevTextarea.selectionEnd = prevTextarea.value.length;
          
          // Scroll suave hacia la línea anterior
          try {
            const card = prevTextarea?.closest('.rounded-2xl');
            if (card && typeof (card as any).scrollIntoView === 'function') {
              (card as HTMLElement).scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'nearest' 
              });
            }
          } catch (err) {
            // Silenciar error de scroll en caso de que el elemento no esté disponible
          }
        }
      }, 50);
    }
  };

  const toggleDueDate = (id: string) => {
    setLines(prev => prev.map(l => 
      l.id === id ? { 
        ...l, 
        dueDateEnabled: !l.dueDateEnabled,
        dueDate: !l.dueDateEnabled ? getTodayDate() : l.dueDate,
        dueTime: !l.dueDateEnabled ? getCurrentTime() : l.dueTime
      } : l
    ));
  };

  const setLineDueDate = (id: string, dueDate: string | undefined) => {
    setLines(prev => prev.map(l => 
      l.id === id ? { ...l, dueDate } : l
    ));
  };

  const setLineDueTime = (id: string, dueTime: string | undefined) => {
    setLines(prev => prev.map(l => 
      l.id === id ? { ...l, dueTime } : l
    ));
  };

  const toggleDuration = (id: string) => {
    setLines(prev => prev.map(l => 
      l.id === id ? { ...l, durationEnabled: !l.durationEnabled } : l
    ));
  };

  const setLineDuration = (id: string, minutes: number, hours: number, days: number, months: number, years: number) => {
    setLines(prev => prev.map(l => 
      l.id === id ? { 
        ...l, 
        durationMinutes: minutes,
        durationHours: hours,
        durationDays: days,
        durationMonths: months,
        durationYears: years
      } : l
    ));
  };

  const toggleAdvancedDuration = (id: string) => {
    setLines(prev => prev.map(l => 
      l.id === id ? { ...l, showAdvancedDuration: !l.showAdvancedDuration } : l
    ));
  };

  const parseLineContent = (text: string) => {
    let dashIndex = text.indexOf(' - ');
    let spacedDash = true;
    
    if (dashIndex === -1) {
      dashIndex = text.indexOf('-');
      spacedDash = false;
    }
    
    if (dashIndex > 0) {
      const title = text.substring(0, dashIndex).trim();
      let description = '';
      
      if (spacedDash) {
        description = text.substring(dashIndex + 3).trim();
      } else {
        description = text.substring(dashIndex + 1).trim();
      }
      
      return { title, description };
    }
    
    return { title: text.trim(), description: '' };
  };

  const parseTasks = (): QuickProjectTask[] => {
    const filteredLines = lines.filter(line => line.text.trim().length > 0);
    
    const tasks = filteredLines.map(line => {
        const parsed = parseLineContent(line.text);
        
        const task: QuickProjectTask = {
          title: parsed.title,
          description: parsed.description || undefined,
          type: line.type,
          priority: 'media'
        };
        
        if (line.type === 'numeric') {
          if (line.target !== undefined) task.target = line.target;
          if (line.unit) task.unit = line.unit;
        }
        
        if (line.dueDateEnabled) {
          if (line.dueDate) task.dueDate = line.dueDate;
          if (line.dueTime) task.dueTime = line.dueTime;
        }
        
        if (line.durationEnabled) {
          const minutes = line.durationMinutes || 0;
          const hours = line.durationHours || 0;
          const days = line.durationDays || 0;
          const months = line.durationMonths || 0;
          const years = line.durationYears || 0;
          
          const totalSeconds = 
            (minutes * 60) + 
            (hours * 3600) + 
            (days * 86400) + 
            (months * 2592000) + 
            (years * 31536000);
          
          if (totalSeconds > 0) {
            task.estimatedDuration = totalSeconds;
          }
        }
        
        return task;
      });
      
    return tasks;
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
    } else {
      setProjectName('');
      setLines([{ 
        id: crypto.randomUUID(), 
        text: '', 
        type: 'boolean',
        dueDateEnabled: false,
        durationEnabled: false
      }]);
      setConfirmReset(false);
    }
  };

  const handleSave = () => {
    const tasks = parseTasks();
    
    if (destinationMode === 'project') {
      if (!selectedProjectId) return;
      if (!onCreateDailyTask) return;
      
      console.log('💾 QuickProject: Guardando tareas en proyecto existente', {
        projectId: selectedProjectId,
        tasksCount: tasks.length
      });
      
      tasks.forEach((t) => {
        onCreateDailyTask({
          title: t.title,
          description: t.description,
          type: t.type,
          projectId: selectedProjectId,
          target: t.target,
          unit: t.unit,
          dueDate: t.dueDate,
          dueTime: t.dueTime,
          estimatedDuration: t.estimatedDuration,
          priority: t.priority || 'media',
        });
      });
      
      // Pequeño delay antes de cerrar para asegurar que las tareas se guarden
      setTimeout(() => {
        onClose();
      }, 100);
      return;
    }

    // destinationMode === 'folder'
    if (!projectName.trim()) return;
    
    console.log('💾 QuickProject: Creando nuevo proyecto', {
      name: projectName,
      folderId: selectedFolderId,
      tasksCount: tasks.length
    });
    
    if (selectedFolderId === 'new' && newFolderName.trim()) {
      onCreateProject({
        name: projectName,
        folderId: 'new',
        folderName: newFolderName,
        tasks
      });
      
      // Pequeño delay antes de cerrar para asegurar que el proyecto se cree
      setTimeout(() => {
        onClose();
      }, 150);
      return;
    } else if (selectedFolderId && selectedFolderId !== 'new') {
      onCreateProject({
        name: projectName,
        folderId: selectedFolderId,
        tasks
      });
      
      // Pequeño delay antes de cerrar para asegurar que el proyecto se cree
      setTimeout(() => {
        onClose();
      }, 150);
      return;
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 animate-in fade-in duration-300">
      {/* Overlay con efecto de cristal y animación */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-3xl animate-in fade-in duration-500"></div>
      
      {/* Patrón de fondo sutil */}
      <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
      
      <div className="absolute inset-0 flex flex-col animate-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Premium */}
        <div className="relative flex flex-col items-center justify-center pt-10 pb-6">
          {/* Icono principal con glow effect */}
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 flex items-center justify-center mb-5 shadow-2xl shadow-purple-500/50">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-400 to-purple-500 blur-xl opacity-50"></div>
            <Zap className="w-9 h-9 text-white relative z-10" />
          </div>
          
          <h1 className="text-white font-bold text-2xl mb-1 tracking-tight">Quick Project</h1>
          <p className="text-white/50 text-sm">
            Crea tareas rápidamente
          </p>
          
          {/* Botones flotantes en esquina superior derecha */}
          <div className="absolute top-6 right-6 flex items-center gap-2">
            <button 
              onClick={handleReset}
              className={`w-10 h-10 rounded-xl backdrop-blur-md border flex items-center justify-center transition-all duration-300 ${
                confirmReset 
                  ? 'bg-red-500/30 text-red-200 border-red-400/50 hover:bg-red-500/40 scale-105' 
                  : 'bg-white/5 text-white/60 border-white/10 hover:text-white hover:bg-white/10 hover:border-white/20'
              }`}
              title={confirmReset ? "¿Confirmar reseteo?" : "Limpiar todo"}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content - 2 páginas */}
        <div className="flex-1 px-6 pb-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20 scroll-smooth">
          
          {currentStep === 1 ? (
            <> 
              {/* ===== PÁGINA 1: CREAR TAREAS ===== */}
              {/* Project Name Premium */}
              <div className="mb-6">
                <div className="relative group">
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(capitalizeFirst(e.target.value))}
                    placeholder="Nombre del proyecto..."
                    className="w-full bg-white/5 backdrop-blur-md border border-white/10 text-white placeholder-white/30 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300 text-base font-medium"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-purple-500/0 group-focus-within:from-purple-500/10 group-focus-within:via-pink-500/10 group-focus-within:to-purple-500/10 pointer-events-none transition-all duration-500"></div>
                </div>
              </div>

          <div ref={containerRef} className="flex flex-col justify-start space-y-3">
            
            {lines.map((line, idx) => {
              const IconBoolean = TYPE_ICONS.boolean;
              const IconNumeric = TYPE_ICONS.numeric;
              const IconSubjective = TYPE_ICONS.subjective;
              
              const showIcons = true; // Siempre mostrar controles
              
              return (
                <div key={line.id} className="rounded-2xl transition-all duration-300 backdrop-blur-md relative group bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-purple-500/10">
                  
                  <button
                    onClick={() => removeLine(line.id, false)}
                    className="absolute top-3 right-3 w-7 h-7 rounded-xl bg-white/3 hover:bg-red-500/15 border border-white/8 hover:border-red-400/20 flex items-center justify-center text-white/30 hover:text-red-300 transition-all duration-300 z-10 opacity-100 hover:scale-110 shadow-sm"
                    title="Eliminar tarea"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  
                  <div className="p-4">
                    <textarea
                      rows={1}
                      value={line.text}
                      onChange={e => setLineText(line.id, e.target.value)}
                      onInput={e => autoGrow(e.currentTarget)}
                      onFocus={e => {
                        // Scroll suave cuando se enfoca (especialmente útil en móviles)
                        setTimeout(() => {
                          try {
                            const card = e.currentTarget?.closest('.rounded-2xl');
                            if (card && typeof (card as any).scrollIntoView === 'function') {
                              (card as HTMLElement).scrollIntoView({ 
                                behavior: 'smooth', 
                                block: 'center',
                                inline: 'nearest' 
                              });
                            }
                          } catch (err) {
                            // Silenciar error de scroll en caso de que el elemento no esté disponible
                          }
                        }, 100); // Delay para esperar que el teclado móvil se abra
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          addLineAfter(line.id);
                        }
                        if (e.key === 'Backspace' && line.text.length === 0 && lines.length > 1) {
                          e.preventDefault();
                          removeLine(line.id, true); // true = enfocar línea anterior
                        }
                      }}
                      placeholder={lines.length === 1 && idx === 0 ? "Escribe tu primera tarea..." : "Escribe una tarea..."}
                      className="w-full resize-none bg-transparent text-white text-lg leading-snug placeholder-white/40 px-0 py-0 focus:outline-none border-none flex items-center font-normal"
                      style={{ minHeight: '28px', height: '28px' }}
                    />
                  
                  {showIcons && (
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
                      <span className="text-white/50 text-xs uppercase tracking-wider font-semibold mr-1">Tipo</span>
                      <button title="Completar" onClick={() => setLineType(line.id, 'boolean')} className={`p-2 rounded-xl transition-all duration-200 ${line.type==='boolean'?'bg-gradient-to-br from-emerald-500/30 to-teal-500/30 text-emerald-200 scale-105 shadow-lg shadow-emerald-500/20':'text-white/50 hover:text-white hover:bg-white/10'}`}>
                        <IconBoolean className="w-4 h-4" />
                      </button>
                      <button title="Meta" onClick={() => setLineType(line.id, 'numeric')} className={`p-2 rounded-xl transition-all duration-200 ${line.type==='numeric'?'bg-gradient-to-br from-indigo-500/30 to-blue-500/30 text-indigo-200 scale-105 shadow-lg shadow-indigo-500/20':'text-white/50 hover:text-white hover:bg-white/10'}`}>
                        <IconNumeric className="w-4 h-4" />
                      </button>
                      <button title="Valorar" onClick={() => setLineType(line.id, 'subjective')} className={`p-2 rounded-xl transition-all duration-200 ${line.type==='subjective'?'bg-gradient-to-br from-rose-500/30 to-pink-500/30 text-rose-200 scale-105 shadow-lg shadow-rose-500/20':'text-white/50 hover:text-white hover:bg-white/10'}`}>
                        <IconSubjective className="w-4 h-4" />
                      </button>
                      
                      <div className="ml-3 flex items-center gap-2">
                        <span className="text-white/50 text-xs uppercase tracking-wider font-semibold mr-1">Tiempo</span>
                        <button 
                          title={line.dueDateEnabled ? 'Quitar fecha' : 'Fecha límite'} 
                          onClick={() => toggleDueDate(line.id)} 
                          className={`p-2 rounded-xl transition-all duration-200 ${
                            line.dueDateEnabled
                              ? 'bg-gradient-to-br from-amber-500/30 to-orange-500/30 text-amber-200 scale-105 shadow-lg shadow-amber-500/20'
                              : 'text-white/50 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                        
                        <button 
                          title={line.durationEnabled ? 'Quitar duración' : 'Estimar tiempo'} 
                          onClick={() => toggleDuration(line.id)} 
                          className={`p-2 rounded-xl transition-all duration-200 ${
                            line.durationEnabled
                              ? 'bg-gradient-to-br from-cyan-500/30 to-blue-500/30 text-cyan-200 scale-105 shadow-lg shadow-cyan-500/20'
                              : 'text-white/50 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <Timer className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {showIcons && line.dueDateEnabled && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-amber-300/70" />
                        <input
                          type="date"
                          value={line.dueDate || getTodayDate()}
                          onChange={(e) => setLineDueDate(line.id, e.target.value || undefined)}
                          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all"
                        />
                        <Clock className="w-4 h-4 text-amber-300/70" />
                        <input
                          type="time"
                          value={line.dueTime || getCurrentTime()}
                          onChange={(e) => setLineDueTime(line.id, e.target.value || undefined)}
                          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {showIcons && line.durationEnabled && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Timer className="w-4 h-4 text-cyan-300/70" />
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max="59"
                            value={line.durationMinutes ?? ''}
                            onChange={(e) => setLineDuration(
                              line.id, 
                              e.target.value === '' ? 0 : parseInt(e.target.value) || 0, 
                              line.durationHours || 0, 
                              line.durationDays || 0,
                              line.durationMonths || 0,
                              line.durationYears || 0
                            )}
                            onFocus={(e) => e.target.select()}
                            placeholder="0"
                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 w-16 transition-all"
                          />
                          <span className="text-white/50 text-xs font-medium">min</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max="23"
                            value={line.durationHours ?? ''}
                            onChange={(e) => setLineDuration(
                              line.id, 
                              line.durationMinutes || 0, 
                              e.target.value === '' ? 0 : parseInt(e.target.value) || 0, 
                              line.durationDays || 0,
                              line.durationMonths || 0,
                              line.durationYears || 0
                            )}
                            onFocus={(e) => e.target.select()}
                            placeholder="0"
                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 w-16 transition-all"
                          />
                          <span className="text-white/50 text-xs font-medium">hrs</span>
                        </div>
                        
                        <button
                          onClick={() => toggleAdvancedDuration(line.id)}
                          className={`p-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                            line.showAdvancedDuration
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                              : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/10'
                          }`}
                          title={line.showAdvancedDuration ? 'Menos opciones' : 'Más opciones'}
                        >
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${line.showAdvancedDuration ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                      
                      {line.showAdvancedDuration && (
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              value={line.durationDays ?? ''}
                              onChange={(e) => setLineDuration(
                                line.id, 
                                line.durationMinutes || 0, 
                                line.durationHours || 0, 
                                e.target.value === '' ? 0 : parseInt(e.target.value) || 0,
                                line.durationMonths || 0,
                                line.durationYears || 0
                              )}
                              onFocus={(e) => e.target.select()}
                              placeholder="0"
                              className="bg-white/5 border border-white/20 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 w-16"
                            />
                            <span className="text-white/70 text-xs">días</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              max="11"
                              value={line.durationMonths ?? ''}
                              onChange={(e) => setLineDuration(
                                line.id, 
                                line.durationMinutes || 0, 
                                line.durationHours || 0, 
                                line.durationDays || 0,
                                e.target.value === '' ? 0 : parseInt(e.target.value) || 0,
                                line.durationYears || 0
                              )}
                              onFocus={(e) => e.target.select()}
                              placeholder="0"
                              className="bg-white/5 border border-white/20 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 w-16"
                            />
                            <span className="text-white/70 text-xs">meses</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              value={line.durationYears ?? ''}
                              onChange={(e) => setLineDuration(
                                line.id, 
                                line.durationMinutes || 0, 
                                line.durationHours || 0, 
                                line.durationDays || 0,
                                line.durationMonths || 0,
                                e.target.value === '' ? 0 : parseInt(e.target.value) || 0
                              )}
                              onFocus={(e) => e.target.select()}
                              placeholder="0"
                              className="bg-white/5 border border-white/20 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 w-16"
                            />
                            <span className="text-white/70 text-xs">años</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {showIcons && line.type === 'numeric' && (
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-indigo-300/70" />
                        <span className="text-white/50 text-xs uppercase tracking-wider font-semibold">Meta</span>
                        <input
                          type="number"
                          value={line.target || ''}
                          onChange={(e) => setLineTarget(line.id, e.target.value ? parseFloat(e.target.value) : undefined)}
                          placeholder="100"
                          className="w-20 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 transition-all"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white/50 text-xs uppercase tracking-wider font-semibold">Unidad</span>
                        <input
                          type="text"
                          value={line.unit || ''}
                          onChange={(e) => setLineUnit(line.id, e.target.value || undefined)}
                          placeholder="kg"
                          className="w-24 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 transition-all"
                        />
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              );
            })}
            
            {/* Botón para agregar nueva tarea - flotante y premium */}
            <button
              onClick={() => addLineAfter(lines[lines.length - 1]?.id)}
              className="mt-3 w-full py-4 bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/10 hover:border-white/20 rounded-2xl text-white/40 hover:text-white/70 transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 group-hover:from-indigo-500/30 group-hover:to-purple-500/30 flex items-center justify-center transition-all">
                <span className="text-lg font-bold">+</span>
              </div>
              <span className="text-sm font-semibold">Nueva tarea</span>
            </button>
          </div>
            </>
          ) : (
            <>
              {/* ===== PÁGINA 2: SELECCIÓN DE DESTINO ===== */}
              <div className="text-center mb-6 px-2">
                <h3 className="text-white text-xl sm:text-2xl font-bold mb-2">¿Dónde guardar las tareas?</h3>
                <p className="text-white/60 text-sm">Elige un proyecto existente o crea uno nuevo</p>
              </div>

              {/* Opciones principales - Cards responsivas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                {/* Opción: Proyecto Existente */}
                <button
                  onClick={() => { setDestinationMode('project'); setProjectName(''); setSelectedFolderId(''); setSelectedProjectId(''); setExistingFolderFilter(''); }}
                  className={`group relative p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 ${
                    destinationMode === 'project' 
                      ? 'border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/20' 
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                      destinationMode === 'project' 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-white/10 text-white/60 group-hover:bg-white/20 group-hover:text-white'
                    }`}>
                      <Folder className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="text-white font-semibold mb-1 text-sm sm:text-base">Proyecto Existente</h4>
                      <p className="text-white/60 text-xs sm:text-sm">Agregar tareas a un proyecto que ya tienes</p>
                      {existingProjects.length > 0 && (
                        <div className="mt-2 text-xs text-white/40">
                          {existingProjects.length} disponible{existingProjects.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                    {destinationMode === 'project' && (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>

                {/* Opción: Nuevo Proyecto */}
                <button
                  onClick={() => { setDestinationMode('folder'); setSelectedProjectId(''); setExistingFolderFilter(''); }}
                  className={`group relative p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 ${
                    destinationMode === 'folder' 
                      ? 'border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/20' 
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                      destinationMode === 'folder' 
                        ? 'bg-purple-500/20 text-purple-400' 
                        : 'bg-white/10 text-white/60 group-hover:bg-white/20 group-hover:text-white'
                    }`}>
                      <FolderPlus className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="text-white font-semibold mb-1 text-sm sm:text-base">Proyecto Nuevo</h4>
                      <p className="text-white/60 text-xs sm:text-sm">Crear un proyecto para estas tareas</p>
                      <div className="mt-2 text-xs text-white/40">
                        En carpeta nueva o existente
                      </div>
                    </div>
                    {destinationMode === 'folder' && (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              </div>

              {/* Configuración específica según opción seleccionada */}
              {destinationMode === 'project' ? (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {existingProjects.length === 0 ? (
                    <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                      <div className="w-16 h-16 rounded-2xl bg-gray-500/20 flex items-center justify-center mx-auto mb-4">
                        <FolderOpen className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-white/60 text-lg font-medium mb-2">No hay proyectos disponibles</p>
                      <p className="text-white/40 text-sm">Crea tu primer proyecto para poder agregar tareas</p>
                      <button
                        onClick={() => setDestinationMode('folder')}
                        className="mt-4 px-6 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl text-purple-400 text-sm font-medium transition-all"
                      >
                        Crear Proyecto Nuevo
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Paso 1: Seleccionar Carpeta */}
                      <div className="bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/10">
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                          <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <span className="text-blue-400 text-sm font-bold">1</span>
                          </div>
                          <h4 className="text-white font-medium text-sm sm:text-base">Selecciona la Carpeta</h4>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                          {Array.from(new Map(existingProjects.filter(p=>p.folderId).map(p=>[p.folderId!, p.folderName || existingFolders.find(f => f.id === p.folderId)?.name || 'Sin nombre'])).entries()).map(([folderId, folderName]) => {
                            const projectCount = existingProjects.filter(p => p.folderId === folderId).length;
                            return (
                              <button
                                key={folderId}
                                onClick={() => { setExistingFolderFilter(folderId); setSelectedProjectId(''); }}
                                className={`group p-2.5 sm:p-3 rounded-lg sm:rounded-xl border text-left transition-all duration-200 min-h-[70px] sm:min-h-[80px] ${
                                  existingFolderFilter === folderId 
                                    ? 'border-blue-500/50 bg-blue-500/20 shadow-lg' 
                                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                                  <Folder className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${existingFolderFilter === folderId ? 'text-blue-400' : 'text-white/60'}`} />
                                  <span className={`text-xs sm:text-sm font-medium truncate ${existingFolderFilter === folderId ? 'text-white' : 'text-white/80'}`}>
                                    {folderName}
                                  </span>
                                </div>
                                <div className={`text-[10px] sm:text-xs ${existingFolderFilter === folderId ? 'text-blue-300' : 'text-white/50'}`}>
                                  {projectCount} proyecto{projectCount !== 1 ? 's' : ''}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Paso 2: Seleccionar Proyecto (solo si ya seleccionó carpeta) */}
                      {existingFolderFilter && (
                        <div className="bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/10 animate-in slide-in-from-top-2 duration-300">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3 sm:mb-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                <span className="text-purple-400 text-sm font-bold">2</span>
                              </div>
                              <h4 className="text-white font-medium text-sm sm:text-base">Selecciona el Proyecto</h4>
                            </div>
                            <div className="text-white/40 text-xs sm:text-sm sm:ml-auto truncate">
                              en "{Array.from(new Map(existingProjects.filter(p=>p.folderId).map(p=>[p.folderId!, p.folderName || existingFolders.find(f => f.id === p.folderId)?.name || 'Sin nombre'])).entries()).find(([fId]) => fId === existingFolderFilter)?.[1]}"
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                            {existingProjects.filter(p => p.folderId === existingFolderFilter).map(project => (
                              <button
                                key={project.id}
                                onClick={() => setSelectedProjectId(project.id)}
                                className={`group p-3 sm:p-4 rounded-lg sm:rounded-xl border text-left transition-all duration-200 min-h-[60px] ${
                                  selectedProjectId === project.id 
                                    ? 'border-purple-500/50 bg-purple-500/20 shadow-lg scale-105' 
                                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 hover:scale-102'
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                                  <Target className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${selectedProjectId === project.id ? 'text-purple-400' : 'text-white/60'}`} />
                                  <span className={`text-xs sm:text-sm font-medium truncate ${selectedProjectId === project.id ? 'text-white' : 'text-white/80'}`}>
                                    {project.name}
                                  </span>
                                </div>
                                {selectedProjectId === project.id && (
                                  <div className="flex items-center gap-1 text-purple-300 text-[10px] sm:text-xs">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Seleccionado
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Paso 1: Seleccionar/Crear Carpeta */}
                  <div className="bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/10">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <span className="text-purple-400 text-sm font-bold">1</span>
                      </div>
                      <h4 className="text-white font-medium text-sm sm:text-base">Selecciona la Carpeta</h4>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                      {/* Opción: Nueva Carpeta */}
                      <button
                        onClick={() => { setSelectedFolderId('new'); setNewFolderMode(true); }}
                        className={`group p-2.5 sm:p-3 rounded-lg sm:rounded-xl border text-left transition-all duration-200 min-h-[70px] sm:min-h-[80px] ${
                          selectedFolderId === 'new' 
                            ? 'border-pink-500/50 bg-pink-500/20 shadow-lg' 
                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                          <Plus className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${selectedFolderId === 'new' ? 'text-pink-400' : 'text-white/60'}`} />
                          <span className={`text-xs sm:text-sm font-medium ${selectedFolderId === 'new' ? 'text-white' : 'text-white/80'}`}>
                            Nueva
                          </span>
                        </div>
                        <div className={`text-[10px] sm:text-xs ${selectedFolderId === 'new' ? 'text-pink-300' : 'text-white/50'}`}>
                          Crear una nueva
                        </div>
                      </button>

                      {/* Carpetas Existentes */}
                      {existingFolders.map(folder => (
                        <button
                          key={folder.id}
                          onClick={() => { setSelectedFolderId(folder.id); setNewFolderMode(false); }}
                          className={`group p-2.5 sm:p-3 rounded-lg sm:rounded-xl border text-left transition-all duration-200 min-h-[70px] sm:min-h-[80px] ${
                            selectedFolderId === folder.id 
                              ? 'border-purple-500/50 bg-purple-500/20 shadow-lg' 
                              : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                            <Folder className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${selectedFolderId === folder.id ? 'text-purple-400' : 'text-white/60'}`} />
                            <span className={`text-xs sm:text-sm font-medium truncate ${selectedFolderId === folder.id ? 'text-white' : 'text-white/80'}`}>
                              {folder.name}
                            </span>
                          </div>
                          <div className={`text-xs ${selectedFolderId === folder.id ? 'text-purple-300' : 'text-white/50'}`}>
                            Existente
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Paso 2: Nombre de Carpeta Nueva (solo si eligió nueva) */}
                  {selectedFolderId === 'new' && (
                    <div className="bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/10 animate-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <div className="w-6 h-6 rounded-lg bg-pink-500/20 flex items-center justify-center">
                          <span className="text-pink-400 text-sm font-bold">2</span>
                        </div>
                        <h4 className="text-white font-medium text-sm sm:text-base">Nombre de la Nueva Carpeta</h4>
                      </div>
                      
                      <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(capitalizeFirst(e.target.value))}
                        placeholder="Ej: Proyectos Personales..."
                        className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400/50 transition-all placeholder-white/30"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Botones de Acción dentro del contenido de página 2 */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-2 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 text-white/40 text-xs sm:text-sm">
                  {destinationMode === 'project' && selectedProjectId && (
                    <>
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-green-400">
                        Listo: {lines.filter(l => l.text.trim()).length} tarea{lines.filter(l => l.text.trim()).length !== 1 ? 's' : ''} a "{existingProjects.find(p => p.id === selectedProjectId)?.name}"
                      </span>
                    </>
                  )}
                  {destinationMode === 'folder' && projectName.trim() && selectedFolderId && (selectedFolderId !== 'new' || newFolderName.trim()) && (
                    <>
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-green-400">
                        Listo: "{projectName}" con {lines.filter(l => l.text.trim()).length} tarea{lines.filter(l => l.text.trim()).length !== 1 ? 's' : ''}
                      </span>
                    </>
                  )}
                </div>
                
                <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                  <button
                    onClick={onClose}
                    className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg sm:rounded-xl text-white/60 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Cancelar</span>
                    <span className="sm:hidden">Cerrar</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={destinationMode==='project' ? !selectedProjectId : (!projectName.trim() || !selectedFolderId || (selectedFolderId==='new' && !newFolderName.trim()))}
                    className="relative flex-1 sm:flex-initial px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 disabled:from-gray-600 disabled:to-gray-600 disabled:text-white/30 text-white rounded-lg sm:rounded-xl transition-all duration-300 font-medium shadow-lg disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 overflow-hidden group text-sm sm:text-base"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                    <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10" />
                    <span className="relative z-10">
                      {destinationMode === 'project' ? 'Agregar' : 'Crear'}
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer con botones según la página */}
        {currentStep === 1 ? (
          /* Botones Página 1: Solo Continuar (X arriba para cerrar) */
          <div className="border-t border-white/10 bg-gradient-to-b from-black/30 to-black/50 backdrop-blur-xl p-4 sm:p-6">
            <div className="flex justify-center items-center gap-3 sm:gap-4 max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-2 text-white/40 text-xs sm:text-sm">
                {lines.filter(l => l.text.trim()).length > 0 && (
                  <>
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-green-400">
                      {lines.filter(l => l.text.trim()).length} tarea{lines.filter(l => l.text.trim()).length !== 1 ? 's' : ''} lista{lines.filter(l => l.text.trim()).length !== 1 ? 's' : ''}
                    </span>
                  </>
                )}
              </div>
              
              <button
                onClick={() => setCurrentStep(2)}
                disabled={lines.filter(l => l.text.trim()).length === 0}
                className="relative px-6 sm:px-8 py-3 sm:py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 disabled:from-gray-600 disabled:to-gray-600 disabled:text-white/30 text-white rounded-lg sm:rounded-xl transition-all duration-300 font-medium shadow-lg disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 overflow-hidden group text-sm sm:text-base"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                <span className="relative z-10">Continuar</span>
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 rotate-180" />
              </button>
            </div>
          </div>
        ) : (
          /* Botones Página 2: Regresar / Guardar */
          <div className="border-t border-white/10 bg-gradient-to-b from-black/30 to-black/50 backdrop-blur-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 max-w-4xl mx-auto">
              <button
                onClick={() => setCurrentStep(1)}
                className="order-2 sm:order-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg sm:rounded-xl text-white/60 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Regresar
              </button>
              
              <button
                onClick={handleSave}
                disabled={destinationMode==='project' ? !selectedProjectId : (!projectName.trim() || !selectedFolderId || (selectedFolderId==='new' && !newFolderName.trim()))}
                className="order-1 sm:order-2 relative px-4 sm:px-6 py-3 sm:py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 disabled:from-gray-600 disabled:to-gray-600 disabled:text-white/30 text-white rounded-lg sm:rounded-xl transition-all duration-300 font-medium shadow-lg disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 overflow-hidden group text-sm sm:text-base"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10" />
                <span className="relative z-10">
                  {destinationMode === 'project' ? 'Agregar Tareas' : 'Crear Proyecto'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
