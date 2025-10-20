'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Project, User } from '@/types';
import { X, Target, Trophy, Swords, Calendar, Users, DollarSign, Clock, RotateCcw, Zap, CheckCircle, CheckCircle2, Flame, TrendingUp, Layers, Sparkles, ArrowLeft, CalendarClock, Gift } from 'lucide-react';

interface ProjectModeModalProps {
  isOpen: boolean;
  project: Project;
  teamMembers?: User[];
  onClose: () => void;
  onSelectMode: (mode: 'normal' | 'challenge' | 'competition', config?: any) => void;
}

export default function ProjectModeModal({
  isOpen,
  project,
  teamMembers = [],
  onClose,
  onSelectMode
}: ProjectModeModalProps) {
  const [selectedMode, setSelectedMode] = useState<'normal' | 'challenge' | 'competition' | null>(null);
  const [showNormalSubmenu, setShowNormalSubmenu] = useState(false); // Estado para mostrar sub-menú de Normal
  const [normalSubMode, setNormalSubMode] = useState<'phases' | 'flexible' | null>(null); // Sub-modo de Normal
  const [challengeDays, setChallengeDays] = useState(30);
  const [challengeDaysInput, setChallengeDaysInput] = useState('30'); // Estado separado para el input
  const [resetOnMiss, setResetOnMiss] = useState(false); // Por defecto: modo flexible
  const [challengeStartDate, setChallengeStartDate] = useState(new Date().toISOString().split('T')[0]); // Fecha actual
  const [challengeReward, setChallengeReward] = useState(''); // Premio o castigo
  const [competitionDeadline, setCompetitionDeadline] = useState('');
  const [selectedOpponents, setSelectedOpponents] = useState<string[]>([]);
  const [stake, setStake] = useState('');
  const [mounted, setMounted] = useState(false);
  const challengeDaysInputRef = useRef<HTMLInputElement>(null);
  
  // Estado para feedback visual al seleccionar modo
  const [selectedModeFeedback, setSelectedModeFeedback] = useState<{
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
      setSelectedMode(project.mode || null);
      if (project.challengeConfig) {
        setChallengeDays(project.challengeConfig.totalDays);
        setChallengeDaysInput(project.challengeConfig.totalDays.toString());
        setResetOnMiss(project.challengeConfig.resetOnMiss);
        setChallengeStartDate(project.challengeConfig.startDate || new Date().toISOString().split('T')[0]);
        setChallengeReward(project.challengeConfig.reward || '');
      } else {
        // Resetear a valores por defecto si no hay config
        setChallengeStartDate(new Date().toISOString().split('T')[0]);
        setChallengeReward('');
      }
      if (project.competitionConfig) {
        setCompetitionDeadline(project.competitionConfig.deadline || '');
        setSelectedOpponents(project.competitionConfig.participants.map(p => p.userId));
        setStake(project.competitionConfig.stake || '');
      }
    }
  }, [isOpen, project]);

  const handleConfirm = () => {
    if (!selectedMode) return;
    
    // Si es modo normal y no hay sub-modo seleccionado, no continuar
    if (selectedMode === 'normal' && !normalSubMode) return;

    let config: any = undefined;

    if (selectedMode === 'normal') {
      // Guardar el sub-modo seleccionado (phases o flexible)
      config = {
        playMode: normalSubMode // 'phases' o 'flexible'
      };
    } else if (selectedMode === 'challenge') {
      config = {
        totalDays: challengeDays,
        resetOnMiss,
        daysCompleted: project.challengeConfig?.daysCompleted || [],
        currentStreak: project.challengeConfig?.currentStreak || 0,
        startDate: challengeStartDate || new Date().toISOString().split('T')[0],
        reward: challengeReward || undefined
      };
    } else if (selectedMode === 'competition') {
      const participants = selectedOpponents.map(userId => {
        const existingParticipant = project.competitionConfig?.participants.find(p => p.userId === userId);
        const user = teamMembers.find(u => u.id === userId);
        return {
          userId,
          userName: user?.name || `Usuario ${userId}`,
          progress: existingParticipant?.progress || 0,
          lastUpdate: existingParticipant?.lastUpdate
        };
      });

      config = {
        deadline: competitionDeadline || undefined,
        participants,
        stake: stake || undefined,
        winner: project.competitionConfig?.winner
      };
    }

    // Mostrar feedback visual centrado usando los metadatos del modo seleccionado
    const meta = modeOptions.find(m => m.id === selectedMode);
    if (meta) {
      setSelectedModeFeedback({ icon: meta.icon, gradient: meta.gradient, label: meta.label });
    }

    // Esperar a que corra la animación y luego aplicar el modo y cerrar
    setTimeout(() => {
      onSelectMode(selectedMode, config);
      onClose();
      // limpiar feedback tras cerrar
      setSelectedModeFeedback(null);
    }, 850);
  };

  const toggleOpponent = (userId: string) => {
    setSelectedOpponents(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Opciones de modos con iconos y gradientes
  const modeOptions = [
    {
      id: 'normal' as const,
      label: 'Normal',
      icon: Target,
      gradient: 'from-emerald-500 to-green-500',
      description: 'Modo estándar para proyectos regulares'
    },
    {
      id: 'challenge' as const,
      label: 'Reto',
      icon: Trophy,
      gradient: 'from-amber-500 to-orange-500',
      description: 'Desafío de días consecutivos con racha'
    },
    {
      id: 'competition' as const,
      label: 'Competición',
      icon: Swords,
      gradient: 'from-red-500 to-pink-500',
      description: 'Compite con otros usuarios'
    }
  ];
  
  // Sub-opciones del modo Normal (Fases vs Flexible)
  const normalSubOptions = [
    {
      id: 'phases' as const,
      label: 'Por Fases',
      icon: Layers,
      gradient: 'from-blue-500 to-cyan-500',
      description: 'Organiza tareas en fases secuenciales'
    },
    {
      id: 'flexible' as const,
      label: 'Flexible',
      icon: Sparkles,
      gradient: 'from-teal-500 to-emerald-500',
      description: 'Trabaja en cualquier tarea sin orden'
    }
  ];

  // Seleccionar modo sin disparar feedback todavía
  const handleModeSelect = (option: typeof modeOptions[0]) => {
    // Si selecciona "Normal", mostrar sub-menú en lugar de confirmar
    if (option.id === 'normal') {
      setShowNormalSubmenu(true);
      return;
    }
    
    setSelectedMode(option.id);
    
    // Si selecciona "Reto", hacer focus en el input de días después de un breve delay
    if (option.id === 'challenge') {
      setTimeout(() => {
        if (challengeDaysInputRef.current) {
          challengeDaysInputRef.current.focus();
          challengeDaysInputRef.current.select(); // Seleccionar todo el texto para fácil reemplazo
        }
      }, 100);
    }
  };
  
  // Volver al menú principal desde el sub-menú
  const handleBackToMainMenu = () => {
    setShowNormalSubmenu(false);
    setNormalSubMode(null);
  };
  
  // Seleccionar sub-modo de Normal
  const handleNormalSubModeSelect = (subMode: 'phases' | 'flexible') => {
    setNormalSubMode(subMode);
    setSelectedMode('normal');
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
          <div className={`relative w-20 h-20 rounded-3xl flex items-center justify-center mb-5 shadow-2xl ${
            showNormalSubmenu 
              ? 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500 shadow-emerald-500/50'
              : 'bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 shadow-purple-500/50'
          }`}>
            <div className={`absolute inset-0 rounded-3xl blur-xl opacity-50 ${
              showNormalSubmenu 
                ? 'bg-gradient-to-br from-emerald-400 to-green-500'
                : 'bg-gradient-to-br from-indigo-400 to-purple-500'
            }`}></div>
            {showNormalSubmenu ? (
              <Target className="w-9 h-9 text-white relative z-10" />
            ) : (
              <Zap className="w-9 h-9 text-white relative z-10" />
            )}
          </div>
          
          <h1 className="text-white font-bold text-2xl mb-1 tracking-tight">
            {showNormalSubmenu ? 'Tipo de Proyecto' : 'Modo de Proyecto'}
          </h1>
          <p className="text-white/50 text-sm">
            {showNormalSubmenu ? 'Elige la organización de tareas' : project.title}
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

        {/* Content - Selección de Modos */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="max-w-2xl mx-auto space-y-6">
            
            {/* Botón de Volver cuando está en sub-menú */}
            {showNormalSubmenu && (
              <button
                onClick={handleBackToMainMenu}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-all duration-300 group mb-4"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                  <ArrowLeft className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Volver a Modos</span>
              </button>
            )}
            
            {/* Grid de modos - ESTILO FILTROS PREMIUM */}
            {!showNormalSubmenu ? (
              // Menú principal con los 3 modos
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {modeOptions.map((option) => {
                const isSelected = selectedMode === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleModeSelect(option)}
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
                      {isSelected && option.id === 'challenge' && (
                        <div className="w-full mt-2 text-left space-y-3 p-4 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 rounded-xl border border-yellow-500/20">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center">
                              <Flame className="w-4 h-4 text-white" />
                            </div>
                            <h4 className="text-yellow-400 font-semibold">Configuración del Reto</h4>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-white text-xs font-medium mb-1.5 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-yellow-400" />
                                Número de días consecutivos
                              </label>
                              <div className="relative">
                                <input
                                  ref={challengeDaysInputRef}
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={challengeDaysInput}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    // Permitir solo números y vacío
                                    if (value === '' || /^\d+$/.test(value)) {
                                      setChallengeDaysInput(value);
                                      // Actualizar el número solo si es válido
                                      const num = parseInt(value);
                                      if (!isNaN(num) && num >= 1 && num <= 365) {
                                        setChallengeDays(num);
                                      }
                                    }
                                  }}
                                  onBlur={(e) => {
                                    // Si está vacío al perder foco, poner el valor mínimo
                                    if (challengeDaysInput === '') {
                                      setChallengeDaysInput('1');
                                      setChallengeDays(1);
                                    } else {
                                      // Validar rango
                                      const num = parseInt(challengeDaysInput);
                                      if (num < 1) {
                                        setChallengeDaysInput('1');
                                        setChallengeDays(1);
                                      } else if (num > 365) {
                                        setChallengeDaysInput('365');
                                        setChallengeDays(365);
                                      }
                                    }
                                  }}
                                  placeholder="30"
                                  className="w-full px-3 py-2.5 bg-white/5 backdrop-blur-md border border-white/20 rounded-lg text-white text-sm placeholder-white/30 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-xs font-medium">días</div>
                              </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                id="resetOnMiss"
                                checked={resetOnMiss}
                                onChange={(e) => setResetOnMiss(e.target.checked)}
                                className="mt-1 w-5 h-5 text-yellow-500 bg-white/10 border-white/20 rounded focus:ring-2 focus:ring-yellow-500/50 cursor-pointer"
                              />
                              <label htmlFor="resetOnMiss" className="flex-1 cursor-pointer">
                                <div className="flex items-center gap-2 text-white font-semibold text-sm mb-1">
                                  {resetOnMiss ? (
                                    <>
                                      <RotateCcw className="w-4 h-4 text-red-400" />
                                      <span className="text-red-400">🔥 Modo Estricto</span>
                                    </>
                                  ) : (
                                    <>
                                      <TrendingUp className="w-4 h-4 text-green-400" />
                                      <span className="text-green-400">💪 Modo Flexible</span>
                                    </>
                                  )}
                                </div>
                                <p className="text-white/70 text-xs leading-relaxed">
                                  {resetOnMiss 
                                    ? 'Los días DEBEN ser consecutivos. Si fallas un día → se borra todo y empiezas de cero.'
                                    : 'Acumula días en cualquier orden. Puedes saltar días y tu progreso se mantiene.'
                                  }
                                </p>
                              </label>
                            </div>
                            
                            {/* Grid de 2 columnas para fecha y premio */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {/* Fecha de inicio */}
                              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                <label className="block text-white text-xs font-medium mb-1.5 flex items-center gap-2">
                                  <CalendarClock className="w-4 h-4 text-cyan-400" />
                                  Fecha de inicio
                                </label>
                                <input
                                  type="date"
                                  value={challengeStartDate}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => setChallengeStartDate(e.target.value)}
                                  className="w-full px-2.5 py-2 bg-white/5 backdrop-blur-md border border-white/20 rounded-lg text-white text-xs focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
                                />
                                <p className="text-white/50 text-[10px] mt-1">Hoy por defecto</p>
                              </div>
                              
                              {/* Premio o castigo */}
                              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                <label className="block text-white text-xs font-medium mb-1.5 flex items-center gap-2">
                                  <Gift className="w-4 h-4 text-purple-400" />
                                  Premio o castigo
                                </label>
                                <input
                                  type="text"
                                  value={challengeReward}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => setChallengeReward(e.target.value)}
                                  placeholder="Ej: Viaje a la playa..."
                                  className="w-full px-2.5 py-2 bg-white/5 backdrop-blur-md border border-white/20 rounded-lg text-white text-xs placeholder-white/40 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                                />
                                <p className="text-white/50 text-[10px] mt-1">Tu motivación</p>
                              </div>
                            </div>
                            
                            <div className="p-3 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/30">
                              <div className="flex items-center gap-2 text-yellow-400 font-semibold text-xs mb-1">
                                <Zap className="w-3.5 h-3.5" />
                                Vista previa del reto
                              </div>
                              <div className="text-white/80 text-xs space-y-1">
                                <div>
                                  <span className="font-bold text-white">{challengeDays} días</span> · 
                                  {resetOnMiss ? (
                                    <span className="text-red-400 font-medium"> Modo Estricto</span>
                                  ) : (
                                    <span className="text-green-400 font-medium"> Modo Flexible</span>
                                  )}
                                </div>
                                {challengeStartDate && (
                                  <div className="text-cyan-400">
                                    📅 Inicia: {new Date(challengeStartDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                  </div>
                                )}
                                {challengeReward && (
                                  <div className="text-purple-400">
                                    🎁 {challengeReward}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {isSelected && option.id === 'competition' && (
                        <div className="w-full mt-2 text-left space-y-3 p-4 bg-gradient-to-br from-red-500/5 to-pink-500/5 rounded-xl border border-red-500/20">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-400 to-pink-600 flex items-center justify-center">
                              <Swords className="w-4 h-4 text-white" />
                            </div>
                            <h4 className="text-red-400 font-semibold">Configuración de la Competición</h4>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-white text-xs font-medium mb-1.5 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-red-400" />
                                Fecha límite <span className="text-white/40 font-normal">(opcional)</span>
                              </label>
                              <input
                                type="date"
                                value={competitionDeadline}
                                onChange={(e) => setCompetitionDeadline(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-3 py-2.5 bg-white/5 backdrop-blur-md border border-white/20 rounded-lg text-white text-sm placeholder-white/30 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all"
                              />
                            </div>

                            <div>
                              <label className="block text-white text-xs font-medium mb-1.5 flex items-center gap-2">
                                <Users className="w-4 h-4 text-red-400" />
                                Seleccionar oponentes
                              </label>
                              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar p-1">
                                {teamMembers.length === 0 ? (
                                  <div className="text-center py-4 text-white/40 text-sm">No hay miembros disponibles en este proyecto</div>
                                ) : (
                                  teamMembers.map((member) => (
                                    <button
                                      key={member.id}
                                      onClick={() => toggleOpponent(member.id)}
                                      className={`w-full p-2.5 rounded-lg border-2 transition-all duration-200 text-left ${
                                        selectedOpponents.includes(member.id)
                                          ? 'border-red-500/60 bg-red-500/10 shadow-md'
                                          : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                                          selectedOpponents.includes(member.id)
                                            ? 'bg-gradient-to-br from-red-400 to-pink-600'
                                            : 'bg-gradient-to-br from-slate-600 to-slate-700'
                                        }`}>
                                          {member.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                          <div className="text-white text-sm font-medium">{member.name}</div>
                                          <div className="text-white/40 text-xs">{member.email || 'Sin email'}</div>
                                        </div>
                                        {selectedOpponents.includes(member.id) && (
                                          <CheckCircle2 className="w-4 h-4 text-red-400" />
                                        )}
                                      </div>
                                    </button>
                                  ))
                                )}
                              </div>
                            </div>

                            <div>
                              <label className="block text-white text-xs font-medium mb-1.5 flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-red-400" />
                                Apuesta o premio <span className="text-white/40 font-normal">(opcional)</span>
                              </label>
                              <input
                                type="text"
                                value={stake}
                                onChange={(e) => setStake(e.target.value)}
                                placeholder="Ej: $100, Cena gratis, Café..."
                                className="w-full px-3 py-2.5 bg-white/5 backdrop-blur-md border border-white/20 rounded-lg text-white text-sm placeholder-white/30 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all"
                              />
                            </div>

                            {(selectedOpponents.length > 0 || competitionDeadline || stake) && (
                              <div className="p-3 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-lg border border-red-500/30">
                                <div className="flex items-center gap-2 text-red-400 font-semibold text-xs mb-1">
                                  <Zap className="w-3.5 h-3.5" />
                                  Vista previa de la competición
                                </div>
                                <div className="text-white/80 text-xs space-y-1">
                                  {selectedOpponents.length > 0 && (
                                    <div>
                                      <span className="font-bold text-white">{selectedOpponents.length}</span> oponente{selectedOpponents.length !== 1 ? 's' : ''}
                                    </div>
                                  )}
                                  {competitionDeadline && (
                                    <div className="text-orange-400">Límite: {new Date(competitionDeadline).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                  )}
                                  {stake && <div className="text-yellow-400">Premio: {stake}</div>}
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
            ) : (
              // Sub-menú de Normal (Fases vs Flexible)
              <div>
                <h2 className="text-white font-bold text-xl mb-2">Tipo de Proyecto Normal</h2>
                <p className="text-white/60 text-sm mb-6">Elige cómo quieres organizar las tareas</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {normalSubOptions.map((option) => {
                    const isSelected = normalSubMode === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleNormalSubModeSelect(option.id)}
                        className={`group relative p-6 rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-md border ${
                          isSelected
                            ? 'bg-white/10 border-purple-400/50 hover:bg-white/15'
                            : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
                        }`}
                        style={{ minHeight: '160px' }}
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
                          <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${option.gradient} shadow-xl`}>
                            <div className={`absolute inset-0 bg-gradient-to-br ${option.gradient} rounded-2xl blur-xl opacity-50`}></div>
                            <option.icon className="w-8 h-8 text-white relative z-10" />
                          </div>

                          {/* Título y descripción */}
                          <div className="space-y-2">
                            <div className="text-lg font-bold text-white">{option.label}</div>
                            <div className="text-white/70 text-sm">{option.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer con botón confirmar - ESTILO QUICK PROJECT */}
        <div className="border-t border-white/10 bg-gradient-to-b from-black/30 to-black/50 backdrop-blur-xl p-4 sm:p-6">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={handleConfirm}
              disabled={!selectedMode || !!selectedModeFeedback}
              className="w-full relative px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 hover:from-purple-600 hover:via-indigo-600 hover:to-pink-600 text-white font-bold text-lg transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xl overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
              <span className="relative z-10 flex items-center justify-center gap-3">
                <CheckCircle className="w-6 h-6" />
                Confirmar Modo
              </span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Feedback visual al seleccionar modo - IGUAL A FILTROS */}
      {selectedModeFeedback && (
        <>
          {/* Backdrop opaco que acompaña la animación */}
          <div className="fixed inset-0 z-[1999] bg-black/60 animate-fadeInOut pointer-events-none"></div>
          
          {/* Icono centrado */}
          <div className="fixed inset-0 z-[2000] pointer-events-none flex items-center justify-center">
            <div className="animate-filterFeedback">
              <div className="relative">
                {/* Resplandor grande detrás */}
                <div 
                  className={`absolute -inset-8 bg-gradient-to-br ${selectedModeFeedback.gradient} rounded-full blur-3xl opacity-40`}
                ></div>
                
                {/* Icono principal con brillo */}
                <div className={`relative w-28 h-28 rounded-3xl bg-gradient-to-br ${selectedModeFeedback.gradient} flex items-center justify-center shadow-2xl`}>
                  {/* Resplandor interno */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${selectedModeFeedback.gradient} rounded-3xl blur-xl opacity-50`}></div>
                  
                  <selectedModeFeedback.icon className="w-14 h-14 text-white relative z-10 drop-shadow-2xl" />
                </div>
                
                {/* Label debajo */}
                <div className="mt-3 text-center">
                  <p className="text-white font-bold text-lg drop-shadow-2xl">
                    {selectedModeFeedback.label}
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