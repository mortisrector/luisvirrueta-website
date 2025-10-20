'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Target, 
  Hash, 
  Star, 
  CheckCircle, 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  Zap,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Trophy,
  Crown,
  Diamond,
  Shield,
  Rocket,
  Heart,
  Briefcase,
  Coffee,
  Palette,
  Camera,
  Music,
  BookOpen,
  Code,
  Home,
  Car,
  Plane,
  Gamepad2,
  Dumbbell,
  Flame,
  Plus,
  Save
} from 'lucide-react';

interface ProjectTaskData {
  title: string;
  description?: string;
  type: 'boolean' | 'numeric' | 'subjective';
  target?: number;
  unit?: string;
  priority: 'baja' | 'media' | 'alta';
  category?: string;
  dueDate?: string;
  estimatedTime?: string;
  assignedTo?: string;
  icon?: string;
  colorScheme?: string;
}

interface ProjectTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (taskData: ProjectTaskData) => void;
  projectTitle: string;
}

const premiumIcons = [
  { icon: Target, name: 'target', category: 'goals', label: 'Objetivo' },
  { icon: Trophy, name: 'trophy', category: 'goals', label: 'Logro' },
  { icon: Star, name: 'star', category: 'goals', label: 'Estrella' },
  { icon: Crown, name: 'crown', category: 'goals', label: 'Premium' },
  { icon: Diamond, name: 'diamond', category: 'goals', label: 'Diamante' },
  { icon: Shield, name: 'shield', category: 'goals', label: 'Escudo' },
  { icon: Rocket, name: 'rocket', category: 'goals', label: 'Proyecto' },
  { icon: Zap, name: 'zap', category: 'goals', label: 'Energía' },
  { icon: Flame, name: 'flame', category: 'goals', label: 'Trending' },
  { icon: Sparkles, name: 'sparkles', category: 'goals', label: 'Magia' },
  { icon: Briefcase, name: 'briefcase', category: 'work', label: 'Trabajo' },
  { icon: Coffee, name: 'coffee', category: 'work', label: 'Café' },
  { icon: Clock, name: 'clock', category: 'work', label: 'Tiempo' },
  { icon: Calendar, name: 'calendar', category: 'work', label: 'Calendario' },
  { icon: CheckCircle, name: 'check-circle', category: 'work', label: 'Completar' },
  { icon: Hash, name: 'hash', category: 'work', label: 'Numérico' },
  { icon: Palette, name: 'palette', category: 'creative', label: 'Arte' },
  { icon: Camera, name: 'camera', category: 'creative', label: 'Fotografía' },
  { icon: Music, name: 'music', category: 'creative', label: 'Música' },
  { icon: BookOpen, name: 'book-open', category: 'education', label: 'Estudio' },
  { icon: Code, name: 'code', category: 'education', label: 'Programación' },
  { icon: Heart, name: 'heart', category: 'personal', label: 'Salud' },
  { icon: Home, name: 'home', category: 'personal', label: 'Hogar' },
  { icon: Car, name: 'car', category: 'personal', label: 'Transporte' },
  { icon: Plane, name: 'plane', category: 'personal', label: 'Viajes' },
  { icon: Gamepad2, name: 'gamepad2', category: 'entertainment', label: 'Gaming' },
  { icon: Dumbbell, name: 'dumbbell', category: 'entertainment', label: 'Fitness' },
  { icon: User, name: 'user', category: 'entertainment', label: 'Personal' },
  { icon: Tag, name: 'tag', category: 'entertainment', label: 'Etiqueta' }
];

const colorSchemes = [
  { name: 'electric-blue', label: 'Eléctrico Azul', gradient: 'from-blue-500 to-cyan-500' },
  { name: 'electric-green', label: 'Eléctrico Verde', gradient: 'from-green-500 to-emerald-500' },
  { name: 'electric-purple', label: 'Eléctrico Morado', gradient: 'from-purple-500 to-pink-500' },
  { name: 'cosmic', label: 'Cosmic Purple', gradient: 'from-purple-500 to-blue-600' },
  { name: 'sunset', label: 'Sunset Bliss', gradient: 'from-orange-500 to-pink-500' },
  { name: 'forest', label: 'Forest Green', gradient: 'from-green-500 to-emerald-600' },
  { name: 'ocean', label: 'Ocean Breeze', gradient: 'from-blue-500 to-cyan-500' },
  { name: 'fire', label: 'Fire Red', gradient: 'from-red-500 to-orange-500' },
  { name: 'lavender', label: 'Lavender Dreams', gradient: 'from-purple-400 to-pink-400' },
  { name: 'mint', label: 'Mint Fresh', gradient: 'from-emerald-400 to-teal-400' },
  { name: 'gold', label: 'Golden Hour', gradient: 'from-yellow-500 to-orange-500' },
  { name: 'silver', label: 'Silver Shine', gradient: 'from-gray-400 to-slate-500' },
];

