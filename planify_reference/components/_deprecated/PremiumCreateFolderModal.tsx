'use client';

import React, { useState, useEffect } from 'react';
import { User, Team, ShareSettings } from '@/types';
import { mockUsers, mockTeams } from '@/lib/mockData';
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
  User as UserIcon
} from 'lucide-react';

interface PremiumCreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (folderData: any, projectsData: any[]) => void;
  availableProjects?: any[];
}

const premiumIcons = [
  // Trabajo & Productividad
  { icon: Briefcase, name: 'briefcase', category: 'work', label: 'Trabajo' },
  { icon: Coffee, name: 'coffee', category: 'work', label: 'Café' },
  { icon: Target, name: 'target', category: 'work', label: 'Objetivos' },
  
  // Creatividad & Arte
  { icon: Palette, name: 'palette', category: 'creative', label: 'Arte' },
  { icon: Camera, name: 'camera', category: 'creative', label: 'Fotografía' },
  { icon: Music, name: 'music', category: 'creative', label: 'Música' },
  
  // Educación & Desarrollo
  { icon: BookOpen, name: 'book-open', category: 'education', label: 'Estudio' },
  { icon: Code, name: 'code', category: 'education', label: 'Programación' },
  
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
  { icon: Zap, name: 'zap', category: 'premium', label: 'Energía' },
  { icon: Flame, name: 'flame', category: 'premium', label: 'Trending' }
];

const colorSchemes = [
  { name: 'cosmic', label: 'Cosmic Purple', gradient: 'from-purple-500 to-blue-600' },
  { name: 'sunset', label: 'Sunset Bliss', gradient: 'from-orange-500 to-pink-500' },
  { name: 'forest', label: 'Forest Green', gradient: 'from-green-500 to-emerald-600' },
  { name: 'ocean', label: 'Ocean Breeze', gradient: 'from-blue-500 to-cyan-500' },
  { name: 'fire', label: 'Fire Red', gradient: 'from-red-500 to-orange-500' },
  { name: 'lavender', label: 'Lavender Dreams', gradient: 'from-purple-400 to-pink-400' },
  { name: 'mint', label: 'Mint Fresh', gradient: 'from-emerald-400 to-teal-400' },
  { name: 'gold', label: 'Golden Hour', gradient: 'from-yellow-500 to-orange-500' },
  { name: 'silver', label: 'Silver Shine', gradient: 'from-gray-400 to-slate-500' },
  { name: 'rose', label: 'Rose Garden', gradient: 'from-pink-500 to-rose-500' },
  { name: 'indigo', label: 'Indigo Night', gradient: 'from-indigo-500 to-purple-600' },
  { name: 'emerald', label: 'Emerald Glow', gradient: 'from-emerald-500 to-green-600' },
  { name: 'amber', label: 'Amber Warm', gradient: 'from-amber-500 to-yellow-600' },
  { name: 'cyan', label: 'Cyan Cool', gradient: 'from-cyan-500 to-blue-500' }
];

