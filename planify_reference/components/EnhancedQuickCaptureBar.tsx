'use client';

import { useState } from 'react';
import { Mic, PenTool, Sparkles } from 'lucide-react';

interface EnhancedQuickCaptureBarProps {
  onCapture: (text: string, startVoice?: boolean) => void;
  placeholder?: string;
}

export default function EnhancedQuickCaptureBar({ 
  onCapture, 
  placeholder = "Captura tu próxima gran idea" 
}: EnhancedQuickCaptureBarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onCapture(inputText.trim(), false);
      setInputText('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Si es la primera letra (cambió de vacío a tener contenido), abrir modal inmediatamente
    if (value.length === 1 && inputText.length === 0) {
      setIsActive(true);
      onCapture(value, false);
      setInputText('');
      return;
    }
    
    // Si se borra todo el texto, cerrar modal y regresar a la barra
    if (value.length === 0 && inputText.length > 0) {
      setIsActive(false);
      onCapture('', false); // Enviar señal de cierre
      setInputText('');
      return;
    }
    
    setInputText(value);
  };

  const handleVoiceCapture = () => {
    setIsVoiceActive(true);
    setIsActive(true);
    onCapture('', true);
    
    // Reset voice active state after animation
    setTimeout(() => {
      setIsVoiceActive(false);
      setIsActive(false);
    }, 2000);
  };

  return (
    <div className="relative mb-6 mx-4">
      <form onSubmit={handleSubmit}>
        <div className="relative group">
          {/* Glow externo que gira alrededor como un halo */}
          <div 
            className="absolute -inset-6 rounded-full opacity-60 blur-3xl"
            style={{
              background: 'conic-gradient(from 0deg, transparent 40%, #8b5cf6 50%, transparent 60%)',
              animation: 'cinematicSpin 3s linear infinite'
            }}
          ></div>
          <div 
            className="absolute -inset-4 rounded-full opacity-80 blur-2xl"
            style={{
              background: 'conic-gradient(from 180deg, transparent 30%, #3b82f6 50%, transparent 70%)',
              animation: 'cinematicSpinReverse 2.5s linear infinite'
            }}
          ></div>
          
          {/* Segundo anillo de luz */}
          <div 
            className="absolute -inset-5 rounded-full opacity-40 blur-2xl"
            style={{
              background: 'conic-gradient(from 90deg, transparent 20%, #a855f7 50%, transparent 80%)',
              animation: 'cinematicSpin 4s linear infinite'
            }}
          ></div>
          
          {/* Borde sutil interno */}
          <div 
            className="absolute -inset-[1px] rounded-2xl opacity-60 blur-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.3))',
            }}
          ></div>

          {/* Borde blanco elegante y sutil */}
          <div 
            className="absolute inset-0 rounded-2xl p-[1px]"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.2))',
              boxShadow: `
                0 0 8px rgba(255, 255, 255, 0.2),
                0 0 15px rgba(255, 255, 255, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.3),
                inset 0 -1px 0 rgba(255, 255, 255, 0.1)
              `
            }}
          >
            <div className="w-full h-full bg-slate-950/90 rounded-2xl relative overflow-hidden">
              {/* Luz que gira alrededor del borde */}
              <div 
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 70%, #3b82f6 80%, #8b5cf6 90%, transparent 100%)',
                  animation: 'cinematicSpin 2s linear infinite'
                }}
              ></div>
              <div 
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: 'conic-gradient(from 180deg, transparent 70%, #a855f7 80%, #06b6d4 90%, transparent 100%)',
                  animation: 'cinematicSpinReverse 3s linear infinite'
                }}
              ></div>
            </div>
          </div>
          
          <div 
            className={`
              relative flex items-center z-30 backdrop-blur-xl rounded-2xl px-4 sm:px-6 py-3 sm:py-4 
              transition-all duration-500 ease-out border border-white/20
              ${isHovered 
                ? 'bg-slate-900/80 shadow-2xl shadow-purple-500/30 transform scale-[1.005]' 
                : 'bg-slate-900/75 shadow-xl'
              }
              ${isActive 
                ? 'bg-slate-900/85 shadow-2xl shadow-purple-500/40 transform scale-[1.01]' 
                : ''
              }
            `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Writing icon with subtle animation */}
            <div className="relative mr-3 sm:mr-4 flex-shrink-0">
              <PenTool className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 ${isActive ? 'text-indigo-300' : 'text-slate-400'}`} />
              {isActive && (
                <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-purple-400 animate-pulse" />
              )}
            </div>
            
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder={placeholder}
              className={`
                flex-1 bg-transparent text-white placeholder-slate-500 text-sm sm:text-base font-medium outline-none
                transition-all duration-300 min-w-0
                ${isActive ? 'placeholder-slate-400 text-slate-100' : 'text-slate-200'}
              `}
              onFocus={() => {
                setIsActive(true);
                // Preparar para captura inmediata
              }}
              onBlur={() => setIsActive(false)}
            />
            
            {/* Enhanced voice button - SIEMPRE DENTRO del contenedor */}
            <button
              type="button"
              onClick={handleVoiceCapture}
              className={`
                relative ml-2 sm:ml-4 p-2 sm:p-3 rounded-xl overflow-hidden
                transition-all duration-300 group flex-shrink-0
                hover:scale-105 active:scale-95 border
                ${isVoiceActive 
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/50 scale-110 border-purple-400/50' 
                  : 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 shadow-md border-purple-500/30'
                }
              `}
              style={{
                boxShadow: `
                  0 0 20px rgba(139, 92, 246, 0.5),
                  0 4px 15px rgba(139, 92, 246, 0.3)
                `,
                animation: isVoiceActive ? 'cinematicPulse 1.5s ease-in-out infinite' : 'none'
              }}
              aria-label="Captura de voz"
              disabled={isVoiceActive}
            >
              {/* Ripple effect for voice activation */}
              {isVoiceActive && (
                <div className="absolute inset-0 rounded-xl">
                  <div className="absolute inset-0 bg-white/15 rounded-xl animate-ping"></div>
                  <div className="absolute inset-0 bg-indigo-300/20 rounded-xl animate-pulse"></div>
                </div>
              )}
              
              <Mic 
                className={`
                  relative w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 z-10 text-white
                  ${isVoiceActive ? 'animate-pulse' : ''}
                  group-hover:text-purple-100
                `}
                style={{ 
                  filter: isVoiceActive 
                    ? 'drop-shadow(0 0 6px rgba(255,255,255,0.9))' 
                    : 'drop-shadow(0 0 3px rgba(255,255,255,0.5))'
                }}
              />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}