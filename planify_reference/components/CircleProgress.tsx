'use client';

interface CircleProgressProps {
  progress: number; // 0-100
  size?: number;    // diameter in pixels
  strokeWidth?: number;
  projectTitle?: string;
  className?: string;
  colorScheme?: string;
  onClick?: () => void;
}

export default function CircleProgress({ 
  progress, 
  size = 80, 
  strokeWidth,
  projectTitle = '',
  className = '',
  colorScheme = 'default',
  onClick
}: CircleProgressProps) {
  // Auto-adjust strokeWidth based on size if not provided
  const actualStrokeWidth = strokeWidth || (size <= 60 ? 6 : 8);
  const radius = (size - actualStrokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  // Esquemas de color disponibles
  const colorSchemes = {
    // Clásicos
    default: { start: '#8b5cf6', middle: '#06b6d4', end: '#10b981' },
    'Azul Clásico': { start: '#3B82F6', middle: '#1D4ED8', end: '#2563EB' },
    'Verde Esmeralda': { start: '#10B981', middle: '#047857', end: '#065f46' },
    'Púrpura Real': { start: '#8B5CF6', middle: '#6D28D9', end: '#581c87' },
    'Rojo Carmesí': { start: '#EF4444', middle: '#B91C1C', end: '#991b1b' },
    'Naranja Fuego': { start: '#F97316', middle: '#DC2626', end: '#b91c1c' },
    'Gris Profesional': { start: '#4B5563', middle: '#1F2937', end: '#111827' },
    
    // Vibrantes  
    'Neón Rosa': { start: '#F472B6', middle: '#E11D48', end: '#be185d' },
    'Cyber Azul': { start: '#22D3EE', middle: '#2563EB', end: '#1d4ed8' },
    'Lima Eléctrica': { start: '#A3E635', middle: '#16A34A', end: '#15803d' },
    'Magenta Shock': { start: '#D946EF', middle: '#DB2777', end: '#be185d' },
    'Turquesa Neon': { start: '#2DD4BF', middle: '#0891B2', end: '#0e7490' },
    'Amarillo Voltio': { start: '#FACC15', middle: '#F97316', end: '#ea580c' },
    
    // Elegantes
    'Oro Rosa': { start: '#FDA4AF', middle: '#F472B6', end: '#ec4899' },
    'Platino': { start: '#94A3B8', middle: '#4B5563', end: '#374151' },
    'Champagne': { start: '#FDE68A', middle: '#EAB308', end: '#d97706' },
    'Perla Negra': { start: '#374151', middle: '#000000', end: '#000000' },
    'Violeta Imperial': { start: '#A78BFA', middle: '#6D28D9', end: '#581c87' },
    'Bronce Antiguo': { start: '#D97706', middle: '#9A3412', end: '#7c2d12' },
    
    // Suaves
    'Rosa Sakura': { start: '#FBCFE8', middle: '#FDA4AF', end: '#f9a8d4' },
    'Celeste Nube': { start: '#BAE6FD', middle: '#93C5FD', end: '#7dd3fc' },
    'Menta Fresca': { start: '#A7F3D0', middle: '#6EE7B7', end: '#5eead4' },
    'Lavanda Dulce': { start: '#E9D5FF', middle: '#C4B5FD', end: '#c084fc' },
    'Durazno Suave': { start: '#FED7AA', middle: '#FDBA74', end: '#fb923c' },
    'Lila Pastel': { start: '#C7D2FE', middle: '#C4B5FD', end: '#c084fc' },
    
    // Profesionales
    'Azul Corporativo': { start: '#2563EB', middle: '#3730A3', end: '#312e81' },
    'Verde Ejecutivo': { start: '#15803D', middle: '#064E3B', end: '#022c22' },
    'Grafito Premium': { start: '#475569', middle: '#111827', end: '#030712' },
    'Burgundy Ejecutivo': { start: '#991B1B', middle: '#7F1D1D', end: '#450a0a' },
    'Navy Premium': { start: '#1E293B', middle: '#1E3A8A', end: '#1e3a8a' },
    'Carbón Elegante': { start: '#3F3F46', middle: '#1C1917', end: '#0c0a09' },
    
    // Especiales
    'Arcoíris': { start: '#EC4899', middle: '#8B5CF6', end: '#3B82F6' },
    'Atardecer': { start: '#FB923C', middle: '#EF4444', end: '#DB2777' },
    'Aurora Boreal': { start: '#4ADE80', middle: '#22D3EE', end: '#2563EB' },
    'Galaxia': { start: '#581C87', middle: '#312e81', end: '#1E3A8A' },
    'Lava': { start: '#DC2626', middle: '#EA580C', end: '#EAB308' },
    'Océano Profundo': { start: '#1E40AF', middle: '#0891B2', end: '#0D9488' },
    
    // Legacy schemes for backward compatibility
    sunset: { start: '#f97316', middle: '#ec4899', end: '#ef4444' },
    ocean: { start: '#2563eb', middle: '#3b82f6', end: '#22d3ee' },
    forest: { start: '#059669', middle: '#10b981', end: '#14b8a6' },
    cosmic: { start: '#7c3aed', middle: '#6366f1', end: '#3b82f6' },
    neon: { start: '#84cc16', middle: '#22c55e', end: '#10b981' },
    electric: { start: '#60a5fa', middle: '#a855f7', end: '#ec4899' },
    fire: { start: '#ef4444', middle: '#f97316', end: '#facc15' },
    gold: { start: '#facc15', middle: '#eab308', end: '#fb923c' },
    silver: { start: '#9ca3af', middle: '#6b7280', end: '#64748b' },
    bronze: { start: '#d97706', middle: '#ea580c', end: '#dc2626' },
    platinum: { start: '#cbd5e1', middle: '#93c5fd', end: '#818cf8' },
    rose: { start: '#fda4af', middle: '#fbb6ce', end: '#f87171' },
    mint: { start: '#6ee7b7', middle: '#5eead4', end: '#67e8f9' },
    lavender: { start: '#ddd6fe', middle: '#c4b5fd', end: '#f8bbdd' },
    peach: { start: '#fed7aa', middle: '#fecaca', end: '#fca5a5' }
  };

  // Obtener colores del esquema seleccionado
  const getGradientColors = () => {
    const scheme = colorSchemes[colorScheme as keyof typeof colorSchemes] || colorSchemes.default;
    
    if (progress <= 50) {
      // Primer color a segundo color
      return {
        start: scheme.start,
        middle: scheme.middle,
        end: scheme.middle
      };
    } else {
      // Segundo color a tercer color
      return {
        start: scheme.middle,
        middle: scheme.end,
        end: scheme.end
      };
    }
  };

  const colors = getGradientColors();
  const gradientId = `gradient-${projectTitle.replace(/\s+/g, '-')}-${projectTitle.length}-${progress}`;
  
  const handleClick = (event: React.MouseEvent) => {
    if (onClick) {
      event.stopPropagation(); // Prevent event bubbling to parent elements
      onClick();
    }
  };
  
  return (
    <div 
      className={`relative ${onClick ? 'cursor-pointer hover:scale-105 transition-transform duration-200' : ''} ${className}`}
      onClick={handleClick}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        role="img"
        aria-label={`Progreso del proyecto ${projectTitle}: ${Math.round(progress)}%`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="50%" stopColor={colors.middle} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
          <filter id={`glow-${gradientId}`}>
            <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor={colors.middle} floodOpacity="0.3"/>
          </filter>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(148, 163, 184, 0.15)"
          strokeWidth={actualStrokeWidth - 1}
          strokeLinecap="round"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={actualStrokeWidth}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          filter={`url(#glow-${gradientId})`}
          className="transition-all duration-700 ease-out"
          style={{
            transformOrigin: '50% 50%',
          }}
        />
      </svg>
      

    </div>
  );
}