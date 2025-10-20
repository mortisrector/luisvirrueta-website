'use client';

import { useState, useEffect } from 'react';
import { X, Star, Trophy, Sparkles, Target, CheckCircle } from 'lucide-react';

interface MotivationalCardProps {
  type: 'first-task' | 'project-start' | 'progress-milestone';
  title?: string;
  projectName?: string;
  taskName?: string;
  progress?: number;
  isVisible: boolean;
  onClose: () => void;
}

export default function MotivationalCard({
  type,
  title,
  projectName,
  taskName,
  progress = 0,
  isVisible,
  onClose
}: MotivationalCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      // Auto-close after 4 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 300);
  };

  if (!isVisible && !isAnimating) return null;

  const getCardContent = () => {
    switch (type) {
      case 'first-task':
        return {
          icon: <Sparkles className="w-12 h-12 text-yellow-300" />,
          gradient: 'from-yellow-500 via-orange-500 to-pink-500',
          title: '¡Increíble inicio! ✨',
          message: `Has iniciado tu primera tarea del día`,
          subtitle: taskName ? `"${taskName}"` : 'Sigues construyendo tu rutina perfecta',
          animation: 'animate-bounce'
        };
      
      case 'project-start':
        return {
          icon: <Target className="w-12 h-12 text-blue-300" />,
          gradient: 'from-blue-500 via-purple-500 to-indigo-500',
          title: '🚀 ¡Proyecto en marcha!',
          message: `Has comenzado a trabajar en`,
          subtitle: projectName ? `"${projectName}"` : 'tu nuevo desafío',
          animation: 'animate-pulse'
        };
      
      case 'progress-milestone':
        return {
          icon: progress >= 100 ? <Trophy className="w-12 h-12 text-gold-300" /> : <CheckCircle className="w-12 h-12 text-green-300" />,
          gradient: progress >= 100 
            ? 'from-yellow-400 via-yellow-500 to-orange-500' 
            : 'from-green-500 via-emerald-500 to-teal-500',
          title: progress >= 100 ? '🎉 ¡Proyecto Completado!' : `🎯 ${progress}% Completado`,
          message: progress >= 100 ? '¡Felicitaciones por terminar' : 'Excelente progreso en',
          subtitle: projectName ? `"${projectName}"` : 'tu proyecto',
          animation: progress >= 100 ? 'animate-bounce' : 'animate-pulse'
        };
      
      default:
        return {
          icon: <Star className="w-12 h-12 text-purple-300" />,
          gradient: 'from-purple-500 via-pink-500 to-red-500',
          title: '¡Excelente trabajo!',
          message: 'Sigues avanzando hacia tus metas',
          subtitle: 'Cada paso cuenta',
          animation: 'animate-pulse'
        };
    }
  };

  const content = getCardContent();

  return (
    <div className={`
      fixed inset-0 z-[60] flex items-center justify-center p-4
      transition-all duration-300 ease-out
      ${isAnimating ? 'opacity-100 backdrop-blur-sm bg-black/20' : 'opacity-0 pointer-events-none'}
    `}>
      {/* Card */}
      <div className={`
        relative max-w-sm w-full
        transform transition-all duration-500 ease-out
        ${isAnimating ? 'scale-100 translate-y-0 opacity-100' : 'scale-75 translate-y-8 opacity-0'}
      `}>
        {/* Background with gradient */}
        <div className={`
          absolute inset-0 rounded-3xl bg-gradient-to-br ${content.gradient}
          opacity-90 blur-xl scale-110
        `}></div>
        
        {/* Main card */}
        <div className="
          relative backdrop-blur-xl bg-white/95 border border-white/30
          rounded-3xl shadow-2xl overflow-hidden
          dark:bg-slate-900/95 dark:border-white/10
        ">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="
              absolute top-4 right-4 z-10
              w-8 h-8 bg-white/20 hover:bg-white/30
              rounded-full flex items-center justify-center
              transition-colors duration-200
              backdrop-blur-sm border border-white/20
            "
          >
            <X className="w-4 h-4 text-white" />
          </button>

          {/* Content */}
          <div className="p-8 text-center">
            {/* Icon with animation */}
            <div className={`
              flex justify-center mb-6
              ${content.animation}
            `}>
              <div className={`
                w-20 h-20 rounded-2xl bg-gradient-to-br ${content.gradient}
                flex items-center justify-center
                shadow-lg
              `}>
                {content.icon}
              </div>
            </div>

            {/* Title */}
            <h3 className="
              text-2xl font-bold text-slate-800 mb-3
              dark:text-white
            ">
              {content.title}
            </h3>

            {/* Message */}
            <p className="
              text-slate-600 mb-2 text-lg
              dark:text-slate-300
            ">
              {content.message}
            </p>

            {/* Subtitle */}
            <p className="
              text-slate-800 font-semibold text-xl
              dark:text-white
            ">
              {content.subtitle}
            </p>

            {/* Progress bar for milestone cards */}
            {type === 'progress-milestone' && progress < 100 && (
              <div className="mt-6">
                <div className="
                  w-full h-3 bg-slate-200 rounded-full overflow-hidden
                  dark:bg-slate-700
                ">
                  <div 
                    className={`
                      h-full bg-gradient-to-r ${content.gradient}
                      transition-all duration-1000 ease-out
                      rounded-full
                    `}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-slate-500 mt-2 dark:text-slate-400">
                  {progress}% completado
                </p>
              </div>
            )}

            {/* Motivational quote */}
            <div className="
              mt-6 p-4 bg-gradient-to-r from-white/50 to-white/30
              rounded-2xl border border-white/20
              dark:from-slate-800/50 dark:to-slate-800/30
            ">
              <p className="
                text-sm text-slate-600 italic
                dark:text-slate-300
              ">
                {type === 'first-task' && '"El éxito es la suma de pequeños esfuerzos repetidos día tras día"'}
                {type === 'project-start' && '"Un viaje de mil millas comienza con un solo paso"'}
                {type === 'progress-milestone' && progress >= 100 
                  ? '"Lo que parece imposible se vuelve inevitable con persistencia"' 
                  : '"El progreso es imposible sin cambio"'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}