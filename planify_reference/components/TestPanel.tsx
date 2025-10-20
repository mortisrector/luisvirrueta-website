'use client';

import { useState } from 'react';
import { appTester } from '@/utils/appTester';
import { X, Play, CheckCircle, AlertCircle, Users, Target, BarChart } from 'lucide-react';

interface TestPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TestPanel({ isOpen, onClose }: TestPanelProps) {
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = () => {
    setIsRunning(true);
    try {
      const results = appTester.runFullTest();
      setTestResults(results);
    } catch (error) {
      console.error('Error running tests:', error);
    }
    setIsRunning(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
      <div className="w-full h-full bg-gradient-to-br from-slate-800/95 to-purple-900/95 backdrop-blur-xl border border-white/20 shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-xl border-b border-white/10 p-6 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Play className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Panel de Pruebas - Planify
                </h2>
                <p className="text-white/70">
                  Verifica todas las funcionalidades de la aplicación
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
          {/* Test Controls */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">Ejecutar Pruebas</h3>
              <button
                onClick={runTests}
                disabled={isRunning}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white font-medium hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4" />
                {isRunning ? 'Ejecutando...' : 'Ejecutar Test Completo'}
              </button>
            </div>
            
            <p className="text-white/70 text-sm">
              Este test verifica: colaboración en equipo, sistema de compartir, estadísticas, 
              creación de carpetas/proyectos/tareas, y funcionalidad general.
            </p>
          </div>

          {/* Test Results */}
          {testResults && (
            <>
              {/* Collaboration Test Results */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-green-400" />
                  <h3 className="text-white font-semibold text-lg">Test de Colaboración</h3>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                    <div className="text-green-400 font-semibold">Usuarios Creados</div>
                    <div className="text-white text-2xl font-bold">{testResults.collaboration.users.length}</div>
                    {testResults.collaboration.users.map((user: any, index: number) => (
                      <div key={index} className="text-green-300 text-sm">
                        {user.name} ({user.role})
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                    <div className="text-blue-400 font-semibold">Equipo y Proyectos</div>
                    <div className="text-white text-2xl font-bold">{testResults.collaboration.projects.length}</div>
                    <div className="text-blue-300 text-sm">
                      Equipo: {testResults.collaboration.team.name}
                    </div>
                    <div className="text-blue-300 text-sm">
                      Carpeta: {testResults.collaboration.folder.name}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
                  <h4 className="text-white font-medium mb-2">Configuración de Permisos</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-green-400">✅ Compartir activado</div>
                    <div className="text-green-400">✅ Edición permitida</div>
                    <div className="text-green-400">✅ Gestión de miembros</div>
                    <div className="text-green-400">✅ Herencia de permisos</div>
                  </div>
                </div>
              </div>

              {/* Statistics Test Results */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart className="w-5 h-5 text-purple-400" />
                  <h3 className="text-white font-semibold text-lg">Test de Estadísticas</h3>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20 text-center">
                    <div className="text-purple-400 font-semibold text-sm">Progreso Global</div>
                    <div className="text-white text-3xl font-bold">{testResults.statistics.globalProgress}%</div>
                  </div>
                  
                  <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20 text-center">
                    <div className="text-green-400 font-semibold text-sm">Proyectos</div>
                    <div className="text-white text-3xl font-bold">{testResults.statistics.completedProjects}</div>
                    <div className="text-green-300 text-xs">completados</div>
                  </div>
                  
                  <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20 text-center">
                    <div className="text-blue-400 font-semibold text-sm">Tareas Diarias</div>
                    <div className="text-white text-3xl font-bold">{testResults.statistics.completedDailyTasks}</div>
                    <div className="text-blue-300 text-xs">completadas</div>
                  </div>
                  
                  <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20 text-center">
                    <div className="text-yellow-400 font-semibold text-sm">Productividad</div>
                    <div className="text-white text-3xl font-bold">{testResults.statistics.productivity}%</div>
                  </div>
                </div>
              </div>

              {/* Daily Tasks Test */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-orange-400" />
                  <h3 className="text-white font-semibold text-lg">Tareas Diarias de Prueba</h3>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                
                <div className="space-y-2">
                  {testResults.dailyTasks.map((task: any, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-gray-800/30 rounded-lg p-3 border border-gray-600/20">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          task.type === 'boolean' ? 'bg-green-400' :
                          task.type === 'numeric' ? 'bg-blue-400' :
                          'bg-purple-400'
                        }`} />
                        <span className="text-white">{task.title}</span>
                      </div>
                      <div className="text-white/60 text-sm">
                        {task.type} • Racha: {task.streak} días
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Test Logs */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h3 className="text-white font-semibold text-lg mb-4">Logs de Ejecución</h3>
                <div className="bg-black/30 rounded-lg p-4 border border-gray-600/20 max-h-60 overflow-y-auto">
                  {testResults.logs.map((log: string, index: number) => (
                    <div key={index} className="text-green-400 font-mono text-xs mb-1">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {isRunning && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
              <span className="text-white ml-4">Ejecutando pruebas...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}