'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Hash, Star, GitBranch, Hourglass, Zap, X, ArrowLeft, RotateCcw, Plus, Mic, MicOff, Calendar, Timer, ChevronDown } from 'lucide-react';

// TypeScript declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: any) => void;
}

type TaskType = 'boolean' | 'numeric' | 'subjective';

export interface QuickTaskComposerTask {
  title: string;
  description?: string;
  type: TaskType;
  priority?: 'baja' | 'media' | 'alta';
  // Campos para tareas numéricas
  target?: number;
  unit?: string;
  // Campos de fecha límite
  dueDate?: string;
  dueTime?: string;
  // Campos de duración/temporizador (en segundos totales)
  estimatedDuration?: number; // Duración total en segundos
}

interface QuickTaskComposerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTasks: (tasks: QuickTaskComposerTask[]) => void;
  projectTitle: string;
  projectIcon?: string;
  projectColorScheme?: string;
}

const TYPE_ICONS: Record<TaskType, any> = {
  boolean: CheckCircle2,
  numeric: Hash,
  subjective: Star
};

type Line = { 
  id: string; 
  text: string; 
  type: TaskType; 
  target?: number; 
  unit?: string;
  dueDate?: string;
  dueTime?: string;
  hasCustomDate?: boolean; // Para saber si el usuario configuró fecha
  hasCustomTime?: boolean; // Para saber si el usuario configuró hora
  dueDateEnabled?: boolean; // Para saber si está activada la fecha límite
  durationEnabled?: boolean; // Para saber si está activado el temporizador
  durationMinutes?: number; // Duración en minutos
  durationHours?: number; // Duración en horas
  durationDays?: number; // Duración en días
  durationMonths?: number; // Duración en meses (opcional)
  durationYears?: number; // Duración en años (opcional)
  showAdvancedDuration?: boolean; // Para mostrar meses y años
};

// Helper functions para fecha y hora por defecto
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD
};

const getCurrentTime = () => {
  const now = new Date();
  return now.toTimeString().slice(0, 5); // HH:MM
};

