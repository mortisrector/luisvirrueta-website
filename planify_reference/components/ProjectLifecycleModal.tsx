'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Lock, Zap, CheckCircle, Clock, RotateCcw, Calendar, Infinity, Hourglass } from 'lucide-react';

interface ProjectLifecycleModalProps {
  isOpen: boolean;
  projectTitle?: string;
  currentLifecycle?: 'ephemeral' | 'cyclic' | 'fixed' | null;
  onClose: () => void;
  onSelectLifecycle: (lifecycle: 'ephemeral' | 'cyclic' | 'fixed', config?: any) => void;
}

export default function ProjectLifecycleModal({
  isOpen,
  projectTitle = 'Mi Proyecto',
  currentLifecycle = null,
  onClose,
  onSelectLifecycle
}: ProjectLifecycleModalProps) {
  const [selectedLifecycle, setSelectedLifecycle] = useState<'ephemeral' | 'cyclic' | 'fixed' | null>(currentLifecycle);
  const [ephemeralDays, setEphemeralDays] = useState(7);
  const [cyclicInterval, setCyclicInterval] = useState('daily');
  const [cyclicDuration, setCyclicDuration] = useState(30);
  const [fixedDeadline, setFixedDeadline] = useState('');
  const [mounted, setMounted] = useState(false);
  
  // Estado para feedback visual al seleccionar modo
  const [selectedLifecycleFeedback, setSelectedLifecycleFeedback] = useState<{
    icon: any;
    gradient: string;
    label: string;
  } | null>(null);

  // Ensure client-side only rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedLifecycle(currentLifecycle);
    }
  }, [isOpen, currentLifecycle]);

  const handleConfirm = () => {
    if (!selectedLifecycle) return;

    let config: any = undefined;

    if (selectedLifecycle === 'ephemeral') {
      config = {
        autoDeleteAfterDays: ephemeralDays,
        createdAt: new Date().toISOString(),
        deletionDate: new Date(Date.now() + ephemeralDays * 24 * 60 * 60 * 1000).toISOString()
      };
    } else if (selectedLifecycle === 'cyclic') {
      config = {
        interval: cyclicInterval,
        durationDays: cyclicDuration,
        lastReset: new Date().toISOString(),
        nextReset: calculateNextReset(cyclicInterval, cyclicDuration)
      };
    } else if (selectedLifecycle === 'fixed') {
      config = {
        deadline: fixedDeadline,
        isLocked: true,
        lockedAt: new Date().toISOString()
      };
    }

    // Mostrar feedback visual centrado usando los metadatos del modo seleccionado
    const meta = lifecycleOptions.find(m => m.id === selectedLifecycle);
    if (meta) {
      setSelectedLifecycleFeedback({ icon: meta.icon, gradient: meta.gradient, label: meta.label });
    }

    // Esperar a que corra la animación y luego aplicar el modo y cerrar
    setTimeout(() => {
      onSelectLifecycle(selectedLifecycle, config);
      onClose();
      // limpiar feedback tras cerrar
      setSelectedLifecycleFeedback(null);
    }, 850);
  };

  const calculateNextReset = (interval: string, duration: number): string => {
    const now = new Date();
    let nextReset = new Date(now);
    
    switch(interval) {
      case 'daily':
        nextReset.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        nextReset.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        nextReset.setMonth(now.getMonth() + 1);
        break;
      default:
        nextReset.setDate(now.getDate() + duration);
    }
    
    return nextReset.toISOString();
  };

  // Opciones de ciclos de vida con iconos y gradientes
  const lifecycleOptions = [
    {
      id: 'ephemeral' as const,
      label: 'Efímero',
      icon: Hourglass,
      gradient: 'from-amber-500 to-orange-500',
      description: 'Se auto-elimina tras N días de inactividad'
    },
    {
      id: 'cyclic' as const,
      label: 'Cíclico',
      icon: RotateCcw,
      gradient: 'from-blue-500 to-cyan-500',
      description: 'Se resetea automáticamente cada período'
    },
    {
      id: 'fixed' as const,
      label: 'Fijo',
      icon: Lock,
      gradient: 'from-purple-500 to-pink-500',
      description: 'Proyecto permanente con fecha límite opcional'
    }
  ];

  // Seleccionar modo sin disparar feedback todavía
  const handleLifecycleSelect = (option: typeof lifecycleOptions[0]) => {
    setSelectedLifecycle(option.id);
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[1000] bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 animate-in fade-in duration-300">
      {/* Overlay con efecto de cristal y animación */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-3xl animate-in fade-in duration-500"></div>
      
      {/* Patrón de fondo sutil */}
      <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
      
      <div className="absolute inset-0 flex flex-col animate-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Premium - IGUAL A QUICK PROJECT Y FILTROS */}
        <div className="relative flex flex-col items-center justify-center pt-10 pb-6">
          {/* Icono principal con glow effect */}
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 flex items-center justify-center mb-5 shadow-2xl shadow-purple-500/50">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-400 to-purple-500 blur-xl opacity-50"></div>
            <Lock className="w-9 h-9 text-white relative z-10" />
          </div>
          
          <h1 className="text-white font-bold text-2xl mb-1 tracking-tight">Ciclo de Vida del Proyecto</h1>
          <p className="text-white/50 text-sm">
            {projectTitle}
          </p>
          
          {/* Botón cerrar flotante en esquina superior derecha */}
          <div className="absolute top-6 right-6">
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content - Selección de Ciclos de Vida */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="max-w-2xl mx-auto space-y-6">
            
            {/* Grid de modos - ESTILO FILTROS PREMIUM */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {lifecycleOptions.map((option) => {
                const isSelected = selectedLifecycle === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleLifecycleSelect(option)}
                    className={`group relative p-6 rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-md border ${
                      isSelected
                        ? 'bg-white/10 border-purple-400/50 hover:bg-white/15'
                        : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
                    }`}
                    style={{ minHeight: '140px' }}
                  >
                    {/* Checkmark cuando está seleccionado */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}

                    {/* Contenido de la tarjeta */}
                    <div className="flex flex-col items-center text-center gap-3">
                      {/* Icono con glow */}
                      <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${option.gradient} shadow-xl`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${option.gradient} rounded-2xl blur-xl opacity-50`}></div>
                        <option.icon className="w-7 h-7 text-white relative z-10" />
                      </div>

                      {/* Título y descripción */}
                      <div className="space-y-1">
                        <div className="text-base font-bold text-white">{option.label}</div>
                        <div className="text-white/60 text-xs">{option.description}</div>
                      </div>

                      {/* Configuración inline por modo cuando está seleccionado */}
                      {isSelected && option.id === 'ephemeral' && (
                        <div className="w-full mt-2 text-left space-y-3 p-4 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-xl border border-amber-500/20">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
                              <Hourglass className="w-4 h-4 text-white" />
                            </div>
                            <h4 className="text-amber-400 font-semibold">Configuración Efímera</h4>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-white text-xs font-medium mb-1.5 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-amber-400" />
                                Días antes de auto-eliminarse
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="1"
                                  max="365"
                                  value={ephemeralDays}
                                  onChange={(e) => setEphemeralDays(parseInt(e.target.value) || 1)}
                                  className="w-full px-3 py-2.5 bg-white/5 backdrop-blur-md border border-white/20 rounded-lg text-white text-sm placeholder-white/30 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-xs font-medium">días</div>
                              </div>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/30">
                              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs mb-1">
                                <Zap className="w-3.5 h-3.5" />
                                Vista previa
                              </div>
                              <div className="text-white/80 text-xs">
                                Se eliminará automáticamente después de <span className="font-bold text-white">{ephemeralDays} días</span> de inactividad
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {isSelected && option.id === 'cyclic' && (
                        <div className="w-full mt-2 text-left space-y-3 p-4 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-xl border border-blue-500/20">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center">
                              <RotateCcw className="w-4 h-4 text-white" />
                            </div>
                            <h4 className="text-blue-400 font-semibold">Configuración Cíclica</h4>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-white text-xs font-medium mb-1.5 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-400" />
                                Intervalo de reseteo
                              </label>
                              <select
                                value={cyclicInterval}
                                onChange={(e) => setCyclicInterval(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white/5 backdrop-blur-md border border-white/20 rounded-lg text-white text-sm focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                              >
                                <option value="daily" className="bg-slate-800">Diario</option>
                                <option value="weekly" className="bg-slate-800">Semanal</option>
                                <option value="monthly" className="bg-slate-800">Mensual</option>
                                <option value="custom" className="bg-slate-800">Personalizado</option>
                              </select>
                            </div>

                            {cyclicInterval === 'custom' && (
                              <div>
                                <label className="block text-white text-xs font-medium mb-1.5 flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-blue-400" />
                                  Duración del ciclo (días)
                                </label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    min="1"
                                    max="365"
                                    value={cyclicDuration}
                                    onChange={(e) => setCyclicDuration(parseInt(e.target.value) || 1)}
                                    className="w-full px-3 py-2.5 bg-white/5 backdrop-blur-md border border-white/20 rounded-lg text-white text-sm placeholder-white/30 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                                  />
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-xs font-medium">días</div>
                                </div>
                              </div>
                            )}

                            <div className="p-3 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/30">
                              <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs mb-1">
                                <Zap className="w-3.5 h-3.5" />
                                Vista previa
                              </div>
                              <div className="text-white/80 text-xs">
                                Se reseteará automáticamente cada{' '}
                                <span className="font-bold text-white">
                                  {cyclicInterval === 'daily' ? 'día' : 
                                   cyclicInterval === 'weekly' ? 'semana' : 
                                   cyclicInterval === 'monthly' ? 'mes' : 
                                   `${cyclicDuration} días`}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {isSelected && option.id === 'fixed' && (
                        <div className="w-full mt-2 text-left space-y-3 p-4 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-xl border border-purple-500/20">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center">
                              <Lock className="w-4 h-4 text-white" />
                            </div>
                            <h4 className="text-purple-400 font-semibold">Configuración Fija</h4>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-white text-xs font-medium mb-1.5 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-purple-400" />
                                Fecha límite <span className="text-white/40 font-normal">(opcional)</span>
                              </label>
                              <input
                                type="date"
                                value={fixedDeadline}
                                onChange={(e) => setFixedDeadline(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-3 py-2.5 bg-white/5 backdrop-blur-md border border-white/20 rounded-lg text-white text-sm placeholder-white/30 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                              />
                            </div>

                            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                              <div className="flex items-start gap-3">
                                <Infinity className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <div className="text-white font-medium text-sm mb-0.5">
                                    Proyecto permanente
                                  </div>
                                  <p className="text-white/60 text-xs">
                                    Este proyecto no se auto-eliminará ni se reseteará. Permanecerá hasta que decidas eliminarlo manualmente.
                                  </p>
                                </div>
                              </div>
                            </div>

                            {fixedDeadline && (
                              <div className="p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/30">
                                <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs mb-1">
                                  <Zap className="w-3.5 h-3.5" />
                                  Vista previa
                                </div>
                                <div className="text-white/80 text-xs">
                                  Fecha límite: <span className="font-bold text-white">
                                    {new Date(fixedDeadline).toLocaleDateString('es-ES', { 
                                      day: 'numeric', 
                                      month: 'long', 
                                      year: 'numeric' 
                                    })}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer con botón confirmar - ESTILO QUICK PROJECT */}
        <div className="border-t border-white/10 bg-gradient-to-b from-black/30 to-black/50 backdrop-blur-xl p-4 sm:p-6">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={handleConfirm}
              disabled={!selectedLifecycle || !!selectedLifecycleFeedback}
              className="w-full relative px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 hover:from-purple-600 hover:via-indigo-600 hover:to-pink-600 text-white font-bold text-lg transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xl overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
              <span className="relative z-10 flex items-center justify-center gap-3">
                <CheckCircle className="w-6 h-6" />
                Confirmar Ciclo de Vida
              </span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Feedback visual al seleccionar modo - IGUAL A FILTROS */}
      {selectedLifecycleFeedback && (
        <>
          {/* Backdrop opaco que acompaña la animación */}
          <div className="fixed inset-0 z-[1999] bg-black/60 animate-fadeInOut pointer-events-none"></div>
          
          {/* Icono centrado */}
          <div className="fixed inset-0 z-[2000] pointer-events-none flex items-center justify-center">
            <div className="animate-filterFeedback">
              <div className="relative">
                {/* Resplandor grande detrás */}
                <div 
                  className={`absolute -inset-8 bg-gradient-to-br ${selectedLifecycleFeedback.gradient} rounded-full blur-3xl opacity-40`}
                ></div>
                
                {/* Icono principal con brillo */}
                <div className={`relative w-28 h-28 rounded-3xl bg-gradient-to-br ${selectedLifecycleFeedback.gradient} flex items-center justify-center shadow-2xl`}>
                  {/* Resplandor interno */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${selectedLifecycleFeedback.gradient} rounded-3xl blur-xl opacity-50`}></div>
                  
                  <selectedLifecycleFeedback.icon className="w-14 h-14 text-white relative z-10 drop-shadow-2xl" />
                </div>
                
                {/* Label debajo */}
                <div className="mt-3 text-center">
                  <p className="text-white font-bold text-lg drop-shadow-2xl">
                    {selectedLifecycleFeedback.label}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
}
