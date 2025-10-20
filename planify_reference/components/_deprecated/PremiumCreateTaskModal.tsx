'use client';

import React, { useState, useEffect } from 'react';
import { Task } from '@/types';

interface PremiumTaskData {
  title: string;
  description?: string;
  type: 'numeric' | 'subjective';
  target?: number;
  unit?: string;
  priority?: 'baja' | 'media' | 'alta';
  category?: string;
  dueDate?: string;
  estimatedTime?: string;
  tags?: string[];
  reminder?: string | null;
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly';
  done?: boolean;
}

interface PremiumCreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (taskData: PremiumTaskData) => void;
}

const PremiumCreateTaskModal: React.FC<PremiumCreateTaskModalProps> = ({
  isOpen,
  onClose,
  onCreateTask
}) => {
  const [step, setStep] = useState<'basic' | 'details' | 'schedule'>('basic');
  const [taskData, setTaskData] = useState<PremiumTaskData>({
    title: '',
    description: '',
    type: 'subjective',
    done: false,
    priority: 'media',
    category: 'personal',
    dueDate: '',
    estimatedTime: '',
    tags: [],
    reminder: null,
    recurring: 'none'
  });
  const [currentTag, setCurrentTag] = useState('');

  // Cerrar modal con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const resetForm = () => {
    setStep('basic');
    setTaskData({
      title: '',
      description: '',
      type: 'subjective',
      done: false,
      priority: 'media',
      category: 'personal',
      dueDate: '',
      estimatedTime: '',
      tags: [],
      reminder: null,
      recurring: 'none'
    });
    setCurrentTag('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleNext = () => {
    if (step === 'basic') setStep('details');
    else if (step === 'details') setStep('schedule');
  };

  const handleBack = () => {
    if (step === 'details') setStep('basic');
    else if (step === 'schedule') setStep('details');
  };

  const handleCreate = () => {
    if (taskData.title?.trim()) {
      onCreateTask({
        ...taskData,
        title: taskData.title.trim()
      });
      handleClose();
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !taskData.tags?.includes(currentTag.trim())) {
      setTaskData({
        ...taskData,
        tags: [...(taskData.tags || []), currentTag.trim()]
      });
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTaskData({
      ...taskData,
      tags: taskData.tags?.filter(tag => tag !== tagToRemove) || []
    });
  };

  const priorities = [
    { value: 'baja', label: 'Baja', color: 'bg-blue-500', icon: '🟢' },
    { value: 'media', label: 'Media', color: 'bg-yellow-500', icon: '🟡' },
    { value: 'alta', label: 'Alta', color: 'bg-orange-500', icon: '🟠' }
  ];

  const categories = [
    { value: 'work', label: 'Trabajo', icon: '💼', color: 'from-blue-500 to-blue-600' },
    { value: 'personal', label: 'Personal', icon: '👤', color: 'from-green-500 to-green-600' },
    { value: 'health', label: 'Salud', icon: '🏃', color: 'from-red-500 to-red-600' },
    { value: 'education', label: 'Educación', icon: '📚', color: 'from-purple-500 to-purple-600' },
    { value: 'finance', label: 'Finanzas', icon: '💰', color: 'from-yellow-500 to-yellow-600' },
    { value: 'shopping', label: 'Compras', icon: '🛒', color: 'from-pink-500 to-pink-600' },
    { value: 'social', label: 'Social', icon: '👥', color: 'from-indigo-500 to-indigo-600' },
    { value: 'creative', label: 'Creativo', icon: '🎨', color: 'from-orange-500 to-orange-600' }
  ];

  const estimatedTimes = [
    '15 min', '30 min', '45 min', '1 hora', '2 horas', '3 horas', '4+ horas'
  ];

  const recurringOptions = [
    { value: 'none', label: 'No repetir' },
    { value: 'daily', label: 'Diario' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensual' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Nueva Tarea</h2>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${step === 'basic' ? 'bg-purple-400' : 'bg-white/30'}`} />
                <div className={`w-2 h-2 rounded-full ${step === 'details' ? 'bg-purple-400' : 'bg-white/30'}`} />
                <div className={`w-2 h-2 rounded-full ${step === 'schedule' ? 'bg-purple-400' : 'bg-white/30'}`} />
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
            >
              <span className="text-white text-xl">×</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {step === 'basic' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Título de la tarea *
                </label>
                <input
                  type="text"
                  value={taskData.title || ''}
                  onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                  placeholder="¿Qué necesitas hacer?"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:bg-white/20 transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Descripción
                </label>
                <textarea
                  value={taskData.description || ''}
                  onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                  placeholder="Detalles adicionales..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:bg-white/20 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Prioridad
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {priorities.map((priority) => (
                    <button
                      key={priority.value}
                      onClick={() => setTaskData({ ...taskData, priority: priority.value as any })}
                      className={`p-3 rounded-xl border transition-all ${
                        taskData.priority === priority.value
                          ? 'border-purple-400 bg-purple-500/20'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{priority.icon}</span>
                        <span className="text-white font-medium">{priority.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Categoría
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => setTaskData({ ...taskData, category: category.value as any })}
                      className={`p-3 rounded-xl border transition-all ${
                        taskData.category === category.value
                          ? 'border-purple-400 bg-purple-500/20'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center text-sm`}>
                          {category.icon}
                        </div>
                        <span className="text-white font-medium text-sm">{category.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Tiempo estimado
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {estimatedTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => setTaskData({ ...taskData, estimatedTime: time })}
                      className={`p-3 rounded-xl border transition-all text-sm ${
                        taskData.estimatedTime === time
                          ? 'border-purple-400 bg-purple-500/20 text-white'
                          : 'border-white/20 bg-white/5 hover:bg-white/10 text-white/80'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Etiquetas
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Agregar etiqueta..."
                    className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 bg-purple-500/20 border border-purple-400/50 rounded-lg text-purple-300 hover:bg-purple-500/30 transition-colors"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {taskData.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-white"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-white/60 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'schedule' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Fecha límite
                </label>
                <input
                  type="date"
                  value={taskData.dueDate || ''}
                  onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400 focus:bg-white/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Recordatorio
                </label>
                <input
                  type="datetime-local"
                  value={taskData.reminder || ''}
                  onChange={(e) => setTaskData({ ...taskData, reminder: e.target.value || null })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400 focus:bg-white/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Repetir
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {recurringOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTaskData({ ...taskData, recurring: option.value as any })}
                      className={`p-3 rounded-xl border transition-all ${
                        taskData.recurring === option.value
                          ? 'border-purple-400 bg-purple-500/20'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-white font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h4 className="text-white font-medium mb-2">Resumen</h4>
                <div className="space-y-2 text-sm text-white/70">
                  <p><strong>Título:</strong> {taskData.title}</p>
                  <p><strong>Prioridad:</strong> {priorities.find(p => p.value === taskData.priority)?.label}</p>
                  <p><strong>Categoría:</strong> {categories.find(c => c.value === taskData.category)?.label}</p>
                  {taskData.estimatedTime && <p><strong>Tiempo:</strong> {taskData.estimatedTime}</p>}
                  {taskData.dueDate && <p><strong>Fecha límite:</strong> {new Date(taskData.dueDate).toLocaleDateString()}</p>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <div className="flex gap-3">
            {step !== 'basic' && (
              <button
                onClick={handleBack}
                className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-colors"
              >
                Atrás
              </button>
            )}
            
            {step !== 'schedule' ? (
              <button
                onClick={handleNext}
                disabled={!taskData.title?.trim()}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 disabled:opacity-50 rounded-xl text-white font-medium transition-all shadow-lg"
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={!taskData.title?.trim()}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-500 disabled:to-gray-600 disabled:opacity-50 rounded-xl text-white font-medium transition-all shadow-lg"
              >
                Crear Tarea
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumCreateTaskModal;