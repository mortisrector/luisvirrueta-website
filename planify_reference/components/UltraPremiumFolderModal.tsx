'use client';

import React, { useState, useEffect } from 'react';
import { User, Team, ShareSettings, Project, Task } from '@/types';
import { mockUsers, mockTeams } from '@/lib/mockData';
import { getUserColor, generateUserAvatar } from '@/lib/userColors';
import { useToggle, useInputState, useArrayState, useModal } from '@/hooks/useOptimizedHooks';
import { capitalizeFirst } from '@/utils/textUtils';
import { 
  X, 
  Plus, 
  Folder, 
  Target, 
  Users, 
  Share2, 
  Globe, 
  Lock, 
  Eye,
  Sparkles,
  Palette,
  Camera,
  Music,
  BookOpen,
  Code,
  Heart,
  Briefcase,
  Coffee,
  Plane,
  Star,
  Trophy,
  Crown,
  Diamond,
  Shield,
  Rocket,
  Home,
  Car,
  Zap,
  Moon,
  CheckSquare,
  Sun,
  Flame,
  Droplets,
  Leaf,
  Gamepad2,
  Dumbbell,
  Circle,
  Hash,
  User as UserIcon,
  Settings,
  Layout,
  Activity,
  BarChart3,
  Mail,
  Send,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Minus,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  FileText,
  Layers,
  Hash as HashIcon,
  Brain,
  ArrowRight,
  Wand2,
  Repeat,
  Timer,
  Edit3,
  Trash2,
  UserPlus
} from 'lucide-react';

interface UltraPremiumFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (folderData: any) => void;
}

interface FolderProject {
  id: string;
  title: string;
  description: string;
  icon: string;
  colorScheme: string;
  tasks: FolderTask[];
  assignedTo: User[];
  dueDate?: string;
  dueTime?: string;
  createdAt: string;
  updatedAt: string;
}

interface FolderTask {
  id: string;
  title: string;
  type: 'checklist' | 'counter' | 'skill';
  done?: boolean;
  current?: number;
  target?: number;
  score0to1?: number;
  assignedTo: User[];
  dueDate?: string;
  dueTime?: string;
  createdAt: string;
  updatedAt: string;
}

const premiumIcons = [
  // Trabajo & Productividad
  { icon: Briefcase, name: 'briefcase', category: 'work', label: 'Trabajo' },
  { icon: Coffee, name: 'coffee', category: 'work', label: 'Café' },
  { icon: Target, name: 'target', category: 'work', label: 'Objetivos' },
  { icon: Layout, name: 'layout', category: 'work', label: 'Diseño' },
  
  // Creatividad & Arte
  { icon: Palette, name: 'palette', category: 'creative', label: 'Arte' },
  { icon: Camera, name: 'camera', category: 'creative', label: 'Fotografía' },
  { icon: Music, name: 'music', category: 'creative', label: 'Música' },
  { icon: Wand2, name: 'wand2', category: 'creative', label: 'Magia' },
  
  // Educación & Desarrollo
  { icon: BookOpen, name: 'book-open', category: 'education', label: 'Estudio' },
  { icon: Code, name: 'code', category: 'education', label: 'Programación' },
  { icon: Brain, name: 'brain', category: 'education', label: 'Aprendizaje' },
  
  // Personal & Vida
  { icon: Heart, name: 'heart', category: 'personal', label: 'Salud' },
  { icon: Home, name: 'home', category: 'personal', label: 'Hogar' },
  { icon: Car, name: 'car', category: 'personal', label: 'Transporte' },
  { icon: Plane, name: 'plane', category: 'personal', label: 'Viajes' },
  
  // Entretenimiento
  { icon: Gamepad2, name: 'gamepad2', category: 'entertainment', label: 'Gaming' },
  { icon: Dumbbell, name: 'dumbbell', category: 'entertainment', label: 'Fitness' },
  
  // Premium & Especiales
  { icon: Star, name: 'star', category: 'premium', label: 'Favorito' },
  { icon: Trophy, name: 'trophy', category: 'premium', label: 'Logros' },
  { icon: Crown, name: 'crown', category: 'premium', label: 'VIP' },
  { icon: Diamond, name: 'diamond', category: 'premium', label: 'Premium' },
  { icon: Shield, name: 'shield', category: 'premium', label: 'Seguridad' },
  { icon: Rocket, name: 'rocket', category: 'premium', label: 'Proyecto' },
  
  // Elementos naturales
  { icon: Sun, name: 'sun', category: 'nature', label: 'Sol' },
  { icon: Moon, name: 'moon', category: 'nature', label: 'Luna' },
  { icon: Flame, name: 'flame', category: 'nature', label: 'Fuego' },
  { icon: Droplets, name: 'droplets', category: 'nature', label: 'Agua' },
  { icon: Leaf, name: 'leaf', category: 'nature', label: 'Naturaleza' },
  { icon: Zap, name: 'zap', category: 'nature', label: 'Energía' }
];

