'use client';

import React from 'react';
import { TrendingUp, Target, Award, Calendar, Folder, AlertTriangle, Clock } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  progress?: number;
  trend?: 'up' | 'down' | 'neutral';
  chart?: React.ReactNode;
  size?: 'normal' | 'large';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color, 
  progress = 0, 
  trend = 'neutral',
  chart,
  size = 'normal'
}) => {
  const isLarge = size === 'large';
  
  return (
    <div 
      className={`
        relative overflow-hidden rounded-2xl backdrop-blur-2xl border border-white/20 
        transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group cursor-pointer
        ${isLarge ? 'col-span-2 p-4' : 'p-3'}
        hover:border-white/30
      `}
      style={{
        background: `linear-gradient(135deg, ${color} 0%, ${color.replace('0.12', '0.08')} 50%, ${color.replace('0.12', '0.15')} 100%)`,
        boxShadow: `
          0 25px 50px rgba(0, 0, 0, 0.12),
          0 15px 30px rgba(0, 0, 0, 0.08),
          0 8px 20px rgba(0, 0, 0, 0.05),
          inset 0 2px 0 rgba(255, 255, 255, 0.15),
          inset 0 -1px 0 rgba(0, 0, 0, 0.1)
        `
      }}
    >
      {/* Patrón de fondo premium con efectos motivantes */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(34, 197, 94, 0.4) 0%, transparent 40%),
            radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, rgba(5, 150, 105, 0.2) 0%, transparent 60%),
            linear-gradient(45deg, transparent 48%, rgba(255, 255, 255, 0.1) 49%, rgba(255, 255, 255, 0.1) 51%, transparent 52%)
          `
        }}
      />

      {/* Partículas de éxito animadas */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-4 right-6 w-1 h-1 bg-emerald-300/80 rounded-full"
          style={{ animation: 'float 4s ease-in-out infinite' }}
        />
        <div 
          className="absolute bottom-6 left-4 w-1.5 h-1.5 bg-green-200/70 rounded-full"
          style={{ animation: 'float 4s ease-in-out infinite 2s' }}
        />
        <div 
          className="absolute top-1/2 right-3 w-0.5 h-0.5 bg-teal-300/60 rounded-full"
          style={{ animation: 'sparkle 3s ease-in-out infinite 1s' }}
        />
      </div>

      <div className="relative z-10">
        {/* Header bien alineado */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div 
              className={`
                p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20
                group-hover:scale-110 transition-transform duration-300
              `}
            >
              <div className="text-white w-5 h-5">
                {icon}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/90">
                {title}
              </h3>
              <p className="text-xs text-white/60">
                {subtitle}
              </p>
            </div>
          </div>
          
          {trend !== 'neutral' && (
            <div className={`
              flex items-center space-x-1 px-2 py-1 rounded-full 
              ${trend === 'up' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}
            `}>
              <TrendingUp className={`w-3 h-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
              <span className="text-xs font-semibold">
                {trend === 'up' ? '+12%' : '-5%'}
              </span>
            </div>
          )}
        </div>

        {/* Value prominente */}
        <div className="mb-3">
          <div className={`font-black text-white ${isLarge ? 'text-3xl' : 'text-2xl'}`}>
            {value}
          </div>
        </div>

        {/* Chart area restaurado */}
        {chart && (
          <div className={`mb-3 ${isLarge ? 'h-24' : 'h-16'}`}>
            {chart}
          </div>
        )}

        {/* Progress Bar elegante */}
        {progress > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Progreso</span>
              <span className="text-white/80 font-semibold">{progress}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-white/80 to-white/60 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componentes de gráficos premium motivantes
const MiniLineChart: React.FC<{ data: number[]; color: string }> = ({ data, color }) => (
  <div className="flex items-end space-x-1 h-full relative">
    {/* Línea de fondo sutil */}
    <div className="absolute bottom-0 left-0 right-0 h-px bg-white/20"></div>
    
    {data.map((value, index) => (
      <div key={index} className="flex-1 relative">
        {/* Barra principal con gradiente */}
        <div
          className={`rounded-t-lg ${color} shadow-lg relative overflow-hidden`}
          style={{ 
            height: `${Math.max(value, 5)}%`,
            animation: `slideUp 0.8s ease-out ${index * 0.1}s both`
          }}
        >
          {/* Brillo superior */}
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-white/30 rounded-t-lg"></div>
          
          {/* Punto de datos al final */}
          {index === data.length - 1 && (
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg animate-pulse"></div>
          )}
        </div>
      </div>
    ))}
    
    {/* CSS para la animación */}
    <style jsx>{`
      @keyframes slideUp {
        from {
          height: 0%;
          opacity: 0;
        }
        to {
          height: var(--final-height);
          opacity: 1;
        }
      }
    `}</style>
  </div>
);

const CircularProgress: React.FC<{ progress: number; size?: number }> = ({ 
  progress, 
  size = 80 
}) => {
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex items-center justify-center h-full relative">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Círculo de fondo */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="6"
          fill="transparent"
        />
        
        {/* Círculo de progreso con gradiente */}
        <defs>
          <linearGradient id={`gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(34, 197, 94, 0.9)" />
            <stop offset="50%" stopColor="rgba(16, 185, 129, 1)" />
            <stop offset="100%" stopColor="rgba(5, 150, 105, 0.8)" />
          </linearGradient>
        </defs>
        
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#gradient-${size})`}
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1500 ease-out drop-shadow-lg"
          style={{
            filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.3))'
          }}
        />
        
        {/* Punto final brillante */}
        {progress > 5 && (
          <circle
            cx={size / 2 + radius * Math.cos((progress / 100 * 2 * Math.PI) - Math.PI / 2)}
            cy={size / 2 + radius * Math.sin((progress / 100 * 2 * Math.PI) - Math.PI / 2)}
            r="4"
            fill="rgba(255, 255, 255, 0.9)"
            className="animate-pulse"
            style={{
              filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.8))'
            }}
          />
        )}
      </svg>
      
      {/* Porcentaje central */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-black text-white drop-shadow-md">
          {progress}%
        </span>
      </div>
    </div>
  );
};