export default function ProjectTaskModal({
  isOpen,
  onClose,
  onCreateTask,
  projectTitle
}: ProjectTaskModalProps) {
  const [taskData, setTaskData] = useState<ProjectTaskData>({
    title: '',
    description: '',
    type: 'boolean',
    priority: 'media',
    category: '',
    dueDate: '',
    estimatedTime: '',
    assignedTo: '',
    icon: 'target',
    colorScheme: 'ocean'
  });

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setTaskData({
        title: '',
        description: '',
        type: 'boolean',
        priority: 'media',
        category: '',
        dueDate: '',
        estimatedTime: '',
        assignedTo: '',
        icon: 'target',
        colorScheme: 'electric-blue'
      });
      // Bloquear scroll del body
      document.body.style.overflow = 'hidden';
    } else {
      // Restaurar scroll del body
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const taskTypes = [
    {
      type: 'boolean' as const,
      icon: CheckCircle,
      title: 'Tarea Booleana',
      description: 'Completar / No completar',
      color: 'from-emerald-500 to-green-600',
      examples: ['Llamar al cliente', 'Enviar informe', 'Revisar código']
    },
    {
      type: 'numeric' as const,
      icon: Hash,
      title: 'Tarea Numérica',
      description: 'Alcanzar una meta numérica',
      color: 'from-blue-500 to-cyan-600',
      examples: ['Escribir 2000 palabras', 'Hacer 50 flexiones', 'Leer 3 capítulos']
    },
    {
      type: 'subjective' as const,
      icon: Star,
      title: 'Tarea Subjetiva',
      description: 'Calificar del 1 al 10',
      color: 'from-purple-500 to-pink-600',
      examples: ['Calidad del diseño', 'Satisfacción personal', 'Nivel de energía']
    }
  ];

  const priorities = [
    { value: 'alta', label: 'Alta', gradient: 'from-red-500 to-red-600' },
    { value: 'media', label: 'Media', gradient: 'from-orange-500 to-orange-600' },
    { value: 'baja', label: 'Baja', gradient: 'from-blue-500 to-blue-600' }
  ];

  const steps = [
    { title: 'Tipo de Tarea', description: 'Selecciona el tipo' },
    { title: 'Información Básica', description: 'Título y descripción' },
    { title: 'Personalización', description: 'Icono y colores' },
    { title: 'Configuración', description: 'Prioridad y detalles' }
  ];

  const getSelectedIcon = () => {
    const iconData = premiumIcons.find(icon => icon.name === taskData.icon);
    return iconData ? iconData.icon : Target;
  };

  const getSelectedColorScheme = () => {
    return colorSchemes.find(scheme => scheme.name === taskData.colorScheme) || colorSchemes[0];
  };

  const handleSubmit = () => {
    if (!taskData.title.trim()) return;
    onCreateTask(taskData);
    onClose();
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true;
      case 1: return taskData.title.trim().length > 0;
      case 2: return true;
      case 3: return true;
      default: return false;
    }
  };

  const SelectedIcon = getSelectedIcon();
  const selectedColorScheme = getSelectedColorScheme();

  return (
    <>
      {/* OVERLAY FULL SCREEN - FUERZA PANTALLA COMPLETA */}
      <div 
        className="fixed inset-0 w-screen h-screen bg-black/80 backdrop-blur-xl"
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 99999,
          margin: 0,
          padding: 0,
          boxSizing: 'border-box'
        }}
      >
        {/* MODAL CONTAINER SIN LIMITACIONES */}
        <div 
          className="w-screen h-screen bg-gradient-to-br from-slate-900/95 via-cyan-900/20 to-teal-900/30 backdrop-blur-2xl flex flex-col"
          style={{
            position: 'relative',
            width: '100vw',
            height: '100vh',
            margin: 0,
            padding: 0,
            maxWidth: 'none',
            maxHeight: 'none',
            minWidth: '100vw',
            minHeight: '100vh',
            boxSizing: 'border-box'
          }}
        >
          {/* EFECTOS DE FONDO - TONOS TURQUESA SUTILES */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-teal-500/8 to-emerald-500/5"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-cyan-500/12 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-radial from-teal-500/10 to-transparent rounded-full blur-3xl"></div>
          
          {/* HEADER */}
          <div className="relative z-10 p-8 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 bg-gradient-to-br ${selectedColorScheme.gradient} rounded-2xl flex items-center justify-center shadow-2xl`}>
                  <SelectedIcon className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
                <div>
                  <h1 className="text-3xl font-light text-white/95 mb-1">Crear Nueva Tarea</h1>
                  <p className="text-white/60">Proyecto: {projectTitle}</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105"
              >
                <X className="w-6 h-6 text-white/80" />
              </button>
            </div>

            {/* PROGRESS BAR */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                      index <= currentStep 
                        ? `bg-gradient-to-r ${selectedColorScheme.gradient} text-white shadow-lg` 
                        : 'bg-white/10 text-white/50'
                    }`}>
                      {index + 1}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-24 h-1 mx-4 rounded-full transition-all duration-500 ${
                        index < currentStep 
                          ? `bg-gradient-to-r ${selectedColorScheme.gradient}` 
                          : 'bg-white/20'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center">
                <h3 className="text-xl font-medium text-white/90">{steps[currentStep].title}</h3>
                <p className="text-white/60 mt-1">{steps[currentStep].description}</p>
              </div>
            </div>
          </div>

          {/* CONTENIDO PRINCIPAL */}
          <div className="relative z-10 flex-1 p-8 overflow-y-auto">
            
            {/* STEP 1: TIPO DE TAREA */}
            {currentStep === 0 && (
              <div className="max-w-5xl mx-auto">
                <h3 className="text-3xl font-light text-white/90 mb-12 text-center">¿Qué tipo de tarea quieres crear?</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {taskTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.type}
                        onClick={() => {
                          setTaskData(prev => ({ ...prev, type: type.type }));
                          nextStep();
                        }}
                        className={`p-8 rounded-3xl border border-white/20 hover:border-white/40 bg-gradient-to-br ${type.color}/20 hover:${type.color}/30 transition-all duration-500 text-left group hover:scale-105 hover:shadow-2xl`}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${type.color} flex items-center justify-center group-hover:scale-110 transition-all duration-300 mb-6 shadow-xl`}>
                            <Icon className="w-10 h-10 text-white" />
                          </div>
                          <h4 className="text-xl font-medium text-white/90 mb-3">{type.title}</h4>
                          <p className="text-white/60 mb-4">{type.description}</p>
                          <div className="space-y-2">
                            <p className="text-white/50 text-sm font-medium">Ejemplos:</p>
                            {type.examples.map((example, idx) => (
                              <div key={idx} className="text-white/40 text-sm">• {example}</div>
                            ))}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: INFORMACIÓN BÁSICA */}
            {currentStep === 1 && (
              <div className="max-w-3xl mx-auto space-y-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-light text-white/90 mb-4">Información Básica</h3>
                  <p className="text-white/60">Dale un nombre y descripción a tu tarea</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-white/80 text-lg font-medium mb-3">Nombre de la Tarea</label>
                    <input
                      type="text"
                      value={taskData.title}
                      onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-300 text-lg"
                      placeholder="Ej: Completar informe mensual"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-lg font-medium mb-3">Descripción (Opcional)</label>
                    <textarea
                      value={taskData.description}
                      onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-300 text-lg resize-none"
                      placeholder="Describe los detalles de la tarea..."
                      rows={4}
                    />
                  </div>

                  {taskData.type === 'numeric' && (
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-white/80 text-lg font-medium mb-3">Meta Numérica</label>
                        <input
                          type="number"
                          value={taskData.target || ''}
                          onChange={(e) => setTaskData(prev => ({ ...prev, target: parseInt(e.target.value) || undefined }))}
                          className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-300 text-lg"
                          placeholder="Ej: 100"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-lg font-medium mb-3">Unidad</label>
                        <input
                          type="text"
                          value={taskData.unit || ''}
                          onChange={(e) => setTaskData(prev => ({ ...prev, unit: e.target.value }))}
                          className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-300 text-lg"
                          placeholder="Ej: páginas, km, horas"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: PERSONALIZACIÓN */}
            {currentStep === 2 && (
              <div className="max-w-5xl mx-auto space-y-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-light text-white/90 mb-4">Personalización</h3>
                  <p className="text-white/60">Elige un icono y esquema de color para tu tarea</p>
                </div>

                {/* PREVIEW */}
                <div className="flex justify-center mb-12">
                  <div className={`w-32 h-32 bg-gradient-to-br ${selectedColorScheme.gradient} rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-all duration-300`}>
                    <SelectedIcon className="w-16 h-16 text-white drop-shadow-lg" />
                  </div>
                </div>

                {/* ICONOS */}
                <div className="mb-12">
                  <h4 className="text-xl font-medium text-white/90 mb-6">Selecciona un Icono</h4>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                    {premiumIcons.map((iconData) => {
                      const Icon = iconData.icon;
                      const isSelected = taskData.icon === iconData.name;
                      return (
                        <button
                          key={iconData.name}
                          onClick={() => setTaskData(prev => ({ ...prev, icon: iconData.name }))}
                          className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 ${
                            isSelected 
                              ? `bg-gradient-to-br ${selectedColorScheme.gradient} shadow-xl` 
                              : 'bg-white/10 hover:bg-white/20'
                          }`}
                          title={iconData.label}
                        >
                          <Icon className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-white/70'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* COLORES */}
                <div>
                  <h4 className="text-xl font-medium text-white/90 mb-6">Esquema de Color</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {colorSchemes.map((scheme) => {
                      const isSelected = taskData.colorScheme === scheme.name;
                      return (
                        <button
                          key={scheme.name}
                          onClick={() => setTaskData(prev => ({ ...prev, colorScheme: scheme.name }))}
                          className={`p-4 rounded-2xl transition-all duration-300 hover:scale-105 ${
                            isSelected 
                              ? 'bg-white/20 border-2 border-white/40' 
                              : 'bg-white/5 border border-white/20 hover:bg-white/10'
                          }`}
                        >
                          <div className={`w-full h-16 bg-gradient-to-r ${scheme.gradient} rounded-xl mb-3 shadow-lg`}></div>
                          <p className="text-white/80 text-sm font-medium">{scheme.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: CONFIGURACIÓN */}
            {currentStep === 3 && (
              <div className="max-w-3xl mx-auto space-y-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-light text-white/90 mb-4">Configuración Final</h3>
                  <p className="text-white/60">Establece la prioridad y otros detalles</p>
                </div>

                <div className="space-y-8">
                  {/* PRIORIDAD */}
                  <div>
                    <label className="block text-white/80 text-lg font-medium mb-4">Prioridad</label>
                    <div className="grid grid-cols-3 gap-4">
                      {priorities.map((priority) => (
                        <button
                          key={priority.value}
                          onClick={() => setTaskData(prev => ({ ...prev, priority: priority.value as any }))}
                          className={`p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                            taskData.priority === priority.value
                              ? `bg-gradient-to-r ${priority.gradient}/20 border-white/40`
                              : 'bg-white/5 border-white/20 hover:bg-white/10'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${priority.gradient} mx-auto mb-3`}></div>
                          <p className="text-white/90 font-medium">{priority.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* OTROS CAMPOS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white/80 text-lg font-medium mb-3">Fecha Límite</label>
                      <input
                        type="date"
                        value={taskData.dueDate}
                        onChange={(e) => setTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-lg font-medium mb-3">Tiempo Estimado</label>
                      <input
                        type="text"
                        value={taskData.estimatedTime}
                        onChange={(e) => setTaskData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                        className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-300"
                        placeholder="Ej: 2 horas"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="relative z-10 p-8 border-t border-white/10 flex-shrink-0">
            <div className="flex justify-between items-center">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                  currentStep === 0 
                    ? 'opacity-50 cursor-not-allowed bg-white/5' 
                    : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
                Anterior
              </button>

              <div className="text-center">
                <p className="text-white/60 text-sm">Paso {currentStep + 1} de {steps.length}</p>
              </div>

              {currentStep < steps.length - 1 ? (
                <button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                    canProceed()
                      ? `bg-gradient-to-r ${selectedColorScheme.gradient} text-white hover:scale-105 shadow-lg`
                      : 'opacity-50 cursor-not-allowed bg-white/5'
                  }`}
                >
                  Siguiente
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canProceed()}
                  className={`flex items-center gap-3 px-8 py-3 rounded-xl transition-all duration-300 ${
                    canProceed()
                      ? `bg-gradient-to-r ${selectedColorScheme.gradient} text-white hover:scale-105 shadow-lg`
                      : 'opacity-50 cursor-not-allowed bg-white/5'
                  }`}
                >
                  <Save className="w-5 h-5" />
                  Crear Tarea
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}