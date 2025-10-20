'use client';

import { useState, useEffect } from 'react';
import { X, Search, Users, Plus, Trash2, Crown, Edit3, UserCheck, Mail, Phone, Calendar, MapPin } from 'lucide-react';
import { Folder, Project, User, Team } from '@/types';

interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder?: Folder | null; // null para carpetas nuevas
  project?: Project | null; // null para proyectos nuevos
  onSave: (teamData: {
    name: string;
    description?: string;
    members: User[];
    owner: User;
    settings: {
      allowInvites: boolean;
      requireApproval: boolean;
      publicVisible: boolean;
    };
  }) => void;
}

// Mock data de usuarios disponibles para invitar
const availableUsers: User[] = [
  {
    id: '1',
    name: 'Ana García',
    email: 'ana.garcia@email.com',
    avatar: '👩‍💼',
    role: 'admin'
  },
  {
    id: '2', 
    name: 'Carlos Ruiz',
    email: 'carlos.ruiz@email.com',
    avatar: '👨‍💻',
    role: 'member'
  },
  {
    id: '3',
    name: 'María López',
    email: 'maria.lopez@email.com', 
    avatar: '👩‍🎨',
    role: 'member'
  },
  {
    id: '4',
    name: 'David Chen',
    email: 'david.chen@email.com',
    avatar: '👨‍🔬',
    role: 'member'
  },
  {
    id: '5',
    name: 'Sofia Martinez',
    email: 'sofia.martinez@email.com',
    avatar: '👩‍🚀',
    role: 'admin'
  },
  {
    id: '6',
    name: 'Miguel Torres',
    email: 'miguel.torres@email.com',
    avatar: '👨‍🎯',
    role: 'member'
  },
  {
    id: '7',
    name: 'Isabella Franco',
    email: 'isabella.franco@email.com',
    avatar: '👩‍⚕️',
    role: 'viewer'
  },
  {
    id: '8',
    name: 'Roberto Silva',
    email: 'roberto.silva@email.com',
    avatar: '👨‍🏫',
    role: 'member'
  }
];

const currentUser: User = {
  id: 'current',
  name: 'Tú',
  email: 'tu@email.com',
  avatar: '🧑‍💼',
  role: 'owner'
};