const PremiumMetricsGrid: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header cinemático y amigable */}
      <div className="text-center space-y-2">
        <h2 
          className="text-2xl font-black text-white tracking-tight"
          style={{
            textShadow: '0 4px 8px rgba(0,0,0,0.3)',
            background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 50%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Tu Progreso Hoy
        </h2>
        <p className="text-white/70 text-base font-medium">
          Lo que más importa en tu día ✨
        </p>
      </div>
      
      {/* Grid premium compacto - rectángulos pequeños */}
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
        {/* 1. Tareas de Hoy - Métrica principal */}
        <MetricCard
          title="🎯 Hoy"
          value="8/10"
          subtitle="Tareas conquistadas"
          icon={<Calendar className="w-6 h-6" />}
          color="rgba(34, 197, 94, 0.15)"
          progress={80}
          trend="up"
          chart={<CircularProgress progress={80} size={55} />}
        />

        {/* 2. Racha - Motivación central */}
        <MetricCard
          title="🔥 Racha"
          value="12"
          subtitle="Días imparables"
          icon={<Award className="w-6 h-6" />}
          color="rgba(249, 115, 22, 0.15)"
          progress={85}
          trend="up"
          chart={<MiniLineChart data={[60, 70, 75, 80, 82, 85, 85]} color="bg-gradient-to-r from-orange-400 to-red-400" />}
        />

        {/* 3. Progreso Total */}
        <MetricCard
          title="📈 Global"
          value="68%"
          subtitle="Avance total"
          icon={<TrendingUp className="w-6 h-6" />}
          color="rgba(59, 130, 246, 0.15)"
          progress={68}
          trend="up"
          chart={<CircularProgress progress={68} size={65} />}
        />

        {/* 4. Enfoque Activo */}
        <MetricCard
          title="⚡ Enfoque"
          value="3"
          subtitle="Proyectos activos"
          icon={<Target className="w-6 h-6" />}
          color="rgba(168, 85, 247, 0.15)"
          progress={92}
          trend="up"
          chart={<MiniLineChart data={[50, 65, 80, 70, 85, 90, 92]} color="bg-gradient-to-r from-purple-400 to-indigo-400" />}
        />
      </div>

      {/* Modo Enfoque Premium - Destacado */}
      <div className="relative">
        <div className="bg-gradient-to-r from-emerald-400/15 via-teal-400/15 to-cyan-400/15 rounded-4xl p-8 border-2 border-emerald-400/25 backdrop-blur-2xl shadow-2xl">
          {/* Patrón de fondo elegante */}
          <div 
            className="absolute inset-0 opacity-10 rounded-4xl"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(34, 197, 94, 0.3) 0%, transparent 50%),
                               radial-gradient(circle at 75% 75%, rgba(20, 184, 166, 0.2) 0%, transparent 50%)`
            }}
          />
          
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center space-x-4 mb-6">
              <div className="p-4 bg-emerald-500/25 rounded-3xl border-2 border-emerald-400/30 backdrop-blur-lg">
                <Target className="w-8 h-8 text-emerald-200" />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-black text-white mb-1">🎯 Modo Enfoque</h3>
                <p className="text-emerald-200/90 text-lg font-semibold">Francia Trip Planning</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white/15 rounded-3xl p-6 border border-white/20 backdrop-blur-lg">
                <div className="text-3xl font-black text-emerald-300 mb-2">2h 45m</div>
                <div className="text-emerald-200/80 text-base font-semibold">Tiempo enfocado</div>
              </div>
              <div className="bg-white/15 rounded-3xl p-6 border border-white/20 backdrop-blur-lg">
                <div className="text-3xl font-black text-teal-300 mb-2">7/12</div>
                <div className="text-teal-200/80 text-base font-semibold">Tareas restantes</div>
              </div>
              <div className="bg-white/15 rounded-3xl p-6 border border-white/20 backdrop-blur-lg">
                <div className="text-3xl font-black text-cyan-300 mb-2">58%</div>
                <div className="text-cyan-200/80 text-base font-semibold">Progreso hoy</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas de Atención - Solo las más importantes */}
      <div className="grid grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
        {/* Proyectos que necesitan atención */}
        <MetricCard
          title="⚠️ Atención"
          value="2"
          subtitle="Necesitan impulso"
          icon={<AlertTriangle className="w-6 h-6" />}
          color="rgba(239, 68, 68, 0.15)"
          progress={25}
          trend="down"
          chart={<MiniLineChart data={[80, 70, 60, 45, 35, 28, 25]} color="bg-gradient-to-r from-red-400 to-pink-400" />}
        />

        {/* Nuevas ideas capturadas */}
        <MetricCard
          title="💡 Ideas"
          value="12"
          subtitle="Esta semana"
          icon={<Folder className="w-6 h-6" />}
          color="rgba(6, 182, 212, 0.15)"
          progress={150}
          trend="up"
          chart={<MiniLineChart data={[2, 4, 6, 8, 10, 11, 12]} color="bg-gradient-to-r from-cyan-400 to-blue-400" />}
        />
      </div>
    </div>
  );
};

export default PremiumMetricsGrid;