const colorSchemes = [
  { 
    id: 'cosmic-purple', 
    name: 'Púrpura Cósmico',
    primary: 'from-purple-600 to-pink-600',
    secondary: 'from-purple-500/20 to-pink-500/20',
    accent: 'border-purple-400/30',
    text: 'text-purple-100'
  },
  { 
    id: 'ocean-blue', 
    name: 'Azul Océano',
    primary: 'from-blue-600 to-cyan-600',
    secondary: 'from-blue-500/20 to-cyan-500/20',
    accent: 'border-blue-400/30',
    text: 'text-blue-100'
  },
  { 
    id: 'emerald-forest', 
    name: 'Verde Esmeralda',
    primary: 'from-emerald-600 to-teal-600',
    secondary: 'from-emerald-500/20 to-teal-500/20',
    accent: 'border-emerald-400/30',
    text: 'text-emerald-100'
  },
  { 
    id: 'sunset-orange', 
    name: 'Naranja Atardecer',
    primary: 'from-orange-600 to-red-600',
    secondary: 'from-orange-500/20 to-red-500/20',
    accent: 'border-orange-400/30',
    text: 'text-orange-100'
  },
  { 
    id: 'golden-amber', 
    name: 'Ámbar Dorado',
    primary: 'from-amber-600 to-yellow-600',
    secondary: 'from-amber-500/20 to-yellow-500/20',
    accent: 'border-amber-400/30',
    text: 'text-amber-100'
  },
  { 
    id: 'royal-indigo', 
    name: 'Índigo Real',
    primary: 'from-indigo-600 to-purple-600',
    secondary: 'from-indigo-500/20 to-purple-500/20',
    accent: 'border-indigo-400/30',
    text: 'text-indigo-100'
  }
];

