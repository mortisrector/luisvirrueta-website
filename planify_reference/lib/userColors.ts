import { User } from '@/types';

// Sistema de colores para usuarios con paleta consistente
export const userColorPalette = [
  {
    name: 'Purple Cosmic',
    gradient: 'from-purple-500 to-indigo-600',
    bg: 'bg-purple-500',
    text: 'text-purple-500',
    border: 'border-purple-500',
    ring: 'ring-purple-500',
    light: 'from-purple-400 to-indigo-500',
    glow: 'shadow-purple-500/50',
    hex: '#A855F7'
  },
  {
    name: 'Cyan Ocean',
    gradient: 'from-cyan-500 to-blue-600',
    bg: 'bg-cyan-500',
    text: 'text-cyan-500',
    border: 'border-cyan-500',
    ring: 'ring-cyan-500',
    light: 'from-cyan-400 to-blue-500',
    glow: 'shadow-cyan-500/50',
    hex: '#06B6D4'
  },
  {
    name: 'Emerald Forest',
    gradient: 'from-emerald-500 to-green-600',
    bg: 'bg-emerald-500',
    text: 'text-emerald-500',
    border: 'border-emerald-500',
    ring: 'ring-emerald-500',
    light: 'from-emerald-400 to-green-500',
    glow: 'shadow-emerald-500/50',
    hex: '#10B981'
  },
  {
    name: 'Orange Sunset',
    gradient: 'from-orange-500 to-red-600',
    bg: 'bg-orange-500',
    text: 'text-orange-500',
    border: 'border-orange-500',
    ring: 'ring-orange-500',
    light: 'from-orange-400 to-red-500',
    glow: 'shadow-orange-500/50',
    hex: '#F97316'
  },
  {
    name: 'Pink Blush',
    gradient: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-500',
    text: 'text-pink-500',
    border: 'border-pink-500',
    ring: 'ring-pink-500',
    light: 'from-pink-400 to-rose-500',
    glow: 'shadow-pink-500/50',
    hex: '#EC4899'
  },
  {
    name: 'Amber Gold',
    gradient: 'from-amber-500 to-yellow-600',
    bg: 'bg-amber-500',
    text: 'text-amber-500',
    border: 'border-amber-500',
    ring: 'ring-amber-500',
    light: 'from-amber-400 to-yellow-500',
    glow: 'shadow-amber-500/50',
    hex: '#F59E0B'
  },
  {
    name: 'Violet Magic',
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-500',
    text: 'text-violet-500',
    border: 'border-violet-500',
    ring: 'ring-violet-500',
    light: 'from-violet-400 to-purple-500',
    glow: 'shadow-violet-500/50',
    hex: '#8B5CF6'
  },
  {
    name: 'Teal Breeze',
    gradient: 'from-teal-500 to-cyan-600',
    bg: 'bg-teal-500',
    text: 'text-teal-500',
    border: 'border-teal-500',
    ring: 'ring-teal-500',
    light: 'from-teal-400 to-cyan-500',
    glow: 'shadow-teal-500/50',
    hex: '#14B8A6'
  }
];

// Función para asignar color a un usuario basado en su ID o email
export function getUserColor(user: User): typeof userColorPalette[0] {
  const hash = user.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorIndex = hash % userColorPalette.length;
  return userColorPalette[colorIndex];
}

// Función para obtener color por ID de usuario
export function getUserColorById(userId: string): typeof userColorPalette[0] {
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorIndex = hash % userColorPalette.length;
  return userColorPalette[colorIndex];
}

// Función para generar avatar con color consistente
export function generateUserAvatar(user: User, size: 'sm' | 'md' | 'lg' = 'md') {
  const userColor = (user as any).customColor ? {
    // Adaptar estructura para customColor manteniendo compatibilidad
    gradient: (user as any).customColor,
    light: (user as any).customColor,
    glow: 'shadow-white/30',
    bg: '', text: '', border: '', ring: '', hex: '#ffffff'
  } : getUserColor(user);
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base'
  };
  
  // Generar iniciales de forma más robusta
  let initials = 'U';
  if (user.name && user.name.trim()) {
    // Si tiene nombre, usar las iniciales del nombre
    initials = user.name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase();
  } else if (user.email && user.email.trim()) {
    // Si solo tiene email, usar las primeras 2 letras antes del @
    const emailPart = user.email.split('@')[0];
    initials = emailPart.substring(0, 2).toUpperCase();
  }
  
  return {
    className: `${sizeClasses[size]} rounded-full bg-gradient-to-r ${userColor.gradient} flex items-center justify-center text-white font-semibold border-2 border-white/20 ${userColor.glow}`,
    initials,
    color: userColor
  };
}

// Función para generar badge de usuario
export function generateUserBadge(user: User, showName = true) {
  const userColor = (user as any).customColor ? {
    gradient: (user as any).customColor,
    light: (user as any).customColor,
    glow: 'shadow-white/30'
  } : getUserColor(user);
  
  return {
    className: `inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${userColor.light} text-white text-sm font-medium`,
    color: userColor,
    displayName: showName ? user.name : user.name.split(' ')[0]
  };
}

// Función central para resolver el color visual de un miembro priorizando customColor
export function resolveMemberColor(member: any) {
  if (!member) {
    return {
      gradient: 'from-gray-400 to-gray-500',
      light: 'from-gray-400 to-gray-500',
      glow: 'shadow-gray-500/40'
    };
  }
  if (member.customColor) {
    return {
      gradient: member.customColor,
      light: member.customColor,
      glow: 'shadow-white/30'
    };
  }
  const palette = getUserColor(member as User);
  return palette;
}

// --- NUEVO: Helper unificado para obtener un gradient siempre consistente para cualquier representación de usuario ---
// Acepta objetos parciales (user, miembro con email o id) y devuelve siempre un string 'from-... to-...'
export function getUserGradient(member: Partial<User> & { customColor?: string } | undefined): string {
  if (!member) return 'from-gray-400 to-gray-500';
  if (member.customColor) return member.customColor; // ya es gradient válido
  // Preferimos id para hashing estable; si no existe usamos email o nombre
  const base = member.id || member.email || member.name || 'default-user';
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    hash = ((hash << 5) - hash + base.charCodeAt(i)) & 0xffffffff;
  }
  // Reutilizamos la paleta existente pero usamos la propiedad 'light' que ya es un gradient listo
  const paletteIndex = Math.abs(hash) % userColorPalette.length;
  return userColorPalette[paletteIndex].light; // formato 'from-... to-...'
}

// --- NUEVO: Devuelve objeto con clases estándar para chips, unificando diseño en carpetas, proyectos y tareas ---
export function buildMemberChipClasses(member: Partial<User> & { customColor?: string }) {
  const gradient = getUserGradient(member);
  return {
    container: `relative group cursor-pointer transition-all duration-300 hover:scale-[1.04] bg-black/20 backdrop-blur-sm rounded-full border border-white/20 px-2 py-1 flex items-center gap-1`,
    avatar: `w-4 h-4 rounded-full flex items-center justify-center ring-1 ring-white/30 flex-shrink-0 bg-gradient-to-r ${gradient}`,
    gradient
  };
}