export default function TeamManagementModal({ 
  isOpen, 
  onClose, 
  folder,
  project,
  onSave 
}: TeamManagementModalProps) {
  // Detectar si es carpeta o proyecto
  const itemType = folder ? 'carpeta' : 'proyecto';
  
  const [teamName, setTeamName] = useState(() => {
    if (folder) return folder.name || '';
    if (project) return project.title || '';
    return '';
  });
  
  const [teamDescription, setTeamDescription] = useState(() => {
    if (folder) return folder.description || '';
    if (project) return project.subtitle || '';
    return '';
  });
  
  const [teamMembers, setTeamMembers] = useState<User[]>(() => {
    if (folder) return folder.assignedTo || [];
    if (project) return project.assignedTo || [];
    return [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteSection, setShowInviteSection] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'viewer' | 'member' | 'admin'>('member');
  const [teamSettings, setTeamSettings] = useState({
    allowInvites: true,
    requireApproval: false,
    publicVisible: true
  });

  const isNewItem = !folder && !project;

  const filteredUsers = availableUsers.filter(user => 
    !teamMembers.find(member => member.id === user.id) &&
    (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const addMember = (user: User) => {
    const newMember = { ...user, role: selectedRole };
    setTeamMembers(prev => [...prev, newMember]);
    setSearchQuery('');
  };

  const removeMember = (userId: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== userId));
  };

  const updateMemberRole = (userId: string, newRole: 'viewer' | 'member' | 'admin') => {
    setTeamMembers(prev => 
      prev.map(member => 
        member.id === userId ? { ...member, role: newRole } : member
      )
    );
  };

  const handleSave = () => {
    const teamData = {
      name: teamName,
      description: teamDescription,
      members: teamMembers,
      owner: currentUser,
      settings: teamSettings
    };
    
    onSave(teamData);
    onClose();
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin': return <UserCheck className="w-4 h-4 text-purple-500" />;
  case 'member': return <Edit3 className="w-4 h-4 text-blue-500" />;
      case 'viewer': return <Users className="w-4 h-4 text-gray-500" />;
      default: return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleText = (role?: string) => {
    switch (role) {
      case 'owner': return 'Propietario';
      case 'admin': return 'Administrador'; 
  case 'member': return 'Miembro';
      case 'viewer': return 'Visualizador';
      default: return 'Miembro';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
      <div className="w-full h-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-xl border-b border-white/10 p-6 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-white mb-1">
                  {isNewItem ? `Crear Nuevo Equipo` : `Gestionar Equipo - ${itemType}`}
                </h2>
                <p className="text-white/70 text-sm sm:text-base">
                  {isNewItem 
                    ? `Configura tu nuevo ${itemType} colaborativo` 
                    : `Administra miembros y configuración del equipo para este ${itemType}`
                  }
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-8">
            {/* Información del Equipo */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                Información del Equipo
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Nombre del Equipo *
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Ej. Equipo de Marketing Digital"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Descripción (Opcional)
                  </label>
                  <textarea
                    value={teamDescription}
                    onChange={(e) => setTeamDescription(e.target.value)}
                    placeholder="Describe brevemente el propósito de este equipo..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Propietario */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                Propietario
              </h3>
              
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-xl">
                  {currentUser.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-medium">{currentUser.name}</h4>
                    <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded-lg">
                      {getRoleIcon(currentUser.role)}
                      <span className="text-yellow-300 text-xs font-medium">{getRoleText(currentUser.role)}</span>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm">{currentUser.email}</p>
                </div>
              </div>
            </div>

            {/* Miembros del Equipo */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Miembros del Equipo ({teamMembers.length})
                </h3>
                <button
                  onClick={() => setShowInviteSection(!showInviteSection)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Invitar Miembros
                </button>
              </div>

              {/* Lista de Miembros */}
              {teamMembers.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg">
                        {member.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-medium">{member.name}</h4>
                          <select
                            value={member.role}
                            onChange={(e) => updateMemberRole(member.id, e.target.value as any)}
                            className="px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-400"
                          >
                            <option value="viewer">Visualizador</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Administrador</option>
                          </select>
                        </div>
                        <p className="text-white/60 text-sm">{member.email}</p>
                      </div>
                      <button
                        onClick={() => removeMember(member.id)}
                        className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 mb-6">
                  <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60">Aún no hay miembros en el equipo</p>
                  <p className="text-white/40 text-sm">Invita a personas para empezar a colaborar</p>
                </div>
              )}

              {/* Sección de Invitar */}
              {showInviteSection && (
                <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                      <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-indigo-400"
                      />
                    </div>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as any)}
                      className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-indigo-400"
                    >
                      <option value="viewer">Visualizador</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>

                  {/* Lista de Usuarios Disponibles */}
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {filteredUsers.map((user) => (
                      <div key={user.id} className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer" onClick={() => addMember(user)}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm">
                          {user.avatar}
                        </div>
                        <div className="flex-1">
                          <h5 className="text-white font-medium text-sm">{user.name}</h5>
                          <p className="text-white/60 text-xs">{user.email}</p>
                        </div>
                        <Plus className="w-5 h-5 text-indigo-400" />
                      </div>
                    ))}
                    {filteredUsers.length === 0 && (
                      <div className="text-center py-4">
                        <p className="text-white/60 text-sm">No se encontraron usuarios</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Configuración del Equipo */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Configuración del Equipo
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <h4 className="text-white font-medium">Permitir invitaciones</h4>
                    <p className="text-white/60 text-sm">Los miembros pueden invitar a otras personas</p>
                  </div>
                  <button
                    onClick={() => setTeamSettings(prev => ({ ...prev, allowInvites: !prev.allowInvites }))}
                    className={`w-12 h-6 rounded-full transition-colors ${teamSettings.allowInvites ? 'bg-indigo-500' : 'bg-white/20'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${teamSettings.allowInvites ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <h4 className="text-white font-medium">Requerir aprobación</h4>
                    <p className="text-white/60 text-sm">Las invitaciones necesitan aprobación del propietario</p>
                  </div>
                  <button
                    onClick={() => setTeamSettings(prev => ({ ...prev, requireApproval: !prev.requireApproval }))}
                    className={`w-12 h-6 rounded-full transition-colors ${teamSettings.requireApproval ? 'bg-indigo-500' : 'bg-white/20'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${teamSettings.requireApproval ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <h4 className="text-white font-medium">Visible públicamente</h4>
                    <p className="text-white/60 text-sm">Otros usuarios pueden encontrar este equipo</p>
                  </div>
                  <button
                    onClick={() => setTeamSettings(prev => ({ ...prev, publicVisible: !prev.publicVisible }))}
                    className={`w-12 h-6 rounded-full transition-colors ${teamSettings.publicVisible ? 'bg-indigo-500' : 'bg-white/20'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${teamSettings.publicVisible ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-6 bg-white/5 shrink-0">
          <div className="flex justify-between items-center gap-4">
            <div>
              <p className="text-white font-medium">
                {isNewItem ? 'Crear Equipo' : 'Guardar Cambios'}
              </p>
              <p className="text-white/60 text-sm">
                {teamMembers.length + 1} miembro{teamMembers.length !== 0 ? 's' : ''} en total
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!teamName.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isNewItem ? 'Crear Equipo' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}