export default function UltraPremiumFolderModal({ isOpen, onClose, onSave }: UltraPremiumFolderModalProps) {
  const [activeTab, setActiveTab] = useState<'config' | 'team' | 'projects' | 'settings'>('config');
  
  // Estados optimizados con hooks personalizados
  const folderNameState = useInputState('');
  const descriptionState = useInputState('');
  const dueDateState = useInputState('');
  const dueTimeState = useInputState('');
  const inviteEmailState = useInputState('');
  
  const isEditingNameToggle = useToggle(false);
  const isRecurrentToggle = useToggle(false);
  
  const [selectedIcon, setSelectedIcon] = useState(premiumIcons[0]);
  const [selectedColor, setSelectedColor] = useState(colorSchemes[0]);
  const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [resetTime, setResetTime] = useState('00:00');
  
  // Estado del equipo mejorado con hooks optimizados
  const selectedUsersArray = useArrayState<User>([]);
  const selectedTeamsArray = useArrayState<Team>([]);
  
  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    isShared: false,
    isPublic: false,
    allowComments: true,
    allowEditing: false,
    shareLevel: 'view'
  });
  
  // Alias para compatibilidad con el código existente
  const folderName = folderNameState.value;
  const setFolderName = folderNameState.setValue;
  const description = descriptionState.value;
  const setDescription = descriptionState.setValue;
  const inviteEmail = inviteEmailState.value;
  const setInviteEmail = inviteEmailState.setValue;
  const isEditingName = isEditingNameToggle.value;
  const setIsEditingName = isEditingNameToggle.setValue;
  const isRecurrent = isRecurrentToggle.value;
  const setIsRecurrent = isRecurrentToggle.setValue;
  const selectedUsers = selectedUsersArray.items;
  const setSelectedUsers = selectedUsersArray.setItems;
  const selectedTeams = selectedTeamsArray.items;
  const setSelectedTeams = selectedTeamsArray.setItems;
  const folderDueDate = dueDateState.value;
  const folderDueTime = dueTimeState.value;
  
  // Estado de proyectos y tareas
  const [projects, setProjects] = useState<FolderProject[]>([]);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  
  // Estado para tareas organizadas por tipo
  const [tasks, setTasks] = useState<{ [key: string]: FolderTask[] }>({
    checklist: [],
    counter: [],
    skill: []
  });
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['checklist']));
  const [newTaskType, setNewTaskType] = useState<'checklist' | 'counter' | 'skill'>('checklist');
  
  // Estado para carruseles
  const [iconPage, setIconPage] = useState(0);
  const [colorPage, setColorPage] = useState(0);
  
  // Configuración del carrusel
  const iconsPerPage = 20;
  const colorsPerPage = 6;
  const totalIconPages = Math.ceil(premiumIcons.length / iconsPerPage);
  const totalColorPages = Math.ceil(colorSchemes.length / colorsPerPage);

  const handleSave = () => {
    const folderData = {
      id: `folder_${Date.now()}`,
      name: folderName,
      icon: selectedIcon.name,
      color: selectedColor.id,
      description,
      isRecurrent,
      recurrenceType: isRecurrent ? recurrenceType : null,
      resetTime: isRecurrent ? resetTime : null,
      dueDate: folderDueDate || null,
      dueTime: folderDueTime || null,
      collaborators: selectedUsers,
      teams: selectedTeams,
      shareSettings,
      projects,
      tasks, // Tareas organizadas por tipo
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    onSave(folderData);
    onClose();
  };

  // Funciones de invitación por email
  const handleSendInvite = () => {
    if (inviteEmail.trim()) {
      // Aquí se enviaría la invitación real
      console.log(`Invitación enviada a: ${inviteEmail}`);
      setInviteEmail('');
      // TODO: Implementar envío real de email
    }
  };

  // Funciones para manejar proyectos
  const addProject = () => {
    const newProject = {
      id: `project_${Date.now()}`,
      title: 'Nuevo Proyecto',
      description: '',
      icon: 'Target',
      colorScheme: 'default',
      tasks: [],
      assignedTo: [],
      dueDate: '',
      dueTime: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProjects([...projects, newProject]);
  };

  const updateProject = (projectId: string, field: string, value: any) => {
    setProjects(prev => 
      prev.map(project => 
        project.id === projectId ? { ...project, [field]: value } : project
      )
    );
  };

  const removeProject = (projectId: string) => {
    setProjects(prev => prev.filter(project => project.id !== projectId));
  };

  const addTaskToProject = (projectId: string) => {
    const newTask = {
      id: `task_${Date.now()}`,
      title: 'Nueva Tarea',
      type: 'checklist' as 'checklist' | 'counter' | 'skill',
      done: false,
      assignedTo: [],
      dueDate: '',
      dueTime: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProjects(prev =>
      prev.map(project =>
        project.id === projectId
          ? { ...project, tasks: [...project.tasks, newTask] }
          : project
      )
    );
  };

  const updateTask = (projectId: string, taskId: string, field: string, value: any) => {
    setProjects(prev =>
      prev.map(project =>
        project.id === projectId
          ? {
              ...project,
              tasks: project.tasks.map(task =>
                task.id === taskId ? { ...task, [field]: value } : task
              )
            }
          : project
      )
    );
  };

  const removeTask = (projectId: string, taskId: string) => {
    setProjects(prev =>
      prev.map(project =>
        project.id === projectId
          ? { ...project, tasks: project.tasks.filter(task => task.id !== taskId) }
          : project
      )
    );
  };

  const toggleProjectExpanded = (projectId: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  // Función para obtener indicador de fecha límite
  const getDueDateStatus = (dueDate?: string, dueTime?: string) => {
    if (!dueDate) return null;
    
    const now = new Date();
    const deadline = new Date(`${dueDate}T${dueTime || '23:59'}`);
    const timeDiff = deadline.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    if (hoursDiff < 0) return 'overdue';
    if (hoursDiff < 2) return 'urgent';
    if (hoursDiff < 24) return 'soon';
    return 'normal';
  };

  // Funciones para manejar tareas por tipo
  const addTaskByType = (type: 'checklist' | 'counter' | 'skill') => {
    const newTask: FolderTask = {
      id: `task_${Date.now()}`,
      title: '',
      type,
      assignedTo: [],
      dueDate: '',
      dueTime: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setTasks(prev => ({
      ...prev,
      [type]: [...prev[type], newTask]
    }));

    // Expandir la sección si no está expandida
    setExpandedSections(prev => new Set([...prev, type]));
  };

  const updateTaskByType = (type: 'checklist' | 'counter' | 'skill', taskId: string, field: string, value: any) => {
    setTasks(prev => ({
      ...prev,
      [type]: prev[type].map(task => 
        task.id === taskId ? { ...task, [field]: value, updatedAt: new Date().toISOString() } : task
      )
    }));
  };

  const removeTaskByType = (type: 'checklist' | 'counter' | 'skill', taskId: string) => {
    setTasks(prev => ({
      ...prev,
      [type]: prev[type].filter(task => task.id !== taskId)
    }));
  };

  const toggleSectionExpanded = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  if (!isOpen) return null;

  const currentColorScheme = selectedColor;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50">
      <div className="bg-gray-900 w-screen h-screen overflow-hidden border-none flex flex-col">
        {/* Header */}
        <div className={`bg-gradient-to-r ${currentColorScheme.primary} p-3 sm:p-6 relative`}>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-6 sm:right-6 text-white/80 hover:text-white transition-colors z-10"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          
          <div className="flex items-center space-x-3 sm:space-x-4 pr-10">
            <div className={`p-2 sm:p-3 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm`}>
              <selectedIcon.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="min-w-0 flex-1 text-center">
              {/* Nombre editable centrado */}
              <div className="mb-2">
                {isEditingName ? (
                  <input
                    type="text"
                    value={folderName}
                    onChange={(e) => setFolderName(capitalizeFirst(e.target.value))}
                    onBlur={() => setIsEditingName(false)}
                    onKeyPress={(e) => e.key === 'Enter' && setIsEditingName(false)}
                    className="text-lg sm:text-2xl font-bold text-white bg-transparent border-b-2 border-purple-500 text-center outline-none px-2 py-1"
                    placeholder="Nombre de la carpeta"
                    autoFocus
                  />
                ) : (
                  <h2 
                    className="text-lg sm:text-2xl font-bold text-white cursor-pointer hover:text-purple-300 transition-colors"
                    onClick={() => setIsEditingName(true)}
                  >
                    {folderName || 'Sin nombre'}
                  </h2>
                )}
              </div>
              <p className="text-sm sm:text-base text-white/70 hidden sm:block">
                {folderName ? 'Configurando carpeta premium...' : 'Haz clic en el nombre para editarlo'}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Mejoradas */}
        <div className="border-b border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
          <div className="flex justify-center sm:justify-start overflow-x-auto px-3 sm:px-6 py-2">
            {[
              { id: 'config', label: 'Configuración', shortLabel: 'Config', emoji: '⚙️' },
              { id: 'team', label: 'Equipo', shortLabel: 'Equipo', emoji: '👥' },
              { id: 'projects', label: 'Proyectos y Tareas', shortLabel: 'Proyectos', emoji: '📋' },
              { id: 'settings', label: 'Ajustes Avanzados', shortLabel: 'Avanzado', emoji: '🔧' }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center justify-center min-w-fit py-4 px-4 sm:px-6 mx-1 rounded-t-xl border-b-4 transition-all duration-300 hover:transform hover:scale-105 ${
                    isActive
                      ? 'border-purple-500 text-white bg-gradient-to-b from-purple-500/20 to-purple-600/10 shadow-lg'
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700/40 hover:border-gray-500/50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{tab.emoji}</span>
                    <span className={`font-medium transition-all ${
                      isActive ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
                    } ${isActive ? 'text-white' : ''}`}>
                      <span className="sm:hidden">{tab.shortLabel}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
          {activeTab === 'config' && (
            <div className="space-y-6">
              {/* Descripción */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Descripción opcional de la carpeta..."
                />
              </div>

              {/* Carrusel de Iconos */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                    <span>🎨</span>
                    <span>Icono de la Carpeta</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {iconPage + 1} de {totalIconPages}
                    </span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setIconPage(Math.max(0, iconPage - 1))}
                        disabled={iconPage === 0}
                        className="p-1 rounded text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setIconPage(Math.min(totalIconPages - 1, iconPage + 1))}
                        disabled={iconPage === totalIconPages - 1}
                        className="p-1 rounded text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="relative bg-gray-800/50 border border-gray-700 rounded-xl p-4 overflow-hidden">
                  <div className="grid grid-cols-6 md:grid-cols-10 gap-3">
                    {premiumIcons
                      .slice(iconPage * iconsPerPage, (iconPage + 1) * iconsPerPage)
                      .map((iconData, index) => (
                        <button
                          key={`${iconPage}-${index}`}
                          onClick={() => setSelectedIcon(iconData)}
                          className={`p-3 rounded-xl transition-all transform hover:scale-110 ${
                            selectedIcon === iconData
                              ? `bg-gradient-to-br ${currentColorScheme.primary} shadow-xl scale-110 ring-2 ring-white/30`
                              : 'bg-gray-700/50 hover:bg-gray-600/70 hover:shadow-lg'
                          }`}
                          title={iconData.label}
                        >
                          <iconData.icon className={`w-6 h-6 transition-colors ${
                            selectedIcon === iconData ? 'text-white' : 'text-gray-300'
                          }`} />
                        </button>
                      ))}
                  </div>
                  
                  {/* Indicadores de página */}
                  <div className="flex justify-center space-x-1 mt-4">
                    {Array.from({ length: totalIconPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setIconPage(i)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === iconPage ? 'bg-purple-500 w-4' : 'bg-gray-600 hover:bg-gray-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Carrusel de Colores */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                    <span>🌈</span>
                    <span>Esquema de Color</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {colorPage + 1} de {totalColorPages}
                    </span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setColorPage(Math.max(0, colorPage - 1))}
                        disabled={colorPage === 0}
                        className="p-1 rounded text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setColorPage(Math.min(totalColorPages - 1, colorPage + 1))}
                        disabled={colorPage === totalColorPages - 1}
                        className="p-1 rounded text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="relative bg-gray-800/50 border border-gray-700 rounded-xl p-4 overflow-hidden">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {colorSchemes
                      .slice(colorPage * colorsPerPage, (colorPage + 1) * colorsPerPage)
                      .map((scheme) => (
                        <button
                          key={scheme.id}
                          onClick={() => setSelectedColor(scheme)}
                          className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                            selectedColor.id === scheme.id
                              ? `${scheme.accent} bg-gradient-to-br ${scheme.secondary} scale-105 shadow-xl ring-2 ring-white/30`
                              : 'border-gray-600 bg-gray-700/30 hover:border-gray-500 hover:shadow-lg'
                          }`}
                        >
                          <div className={`h-8 bg-gradient-to-r ${scheme.primary} rounded-lg mb-3 shadow-md`} />
                          <p className="text-sm font-medium text-gray-200 truncate">{scheme.name}</p>
                        </button>
                      ))}
                  </div>
                  
                  {/* Indicadores de página */}
                  <div className="flex justify-center space-x-1 mt-4">
                    {Array.from({ length: totalColorPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setColorPage(i)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === colorPage ? 'bg-purple-500 w-4' : 'bg-gray-600 hover:bg-gray-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Colaboradores</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Usuarios individuales */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Usuarios Individuales
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {mockUsers.map((user) => {
                        const isSelected = selectedUsers.some(u => u.id === user.id);
                        const userColor = getUserColor(user);
                        const avatar = generateUserAvatar(user);
                        
                        return (
                          <button
                            key={user.id}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
                              } else {
                                setSelectedUsers(prev => [...prev, user]);
                              }
                            }}
                            className={`w-full p-3 rounded-lg border transition-all flex items-center space-x-3 ${
                              isSelected
                                ? 'border-purple-500 bg-purple-500/20'
                                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                            }`}
                          >
                            <div 
                              className={`w-10 h-10 rounded-full ${userColor.gradient} flex items-center justify-center text-white font-bold text-sm`}
                            >
                              {avatar.initials}
                            </div>
                            <div className="flex-1 text-left">
                              <p className="font-medium text-white">{user.name}</p>
                              <p className="text-sm text-gray-400">{user.role}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Equipos */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Equipos
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {mockTeams.map((team) => {
                        const isSelected = selectedTeams.some(t => t.id === team.id);
                        
                        return (
                          <button
                            key={team.id}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedTeams(prev => prev.filter(t => t.id !== team.id));
                              } else {
                                setSelectedTeams(prev => [...prev, team]);
                              }
                            }}
                            className={`w-full p-3 rounded-lg border transition-all flex items-center space-x-3 ${
                              isSelected
                                ? 'border-purple-500 bg-purple-500/20'
                                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                            }`}
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="font-medium text-white">{team.name}</p>
                              <p className="text-sm text-gray-400">{team.members.length} miembros</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Configuración de compartir */}
              <div className="border-t border-gray-800 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Configuración de Compartir</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-white">Carpeta Pública</p>
                        <p className="text-sm text-gray-400">Visible para todos en la organización</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShareSettings(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        shareSettings.isPublic ? 'bg-purple-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          shareSettings.isPublic ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Eye className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-white">Permitir Comentarios</p>
                        <p className="text-sm text-gray-400">Los colaboradores pueden comentar</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShareSettings(prev => ({ ...prev, allowComments: !prev.allowComments }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        shareSettings.allowComments ? 'bg-purple-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          shareSettings.allowComments ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Lock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-white">Permitir Edición</p>
                        <p className="text-sm text-gray-400">Los colaboradores pueden editar tareas</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShareSettings(prev => ({ ...prev, allowEditing: !prev.allowEditing }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        shareSettings.allowEditing ? 'bg-purple-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          shareSettings.allowEditing ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6 overflow-y-auto max-h-full">
              {/* Header con selector de nuevo tipo de tarea */}
              <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-purple-500/30 rounded-xl">
                      <Layers className="w-6 h-6 text-purple-300" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Gestión de Tareas</h3>
                      <p className="text-sm text-gray-300">Organiza por tipos y asigna responsables</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 bg-gray-800/50 rounded-xl p-2">
                    <select 
                      value={newTaskType}
                      onChange={(e) => setNewTaskType(e.target.value as any)}
                      className="bg-gray-700 border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="checklist">✅ Checklist</option>
                      <option value="counter">🔢 Contador</option>
                      <option value="skill">⭐ Habilidad</option>
                    </select>
                    <button
                      onClick={() => addTaskByType(newTaskType)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg transform hover:scale-105"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Nueva Tarea</span>
                      <span className="sm:hidden">+</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Secciones por tipo de tarea */}
              <div className="space-y-6">
                {[
                  { type: 'checklist' as const, icon: '✅', title: 'Tareas Checklist', color: 'green', description: 'Tareas simples de completar/no completar' },
                  { type: 'counter' as const, icon: '🔢', title: 'Tareas Contador', color: 'blue', description: 'Tareas con objetivos numéricos' },
                  { type: 'skill' as const, icon: '⭐', title: 'Desarrollo de Habilidades', color: 'purple', description: 'Tareas para mejorar habilidades con puntuación' }
                ].map(section => {
                  const isExpanded = expandedSections.has(section.type);
                  const sectionTasks = tasks[section.type];
                  const colorClasses = {
                    green: { bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-300', hover: 'hover:bg-green-500/30' },
                    blue: { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-300', hover: 'hover:bg-blue-500/30' },
                    purple: { bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-300', hover: 'hover:bg-purple-500/30' }
                  }[section.color] || { bg: 'bg-gray-500/20', border: 'border-gray-500/30', text: 'text-gray-300', hover: 'hover:bg-gray-500/30' };

                  return (
                    <div key={section.type} className={`border ${colorClasses.border} rounded-2xl overflow-hidden ${colorClasses.bg}`}>
                      {/* Header de la sección */}
                      <div className="p-4 sm:p-6 border-b border-gray-700/30">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => toggleSectionExpanded(section.type)}
                            className="flex items-center space-x-4 flex-1 text-left group"
                          >
                            <div className={`p-3 ${colorClasses.bg} rounded-xl ${colorClasses.hover} transition-all`}>
                              <span className="text-2xl">{section.icon}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <h3 className={`text-xl font-bold ${colorClasses.text}`}>{section.title}</h3>
                                <span className="bg-gray-700/50 text-gray-300 px-3 py-1 rounded-full text-sm font-medium">
                                  {sectionTasks.length} {sectionTasks.length === 1 ? 'tarea' : 'tareas'}
                                </span>
                                {isExpanded ? (
                                  <ChevronDown className={`w-5 h-5 ${colorClasses.text} transition-transform`} />
                                ) : (
                                  <ChevronRight className={`w-5 h-5 ${colorClasses.text} transition-transform`} />
                                )}
                              </div>
                              <p className="text-gray-400 text-sm mt-1">{section.description}</p>
                            </div>
                          </button>

                          <button
                            onClick={() => addTaskByType(section.type)}
                            className={`flex items-center space-x-2 px-4 py-2 ${colorClasses.bg} ${colorClasses.text} rounded-lg ${colorClasses.hover} transition-all shadow-md transform hover:scale-105`}
                          >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Agregar</span>
                          </button>
                        </div>
                      </div>

                      {/* Tareas de la sección */}
                      {isExpanded && (
                        <div className="p-4 sm:p-6">
                          {sectionTasks.length === 0 ? (
                            <div className="text-center py-12 bg-gray-700/20 rounded-xl border-2 border-dashed border-gray-600">
                              <span className="text-6xl mb-4 block">{section.icon}</span>
                              <h4 className="text-lg font-bold text-white mb-2">Sin tareas {section.type}</h4>
                              <p className="text-gray-400 mb-4">Crea tu primera tarea de este tipo</p>
                              <button
                                onClick={() => addTaskByType(section.type)}
                                className={`px-6 py-3 ${colorClasses.bg} ${colorClasses.text} rounded-xl ${colorClasses.hover} transition-all font-medium shadow-lg transform hover:scale-105`}
                              >
                                ✨ Crear Tarea {section.title}
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {sectionTasks.map((task) => {
                                const taskDueDateStatus = getDueDateStatus(task.dueDate, task.dueTime);
                                
                                return (
                                  <div key={task.id} className="bg-gray-700/30 border border-gray-600/50 rounded-xl p-4 hover:bg-gray-600/30 transition-all">
                                    {/* Cabecera de la tarea */}
                                    <div className="flex items-center space-x-3 mb-4">
                                      <span className="text-2xl">{section.icon}</span>
                                      <input
                                        type="text"
                                        value={task.title}
                                        onChange={(e) => updateTaskByType(section.type, task.id, 'title', e.target.value)}
                                        className="flex-1 text-lg font-medium bg-transparent text-white border-none focus:outline-none focus:bg-gray-700/50 rounded-lg px-3 py-2 placeholder-gray-400"
                                        placeholder={`🎯 Nombre de la tarea ${section.type}...`}
                                      />

                                      {/* Indicador de fecha/hora prominente */}
                                      {(task.dueDate || task.dueTime) && (
                                        <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl font-medium ${
                                          taskDueDateStatus === 'overdue' ? 'bg-red-500/20 text-red-300 ring-2 ring-red-500/50' :
                                          taskDueDateStatus === 'urgent' ? 'bg-orange-500/20 text-orange-300 ring-2 ring-orange-500/50' :
                                          taskDueDateStatus === 'soon' ? 'bg-yellow-500/20 text-yellow-300 ring-2 ring-yellow-500/50' :
                                          'bg-green-500/20 text-green-300'
                                        }`}>
                                          {taskDueDateStatus === 'overdue' ? '⏰' :
                                           taskDueDateStatus === 'urgent' ? '🚨' :
                                           taskDueDateStatus === 'soon' ? '⚠️' : '✅'}
                                          <Clock className="w-4 h-4" />
                                          <span className="text-sm">
                                            {taskDueDateStatus === 'overdue' ? 'VENCIDA' :
                                             taskDueDateStatus === 'urgent' ? 'URGENTE' :
                                             taskDueDateStatus === 'soon' ? 'PRONTO' : 'A TIEMPO'}
                                          </span>
                                        </div>
                                      )}

                                      <button
                                        onClick={() => removeTaskByType(section.type, task.id)}
                                        className="text-gray-400 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>

                                    {/* Configuración inline */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                      {/* Fecha límite */}
                                      <div className="flex items-center space-x-2">
                                        <div className="p-2 bg-blue-500/20 rounded-lg">
                                          <Calendar className="w-4 h-4 text-blue-400" />
                                        </div>
                                        <input
                                          type="date"
                                          value={task.dueDate || ''}
                                          onChange={(e) => updateTaskByType(section.type, task.id, 'dueDate', e.target.value)}
                                          className="flex-1 px-3 py-2 bg-gray-600/50 border-none rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                                        />
                                      </div>

                                      {/* Hora límite */}
                                      <div className="flex items-center space-x-2">
                                        <div className="p-2 bg-green-500/20 rounded-lg">
                                          <Clock className="w-4 h-4 text-green-400" />
                                        </div>
                                        <input
                                          type="time"
                                          value={task.dueTime || ''}
                                          onChange={(e) => updateTaskByType(section.type, task.id, 'dueTime', e.target.value)}
                                          className="flex-1 px-3 py-2 bg-gray-600/50 border-none rounded-lg text-white text-sm focus:ring-2 focus:ring-green-500"
                                        />
                                      </div>

                                      {/* Asignación */}
                                      <div className="flex items-center space-x-2">
                                        <div className="p-2 bg-purple-500/20 rounded-lg">
                                          <Users className="w-4 h-4 text-purple-400" />
                                        </div>
                                        <select
                                          multiple
                                          value={task.assignedTo?.map(u => u.id) || []}
                                          onChange={(e) => {
                                            const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
                                            const selectedUsers = mockUsers.filter(user => selectedIds.includes(user.id));
                                            updateTaskByType(section.type, task.id, 'assignedTo', selectedUsers);
                                          }}
                                          className="flex-1 px-3 py-2 bg-gray-600/50 border-none rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500 max-h-20"
                                        >
                                          {mockUsers.map(user => (
                                            <option key={user.id} value={user.id}>👤 {user.name}</option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>

                                    {/* Vista previa de asignaciones */}
                                    {task.assignedTo && task.assignedTo.length > 0 && (
                                      <div className="mt-4 pt-3 border-t border-gray-600/30">
                                        <p className="text-xs text-gray-400 mb-2 flex items-center space-x-1">
                                          <Users className="w-3 h-3" />
                                          <span>Asignado a:</span>
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                          {task.assignedTo.map(user => (
                                            <span key={user.id} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs font-medium border border-blue-500/30">
                                              👤 {user.name}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Vista previa de fechas */}
                                    {(task.dueDate || task.dueTime) && (
                                      <div className="mt-3 pt-3 border-t border-gray-600/30">
                                        <p className="text-xs text-gray-400 mb-2 flex items-center space-x-1">
                                          <Clock className="w-3 h-3" />
                                          <span>Programado para:</span>
                                        </p>
                                        <div className="flex space-x-2 text-sm">
                                          {task.dueDate && (
                                            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30">
                                              📅 {new Date(task.dueDate).toLocaleDateString('es-ES', { 
                                                weekday: 'short', 
                                                month: 'short', 
                                                day: 'numeric' 
                                              })}
                                            </span>
                                          )}
                                          {task.dueTime && (
                                            <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-lg border border-green-500/30">
                                              🕐 {task.dueTime}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Activity className="w-5 h-5 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Configuración Avanzada</h3>
              </div>

              {/* Tareas Recurrentes Automáticas */}
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-500/30 rounded-xl">
                      <Repeat className="w-6 h-6 text-blue-300" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg">🔄 Tareas Recurrentes</p>
                      <p className="text-sm text-gray-300">Las tareas se recrean automáticamente cada día</p>
                      <p className="text-xs text-blue-300 mt-1">💡 Perfecto para empleados, hijos y rutinas diarias</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-2xl">✅</span>
                      <h4 className="font-bold text-green-300">Checklist Diarias</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-300">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span>Se recrean cada 24 horas</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-300">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span>Mantienen horarios programados</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-300">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span>Conservan asignaciones</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-2xl">🔢</span>
                      <h4 className="font-bold text-blue-300">Contadores Diarios</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-300">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span>Reinician a 0 cada día</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-300">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span>Mantienen metas diarias</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-300">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span>Historial de progreso</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-2xl">⭐</span>
                      <h4 className="font-bold text-purple-300">Habilidades</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-300">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span>Progreso acumulativo</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-300">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span>Métricas de mejora</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-300">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span>Notificaciones diarias</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">⚡</div>
                    <div>
                      <p className="font-medium text-yellow-300 mb-1">Sistema Inteligente Activado</p>
                      <p className="text-sm text-gray-300">
                        Las tareas se regeneran automáticamente cada día a las <span className="font-mono bg-gray-700 px-2 py-1 rounded">00:00</span>. 
                        Los empleados y familiares recibirán notificaciones de sus tareas pendientes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Carpeta recurrente */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Repeat className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="font-medium text-white">Carpeta Recurrente</p>
                      <p className="text-sm text-gray-400">Se reinicia automáticamente</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsRecurrent(!isRecurrent)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isRecurrent ? 'bg-purple-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isRecurrent ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {isRecurrent && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Frecuencia de Reinicio
                      </label>
                      <select
                        value={recurrenceType}
                        onChange={(e) => setRecurrenceType(e.target.value as any)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="daily">Diario</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensual</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Hora de Reinicio
                      </label>
                      <input
                        type="time"
                        value={resetTime}
                        onChange={(e) => setResetTime(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Control de permisos */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="font-medium text-white">Control de Permisos</p>
                    <p className="text-sm text-gray-400">Configurar quién puede hacer qué</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Solo administradores pueden eliminar tareas</span>
                    <input type="checkbox" className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Requerir confirmación para marcar completo</span>
                    <input type="checkbox" className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Mostrar tiempo de finalización</span>
                    <input type="checkbox" className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500" defaultChecked />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-800/50 bg-gray-800/30 p-4 sm:p-6">
          <div className="flex justify-center">
            <button
              onClick={handleSave}
              disabled={!folderName.trim()}
              className={`px-8 py-3 bg-gradient-to-r ${currentColorScheme.primary} text-white rounded-xl font-bold transition-all shadow-lg ${
                !folderName.trim()
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:shadow-2xl hover:scale-105 transform'
              }`}
            >
              ✨ Crear Carpeta Premium
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}