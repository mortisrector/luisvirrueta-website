'use client';

import React, { useState } from 'react';
import { Project, Folder, DailyTask } from '@/types';
import { calculateGlobalStats, getOverdueNotifications } from '@/lib/statistics';
import MetricsModal from '@/components/MetricsModal';

const CircularProgress: React.FC<{ progress: number; size: number }> = ({ progress, size }) => {
  const radius = (size - 4) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="2"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-white">
          {progress}%
        </span>
      </div>
    </div>
  );
};

const MiniChart: React.FC<{ data: number[] }> = ({ data }) => (
  <div className="flex items-end space-x-0.5">
    {data.map((value, i) => (
      <div 
        key={i}
        className="w-1 bg-gradient-to-t from-white/50 to-white/80 rounded-full transition-all duration-500"
        style={{ 
          height: `${Math.max(value/3, 8)}px`,
          animation: `slideUp 0.6s ease-out ${i * 0.1}s both`
        }}
      />
    ))}
  </div>
);

interface UltraPremiumMetricsProps {
  projects: Project[];
  folders: Folder[];
  dailyTasks: DailyTask[];
}

const UltraPremiumMetrics: React.FC<UltraPremiumMetricsProps> = ({ 
  projects, 
  folders, 
  dailyTasks 
}) => {
  // Calcular estadísticas reales
  const globalStats = calculateGlobalStats(projects, folders, dailyTasks);
  const notifications = getOverdueNotifications(projects, dailyTasks);
  
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'daily' | 'streak' | 'global' | 'weekly' | 'notStarted' | 'inProgress' | 'needsAttention' | 'advanced' | 'focused' | null;
  }>({
    isOpen: false,
    type: null
  });

  const openModal = (type: typeof modalState.type) => {
    setModalState({ isOpen: true, type });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: null });
  };

  const handleRedirect = (section: string) => {
    console.log(`Redirecting to: ${section}`);
    // Aquí puedes implementar la navegación real
  };

  return (
    <div className="space-y-6">
      {/* Header Ultra Cinemático */}
      <div className="text-center space-y-3">
        <h2 
          className="text-2xl font-black text-white tracking-tight"
          style={{
            textShadow: '0 4px 12px rgba(0,0,0,0.4)',
            background: 'linear-gradient(135deg, #ffffff 0%, #e879f9 30%, #06b6d4 70%, #10b981 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'shimmer 3s ease-in-out infinite'
          }}
        >
          Tu Día en Números
        </h2>
        <p className="text-white/75 text-lg font-medium">
          Las métricas que realmente importan ✨
        </p>
      </div>
      
      {/* Grid Reorganizado por Importancia Motivacional */}
      <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
        
        {/* 1. ¡VAS QUE VUELAS! - LA MÁS MOTIVANTE */}
        <div 
          className="col-span-2 group p-4 rounded-2xl backdrop-blur-xl border border-white/20 relative overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer"
          onClick={() => openModal('focused')}
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.2))',
            boxShadow: '0 15px 35px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-2 right-2 text-2xl animate-bounce">🚀</div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/90 text-lg font-bold">¡Vas que Vuelas!</span>
              <span className="text-blue-200 text-xs bg-blue-500/30 px-3 py-1 rounded-full font-bold">✨ Top Focus</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-xl font-black text-white mb-1">&ldquo;App Móvil&rdquo; • 12.5h esta semana</div>
                <div className="text-sm text-white/80 font-medium">
                  Tu proyecto estrella está 🔥 • 
                  <span className="text-blue-200 ml-1">+25% progreso</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
                <span className="text-2xl animate-pulse">💎</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Progreso Diario - SEGUNDA MÁS IMPORTANTE */}
        <div 
          className="group p-4 rounded-2xl backdrop-blur-xl border border-white/20 relative overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer"
          onClick={() => openModal('daily')}
          style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.1))',
            boxShadow: '0 12px 30px rgba(34, 197, 94, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/80 text-sm font-semibold">Hoy</span>
              <span className="text-emerald-300 text-xs font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full">+2</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-black text-white">
                  {globalStats.completedDailyTasks}/{globalStats.totalDailyTasks}
                </div>
                <div className="text-xs text-white/60 font-medium">tareas</div>
              </div>
              <CircularProgress progress={globalStats.dailyTasksCompletionRate} size={32} />
            </div>
          </div>
        </div>

        {/* 3. Racha Motivacional - SÚPER MOTIVANTE */}
        <div 
          className="group p-4 rounded-2xl backdrop-blur-xl border border-white/20 relative overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer"
          onClick={() => openModal('streak')}
          style={{
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(234, 88, 12, 0.1))',
            boxShadow: '0 12px 30px rgba(249, 115, 22, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/80 text-sm font-semibold">Racha</span>
              <span className="text-orange-300 text-sm animate-pulse">🔥</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-black text-white">12</div>
                <div className="text-xs text-white/60 font-medium">días</div>
              </div>
              <MiniChart data={[85, 70, 90, 80, 95]} />
            </div>
          </div>
        </div>

        {/* 4. Tareas en Proceso - IMPORTANTE PARA ACCIÓN */}
        <div 
          className="group p-4 rounded-2xl backdrop-blur-xl border border-white/20 relative overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer"
          onClick={() => openModal('inProgress')}
          style={{
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.1))',
            boxShadow: '0 12px 30px rgba(251, 191, 36, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/80 text-sm font-semibold">En Proceso</span>
              <span className="text-yellow-300 text-xs animate-spin">⚡</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-black text-white">4</div>
                <div className="text-xs text-white/60 font-medium">activas</div>
              </div>
              <div className="flex space-x-1">
                {[1,2,3].map((i) => (
                  <div key={i} className="w-1.5 h-6 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 5. Progreso Global */}
        <div 
          className="group p-4 rounded-2xl backdrop-blur-xl border border-white/20 relative overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer"
          onClick={() => openModal('global')}
          style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(147, 51, 234, 0.1))',
            boxShadow: '0 12px 30px rgba(168, 85, 247, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/80 text-sm font-semibold">Global</span>
              <span className="text-purple-300 text-xs font-bold bg-purple-500/20 px-2 py-0.5 rounded-full">↗️</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-black text-white">{globalStats.overallProgress}%</div>
                <div className="text-xs text-white/60 font-medium">total</div>
              </div>
              <CircularProgress progress={globalStats.overallProgress} size={32} />
            </div>
          </div>
        </div>

        {/* 6. Consistencia Semanal */}
        <div 
          className="group p-4 rounded-2xl backdrop-blur-xl border border-white/20 relative overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer"
          onClick={() => openModal('weekly')}
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(79, 70, 229, 0.1))',
            boxShadow: '0 12px 30px rgba(99, 102, 241, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/80 text-sm font-semibold">Semana</span>
              <span className="text-indigo-300 text-xs">📈</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-black text-white">5/7</div>
                <div className="text-xs text-white/60 font-medium">días</div>
              </div>
              <div className="flex space-x-0.5">
                {[100, 80, 90, 70, 85, 60, 75].map((height, i) => (
                  <div 
                    key={i}
                    className={`w-1 rounded-full transition-all duration-500 ${
                      i < 5 
                        ? 'bg-gradient-to-t from-indigo-500 to-indigo-300' 
                        : 'bg-white/30'
                    }`}
                    style={{ 
                      height: `${height/5}px`,
                      animation: `slideUp 0.6s ease-out ${i * 0.1}s both`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 7. Tareas Sin Iniciar */}
        <div 
          className="group p-4 rounded-2xl backdrop-blur-xl border border-white/20 relative overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer"
          onClick={() => openModal('notStarted')}
          style={{
            background: 'linear-gradient(135deg, rgba(245, 101, 101, 0.2), rgba(239, 68, 68, 0.1))',
            boxShadow: '0 12px 30px rgba(245, 101, 101, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/80 text-sm font-semibold">Sin Iniciar</span>
              <span className="text-red-300 text-xs">⏸️</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-black text-white">15</div>
                <div className="text-xs text-white/60 font-medium">pendientes</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-red-400 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* 8. Necesitan Atención (Span 2 columnas) */}
        <div 
          className="col-span-2 group p-4 rounded-2xl backdrop-blur-xl border border-white/20 relative overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer"
          onClick={() => openModal('needsAttention')}
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.1))',
            boxShadow: '0 12px 30px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/80 text-sm font-semibold">Necesitan Atención</span>
              <span className="text-violet-300 text-xs bg-violet-500/20 px-2 py-0.5 rounded-full">⚠️ Recordatorio</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-lg font-black text-white mb-1">&ldquo;Proyecto Marketing Digital&rdquo;</div>
                <div className="text-xs text-white/60 font-medium">
                  Sin actividad hace 3 días • 
                  <span className="text-violet-300 ml-1">Toca revisarla</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center animate-bounce">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Enfoque Simplificada */}
      <div className="mt-8">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-white/90">💡 Ideas & Atención</h3>
          <p className="text-white/60 text-sm">Captura y enfócate</p>
        </div>
        
        <div className="grid grid-cols-1 gap-4 max-w-xs mx-auto">
          {/* Ideas Capturadas */}
          <div 
            className="p-4 rounded-xl backdrop-blur-lg border border-white/20"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1))',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.1)'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-black text-white">23</div>
                <div className="text-xs text-white/70">ideas guardadas</div>
              </div>
              <div className="text-2xl">💡</div>
            </div>
          </div>
        </div>
      </div>

      {/* Animaciones CSS */}
      <style jsx>{`
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes slideUp {
          from { 
            height: 4px;
            opacity: 0;
          }
          to { 
            opacity: 1;
          }
        }
      `}</style>

      {/* Modal System */}
      {modalState.type && (
        <MetricsModal
          isOpen={modalState.isOpen}
          type={modalState.type}
          onClose={closeModal}
          onRedirect={handleRedirect}
        />
      )}
    </div>
  );
};

export default UltraPremiumMetrics;