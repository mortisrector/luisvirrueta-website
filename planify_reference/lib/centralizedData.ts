// Archivo centralizado para todos los datos mock
// Elimina duplicación y proporciona referencias consistentes

import { User, Team, Project, Folder, DailyTask } from '../types';

// ===========================================
// USUARIOS CENTRALIZADOS
// ===========================================

export const USERS = {
  ANA: {
    id: 'user-ana-garcia',
    name: 'Ana García',
    email: 'ana.garcia@example.com',
    avatar: '👩‍💼',
    role: 'owner' as const,
    team: 'Desarrollo'
  } as User,
  CARLOS: {
    id: 'user-carlos-lopez',
    name: 'Carlos López',
    email: 'carlos.lopez@example.com',
    avatar: '👨‍💻',
    role: 'admin' as const,
    team: 'Desarrollo'
  } as User,
  MARIA: {
    id: 'user-maria-silva',
    name: 'María Silva',
    email: 'maria.silva@example.com',
    avatar: '👩‍🎨',
    role: 'member' as const,
    team: 'Diseño'
  } as User,
  JUAN: {
    id: 'user-juan-rodriguez',
    name: 'Juan Rodríguez',
    email: 'juan.rodriguez@example.com',
    avatar: '👨‍📈',
    role: 'viewer' as const,
    team: 'Marketing'
  } as User,
  SOFIA: {
    id: 'user-sofia-rodriguez',
    name: 'Sofia Rodríguez',
    email: 'sofia.rodriguez@example.com',
    avatar: '👩‍🚀',
    role: 'member' as const,
    team: 'Desarrollo'
  } as User,
  MIGUEL: {
    id: 'user-miguel-torres',
    name: 'Miguel Torres',
    email: 'miguel.torres@example.com',
    avatar: '👨‍🎯',
    role: 'owner' as const,
    team: 'Diseño'
  } as User
};

// Array para compatibilidad con código existente
export const mockUsers: User[] = Object.values(USERS);

// ===========================================
// EQUIPOS CENTRALIZADOS
// ===========================================

export const TEAMS = {
  DESARROLLO: {
    id: 'team-desarrollo',
    name: 'Equipo de Desarrollo',
    description: 'Desarrollo de software y aplicaciones',
    members: [USERS.ANA, USERS.CARLOS, USERS.SOFIA],
    color: '#3B82F6',
    icon: '💻',
    createdAt: '2024-01-15T10:00:00.000Z'
  } as Team,
  DISENO: {
    id: 'team-diseno',
    name: 'Equipo de Diseño',
    description: 'Diseño UI/UX y experiencia de usuario',
    members: [USERS.MARIA, USERS.MIGUEL],
    color: '#EC4899',
    icon: '🎨',
    createdAt: '2024-01-15T10:00:00.000Z'
  } as Team,
  MARKETING: {
    id: 'team-marketing',
    name: 'Equipo de Marketing',
    description: 'Marketing digital y estrategia',
    members: [USERS.JUAN],
    color: '#10B981',
    icon: '📈',
    createdAt: '2024-01-15T10:00:00.000Z'
  } as Team
};

export const mockTeams: Team[] = Object.values(TEAMS);

// ===========================================
// CONFIGURACIONES COMUNES
// ===========================================

export const COMMON_ASSIGNMENTS = {
  FULL_DEV_TEAM: [USERS.ANA, USERS.CARLOS, USERS.SOFIA] as User[],
  DESIGN_LEADS: [USERS.MARIA, USERS.MIGUEL] as User[],
  PROJECT_OWNERS: [USERS.ANA, USERS.MIGUEL] as User[],
  ALL_EDITORS: [USERS.CARLOS, USERS.MARIA, USERS.SOFIA] as User[],
  ALL_USERS: Object.values(USERS) as User[]
};

// ===========================================
// HELPERS PARA DATOS MOCK
// ===========================================

export const DataHelpers = {
  // Obtener usuario por nombre
  getUserByName: (name: string) => 
    mockUsers.find(user => user.name === name),

  // Obtener equipo por ID
  getTeamById: (id: string) => 
    mockTeams.find(team => team.id === id),

  // Crear asignación de usuarios
  createAssignment: (userNames: string[]) =>
    userNames.map(name => DataHelpers.getUserByName(name)).filter(Boolean) as User[],

  // Configuraciones de sharing comunes
  createShareSettings: (level: 'view' | 'edit' | 'admin' = 'view', users: User[] = []) => ({
    isShared: true,
    shareLevel: level,
    allowedUsers: users,
    allowedTeams: users.length > 2 ? [TEAMS.DESARROLLO] : [],
    isPublic: false,
    allowComments: level !== 'view',
    allowEditing: level === 'edit' || level === 'admin',
    permissions: {
      canEdit: level === 'edit' || level === 'admin',
      canDelete: level === 'admin',
      canShare: level === 'admin',
      canAddMembers: level === 'admin'
    }
  }),

  // Fecha fija para consistencia
  getFixedDate: () => '2024-01-15T10:00:00.000Z'
} as const;

// ===========================================
// EXPORTACIONES PARA COMPATIBILIDAD
// ===========================================

// Re-exportar para mantener compatibilidad con imports existentes
export { mockUsers as users, mockTeams as teams };
export default {
  users: mockUsers,
  teams: mockTeams,
  USERS,
  TEAMS,
  COMMON_ASSIGNMENTS,
  DataHelpers
};