export default function PremiumCreateFolderModal({
  isOpen,
  onClose,
  onSave,
  availableProjects = []
}: PremiumCreateFolderModalProps) {
  const [step, setStep] = useState(1); // 1: Basic, 2: Collaborators, 3: Projects, 4: Sharing
  const [folderName, setFolderName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('briefcase');
  const [selectedColor, setSelectedColor] = useState('cosmic');
  const [projects, setProjects] = useState<any[]>([]);
  
  // Colaboración y equipos
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [newUserEmail, setNewUserEmail] = useState('');
  
  // Configuración de compartir
  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    isShared: false,
    shareLevel: 'view',
    permissions: {
      canEdit: false,
      canDelete: false,
      canShare: false,
      canAddMembers: false
    }
  });
  
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Todos', icon: Sparkles },
    { id: 'work', label: 'Trabajo', icon: Briefcase },
    { id: 'creative', label: 'Creativo', icon: Palette },
    { id: 'education', label: 'Educación', icon: BookOpen },
    { id: 'personal', label: 'Personal', icon: Heart },
    { id: 'entertainment', label: 'Entretenimiento', icon: Gamepad2 },
    { id: 'premium', label: 'Premium', icon: Crown }
  ];

  const filteredIcons = premiumIcons.filter(icon => 
    selectedCategory === 'all' || icon.category === selectedCategory
  );

  const addProject = () => {
    setProjects([...projects, {
      id: `project-${Date.now()}`,
      title: '',
      subtitle: '',
      type: 'project',
      colorScheme: selectedColor, // Heredar el color de la carpeta
      icon: selectedIcon, // Heredar el icono de la carpeta
      tasks: []
    }]);
  };

  const updateProject = (index: number, field: string, value: any) => {
    const updatedProjects = [...projects];
    updatedProjects[index] = { ...updatedProjects[index], [field]: value };
    setProjects(updatedProjects);
  };

  const addTaskToProject = (projectIndex: number, taskType: string = 'subjective') => {
    const updatedProjects = [...projects];
    const currentProject = updatedProjects[projectIndex];
    const newTask: any = {
      id: `task-${Date.now()}`,
      title: '',
      type: taskType,
      assignedTo: [], // Permitir asignación individual
      priority: 'media',
      colorScheme: currentProject.colorScheme || selectedColor, // Heredar color del proyecto o carpeta
      icon: currentProject.icon || selectedIcon, // Heredar icono del proyecto o carpeta
      projectId: currentProject.id,
      folderId: `folder-${Date.now()}` // Se establecerá correctamente al guardar
    };

    // Configuración específica por tipo de tarea
    if (taskType === 'numeric') {
      newTask.target = 10;
      newTask.current = 0;
      newTask.unit = 'unidades';
    } else if (taskType === 'subjective') {
      newTask.done = false;
      newTask.score0to1 = 0;
    }

    updatedProjects[projectIndex].tasks.push(newTask);
    setProjects(updatedProjects);
  };

  const updateTask = (projectIndex: number, taskIndex: number, field: string, value: any) => {
    const updatedProjects = [...projects];
    updatedProjects[projectIndex].tasks[taskIndex] = {
      ...updatedProjects[projectIndex].tasks[taskIndex],
      [field]: value
    };
    setProjects(updatedProjects);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const removeTask = (projectIndex: number, taskIndex: number) => {
    const updatedProjects = [...projects];
    updatedProjects[projectIndex].tasks = updatedProjects[projectIndex].tasks.filter((_: any, i: number) => i !== taskIndex);
    setProjects(updatedProjects);
  };

  const addUser = (user: User) => {
    if (!assignedUsers.find(u => u.id === user.id)) {
      setAssignedUsers([...assignedUsers, user]);
    }
  };

  const removeUser = (userId: string) => {
    setAssignedUsers(assignedUsers.filter(u => u.id !== userId));
  };

  const addUserByEmail = () => {
    if (!newUserEmail.trim()) return;
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserEmail)) {
      alert('Por favor ingresa un email válido');
      return;
    }

    // Verificar si el usuario ya existe
    if (assignedUsers.find(u => u.email === newUserEmail)) {
      alert('Este usuario ya está agregado');
      return;
    }

    // Crear nuevo usuario
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: newUserEmail.split('@')[0].replace(/[._]/g, ' '),
      email: newUserEmail,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUserEmail}`,
      role: 'member',
      team: 'Invitado'
    };

    setAssignedUsers(prev => [...prev, newUser]);
    setNewUserEmail('');
  };

  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
    // Agregar todos los miembros del equipo
    team.members.forEach(member => {
      if (!assignedUsers.find(u => u.id === member.id)) {
        setAssignedUsers(prev => [...prev, member]);
      }
    });
  };

  const handleSave = () => {
    const folderData = {
      name: folderName,
      description,
      icon: selectedIcon,
      colorScheme: selectedColor,
      assignedTo: assignedUsers,
      team: selectedTeam,
      shareSettings
    };

    onSave(folderData, projects);
    onClose();
    
    // Reset form
    setStep(1);
    setFolderName('');
    setDescription('');
    setSelectedIcon('briefcase');
    setSelectedColor('cosmic');
    setProjects([]);
    setAssignedUsers([]);
    setSelectedTeam(null);
    setNewUserEmail('');
    setShareSettings({
      isShared: false,
      shareLevel: 'view',
      permissions: {
        canEdit: false,
        canDelete: false,
        canShare: false,
        canAddMembers: false
      }
    });
  };

  const getSelectedIconComponent = () => {
    const iconData = premiumIcons.find(i => i.name === selectedIcon);
    return iconData ? iconData.icon : Briefcase;
  };

  const getSelectedColorScheme = () => {
    return colorSchemes.find(c => c.name === selectedColor)?.gradient || 'from-purple-500 to-blue-600';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-purple-600 to-blue-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${getSelectedColorScheme()} rounded-2xl flex items-center justify-center`}>
                {React.createElement(getSelectedIconComponent(), { className: "w-6 h-6 text-white" })}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Crear Nueva Carpeta Premium</h2>
                <p className="text-purple-200">Organiza tus proyectos con estilo profesional</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Step Navigation */}
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-4">
              {[1, 2, 3].map((stepNum) => (
                <React.Fragment key={stepNum}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    step >= stepNum 
                      ? 'bg-white text-purple-600' 
                      : 'bg-white/20 text-white'
                  }`}>
                    {stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div className={`w-12 h-1 rounded transition-all ${
                      step > stepNum ? 'bg-white' : 'bg-white/20'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {step === 1 && (
            <div className="space-y-8">
              {/* Basic Info */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Folder className="w-5 h-5" />
                  Información Básica
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre de la Carpeta *
                    </label>
                    <input
                      type="text"
                      value={folderName}
                      onChange={(e) => setFolderName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Ej. Proyecto Marketing 2024"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      rows={3}
                      placeholder="Describe brevemente el propósito de esta carpeta..."
                    />
                  </div>
                </div>
              </div>

              {/* Icon Selection */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Seleccionar Ícono
                </h4>
                
                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => {
                    const IconComponent = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                          selectedCategory === category.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        {category.label}
                      </button>
                    );
                  })}
                </div>

                {/* Icons Grid */}
                <div className="grid grid-cols-8 md:grid-cols-12 gap-3">
                  {filteredIcons.map((iconData) => {
                    const IconComponent = iconData.icon;
                    return (
                      <button
                        key={iconData.name}
                        onClick={() => setSelectedIcon(iconData.name)}
                        className={`p-3 rounded-xl transition-all hover:scale-105 ${
                          selectedIcon === iconData.name
                            ? `bg-gradient-to-br ${getSelectedColorScheme()} text-white`
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                        title={iconData.label}
                      >
                        <IconComponent className="w-6 h-6" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Selection */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Esquema de Color
                </h4>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {colorSchemes.map((scheme) => (
                    <button
                      key={scheme.name}
                      onClick={() => setSelectedColor(scheme.name)}
                      className={`relative p-4 rounded-xl bg-gradient-to-br ${scheme.gradient} transition-all hover:scale-105 ${
                        selectedColor === scheme.name ? 'ring-2 ring-white' : ''
                      }`}
                      title={scheme.label}
                    >
                      <div className="text-center">
                        <div className="text-white font-medium text-sm">{scheme.label}</div>
                      </div>
                      {selectedColor === scheme.name && (
                        <div className="absolute inset-0 rounded-xl bg-white/20 flex items-center justify-center">
                          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-purple-600 rounded-full" />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {/* Nuevo sistema de colaboración */}
              {/* Selección de equipo */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-600">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Seleccionar Equipo
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {mockTeams.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => handleTeamSelect(team)}
                      className={`p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 ${
                        selectedTeam?.id === team.id
                          ? 'bg-purple-500/20 border-purple-400 text-white'
                          : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50'
                      }`}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <div className="font-medium truncate">{team.name}</div>
                        <div className="text-xs opacity-60 truncate">{team.description}</div>
                        <div className="text-xs mt-1 opacity-80">{team.members.length} miembros</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Colaboradores individuales */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-600">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Agregar Colaboradores
                </h4>
                {/* Agregar usuario por email */}
                <div className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Agregar colaborador por email..."
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={addUserByEmail}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-300"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {mockUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => addUser(user)}
                      disabled={assignedUsers.some(u => u.id === user.id)}
                      className={`p-3 rounded-xl border transition-all duration-300 flex items-center gap-3 ${
                        assignedUsers.some(u => u.id === user.id)
                          ? 'bg-green-500/20 border-green-400 text-white opacity-75'
                          : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50'
                      }`}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-white">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div className="text-left min-w-0">
                        <div className="font-medium truncate">{user.name}</div>
                        <div className="text-xs opacity-60 truncate">{user.team}</div>
                      </div>
                      {assignedUsers.some(u => u.id === user.id) && (
                        <CheckSquare className="w-4 h-4 text-green-400" />
                      )}
                    </button>
                  ))}
                </div>
                
                {/* Lista de colaboradores seleccionados */}
                {assignedUsers.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-white/80">Colaboradores seleccionados:</h5>
                    <div className="flex flex-wrap gap-2">
                      {assignedUsers.map((user) => (
                        <div key={user.id} className="flex items-center gap-2 bg-purple-500/20 px-3 py-2 rounded-lg border border-purple-500/30">
                          <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          <span className="text-sm text-white">{user.name.split(' ')[0]}</span>
                          <button
                            onClick={() => removeUser(user.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Proyectos y Tareas
                </h3>
                <button
                  onClick={addProject}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Proyecto
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No hay proyectos aún</p>
                  <p>Agrega proyectos para organizar mejor tu carpeta</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((project, projectIndex) => (
                    <div key={project.id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-600">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 space-y-3">
                          <input
                            type="text"
                            value={project.title}
                            onChange={(e) => updateProject(projectIndex, 'title', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Nombre del proyecto"
                          />
                          <input
                            type="text"
                            value={project.subtitle}
                            onChange={(e) => updateProject(projectIndex, 'subtitle', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Descripción breve"
                          />
                        </div>
                        <button
                          onClick={() => removeProject(projectIndex)}
                          className="ml-3 p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Tasks */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-medium text-gray-300">Tareas</h5>
                          <div className="flex gap-2">
                            <button
                              onClick={() => addTaskToProject(projectIndex, 'subjective')}
                              className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs hover:bg-green-600/30 transition-colors flex items-center gap-1"
                              title="Checklist"
                            >
                              <CheckSquare className="w-3 h-3" />
                              ✓
                            </button>
                            <button
                              onClick={() => addTaskToProject(projectIndex, 'numeric')}
                              className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs hover:bg-blue-600/30 transition-colors flex items-center gap-1"
                              title="Contador"
                            >
                              <Target className="w-3 h-3" />
                              #
                            </button>
                          </div>
                        </div>
                        
                        {project.tasks.map((task: any, taskIndex: number) => (
                          <div key={task.id} className="space-y-2 pl-4 border-l border-gray-600">
                            <div className="flex items-center gap-2">
                              {task.type === 'numeric' ? (
                                <Target className="w-4 h-4 text-blue-400" />
                              ) : (
                                <CheckSquare className="w-4 h-4 text-green-400" />
                              )}
                              <input
                                type="text"
                                value={task.title}
                                onChange={(e) => updateTask(projectIndex, taskIndex, 'title', e.target.value)}
                                className="flex-1 px-2 py-1 bg-gray-700/50 border border-gray-600 rounded text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                placeholder="Nombre de la tarea"
                              />
                              <button
                                onClick={() => removeTask(projectIndex, taskIndex)}
                                className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            
                            {/* Configuración específica por tipo */}
                            {task.type === 'numeric' && (
                              <div className="flex gap-2 ml-6">
                                <input
                                  type="number"
                                  value={task.target}
                                  onChange={(e) => updateTask(projectIndex, taskIndex, 'target', parseInt(e.target.value))}
                                  className="w-16 px-2 py-1 bg-gray-700/50 border border-gray-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="Meta"
                                />
                                <input
                                  type="text"
                                  value={task.unit}
                                  onChange={(e) => updateTask(projectIndex, taskIndex, 'unit', e.target.value)}
                                  className="w-20 px-2 py-1 bg-gray-700/50 border border-gray-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="unidad"
                                />
                              </div>
                            )}
                            
                            {/* Asignación de usuario */}
                            <div className="flex items-center gap-2 ml-6">
                              <UserIcon className="w-3 h-3 text-gray-400" />
                              <select
                                value={task.assignedTo?.[0]?.id || ''}
                                onChange={(e) => {
                                  const user = assignedUsers.find(u => u.id === e.target.value);
                                  updateTask(projectIndex, taskIndex, 'assignedTo', user ? [user] : []);
                                }}
                                className="text-xs bg-gray-700/50 border border-gray-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                              >
                                <option value="">Sin asignar</option>
                                {assignedUsers.map(user => (
                                  <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Configuración de Compartir
              </h3>

              {/* Configuración de compartir */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-600">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Nivel de Privacidad
                </h4>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-600 hover:bg-gray-700/50 transition-colors">
                    <input
                      type="radio"
                      name="shareLevel"
                      checked={!shareSettings.isShared}
                      onChange={() => setShareSettings(prev => ({ ...prev, isShared: false }))}
                      className="w-4 h-4 text-purple-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-red-400" />
                        <span className="text-white font-medium">Privado</span>
                      </div>
                      <div className="text-sm text-gray-400 mt-1">Solo los colaboradores seleccionados pueden acceder</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-600 hover:bg-gray-700/50 transition-colors">
                    <input
                      type="radio"
                      name="shareLevel"
                      checked={shareSettings.isShared}
                      onChange={() => setShareSettings(prev => ({ ...prev, isShared: true }))}
                      className="w-4 h-4 text-purple-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-green-400" />
                        <span className="text-white font-medium">Compartido</span>
                      </div>
                      <div className="text-sm text-gray-400 mt-1">Permitir compartir con más usuarios</div>
                    </div>
                  </label>
                </div>
              </div>

              {shareSettings.isShared && (
                <>
                  {/* Nivel de permisos */}
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-600">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Permisos de Colaboración
                    </h4>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-600 hover:bg-gray-700/50 transition-colors">
                        <input
                          type="radio"
                          name="permissionLevel"
                          checked={shareSettings.shareLevel === 'view'}
                          onChange={() => setShareSettings(prev => ({ ...prev, shareLevel: 'view' }))}
                          className="w-4 h-4 text-purple-600"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-blue-400" />
                            <span className="text-white font-medium">Solo lectura</span>
                          </div>
                          <div className="text-sm text-gray-400 mt-1">Pueden ver pero no editar</div>
                        </div>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-600 hover:bg-gray-700/50 transition-colors">
                        <input
                          type="radio"
                          name="permissionLevel"
                          checked={shareSettings.shareLevel === 'edit'}
                          onChange={() => setShareSettings(prev => ({ ...prev, shareLevel: 'edit' }))}
                          className="w-4 h-4 text-purple-600"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-green-400" />
                            <span className="text-white font-medium">Colaborador</span>
                          </div>
                          <div className="text-sm text-gray-400 mt-1">Pueden ver y editar contenido</div>
                        </div>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-600 hover:bg-gray-700/50 transition-colors">
                        <input
                          type="radio"
                          name="permissionLevel"
                          checked={shareSettings.shareLevel === 'admin'}
                          onChange={() => setShareSettings(prev => ({ ...prev, shareLevel: 'admin' }))}
                          className="w-4 h-4 text-purple-600"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Crown className="w-4 h-4 text-yellow-400" />
                            <span className="text-white font-medium">Administrador</span>
                          </div>
                          <div className="text-sm text-gray-400 mt-1">Control total: editar, eliminar y gestionar permisos</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Permisos específicos */}
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-600">
                    <h4 className="text-lg font-semibold text-white mb-4">Permisos Específicos</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={shareSettings.permissions?.canEdit || false}
                          onChange={(e) => setShareSettings(prev => ({
                            ...prev,
                            permissions: { ...prev.permissions, canEdit: e.target.checked }
                          }))}
                          className="w-4 h-4 text-purple-600"
                        />
                        <span className="text-white text-sm">Puede editar</span>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={shareSettings.permissions?.canDelete || false}
                          onChange={(e) => setShareSettings(prev => ({
                            ...prev,
                            permissions: { ...prev.permissions, canDelete: e.target.checked }
                          }))}
                          className="w-4 h-4 text-purple-600"
                        />
                        <span className="text-white text-sm">Puede eliminar</span>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={shareSettings.permissions?.canShare || false}
                          onChange={(e) => setShareSettings(prev => ({
                            ...prev,
                            permissions: { ...prev.permissions, canShare: e.target.checked }
                          }))}
                          className="w-4 h-4 text-purple-600"
                        />
                        <span className="text-white text-sm">Puede compartir</span>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={shareSettings.permissions?.canAddMembers || false}
                          onChange={(e) => setShareSettings(prev => ({
                            ...prev,
                            permissions: { ...prev.permissions, canAddMembers: e.target.checked }
                          }))}
                          className="w-4 h-4 text-purple-600"
                        />
                        <span className="text-white text-sm">Puede agregar miembros</span>
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-800/50 border-t border-gray-600">
          <div className="flex justify-between">
            <div>
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
                >
                  Anterior
                </button>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              
              {step < 4 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 && !folderName.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={!folderName.trim()}
                  className="px-8 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Crear Carpeta Premium
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}