import React from 'react';
import { DailyTask } from '@/types';
import { getTaskAnalysis, calculateTaskWeight } from '@/lib/progressCalculation';
import { Target, CheckCircle2, Star, Zap, Hash, Scale } from 'lucide-react';

interface TaskWeightAnalysisProps {
  tasks: DailyTask[];
  projectId?: string;
  className?: string;
}

export default function TaskWeightAnalysis({ 
  tasks, 
  projectId,
  className = '' 
}: TaskWeightAnalysisProps) {
  const filteredTasks = projectId 
    ? tasks.filter(task => task.projectId === projectId)
    : tasks;

  const taskAnalyses = filteredTasks.map(task => {
    const analysis = getTaskAnalysis(task);
    return { task, ...analysis };
  });

  const totalWeight = taskAnalyses.reduce((sum, { weight }) => sum + weight.weight, 0);
  const completedWeight = taskAnalyses
    .filter(({ completed }) => completed)
    .reduce((sum, { weight }) => sum + weight.weight, 0);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'boolean': return CheckCircle2;
      case 'numeric': return Target;
      case 'subjective': return Star;
      default: return Hash;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'boolean': return 'text-blue-600 bg-blue-100';
      case 'numeric': return 'text-green-600 bg-green-100';
      case 'subjective': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getWeightColor = (weight: number) => {
    if (weight >= 30) return 'text-red-600 bg-red-100';
    if (weight >= 15) return 'text-orange-600 bg-orange-100';
    if (weight >= 5) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Análisis de Pesos de Tareas</h3>
            <p className="text-sm text-gray-600">
              Sistema dinámico de ponderación por complejidad
            </p>
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{filteredTasks.length}</div>
            <div className="text-xs text-gray-600">Tareas Totales</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{totalWeight}</div>
            <div className="text-xs text-gray-600">Peso Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {totalWeight > 0 ? ((completedWeight / totalWeight) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-xs text-gray-600">Progreso Ponderado</div>
          </div>
        </div>
      </div>

      {/* Lista de Tareas con Análisis */}
      <div className="max-h-96 overflow-y-auto">
        {taskAnalyses.map(({ task, weight, progress, completed, analysis }) => {
          const TypeIcon = getTypeIcon(task.type);
          
          return (
            <div key={task.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                {/* Icono de tipo */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeColor(task.type)}`}>
                  <TypeIcon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  {/* Título y estado */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className={`font-medium text-sm leading-tight ${
                      completed ? 'text-gray-500 line-through' : 'text-gray-900'
                    }`}>
                      {task.title}
                    </h4>
                    
                    {/* Badge de peso */}
                    <div className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${getWeightColor(weight.weight)}`}>
                      <Zap className="w-3 h-3" />
                      {weight.weight}
                    </div>
                  </div>

                  {/* Detalles del análisis */}
                  <div className="space-y-1">
                    <div className="text-xs text-gray-600">
                      {analysis}
                    </div>
                    
                    {/* Progreso visual */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            completed ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${progress * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600 min-w-[3rem]">
                        {(progress * 100).toFixed(0)}%
                      </span>
                    </div>

                    {/* Detalles específicos por tipo */}
                    {task.type === 'numeric' && (
                      <div className="text-xs text-gray-500">
                        {task.current || 0} / {task.target || 1} {task.unit || 'unidades'}
                      </div>
                    )}
                    
                    {task.type === 'subjective' && (
                      <div className="text-xs text-gray-500">
                        Evaluación: {((task.score0to1 || 0) * 100).toFixed(0)}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <Scale className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No hay tareas para analizar</p>
        </div>
      )}
    </div>
  );
}