'use client';

import React, { useState } from 'react';
import { X, HelpCircle, Users, FolderPlus, Plus, Target, BarChart, Award } from 'lucide-react';

interface QuickHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HelpTip {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  shortcut?: string;
  action: string;
}

const helpTips: HelpTip[] = [
  {
    icon: FolderPlus,
    title: 'Crear Carpetas Colaborativas',
    description: 'Organiza proyectos por categorías y compártelos con tu equipo. Las carpetas pueden tener múltiples colaboradores con diferentes roles.',
    action: 'Toca el botón + en la sección de carpetas'
  },
  {
    icon: Plus,
    title: 'Agregar Proyectos',
    description: 'Cada proyecto puede tener módulos y tareas. Los proyectos heredan los permisos de su carpeta padre automáticamente.',
    action: 'Toca + dentro de una carpeta o crea uno independiente'
  },
  {
    icon: Users,
    title: 'Sistema de Colaboración',
    description: 'Invita colaboradores, asigna roles (viewer, editor, admin) y gestiona equipos. Los cambios se sincronizan en tiempo real.',
    action: 'Toca el botón de equipo en cualquier carpeta o proyecto'
  },
  {
    icon: Target,
    title: 'Tareas y Progreso',
    description: 'Tres tipos de tareas: booleanas (sí/no), numéricas (con objetivo) y subjetivas (escala 0-1). El progreso se calcula automáticamente.',
    action: 'Marca tareas completadas o ajusta valores'
  },
  {
    icon: BarChart,
    title: 'Estadísticas en Vivo',
    description: 'Las estadísticas se actualizan automáticamente basándose en tu actividad. Incluye progreso global, productividad y rachas.',
    action: 'Se actualiza automáticamente con cada acción'
  },
  {
    icon: Award,
    title: 'Sistema de Logros',
    description: 'Desbloquea logros completando tareas, alcanzando hitos y manteniendo rachas. Los logros motivan el progreso constante.',
    action: 'Se otorgan automáticamente por actividad'
  }
];

export default function QuickHelp({ isOpen, onClose }: QuickHelpProps) {
  const [selectedTip, setSelectedTip] = useState<number>(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
      <div className="w-full h-full bg-gradient-to-br from-slate-800/95 to-purple-900/95 backdrop-blur-xl border border-white/20 shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-xl border-b border-white/10 p-6 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Guía Rápida de Planify
                </h2>
                <p className="text-white/70">
                  Aprende a usar todas las funcionalidades de colaboración
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            
            {/* Tips List */}
            <div className="lg:col-span-1">
              <h3 className="text-white font-semibold text-lg mb-4">Funcionalidades</h3>
              <div className="space-y-2">
                {helpTips.map((tip, index) => {
                  const Icon = tip.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedTip(index)}
                      className={`
                        w-full text-left p-4 rounded-xl border transition-all duration-200
                        ${selectedTip === index 
                          ? 'bg-indigo-500/20 border-indigo-500/30' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-8 h-8 rounded-lg flex items-center justify-center
                          ${selectedTip === index 
                            ? 'bg-indigo-500/30' 
                            : 'bg-white/10'
                          }
                        `}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white font-medium text-sm">
                          {tip.title}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {/* Quick Actions */}
              <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <h4 className="text-white font-medium mb-3">Accesos Rápidos</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between text-white/70">
                    <span>Panel de pruebas</span>
                    <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">Ctrl+Shift+T</kbd>
                  </div>
                  <div className="flex items-center justify-between text-white/70">
                    <span>Crear carpeta rápida</span>
                    <span className="text-xs">Botón + en carpetas</span>
                  </div>
                  <div className="flex items-center justify-between text-white/70">
                    <span>Compartir elemento</span>
                    <span className="text-xs">Botón de equipo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Tip Detail */}
            <div className="lg:col-span-2">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center">
                    {React.createElement(helpTips[selectedTip].icon, { className: "w-6 h-6 text-white" })}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {helpTips[selectedTip].title}
                    </h3>
                    <p className="text-indigo-300 text-sm">
                      Funcionalidad principal de colaboración
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-white font-semibold mb-3">¿Qué hace?</h4>
                    <p className="text-white/80 leading-relaxed">
                      {helpTips[selectedTip].description}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-3">¿Cómo usarlo?</h4>
                    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4">
                      <p className="text-green-300 font-medium">
                        {helpTips[selectedTip].action}
                      </p>
                    </div>
                  </div>

                  {/* Examples based on tip */}
                  <div>
                    <h4 className="text-white font-semibold mb-3">Ejemplo práctico</h4>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      {selectedTip === 0 && (
                        <div className="text-white/80">
                          <p className="mb-2"><strong>Escenario:</strong> Trabajas en un proyecto de marketing con tu equipo.</p>
                          <p>1. Crea una carpeta &ldquo;Marketing Q1 2024&rdquo;</p>
                          <p>2. Agrega colaboradores: Ana (admin), Carlos (editor), María (viewer)</p>
                          <p>3. Los proyectos que agregues heredarán estos permisos automáticamente</p>
                        </div>
                      )}
                      {selectedTip === 1 && (
                        <div className="text-white/80">
                          <p className="mb-2"><strong>Escenario:</strong> Necesitas organizar el desarrollo de una app.</p>
                          <p>1. Crea proyecto &ldquo;App Mobile&rdquo; dentro de la carpeta &ldquo;Desarrollo&rdquo;</p>
                          <p>2. Agrega módulos: &ldquo;Backend&rdquo;, &ldquo;Frontend&rdquo;, &ldquo;Testing&rdquo;</p>
                          <p>3. Cada módulo puede tener tareas específicas con diferentes tipos</p>
                        </div>
                      )}
                      {selectedTip === 2 && (
                        <div className="text-white/80">
                          <p className="mb-2"><strong>Escenario:</strong> Tu equipo necesita acceso a los proyectos.</p>
                          <p>1. Toca el botón de equipo en cualquier elemento</p>
                          <p>2. Invita por email o selecciona usuarios existentes</p>
                          <p>3. Asigna roles: viewer (solo ver), editor (editar), admin (gestionar)</p>
                        </div>
                      )}
                      {selectedTip === 3 && (
                        <div className="text-white/80">
                          <p className="mb-2"><strong>Tipos de tareas disponibles:</strong></p>
                          <p>• <strong>Booleana:</strong> ✅ Llamar al cliente</p>
                          <p>• <strong>Numérica:</strong> 📊 Escribir 500 palabras (250/500)</p>
                          <p>• <strong>Subjetiva:</strong> ⭐ Calidad del diseño (8.5/10)</p>
                        </div>
                      )}
                      {selectedTip === 4 && (
                        <div className="text-white/80">
                          <p className="mb-2"><strong>Métricas automáticas:</strong></p>
                          <p>• Progreso global: Promedio de todos los proyectos</p>
                          <p>• Productividad: Basada en actividad y completación</p>
                          <p>• Rachas: Días consecutivos con progreso</p>
                        </div>
                      )}
                      {selectedTip === 5 && (
                        <div className="text-white/80">
                          <p className="mb-2"><strong>Logros que puedes desbloquear:</strong></p>
                          <p>• 🎯 Primera tarea del día completada</p>
                          <p>• 🚀 Proyecto alcanza 25%, 50%, 75%, 100%</p>
                          <p>• 🔥 Rachas de 7, 14, 30 días</p>
                          <p>• 📁 Primera carpeta colaborativa creada</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}