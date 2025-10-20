'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, TrendingUp, Target, Zap, Play, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  const router = useRouter();
  const [animationStep, setAnimationStep] = useState(0);
  const [progressValue, setProgressValue] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set isClient to true only on client side to avoid hydration mismatch
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Animación escalonada
    const timer = setTimeout(() => {
      if (animationStep < 4) {
        setAnimationStep(animationStep + 1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [animationStep]);

  useEffect(() => {
    // Animación del cumplimiento de meta
    const progressTimer = setInterval(() => {
      setProgressValue((prev) => {
        if (prev >= 100) return 0;
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(progressTimer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-radial from-cyan-500/15 to-transparent rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-gradient-radial from-emerald-500/10 to-transparent rounded-full blur-xl animate-pulse delay-2000" />
      </div>

      {/* Particles Effect */}
      {isClient && (
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${(i * 23.7) % 100}%`,
                top: `${(i * 37.3) % 100}%`,
                animationDelay: `${(i * 0.3) % 3}s`,
                animationDuration: `${2 + (i * 0.4) % 4}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        
        {/* Header Premium Badge */}
        <div className={`
          mb-8 transform transition-all duration-1000 ease-out
          ${animationStep >= 0 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
        `}>
          <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-white/20 backdrop-blur-lg">
            <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
            <span className="text-white/90 text-xs sm:text-sm font-medium text-center">
              🏆 APP #1 EN PRODUCTIVIDAD
            </span>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Main Title */}
        <div className={`
          text-center mb-6 transform transition-all duration-1000 ease-out delay-300
          ${animationStep >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
        `}>
          <div className="relative">
            {/* Glow Effect Background */}
            <div className="absolute inset-0 blur-3xl opacity-50">
              <div className="text-4xl sm:text-6xl md:text-8xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                PLANIFY
              </div>
            </div>
            
            {/* Main Logo */}
            <h1 className="relative text-4xl sm:text-6xl md:text-8xl font-black leading-none tracking-wider">
              <span className="bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
                PLAN
              </span>
              <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-2xl animate-pulse">
                I
              </span>
              <span className="bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
                FY
              </span>
            </h1>
            
            {/* Subtitle */}
            <div className="mt-2 text-center">
              <span className="text-sm sm:text-base font-light text-white/70 tracking-[0.3em] uppercase">
                1% Mejor Cada Día
              </span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-purple-400" />
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse delay-200" />
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse delay-400" />
            </div>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-cyan-400" />
          </div>
        </div>

        {/* Tagline Principal */}
        <div className={`
          text-center mb-4 transform transition-all duration-1000 ease-out delay-600
          ${animationStep >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
        `}>
          <p className="text-2xl md:text-3xl font-light text-white/90 leading-relaxed max-w-4xl mx-auto">
            &ldquo;Cuando es <span className="font-semibold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">visible</span> tu progreso es <span className="font-semibold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">fácil</span> llegar del <span className="font-bold text-purple-400">1%</span> al <span className="font-bold text-emerald-400">100%</span>.&rdquo;
          </p>
        </div>

        {/* Subtítulo */}
        <div className={`
          text-center mb-12 transform transition-all duration-1000 ease-out delay-900
          ${animationStep >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
        `}>
          <p className="text-lg md:text-xl text-white/70 font-light max-w-2xl mx-auto">
            Tu progreso nunca se borra. <span className="text-white/90 font-medium">Siempre avanza contigo.</span>
          </p>
        </div>

        {/* Demo Progress Circle */}
        <div className={`
          mb-12 transform transition-all duration-1000 ease-out delay-1200
          ${animationStep >= 4 ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}
        `}>
          <div className="relative">
            <svg width="200" height="200" className="transform -rotate-90">
              <defs>
                <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                <filter id="heroGlow">
                  <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#8b5cf6" floodOpacity="0.4"/>
                </filter>
              </defs>
              
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="8"
              />
              
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="url(#heroGradient)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray="565.48"
                strokeDashoffset={565.48 - (progressValue / 100) * 565.48}
                filter="url(#heroGlow)"
                className="transition-all duration-300 ease-out"
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold text-white mb-1">
                {Math.round(progressValue)}%
              </div>
              
              {/* Texto que cambia según el progreso */}
              {progressValue < 100 ? (
                <div className="text-xs text-white/60 font-medium text-center leading-tight">
                  <div>ALCANZA</div>
                  <div>TUS METAS</div>
                </div>
              ) : (
                <div className="text-xs text-emerald-300 font-bold text-center leading-tight animate-pulse">
                  <div>¡META</div>
                  <div>COMPLETADA!</div>
                </div>
              )}
              
              {/* Animación de completado mejorada */}
              {progressValue >= 100 && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  {/* Explosión de fondo */}
                  <div className="animate-ping absolute inline-flex h-24 w-24 rounded-full bg-emerald-400 opacity-60 animation-duration-1000"></div>
                  <div className="animate-pulse absolute inline-flex h-20 w-20 rounded-full bg-emerald-500 opacity-80 animation-duration-1500"></div>
                  
                  {/* Círculo principal con pausa */}
                  <div className="relative inline-flex rounded-full h-16 w-16 bg-gradient-to-r from-emerald-500 to-emerald-600 items-center justify-center shadow-2xl border-2 border-emerald-300 animate-bounce">
                    <svg className="w-10 h-10 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  
                  {/* Partículas de celebración */}
                  <div className="absolute top-2 left-2 w-2 h-2 bg-yellow-400 rounded-full animate-ping animation-delay-300"></div>
                  <div className="absolute top-4 right-2 w-1 h-1 bg-cyan-400 rounded-full animate-ping animation-delay-500"></div>
                  <div className="absolute bottom-3 left-4 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping animation-delay-700"></div>
                  <div className="absolute bottom-2 right-3 w-1 h-1 bg-pink-400 rounded-full animate-ping animation-delay-900"></div>
                </div>
              )}
            </div>

            {/* Floating Icons */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center animate-bounce">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center animate-bounce delay-300">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div className="absolute top-1/2 -right-8 w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center animate-pulse">
              <Zap className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>

        {/* Cinematic CTA Buttons */}
        <div className={`
          flex flex-col sm:flex-row gap-4 justify-center items-center transform transition-all duration-1000 ease-out delay-1500
          ${animationStep >= 4 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
        `}>
          <button
            onClick={onGetStarted}
            className="group relative px-8 py-4 bg-gradient-to-r from-purple-600/90 to-cyan-600/90 rounded-xl font-bold text-white text-base shadow-xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden backdrop-blur-md border border-white/10"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/50 to-cyan-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-3">
              <Play className="w-4 h-4 fill-white" />
              <span className="font-semibold tracking-wide">COMENZAR MI 1% DIARIO</span>
            </div>
          </button>
          

        </div>

        {/* Features Preview */}
        <div className={`
          mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto transform transition-all duration-1000 ease-out delay-1800
          ${animationStep >= 4 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
        `}>
          {[
            {
              icon: Target,
              title: "Progreso Visual",
              description: "Círculos animados que muestran tu avance real"
            },
            {
              icon: TrendingUp,
              title: "Métricas Avanzadas",
              description: "Estadísticas detalladas de tu crecimiento"
            },
            {
              icon: Sparkles,
              title: "Personalizable",
              description: "Colores e iconos únicos para cada proyecto"
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="group p-6 glass-card rounded-2xl hover:scale-105 transition-all duration-300 border border-white/10 hover:border-white/20"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}