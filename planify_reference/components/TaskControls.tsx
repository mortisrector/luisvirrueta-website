'use client';

import { useState } from 'react';
import { Minus, Plus, Star } from 'lucide-react';

interface TaskControlsProps {
  taskType: 'boolean' | 'numeric' | 'subjective';
  taskId: string;
  completed?: boolean;
  current?: number;
  target?: number;
  score0to1?: number;
  projectColorScheme?: string;
  onToggle?: (taskId: string, value?: number) => void;
  onUpdate?: (taskId: string, value: number) => void;
  disabled?: boolean;
}

export default function TaskControls({
  taskType,
  taskId,
  completed = false,
  current = 0,
  target = 1,
  score0to1 = 0,
  projectColorScheme = 'electric-blue',
  onToggle,
  onUpdate,
  disabled = false
}: TaskControlsProps) {
  const [localNumericValue, setLocalNumericValue] = useState(current);
  const [localSubjectiveValue, setLocalSubjectiveValue] = useState(Math.round(score0to1 * 10));

  const getProjectGradient = () => {
    const gradientMappings: Record<string, string> = {
      'electric-blue': 'from-blue-400 to-cyan-500',
      'electric-green': 'from-emerald-400 to-green-500',
      'electric-purple': 'from-purple-400 to-pink-500',
      'cosmic': 'from-indigo-400 to-purple-500',
      'sunset': 'from-orange-400 to-pink-500',
      'forest': 'from-green-400 to-emerald-500',
      'ocean': 'from-cyan-400 to-teal-500',
      'fire': 'from-red-400 to-orange-500'
    };
    return gradientMappings[projectColorScheme] || 'from-cyan-400 to-blue-500';
  };

  const getProjectAccents = () => {
    const accentMappings: Record<string, { text: string; light: string }> = {
      'electric-blue': { text: 'text-blue-700', light: 'bg-blue-50' },
      'electric-green': { text: 'text-emerald-700', light: 'bg-emerald-50' },
      'electric-purple': { text: 'text-purple-700', light: 'bg-purple-50' },
      'cosmic': { text: 'text-indigo-700', light: 'bg-indigo-50' },
      'sunset': { text: 'text-orange-700', light: 'bg-orange-50' },
      'forest': { text: 'text-green-700', light: 'bg-green-50' },
      'ocean': { text: 'text-cyan-700', light: 'bg-cyan-50' },
      'fire': { text: 'text-red-700', light: 'bg-red-50' }
    };
    return accentMappings[projectColorScheme] || { text: 'text-cyan-700', light: 'bg-cyan-50' };
  };

  const projectGradient = getProjectGradient();
  const projectAccents = getProjectAccents();

  const handleNumericChange = (newValue: number) => {
    const clampedValue = Math.max(0, Math.min(newValue, target * 2)); // Permitir hasta el doble del objetivo
    setLocalNumericValue(clampedValue);
    if (onUpdate) {
      onUpdate(taskId, clampedValue);
    }
  };

  const handleSubjectiveChange = (newValue: number) => {
    setLocalSubjectiveValue(newValue);
    if (onUpdate) {
      onUpdate(taskId, newValue / 10); // Convertir a 0-1
    }
  };

  const isNumericCompleted = localNumericValue >= target;
  const isSubjectiveCompleted = localSubjectiveValue >= 8; // 80% o más

  if (taskType === 'boolean') {
    return (
      <button
        onClick={() => {
          if (onToggle && !disabled) {
            onToggle(taskId, completed ? 0 : 1);
          }
        }}
        disabled={disabled}
        className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl border-2 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl active:scale-95 ${
          completed
            ? `bg-gradient-to-br ${projectGradient} border-transparent shadow-lg`
            : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {completed && (
          <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-white flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </div>
        )}
      </button>
    );
  }

  if (taskType === 'numeric') {
    const progress = Math.min((localNumericValue / target) * 100, 100);
    
    return (
      <div className="space-y-2 md:space-y-3">
        {/* Progress Circle */}
        <div className="relative w-12 h-12 md:w-16 md:h-16 mx-auto">
          <svg className="w-12 h-12 md:w-16 md:h-16 transform -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="26"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-gray-200"
            />
            <circle
              cx="32"
              cy="32"
              r="26"
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 26}`}
              strokeDashoffset={`${2 * Math.PI * 26 * (1 - progress / 100)}`}
              className={`transition-all duration-500 ${
                isNumericCompleted ? 'stroke-green-500' : 'stroke-blue-500'
              }`}
              style={{
                background: `conic-gradient(${projectGradient}, transparent)`
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-xs md:text-sm font-bold ${isNumericCompleted ? 'text-green-600' : projectAccents.text}`}>
                {localNumericValue}
              </div>
              <div className="text-[10px] md:text-xs text-gray-500">de {target}</div>
            </div>
          </div>
        </div>

        {/* Premium Controls with Direct Input */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3">
          {/* Increment/Decrement Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNumericChange(localNumericValue - 1)}
              disabled={disabled || localNumericValue <= 0}
              className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br ${projectGradient} text-white flex items-center justify-center shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Minus className="w-3 h-3 md:w-4 md:h-4" />
            </button>
            
            <button
              onClick={() => handleNumericChange(localNumericValue + 1)}
              disabled={disabled}
              className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br ${projectGradient} text-white flex items-center justify-center shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Plus className="w-3 h-3 md:w-4 md:h-4" />
            </button>
          </div>
          
          {/* Direct Input Field */}
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={localNumericValue}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                handleNumericChange(value);
              }}
              min="0"
              max={target * 2}
              disabled={disabled}
              className={`w-12 md:w-16 h-6 md:h-8 text-center text-xs md:text-sm font-semibold border-2 rounded-lg ${
                isNumericCompleted 
                  ? 'border-green-300 bg-green-50 text-green-700'
                  : 'border-gray-300 bg-white text-gray-700'
              } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="0"
            />
            <span className="text-[10px] md:text-xs text-gray-500">/{target}</span>
          </div>
        </div>
        
        {/* Progress Percentage */}
        <div className={`text-center px-2 py-1 rounded-lg text-xs md:text-sm font-medium ${
          isNumericCompleted 
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {Math.round(progress)}%
        </div>
      </div>
    );
  }

  if (taskType === 'subjective') {
    return (
      <div className="space-y-2 md:space-y-4">
        {/* Stars Display - Smaller for mobile */}
        <div className="flex items-center justify-center gap-0.5 md:gap-1">
          {Array.from({ length: 10 }, (_, i) => (
            <button
              key={i}
              onClick={() => {
                if (!disabled) {
                  handleSubjectiveChange(i + 1);
                }
              }}
              disabled={disabled}
              className={`w-4 h-4 md:w-6 md:h-6 transition-all duration-200 ${
                disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'
              }`}
            >
              <Star
                className={`w-full h-full transition-all duration-200 ${
                  i < localSubjectiveValue
                    ? isSubjectiveCompleted
                      ? 'text-green-500 fill-green-500'
                      : 'text-yellow-500 fill-yellow-500'
                    : 'text-gray-300 hover:text-gray-400'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Score Display */}
        <div className="text-center">
          <div className={`text-sm md:text-lg font-bold ${isSubjectiveCompleted ? 'text-green-600' : projectAccents.text}`}>
            {localSubjectiveValue}/10
          </div>
          <div className="text-[10px] md:text-xs text-gray-500">
            {localSubjectiveValue <= 3 ? 'Bajo' : 
             localSubjectiveValue <= 6 ? 'Medio' : 
             localSubjectiveValue <= 8 ? 'Bueno' : 'Excelente'}
          </div>
        </div>

        {/* Direct Input for Premium Control */}
        <div className="flex items-center justify-center gap-2">
          <input
            type="range"
            min="0"
            max="10"
            value={localSubjectiveValue}
            onChange={(e) => {
              if (!disabled) {
                handleSubjectiveChange(parseInt(e.target.value));
              }
            }}
            disabled={disabled}
            className={`w-16 md:w-20 h-1 md:h-2 rounded-lg appearance-none cursor-pointer ${
              isSubjectiveCompleted 
                ? 'bg-green-200'
                : 'bg-yellow-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            style={{
              background: `linear-gradient(to right, ${
                isSubjectiveCompleted ? '#10b981' : '#f59e0b'
              } 0%, ${
                isSubjectiveCompleted ? '#10b981' : '#f59e0b'
              } ${localSubjectiveValue * 10}%, #e5e7eb ${localSubjectiveValue * 10}%, #e5e7eb 100%)`
            }}
          />
          <input
            type="number"
            value={localSubjectiveValue}
            onChange={(e) => {
              const value = Math.max(0, Math.min(10, parseInt(e.target.value) || 0));
              if (!disabled) {
                handleSubjectiveChange(value);
              }
            }}
            min="0"
            max="10"
            disabled={disabled}
            className={`w-8 md:w-12 h-5 md:h-8 text-center text-xs md:text-sm font-semibold border-2 rounded-lg ${
              isSubjectiveCompleted 
                ? 'border-green-300 bg-green-50 text-green-700'
                : 'border-yellow-300 bg-yellow-50 text-yellow-700'
            } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
          />
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2">
          <div
            className={`h-1.5 md:h-2 rounded-full transition-all duration-500 ${
              isSubjectiveCompleted
                ? 'bg-gradient-to-r from-green-400 to-green-600'
                : `bg-gradient-to-r ${projectGradient}`
            }`}
            style={{ width: `${localSubjectiveValue * 10}%` }}
          ></div>
        </div>
      </div>
    );
  }

  return null;
}