export default function QuickTaskComposer({
  isOpen,
  onClose,
  onCreateTasks,
  projectTitle,
}: QuickTaskComposerProps) {
  const [lines, setLines] = useState<Line[]>([{ 
    id: crypto.randomUUID(), 
    text: '', 
    type: 'boolean',
    target: undefined,
    unit: undefined,
    dueDate: undefined,
    dueTime: undefined,
    hasCustomDate: false,
    hasCustomTime: false,
    dueDateEnabled: false
  }]);
  const [confirmReset, setConfirmReset] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [currentLineId, setCurrentLineId] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'es-ES';
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          // Process the final transcript
          processSpeechInput(finalTranscript.trim());
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      setRecognition(recognition);
    }
  }, []);

  const processSpeechInput = (transcript: string) => {
    // Split by periods to create new lines
    const sentences = transcript.split('.').filter(s => s.trim().length > 0);
    
    if (sentences.length > 0) {
      // Update current line with first sentence
      if (currentLineId) {
        setLineText(currentLineId, sentences[0].trim());
        
        // Add new lines for additional sentences
        let lastId = currentLineId;
        for (let i = 1; i < sentences.length; i++) {
          const newId = crypto.randomUUID();
          const newLine: Line = { id: newId, text: sentences[i].trim(), type: 'boolean' };
          setLines(prev => {
            const idx = prev.findIndex(l => l.id === lastId);
            return [...prev.slice(0, idx + 1), newLine, ...prev.slice(idx + 1)];
          });
          lastId = newId;
        }
        
        // Set focus to last created line
        setCurrentLineId(lastId);
      }
    }
  };

  const toggleListening = () => {
    if (!recognition) {
      alert('La funcionalidad de dictado no está disponible en este navegador');
      return;
    }
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      // Find the first empty line or create one
      let targetLineId = lines.find(l => l.text.trim() === '')?.id;
      if (!targetLineId) {
        const newId = crypto.randomUUID();
        const newLine: Line = { id: newId, text: '', type: 'boolean' };
        setLines(prev => [...prev, newLine]);
        targetLineId = newId;
      }
      
      setCurrentLineId(targetLineId);
      recognition.start();
      setIsListening(true);
    }
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLines([{ 
        id: crypto.randomUUID(), 
        text: '', 
        type: 'boolean',
        target: undefined,
        unit: undefined,
        dueDate: undefined,
        dueTime: undefined,
        hasCustomDate: false,
        hasCustomTime: false,
        dueDateEnabled: false
      }]);
      setConfirmReset(false);
      setIsListening(false);
      setCurrentLineId('');
      
      // Stop any ongoing recognition
      if (recognition && isListening) {
        recognition.stop();
      }
      
      // Auto-focus al primer textarea con un pequeño delay
      setTimeout(() => {
        const firstTextarea = containerRef.current?.querySelector('textarea');
        if (firstTextarea) {
          (firstTextarea as HTMLTextAreaElement).focus();
        }
      }, 100);
    }
  }, [isOpen, recognition, isListening]);

  useEffect(() => {
    if (!isOpen) return;
    // Mantener focus en el primer textarea
    const first = containerRef.current?.querySelector('textarea');
    (first as HTMLTextAreaElement | undefined)?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (isListening) {
          toggleListening();
        } else {
          onClose();
        }
      }
      if ((e.ctrlKey || (e as any).metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, isListening]);

  if (!isOpen) return null;

  const setLineText = (id: string, text: string) => {
    // Capitalizar automáticamente la primera letra
    const capitalizedText = text.length > 0 
      ? text.charAt(0).toUpperCase() + text.slice(1)
      : text;
    setLines(prev => prev.map(l => (l.id === id ? { ...l, text: capitalizedText } : l)));
  };

  // Nueva función para parsear automáticamente título y descripción
  const parseLineContent = (text: string) => {
    // Buscar guión con espacios primero " - "
    let dashIndex = text.indexOf(' - ');
    let spacedDash = true;
    
    // Si no encuentra con espacios, buscar guión simple "-"
    if (dashIndex === -1) {
      dashIndex = text.indexOf('-');
      spacedDash = false;
    }
    
    if (dashIndex >= 0 && dashIndex > 0) { // Asegurar que no esté al inicio
      const title = text.slice(0, dashIndex).trim();
      const descriptionStart = spacedDash ? dashIndex + 3 : dashIndex + 1;
      const description = text.slice(descriptionStart).trim();
      
      // Solo separar si tanto título como descripción tienen contenido
      if (title.length > 0 && description.length > 0) {
        return {
          title,
          description
        };
      }
    }
    
    return {
      title: text.trim(),
      description: undefined
    };
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

  const setLineDueDate = (id: string, dueDate: string | undefined) => {
    setLines(prev => prev.map(l => (l.id === id ? { ...l, dueDate, hasCustomDate: true } : l)));
  };

  const setLineDueTime = (id: string, dueTime: string | undefined) => {
    setLines(prev => prev.map(l => (l.id === id ? { ...l, dueTime, hasCustomTime: true } : l)));
  };

  const toggleDueDate = (id: string) => {
    setLines(prev => prev.map(l => {
      if (l.id === id) {
        const isEnabling = !l.dueDateEnabled;
        return {
          ...l,
          dueDateEnabled: isEnabling,
          // Si se está habilitando, inicializar con fecha/hora actual
          dueDate: isEnabling ? getTodayDate() : undefined,
          dueTime: isEnabling ? getCurrentTime() : undefined,
          hasCustomDate: isEnabling,
          hasCustomTime: isEnabling
        };
      }
      return l;
    }));
  };

  const toggleDuration = (id: string) => {
    setLines(prev => prev.map(l => {
      if (l.id === id) {
        const isEnabling = !l.durationEnabled;
        return {
          ...l,
          durationEnabled: isEnabling,
          // Si se está habilitando, inicializar con valores por defecto (minutos y horas)
          durationMinutes: isEnabling ? 30 : undefined,
          durationHours: isEnabling ? 0 : undefined,
          durationDays: isEnabling ? 0 : undefined,
          durationMonths: isEnabling ? 0 : undefined,
          durationYears: isEnabling ? 0 : undefined,
          showAdvancedDuration: false
        };
      }
      return l;
    }));
    
    // Auto-focus en el campo de minutos cuando se activa la duración
    setTimeout(() => {
      const minutesInput = document.querySelector(`input[data-duration-minutes="${id}"]`) as HTMLInputElement;
      if (minutesInput) {
        minutesInput.focus();
        minutesInput.select(); // Seleccionar todo el texto para facilitar la edición
      }
    }, 100);
  };

  const toggleAdvancedDuration = (id: string) => {
    setLines(prev => prev.map(l => (l.id === id ? { ...l, showAdvancedDuration: !l.showAdvancedDuration } : l)));
  };

  const setLineDuration = (id: string, minutes: number, hours: number, days: number, months?: number, years?: number) => {
    setLines(prev => prev.map(l => (l.id === id ? { 
      ...l, 
      durationMinutes: minutes, 
      durationHours: hours, 
      durationDays: days,
      durationMonths: months,
      durationYears: years
    } : l)));
  };

  const addLineAfter = (id: string) => {
    const idx = lines.findIndex(l => l.id === id);
    const newLine: Line = { 
      id: crypto.randomUUID(), 
      text: '', 
      type: 'boolean',
      target: undefined,
      unit: undefined,
      dueDate: undefined,
      dueTime: undefined,
      hasCustomDate: false,
      hasCustomTime: false,
      dueDateEnabled: false
    };
    const next = [...lines.slice(0, idx + 1), newLine, ...lines.slice(idx + 1)];
    setLines(next);
    setTimeout(() => {
      const areas = containerRef.current?.querySelectorAll('textarea');
      const el = areas?.[idx + 1] as HTMLTextAreaElement | undefined;
      if (el) {
        el.focus();
        setCurrentLineId(newLine.id);
      }
    }, 0);
  };

  const removeLine = (id: string) => {
    if (lines.length === 1) {
      setLineText(id, '');
      return;
    }
    const idx = lines.findIndex(l => l.id === id);
    const next = lines.filter(l => l.id !== id);
    setLines(next);
    
    // Mejor manejo del focus al borrar
    setTimeout(() => {
      const areas = containerRef.current?.querySelectorAll('textarea');
      if (areas && areas.length > 0) {
        // Si borramos la primera línea, ir a la nueva primera
        // Si borramos cualquier otra, ir a la anterior
        const targetIdx = idx === 0 ? 0 : Math.max(0, idx - 1);
        const targetEl = areas[targetIdx] as HTMLTextAreaElement;
        if (targetEl) {
          targetEl.focus();
          // Posicionar cursor al final del texto
          const textLength = targetEl.value.length;
          targetEl.setSelectionRange(textLength, textLength);
        }
      }
    }, 0);
  };

  const autoGrow = (ta: HTMLTextAreaElement) => {
    ta.style.height = 'auto';
    ta.style.height = Math.min(120, Math.max(32, ta.scrollHeight)) + 'px';
  };

  const parseTasks = (): QuickTaskComposerTask[] => {
    const filteredLines = lines.filter(l => l.text.trim().length > 0);
    console.log('📋 Líneas filtradas:', filteredLines.length, filteredLines);
    
    const tasks = filteredLines.map((line, i) => {
      const text = line.text.trim();
      const parsed = parseLineContent(text);
      
      const task: QuickTaskComposerTask = {
        title: parsed.title || `Tarea ${i + 1}`,
        description: parsed.description,
        type: line.type,
        priority: 'media' as const,
      };
      
      // Agregar campos numéricos si es una tarea numérica
      if (line.type === 'numeric') {
        task.target = line.target;
        task.unit = line.unit;
      }
      
      // Agregar fecha y tiempo límite solo si están habilitados
      if (line.dueDateEnabled) {
        task.dueDate = line.dueDate;
        task.dueTime = line.dueTime;
      }
      
      // Agregar duración total en segundos si está habilitada
      if (line.durationEnabled) {
        const minutes = line.durationMinutes || 0;
        const hours = line.durationHours || 0;
        const days = line.durationDays || 0;
        const months = line.durationMonths || 0;
        const years = line.durationYears || 0;
        
        console.log('⏱️ Duración detectada:', { 
          durationEnabled: line.durationEnabled, 
          minutes, 
          hours, 
          days, 
          months, 
          years 
        });
        
        // Convertir todo a segundos
        const totalSeconds = 
          (minutes * 60) + 
          (hours * 3600) + 
          (days * 86400) + 
          (months * 2592000) + // 30 días por mes
          (years * 31536000);  // 365 días por año
        
        console.log('⏱️ Total segundos calculados:', totalSeconds);
        
        if (totalSeconds > 0) {
          task.estimatedDuration = totalSeconds;
          console.log('✅ estimatedDuration asignado:', task.estimatedDuration);
        }
      }
      
      console.log(`✅ Tarea parseada ${i + 1}:`, task);
      return task;
    });
    
    console.log('🎯 Total tareas parseadas:', tasks.length, tasks);
    return tasks;
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000); // Auto-cancel after 3s
    } else {
      setLines([{ 
        id: crypto.randomUUID(), 
        text: '', 
        type: 'boolean',
        target: undefined,
        unit: undefined,
        dueDate: undefined,
        dueTime: undefined,
        hasCustomDate: false,
        hasCustomTime: false,
        dueDateEnabled: false
      }]);
      setConfirmReset(false);
      setCurrentLineId('');
      if (isListening) {
        toggleListening();
      }
    }
  };

  const handleSave = () => {
    const tasks = parseTasks();
    if (tasks.length === 0) return onClose();
    if (isListening) {
      toggleListening();
    }
    onCreateTasks(tasks);
    onClose();
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
            {isListening ? (
              <Mic className="w-9 h-9 text-white relative z-10 animate-pulse" />
            ) : (
              <Zap className="w-9 h-9 text-white relative z-10" />
            )}
          </div>
          
          <h1 className="text-white font-bold text-2xl mb-1 tracking-tight">Quick Tasks</h1>
          <p className="text-white/50 text-sm">
            {isListening 
              ? '🎙️ Escuchando... Di "punto" para separar tareas'
              : `Agregar tareas a ${projectTitle}`
            }
          </p>
          
          {/* Botón flotante en esquina superior derecha */}
          <div className="absolute top-6 right-6 flex items-center gap-2">
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Botones de acción circulares debajo del header */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={toggleListening}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                isListening 
                  ? 'bg-red-500/20 text-red-300 border-red-400/50 hover:bg-red-500/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 hover:bg-emerald-500/30'
              }`}
              title={isListening ? "Detener dictado" : "Iniciar dictado"}
            >
              {isListening ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
            
            <button 
              onClick={handleReset}
              className={`w-12 h-12 rounded-full backdrop-blur-sm border flex items-center justify-center transition-all duration-300 border-2 ${
                confirmReset 
                  ? 'bg-red-500/20 text-red-300 border-red-400/50 hover:bg-red-500/30' 
                  : 'bg-white/10 text-white/70 border-white/20 hover:text-white hover:bg-white/20'
              }`}
              title={confirmReset ? "¿Confirmar reseteo?" : "Limpiar todo"}
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 pb-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20 scroll-smooth">
          <div ref={containerRef} className="flex flex-col justify-start space-y-3">
            {lines.map((line, idx) => {
            const IconBoolean = TYPE_ICONS.boolean;
            const IconNumeric = TYPE_ICONS.numeric;
            const IconSubjective = TYPE_ICONS.subjective;
            
            // Solo mostrar iconos si la línea tiene texto y no es la línea activa
            const showIcons = line.text.trim().length > 0;
            const isCurrentLine = line.id === currentLineId;
            const parsed = parseLineContent(line.text);
            const hasDescription = parsed.description && parsed.description.length > 0;
            
            return (
              <div key={line.id} className="rounded-2xl transition-all duration-300 backdrop-blur-md relative group bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-purple-500/10">
                
                <button
                  onClick={() => removeLine(line.id)}
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
                      setCurrentLineId(line.id);
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
                      if (e.key === 'Backspace' && line.text.length === 0) {
                        e.preventDefault();
                        removeLine(line.id);
                      }
                    }}
                    placeholder={lines.length === 1 && idx === 0 ? "Escribe tu tarea aquí..." : "Nueva tarea..."}
                    className="w-full resize-none bg-transparent text-white text-base leading-tight placeholder-white/40 px-0 py-1 focus:outline-none border-none flex items-center"
                    style={{ minHeight: '28px' }}
                  />
                
                {/* Mostramos título parseado si hay separación */}
                {hasDescription && (
                  <div className="mt-2 p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-white/90 font-medium text-base mb-1">{parsed.title}</div>
                    <div className="text-white/60 text-sm">{parsed.description}</div>
                  </div>
                )}
                
                {/* Iconos aparecen cuando tiene texto */}
                {showIcons && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                    <span className="text-white/50 text-sm mr-2 font-medium">Tipo:</span>
                    <button title="Sí/No" onClick={() => setLineType(line.id, 'boolean')} className={`p-2 rounded-xl transition-all duration-200 ${line.type==='boolean'?'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-lg':'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'}`}>
                      <IconBoolean className="w-4 h-4" />
                    </button>
                    <button title="Numérica" onClick={() => setLineType(line.id, 'numeric')} className={`p-2 rounded-xl transition-all duration-200 ${line.type==='numeric'?'bg-blue-500/20 text-blue-300 border border-blue-400/30 shadow-lg':'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'}`}>
                      <IconNumeric className="w-4 h-4" />
                    </button>
                    <button title="Subjetiva" onClick={() => setLineType(line.id, 'subjective')} className={`p-2 rounded-xl transition-all duration-200 ${line.type==='subjective'?'bg-pink-500/20 text-pink-300 border border-pink-400/30 shadow-lg':'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'}`}>
                      <IconSubjective className="w-4 h-4" />
                    </button>
                    
                    {/* Sección de tiempo con etiqueta separadora */}
                    <div className="ml-4 flex items-center gap-2">
                      <span className="text-white/50 text-sm mr-2 font-medium">Tiempo:</span>
                      <button 
                        title={line.dueDateEnabled ? 'Desactivar fecha límite' : 'Activar fecha límite'} 
                        onClick={() => toggleDueDate(line.id)} 
                        className={`p-2 rounded-xl transition-all duration-200 ${
                          line.dueDateEnabled
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-400/30 shadow-lg'
                            : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                      
                      <button 
                        title={line.durationEnabled ? 'Desactivar temporizador' : 'Activar temporizador'} 
                        onClick={() => toggleDuration(line.id)} 
                        className={`p-2 rounded-xl transition-all duration-200 ${
                          line.durationEnabled
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-lg'
                            : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        <Timer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Campos de fecha y hora - solo aparecen si está activado */}
                {showIcons && line.dueDateEnabled && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-300" />
                        <span className="text-white/70 text-sm font-medium">Fecha:</span>
                        <input
                          type="date"
                          value={line.dueDate || getTodayDate()}
                          onChange={(e) => setLineDueDate(line.id, e.target.value || undefined)}
                          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4 text-orange-300" />
                        <span className="text-white/70 text-sm font-medium">Hora:</span>
                        <input
                          type="time"
                          value={line.dueTime || getCurrentTime()}
                          onChange={(e) => setLineDueTime(line.id, e.target.value || undefined)}
                          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Campos de duración - solo aparecen si está activado el temporizador */}
                {showIcons && line.durationEnabled && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1">
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
                          data-duration-minutes={line.id}
                          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 w-16 transition-all"
                        />
                        <span className="text-white/50 text-xs font-medium">min</span>
                      </div>
                      <div className="flex items-center gap-1">
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

                {/* Campos numéricos - solo aparecen cuando es tipo numérico */}
                {showIcons && line.type === 'numeric' && (
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-blue-300" />
                      <span className="text-white/50 text-sm font-medium">Meta:</span>
                      <input
                        type="number"
                        value={line.target || ''}
                        onChange={(e) => setLineTarget(line.id, e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder="100"
                        className="w-20 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/50 text-sm font-medium">Unidad:</span>
                      <input
                        type="text"
                        value={line.unit || ''}
                        onChange={(e) => setLineUnit(line.id, e.target.value || undefined)}
                        placeholder="kg"
                        className="w-24 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
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
      </div>
        
        {/* Footer con botón confirmar - ESTILO QUICK PROJECT */}
        <div className="border-t border-white/10 bg-gradient-to-b from-black/30 to-black/50 backdrop-blur-xl p-4 sm:p-6">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={handleSave}
              disabled={lines.every(l => !l.text.trim())}
              className="w-full relative px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 hover:from-purple-600 hover:via-indigo-600 hover:to-pink-600 text-white font-bold text-lg transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xl overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
              <span className="relative z-10 flex items-center justify-center gap-3">
                <Plus className="w-6 h-6" />
                Agregar Tareas
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
