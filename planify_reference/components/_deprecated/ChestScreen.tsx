'use client';

import { Recognition } from '@/types';
import { Award, Trophy, Star, Target } from 'lucide-react';

interface ChestScreenProps {
  recognitions: Recognition[];
  onClose?: () => void;
}

export default function ChestScreen({ recognitions, onClose }: ChestScreenProps) {
  const groupedRecognitions = recognitions.reduce((groups, recognition) => {
    const key = recognition.scope;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(recognition);
    return groups;
  }, {} as Record<string, Recognition[]>);
  
  const getRecognitionIcon = (recognition: Recognition) => {
    // Use emoji icon if available, otherwise fallback to Lucide icon
    if (recognition.icon && recognition.icon.length <= 2) {
      return recognition.icon;
    }
    
    // Default icons based on title patterns
    if (recognition.title.includes('100%') || recognition.title.includes('logrado')) {
      return '🏁';
    }
    if (recognition.title.includes('1%') || recognition.title.includes('primer')) {
      return '🌟';
    }
    if (recognition.title.includes('racha') || recognition.title.includes('días')) {
      return '🔥';
    }
    
    return '🏆';
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-600" aria-hidden="true" />
            Cofre de Reconocimientos
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            {recognitions.length} reconocimiento{recognitions.length !== 1 ? 's' : ''} ganado{recognitions.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/20 transition-smooth focus-ring"
            aria-label="Cerrar cofre"
          >
            ✕
          </button>
        )}
      </div>
      
      {recognitions.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center mb-6">
            <Award className="w-12 h-12 text-amber-400" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            Tu cofre está vacío
          </h2>
          <p className="text-slate-600 max-w-sm">
            Completa tareas y alcanza hitos para ganar reconocimientos especiales
          </p>
        </div>
      ) : (
        /* Recognitions grid */
        <div className="space-y-8">
          {Object.entries(groupedRecognitions).map(([scope, items]) => (
            <section key={scope}>
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                {scope === 'global' ? (
                  <>
                    <Star className="w-5 h-5 text-amber-500" aria-hidden="true" />
                    Globales
                  </>
                ) : (
                  <>
                    <Target className="w-5 h-5 text-blue-500" aria-hidden="true" />
                    Por Proyecto
                  </>
                )}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((recognition) => (
                    <div
                      key={recognition.id}
                      className="glass-card rounded-2xl p-4 text-center transition-smooth hover:scale-105 hover:shadow-xl"
                    >
                      <div className="text-4xl mb-3">
                        {getRecognitionIcon(recognition)}
                      </div>
                      
                      <h3 className="font-semibold text-slate-800 text-sm mb-2 leading-tight">
                        {recognition.title}
                      </h3>
                      
                      <div className="text-xs text-slate-500">
                        {new Date(recognition.date).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      
                      {recognition.projectId && (
                        <div className="mt-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          Proyecto específico
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </section>
          ))}
        </div>
      )}
      
      {/* Stats summary */}
      {recognitions.length > 0 && (
        <div className="mt-12 glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Estadísticas del Cofre
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-amber-600">
                {recognitions.length}
              </div>
              <div className="text-sm text-slate-600">Total</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {recognitions.filter(r => r.scope === 'global').length}
              </div>
              <div className="text-sm text-slate-600">Globales</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-green-600">
                {recognitions.filter(r => r.scope === 'project').length}
              </div>
              <div className="text-sm text-slate-600">Proyectos</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {new Set(recognitions.map(r => r.date.split('T')[0])).size}
              </div>
              <div className="text-sm text-slate-600">Días activos</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}