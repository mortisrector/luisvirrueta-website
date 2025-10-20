'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Target, TrendingUp, Layers, Zap } from 'lucide-react';

interface ProjectPlayOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
  onSelectMode: (mode: 'close-and-new' | 'continue-adding') => void;
}

export default function ProjectPlayOptionsModal({ 
  isOpen, 
  onClose, 
  projectTitle,
  onSelectMode 
}: ProjectPlayOptionsModalProps) {
  const [mounted, setMounted] = useState(false);

  // Asegurar que solo se renderiza en el cliente
  useState(() => {
    setMounted(true);
  });

  if (!isOpen || !mounted) return null;

  const handleSelectMode = (mode: 'close-and-new' | 'continue-adding') => {
    onSelectMode(mode);
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 rounded-3xl border-2 border-white/20 shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur-xl p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                <Target className="w-8 h-8 text-purple-400" />
                Modo de Proyecto
              </h2>
              <p className="text-white/70 mt-2 text-sm sm:text-base">
                "{projectTitle}"
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Opción 1: Modo Fases */}
          <button
            onClick={() => handleSelectMode('close-and-new')}
            className="w-full p-6 rounded-2xl border-2 border-white/20 bg-white/5 hover:bg-white/10 hover:border-purple-400/50 transition-all duration-200 text-left group hover:scale-[1.02]"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                <Layers className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  Modo Fases 🎯
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-500/30 text-purple-200">
                    Recomendado
                  </span>
                </h3>
                <p className="text-white/70 text-sm mb-3">
                  Cierra este proyecto a las tareas actuales y crea fases automáticamente
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                    <span>Las tareas actuales se completan</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                    <span>Nuevas tareas van a cola de espera</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                    <span>Al completar → Crea "{projectTitle} - Fase 2" automáticamente</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                    <span>Progreso fijo y predecible</span>
                  </div>
                </div>
              </div>
            </div>
          </button>

          {/* Opción 2: Modo Flexible */}
          <button
            onClick={() => handleSelectMode('continue-adding')}
            className="w-full p-6 rounded-2xl border-2 border-white/20 bg-white/5 hover:bg-white/10 hover:border-cyan-400/50 transition-all duration-200 text-left group hover:scale-[1.02]"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  Modo Flexible 📈
                  <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/30 text-cyan-200">
                    Dinámico
                  </span>
                </h3>
                <p className="text-white/70 text-sm mb-3">
                  Agrega tareas libremente y recalcula el progreso en tiempo real
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                    <span>Agrega tareas en cualquier momento</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                    <span>Progreso se recalcula automáticamente</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                    <span>Tiempo estimado se ajusta dinámicamente</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                    <span>Ideal para proyectos en evolución</span>
                  </div>
                </div>
              </div>
            </div>
          </button>

          {/* Info adicional */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white/70 text-sm">
                  <span className="font-semibold text-white">Consejo:</span> Usa <span className="text-purple-300">Modo Fases</span> para proyectos con alcance definido, y <span className="text-cyan-300">Modo Flexible</span> para proyectos exploratorios o ágiles.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-black/30 backdrop-blur-xl p-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl border border-white/20 text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
