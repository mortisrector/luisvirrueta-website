'use client';

import { X, Download, Upload, User, Cloud, HardDrive, FileDown } from 'lucide-react';
import { useState, useRef } from 'react';
import { downloadJSONBackup, formatBackupData, extractTimeTrackingData, restoreTimeTrackingData } from '@/utils/backupUtils';

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
  user?: { email: string; name?: string } | null;
  isGuestMode: boolean;
  onCreateBackup: () => Promise<boolean>;
  onRestoreBackup: () => Promise<boolean>;
  // Datos para backup JSON local
  folders?: any[];
  projects?: any[];
  tasks?: any[];
  userId?: string | null; // Nuevo prop para el userId
}

export default function ProfilePanel({ 
  isOpen, 
  onClose, 
  user, 
  isGuestMode,
  onCreateBackup,
  onRestoreBackup,
  folders = [],
  projects = [],
  tasks = [],
  userId = null
}: ProfilePanelProps) {
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);
  const [backupStatus, setBackupStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadLocalBackup = () => {
    try {
      // Extraer datos de time tracking
      const timeTrackingData = userId ? extractTimeTrackingData(userId) : null;
      
      // Crear backup completo incluyendo time tracking
      const backupData = formatBackupData(folders, projects, tasks, timeTrackingData);
      
      downloadJSONBackup(backupData, `planify-backup-${isGuestMode ? 'guest' : 'user'}`);
      setBackupStatus('✅ Backup JSON descargado exitosamente (incluye datos de tiempo)');
      setTimeout(() => setBackupStatus(''), 3000);
    } catch (error) {
      console.error('Error downloading backup:', error);
      setBackupStatus('❌ Error al descargar el backup');
      setTimeout(() => setBackupStatus(''), 3000);
    }
  };

  const handleCreateBackup = async () => {
    if (isGuestMode) {
      setBackupStatus('❌ Los usuarios invitados no pueden crear backups en Google Drive');
      return;
    }

    setIsCreatingBackup(true);
    setBackupStatus('☁️ Creando backup en Google Drive...');
    
    try {
      const success = await onCreateBackup();
      if (success) {
        setBackupStatus('✅ Backup creado exitosamente en Google Drive');
      } else {
        setBackupStatus('❌ Error al crear el backup');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      setBackupStatus('❌ Error al crear el backup');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestoreBackup = async () => {
    if (isGuestMode) {
      setBackupStatus('❌ Los usuarios invitados no pueden restaurar desde Google Drive');
      return;
    }

    setIsRestoringBackup(true);
    setBackupStatus('☁️ Restaurando backup desde Google Drive...');
    
    try {
      const success = await onRestoreBackup();
      if (success) {
        setBackupStatus('✅ Backup restaurado exitosamente desde Google Drive');
      } else {
        setBackupStatus('❌ Error al restaurar el backup');
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      setBackupStatus('❌ Error al restaurar el backup');
    } finally {
      setIsRestoringBackup(false);
    }
  };

  const handleJsonFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const backupData = JSON.parse(content);
        
        setBackupStatus('📂 Procesando archivo JSON...');
        
        // Validar que el archivo sea un backup válido
        if (!backupData.data) {
          throw new Error('Formato de backup inválido');
        }

        restoreFromJsonBackup(backupData);
      } catch (error) {
        console.error('Error reading JSON file:', error);
        setBackupStatus('❌ Error al leer el archivo JSON - formato inválido');
        setTimeout(() => setBackupStatus(''), 3000);
      }
    };
    reader.readAsText(file);
  };

  const restoreFromJsonBackup = (backupData: any) => {
    try {
      const { data } = backupData;
      
      // Restaurar datos básicos (folders, projects, tasks)
      if (data.folders) {
        localStorage.setItem(`folders_${userId || 'guest'}`, JSON.stringify(data.folders));
      }
      if (data.projects) {
        localStorage.setItem(`projects_${userId || 'guest'}`, JSON.stringify(data.projects));
      }
      if (data.tasks) {
        localStorage.setItem(`tasks_${userId || 'guest'}`, JSON.stringify(data.tasks));
      }

      // Restaurar datos de time tracking si existen
      if (data.timeTracking && userId) {
        const success = restoreTimeTrackingData(data.timeTracking, userId);
        if (success) {
          setBackupStatus('✅ Backup JSON restaurado exitosamente (incluye datos de tiempo)');
        } else {
          setBackupStatus('⚠️ Backup restaurado pero hubo problemas con los datos de tiempo');
        }
      } else {
        setBackupStatus('✅ Backup JSON restaurado exitosamente');
      }

      // Recargar la página para aplicar los cambios
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Error restoring JSON backup:', error);
      setBackupStatus('❌ Error al restaurar el backup JSON');
      setTimeout(() => setBackupStatus(''), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Fondo animado igual a carpetas */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/30 to-indigo-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.3),rgba(255,255,255,0))]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.2),rgba(255,255,255,0))]"></div>
      </div>

      <div className="relative z-10 pt-8 md:pt-12 px-2 sm:px-3 md:px-6 h-full overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* PREMIUM HEADER - EXACTAMENTE IGUAL A CARPETAS */}
          <div className="text-center mb-8 md:mb-10">
            {/* Icono principal con glow effect */}
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-700 flex items-center justify-center mb-5 shadow-2xl shadow-purple-500/50 mx-auto">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 blur-xl opacity-50"></div>
              <User className="w-9 h-9 text-white relative z-10" />
            </div>

            {/* Título y subtítulo estilo Carpetas */}
            <h1 className="text-white font-bold text-2xl mb-1 tracking-tight">🔥 MI PERFIL ACTUALIZADO 🔥</h1>
            <p className="text-white/50 text-sm">Tu universo de productividad - NUEVA VERSIÓN</p>
            
            {/* PROGRESS CHIPS - botones circulares minimalistas - IGUAL A CARPETAS */}
            <div className="flex justify-center gap-3 mt-5 mb-4 md:mb-6">
              {/* Botón Cerrar - AL INICIO */}
              <button
                onClick={onClose}
                className="relative group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 bg-white/[0.08] backdrop-blur-sm border border-white/[0.15] text-white/70 hover:bg-white/[0.15] hover:scale-105 hover:text-white"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
              
              {/* Botón de Backup JSON */}
              <button
                onClick={handleDownloadLocalBackup}
                className="relative group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 hover:scale-105"
                title="Descargar backup JSON"
              >
                <FileDown className="w-4 h-4" />
              </button>
              
              {/* Botón de Cargar JSON */}
              <button
                onClick={handleJsonFileUpload}
                className="relative group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 hover:scale-105"
                title="Cargar backup JSON"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Contenido Principal - Estilo igual que Carpetas */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            {/* Perfil Info - Header minimalista exacto */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Avatar/Icono de usuario */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-700 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                  <User className="w-6 h-6" />
                </div>
                
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-white truncate">{user?.name || 'Usuario'}</h3>
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <span className="text-white">{user?.email || 'No disponible'}</span>
                    {!isGuestMode && (
                      <>
                        <span className="text-white/50">•</span>
                        <span className="font-medium text-white">Premium</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Perfil Info Card - Como en la imagen */}
            <div className="bg-gradient-to-br from-indigo-500/20 via-purple-600/20 to-violet-700/20 border border-purple-500/30 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-4">
                {/* Avatar grande */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-700 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  {/* Badge Premium */}
                  {!isGuestMode && (
                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded-lg shadow-lg">
                      Premium
                    </div>
                  )}
                </div>

                {/* Info del usuario */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-white mb-1">{user?.name || 'Luis Virrueta'}</h2>
                  <p className="text-purple-200 text-sm mb-2">Organizador Productivo</p>
                  <p className="text-white/70 text-sm mb-3">{user?.email || 'luis.virrueta.contacto@gmail.com'}</p>
                  
                  {/* Badges de nivel y progreso */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1 bg-purple-500/20 border border-purple-400/30 rounded-lg px-3 py-1">
                      <span className="text-yellow-400 text-lg">⭐</span>
                      <span className="text-white text-sm font-medium">Nivel 8</span>
                    </div>
                    <div className="text-white/60 text-sm">2340 / 3000 XP</div>
                  </div>

                  {/* Descripción */}
                  <p className="text-white/70 text-sm mb-4">
                    Construyendo mi mejor versión cada día con esta app.
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-xl p-3">
                      <div className="text-white/60 text-xs mb-1">Miembro desde</div>
                      <div className="text-white text-sm font-medium">octubre de 2025</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3">
                      <div className="text-white/60 text-xs mb-1 flex items-center gap-1">
                        <span className="text-yellow-400">🏆</span>
                        <span>Logros</span>
                      </div>
                      <div className="text-white text-sm font-medium">5 / 8</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          
          {isGuestMode ? (
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <HardDrive className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-yellow-100 font-medium">Modo Invitado</p>
                  <p className="text-yellow-200/70 text-sm">
                    Tus datos se guardan solo en este dispositivo
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Cloud className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-blue-100 font-medium">Usuario Registrado</p>
                  <p className="text-blue-200/70 text-sm">
                    {user?.email || 'No disponible'}
                  </p>
                  <p className="text-blue-200/50 text-xs mt-1">
                    Datos sincronizados con Google Drive
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Estadísticas Section - Como en la imagen */}
        <div className="px-6 pb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🏆</span>
            <h3 className="text-xl font-bold text-white">Estadísticas</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Estadística 1 */}
            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/30 flex items-center justify-center mx-auto mb-3">
                <div className="w-6 h-6 rounded-full bg-cyan-400"></div>
              </div>
              <div className="text-white/80 text-sm mb-1">Productividad</div>
              <div className="text-white text-lg font-bold">85%</div>
            </div>
            
            {/* Estadística 2 */}
            <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-400/30 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-orange-500/30 flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-400 text-xl">⭐</span>
              </div>
              <div className="text-white/80 text-sm mb-1">Rendimiento</div>
              <div className="text-white text-lg font-bold">92%</div>
            </div>
          </div>
        </div>

        {/* Backup & Restore */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-white mb-4">Gestión de Datos</h3>
          
          <div className="space-y-4">
            
            {/* Storage Info */}
            <div className="bg-gray-500/20 border border-gray-500/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Sistema de Almacenamiento</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <p>• <HardDrive className="w-4 h-4 inline mr-1" /> Almacenamiento local para velocidad</p>
                {!isGuestMode && (
                  <p>• <Cloud className="w-4 h-4 inline mr-1" /> Backup manual en Google Drive</p>
                )}
              </div>
            </div>

            {/* Backup Actions */}
            {!isGuestMode && (
              <div className="space-y-3">
                <button
                  onClick={handleCreateBackup}
                  disabled={isCreatingBackup || isRestoringBackup}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-5 h-5 text-green-400" />
                  <span className="text-green-100 font-medium">
                    {isCreatingBackup ? 'Creando Backup...' : 'Crear Backup en Google Drive'}
                  </span>
                </button>

                <button
                  onClick={handleRestoreBackup}
                  disabled={isCreatingBackup || isRestoringBackup}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-100 font-medium">
                    {isRestoringBackup ? 'Restaurando...' : 'Restaurar desde Google Drive'}
                  </span>
                </button>
              </div>
            )}

            {/* Status Message */}
            {backupStatus && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                <p className="text-sm text-gray-200">{backupStatus}</p>
              </div>
            )}

            {/* Guest Mode Info */}
            {isGuestMode && (
              <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4">
                <h4 className="text-orange-100 font-medium mb-2">Limitaciones del Modo Invitado</h4>
                <div className="text-sm text-orange-200/70 space-y-1">
                  <p>• No se puede hacer backup en Google Drive</p>
                  <p>• Los datos solo están disponibles en este dispositivo</p>
                  <p>• Para sincronización en la nube, inicia sesión con Google</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input oculto para cargar archivos JSON */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

      </div>
    </div>
    </div>
  );
}