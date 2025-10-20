'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  User, Settings, Bell, Shield, HelpCircle, 
  LogOut, Edit, Camera, Star, Trophy, 
  Calendar, Target, Home, ChevronRight,
  Moon, Sun, Smartphone, Mail, Lock,
  Download, Upload, Trash2, Heart,
  Award, Zap, Crown, Sparkles, Medal,
  Users, CheckCircle, Plus, X, 
  Cloud, FileDown, FileUp, TrendingUp,
  Database, Palette, HardDrive, Clock
} from 'lucide-react';
import EditProfileModal from '@/components/EditProfileModal';
import { extractTimeTrackingData, restoreTimeTrackingData, formatBackupData } from '@/utils/backupUtils';

interface PremiumProfileScreenProps {
  onBack?: () => void;
  onNavigate?: (view: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  exportData?: () => any;
  importData?: (data: any) => Promise<boolean>;
  isGuestMode?: boolean;
  userId?: string;
}

interface UserStats {
  projectsCompleted: number;
  currentStreak: number;
  totalDays: number;
  achievements: number;
  perfectDays: number;
  tasksCompleted: number;
  level: number;
  experience: number;
  nextLevelExp: number;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  gradient: string;
  unlocked: boolean;
  unlockedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export default function PremiumProfileScreen({ 
  onBack, 
  onNavigate, 
  isOpen, 
  onClose, 
  exportData, 
  importData, 
  isGuestMode = false, 
  userId 
}: PremiumProfileScreenProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [showEmailConfig, setShowEmailConfig] = useState(false);
  const [backupStatus, setBackupStatus] = useState<string>('');
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  // Debug - verificar si el modal está recibiendo isOpen correctamente
  useEffect(() => {
    console.log('🎯 PremiumProfileScreen - isOpen:', isOpen);
  }, [isOpen]);

  // No renderizar si no está abierto
  if (!isOpen) return null;

  // Mock data - más completo como el original
  const user = {
    name: 'Luis Virrueta',
    email: 'luis.virrueta.contacto@gmail.com',
    avatar: '' as string | null,
    plan: 'Ultra Premium',
    title: 'Organizador Productivo',
    bio: 'Construyendo mi mejor versión cada día con esta app.',
    location: 'España',
    memberSince: 'octubre de 2025',
    level: 8,
    experience: 2340,
    nextLevelExp: 3000
  };

  const stats: UserStats = {
    projectsCompleted: 12,
    currentStreak: 7,
    totalDays: 45,
    achievements: 8,
    perfectDays: 5,
    tasksCompleted: 128,
    level: 5,
    experience: 2340,
    nextLevelExp: 3000
  };

  const dailyStats = {
    completedTasks: 8,
    totalTasks: 12,
    focusTime: 180,
    projectsWorked: 3
  };

  const weeklyStats = {
    completedTasks: 45,
    totalTasks: 60,
    averageDaily: 6.4
  };

  const timeStats = {
    todayTime: 180 * 60 * 1000,
    weekTime: 720 * 60 * 1000
  };

  const projectStats = {
    activeProjects: 5,
    completedProjects: 12,
    totalProjects: 17
  };

  const focusStats = {
    sessionsToday: 3,
    totalTime: 180 * 60 * 1000
  };

  const achievements: Achievement[] = [
    {
      id: 1,
      name: 'Primera Victoria',
      description: 'Completa tu primera tarea',
      icon: '🎯',
      gradient: 'from-blue-500 to-cyan-500',
      unlocked: true,
      rarity: 'common'
    },
    {
      id: 2,
      name: 'Racha Perfecta',
      description: 'Mantén una racha de 7 días',
      icon: '🔥',
      gradient: 'from-orange-500 to-red-500',
      unlocked: true,
      rarity: 'rare'
    }
  ];

  const experiencePercentage = (stats.experience / stats.nextLevelExp) * 100;
  const dailyProgress = dailyStats.totalTasks > 0 ? (dailyStats.completedTasks / dailyStats.totalTasks) * 100 : 0;
  const weeklyProgress = weeklyStats.totalTasks > 0 ? (weeklyStats.completedTasks / weeklyStats.totalTasks) * 100 : 0;

  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}h`;
    }
    return `${minutes}m`;
  };

  const handleExportData = async () => {
    try {
      // Crear datos de backup
      const backupData = {
        version: '1.1',
        timestamp: new Date().toISOString(),
        user: user,
        stats: stats,
        achievements: achievements,
        settings: {
          theme: 'dark',
          notifications: true
        }
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `backup-completo-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handleDownloadLocalBackup = () => {
    try {
      if (!exportData) {
        setBackupStatus('❌ Función de exportación no disponible');
        setTimeout(() => setBackupStatus(''), 3000);
        return;
      }

      // Obtener datos reales de la aplicación
      const appData = exportData();
      
      // Obtener datos de time tracking reales
      const timeTrackingData = extractTimeTrackingData(userId || 'guest');
      
      // Crear backup completo con todos los datos reales
      const backupData = {
        ...formatBackupData(
          appData.folders,
          appData.projects, 
          appData.tasks,
          timeTrackingData
        ),
        user: user,
        stats: stats,
        achievements: achievements
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `planify-backup-completo-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(link.href);
      setBackupStatus('✅ Backup JSON descargado exitosamente (incluye datos de tiempo reales)');
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
      // Simular creación de backup en Google Drive
      await new Promise(resolve => setTimeout(resolve, 2000));
      setBackupStatus('✅ Backup creado exitosamente en Google Drive');
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
      // Simular restauración desde Google Drive
      await new Promise(resolve => setTimeout(resolve, 2000));
      setBackupStatus('✅ Backup restaurado exitosamente desde Google Drive');
    } catch (error) {
      console.error('Error restoring backup:', error);
      setBackupStatus('❌ Error al restaurar el backup');
    } finally {
      setIsRestoringBackup(false);
    }
  };

  const handleJsonFileUpload = () => {
    jsonFileInputRef.current?.click();
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!importData) {
      setBackupStatus('❌ Función de importación no disponible');
      setTimeout(() => setBackupStatus(''), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const backupData = JSON.parse(content);
        
        setBackupStatus('📂 Procesando archivo JSON...');
        
        // Validar que el archivo sea un backup válido
        if (!backupData.data) {
          throw new Error('Formato de backup inválido - falta propiedad "data"');
        }

        // Validar que tenga las propiedades necesarias
        const { folders, projects, tasks } = backupData.data;
        if (!Array.isArray(folders) || !Array.isArray(projects) || !Array.isArray(tasks)) {
          throw new Error('Formato de backup inválido - datos corruptos');
        }

        console.log('🔄 Restaurando datos del backup:', {
          folders: folders.length,
          projects: projects.length, 
          tasks: tasks.length
        });

        // Restaurar datos principales usando la función real
        const success = await importData({
          folders,
          projects,
          tasks
        });

        if (!success) {
          throw new Error('Error durante la importación de datos');
        }

        // Restaurar datos de time tracking si existen
        if (backupData.data.timeTracking) {
          const timeTrackingRestored = restoreTimeTrackingData(
            backupData.data.timeTracking, 
            userId || 'guest'
          );
          console.log('⏱️ Time tracking restaurado:', timeTrackingRestored);
        }

        setBackupStatus('✅ Backup JSON restaurado exitosamente (incluye datos de tiempo reales)');
        setTimeout(() => setBackupStatus(''), 3000);

      } catch (error) {
        console.error('❌ Error reading/importing JSON file:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setBackupStatus(`❌ Error: ${errorMessage}`);
        setTimeout(() => setBackupStatus(''), 5000);
      }
    };
    reader.readAsText(file);
  };

  const handleSaveProfile = (profileData: any) => {
    console.log('Saving profile:', profileData);
    setShowEditProfile(false);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 overflow-hidden"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999
      }}
    >
      {/* Fondo animado premium - IGUAL A FOLDERS */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(236,72,153,0.15),rgba(255,255,255,0))]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.2),rgba(255,255,255,0))]"></div>
      </div>

      <div className="relative z-10 pt-8 md:pt-12 px-2 sm:px-3 md:px-6 h-full overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* PREMIUM HEADER - EXACTAMENTE IGUAL A FOLDERS */}
          <div className="text-center mb-8 md:mb-10">
            {/* Icono principal con glow effect */}
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 flex items-center justify-center mb-5 shadow-2xl shadow-purple-500/50 mx-auto">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-400 to-purple-500 blur-xl opacity-50"></div>
              <User className="w-9 h-9 text-white relative z-10" />
            </div>

            {/* Título y subtítulo estilo Folders */}
            <h1 className="text-white font-bold text-2xl mb-1 tracking-tight">Mi Perfil</h1>
            <p className="text-white/50 text-sm">Tu universo de productividad</p>
            
            {/* PROGRESS CHIPS - botones circulares minimalistas - IGUAL A FOLDERS */}
            <div className="flex justify-center gap-3 mt-5 mb-4 md:mb-6">
              {/* Botón Cerrar - AL INICIO */}
              <button
                onClick={onClose || onBack}
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
              
              {/* Botón de Editar Perfil */}
              <button
                onClick={() => setShowEditProfile(true)}
                className="relative group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 hover:scale-105"
                title="Editar perfil"
              >
                <Edit className="w-4 h-4" />
              </button>
              
              {/* Botón de Settings */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="relative group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 bg-white/[0.08] backdrop-blur-sm border border-white/[0.15] text-white/70 hover:bg-white/[0.15] hover:scale-105 hover:text-white"
                title="Configuración"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Contenido Principal - Estilo glassmorphism premium */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            {/* Perfil Info Card Premium - Diseño mobile-first */}
            <div className="p-6">
              {/* Header del perfil con avatar y acciones rápidas */}
              <div className="relative bg-gradient-to-br from-indigo-500/20 via-purple-600/20 to-violet-700/20 border border-purple-500/30 rounded-3xl p-6 mb-6 overflow-hidden">
                {/* Glow sutil de fondo */}
                <div className="absolute inset-0 -z-0 pointer-events-none">
                  <div className="absolute -inset-24 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 opacity-50 blur-3xl" />
                </div>
                
                <div className="relative z-10">
                  {/* Layout móvil-first: Stack en móvil, lado a lado en desktop */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    {/* Avatar grande con efectos premium */}
                    <div className="relative flex-shrink-0">
                      <div className="w-24 h-24 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-2xl shadow-purple-500/50">
                        {/* Glow interno igual al header */}
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-400 to-purple-500 blur-xl opacity-50"></div>
                        <span className="relative z-10">
                          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                      
                      {/* Badge Premium flotante */}
                      {!isGuestMode && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-2.5 py-1 rounded-xl shadow-xl border border-yellow-300/50">
                          ⭐ Premium
                        </div>
                      )}
                    </div>

                    {/* Info del usuario - centrado en móvil */}
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <h2 className="text-2xl sm:text-xl font-bold text-white mb-2">
                        {user?.name || 'Luis Virrueta'}
                      </h2>
                      <p className="text-purple-200 text-base sm:text-sm mb-2">
                        {user?.title || 'Organizador Productivo'}
                      </p>
                      <p className="text-white/70 text-sm mb-4">
                        {user?.email || 'luis.virrueta.contacto@gmail.com'}
                      </p>
                      
                      {/* Badges de nivel - stack en móvil */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
                        <div className="flex items-center gap-2 bg-purple-500/20 border border-purple-400/30 rounded-xl px-4 py-2">
                          <span className="text-yellow-400 text-lg">⭐</span>
                          <span className="text-white text-sm font-medium">Nivel {user?.level || 8}</span>
                        </div>
                        <div className="text-white/60 text-sm">
                          {user?.experience || 2340} / {user?.nextLevelExp || 3000} XP
                        </div>
                      </div>

                      {/* Descripción */}
                      <p className="text-white/70 text-sm leading-relaxed">
                        {user?.bio || 'Construyendo mi mejor versión cada día con esta app.'}
                      </p>
                    </div>
                  </div>

                  {/* Stats grid - responsive */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                      <div className="text-white/60 text-xs mb-1">Miembro desde</div>
                      <div className="text-white text-sm font-semibold">{user?.memberSince || 'Oct 2025'}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                      <div className="text-white/60 text-xs mb-1 flex items-center justify-center gap-1">
                        <span className="text-yellow-400">🏆</span>
                        <span>Logros</span>
                      </div>
                      <div className="text-white text-sm font-semibold">8 / 12</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                      <div className="text-white/60 text-xs mb-1">Racha</div>
                      <div className="text-white text-sm font-semibold flex items-center justify-center gap-1">
                        <span className="text-orange-400">🔥</span>
                        <span>7 días</span>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                      <div className="text-white/60 text-xs mb-1">Proyectos</div>
                      <div className="text-white text-sm font-semibold">12</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Status del usuario - Diseño premium */}
            <div className="px-6 mb-6">
              {isGuestMode ? (
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-2xl p-5 backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-yellow-500/30 flex items-center justify-center">
                      <HardDrive className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-yellow-100 font-semibold text-base">Modo Invitado</p>
                      <p className="text-yellow-200/70 text-sm mt-1">
                        Tus datos se guardan solo en este dispositivo
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-2xl p-5 backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/30 flex items-center justify-center">
                      <Cloud className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-blue-100 font-semibold text-base">Usuario Premium</p>
                      <p className="text-blue-200/70 text-sm mt-1">
                        Datos sincronizados con Google Drive
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Métricas de rendimiento - Grid premium */}
            <div className="px-6 mb-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-300" />
                </div>
                <h3 className="text-xl font-bold text-white">Métricas de Rendimiento</h3>
              </div>
              
              {/* Grid de métricas responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Métrica de productividad */}
                <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/20 rounded-2xl p-5 backdrop-blur-sm">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/30 flex items-center justify-center mb-4">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500"></div>
                  </div>
                  <div className="text-cyan-200 text-sm font-medium mb-1">Productividad</div>
                  <div className="text-white text-2xl font-bold">85%</div>
                  <div className="text-cyan-300/60 text-xs mt-1">↗ +12% este mes</div>
                </div>
                
                {/* Métrica de rendimiento */}
                <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-400/20 rounded-2xl p-5 backdrop-blur-sm">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/30 flex items-center justify-center mb-4">
                    <span className="text-orange-400 text-xl">⭐</span>
                  </div>
                  <div className="text-orange-200 text-sm font-medium mb-1">Rendimiento</div>
                  <div className="text-white text-2xl font-bold">92%</div>
                  <div className="text-orange-300/60 text-xs mt-1">↗ +8% esta semana</div>
                </div>

                {/* Tiempo total */}
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-400/20 rounded-2xl p-5 backdrop-blur-sm">
                  <div className="w-12 h-12 rounded-2xl bg-green-500/30 flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="text-green-200 text-sm font-medium mb-1">Tiempo Total</div>
                  <div className="text-white text-2xl font-bold">127h</div>
                  <div className="text-green-300/60 text-xs mt-1">Este mes</div>
                </div>

                {/* Racha actual */}
                <div className="bg-gradient-to-br from-purple-500/20 to-violet-600/20 border border-purple-400/20 rounded-2xl p-5 backdrop-blur-sm">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/30 flex items-center justify-center mb-4">
                    <span className="text-purple-400 text-xl">🔥</span>
                  </div>
                  <div className="text-purple-200 text-sm font-medium mb-1">Racha Actual</div>
                  <div className="text-white text-2xl font-bold">7</div>
                  <div className="text-purple-300/60 text-xs mt-1">días consecutivos</div>
                </div>
              </div>
            </div>

            {/* Gestión de Datos - Diseño premium */}
            <div className="px-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500/30 to-emerald-500/30 flex items-center justify-center">
                  <Database className="w-5 h-5 text-green-300" />
                </div>
                <h3 className="text-xl font-bold text-white">Gestión de Datos</h3>
              </div>
              
              <div className="space-y-5">
                {/* Storage Info - Diseño premium */}
                <div className="bg-gradient-to-r from-gray-500/20 to-slate-500/20 border border-gray-400/30 rounded-2xl p-5 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-gray-500/30 flex items-center justify-center">
                      <HardDrive className="w-5 h-5 text-gray-300" />
                    </div>
                    <h4 className="text-white font-semibold text-base">Sistema de Almacenamiento</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                      <HardDrive className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-300 text-sm">Almacenamiento local para velocidad máxima</span>
                    </div>
                    {!isGuestMode && (
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                        <Cloud className="w-5 h-5 text-blue-400" />
                        <span className="text-gray-300 text-sm">Backup automático en Google Drive</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Backup Actions - Diseño premium */}
                {!isGuestMode && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={handleCreateBackup}
                      disabled={isCreatingBackup || isRestoringBackup}
                      className="group flex items-center justify-center gap-3 p-5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-400/30 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] backdrop-blur-sm"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-green-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Download className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="text-left">
                        <div className="text-green-100 font-semibold text-sm">
                          {isCreatingBackup ? 'Creando...' : 'Crear Backup'}
                        </div>
                        <div className="text-green-200/70 text-xs">Google Drive</div>
                      </div>
                    </button>

                    <button
                      onClick={handleRestoreBackup}
                      disabled={isCreatingBackup || isRestoringBackup}
                      className="group flex items-center justify-center gap-3 p-5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-400/30 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] backdrop-blur-sm"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="text-left">
                        <div className="text-blue-100 font-semibold text-sm">
                          {isRestoringBackup ? 'Restaurando...' : 'Restaurar'}
                        </div>
                        <div className="text-blue-200/70 text-xs">Desde Drive</div>
                      </div>
                    </button>
                  </div>
                )}

                {/* Status Message - Diseño premium */}
                {backupStatus && (
                  <div className="bg-gradient-to-r from-purple-500/20 to-violet-500/20 border border-purple-400/30 rounded-2xl p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/30 flex items-center justify-center">
                        <span className="text-purple-300 text-lg">ℹ️</span>
                      </div>
                      <p className="text-purple-100 text-sm font-medium">{backupStatus}</p>
                    </div>
                  </div>
                )}

                {/* Guest Mode Info - Diseño premium */}
                {isGuestMode && (
                  <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30 rounded-2xl p-5 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-2xl bg-orange-500/30 flex items-center justify-center">
                        <span className="text-orange-400 text-lg">⚠️</span>
                      </div>
                      <h4 className="text-orange-100 font-semibold text-base">Limitaciones del Modo Invitado</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-orange-200/80 text-sm">
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                        <span>Sin backup en Google Drive</span>
                      </div>
                      <div className="flex items-center gap-2 text-orange-200/80 text-sm">
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                        <span>Datos solo en este dispositivo</span>
                      </div>
                      <div className="flex items-center gap-2 text-orange-200/80 text-sm">
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                        <span>Para sync: inicia sesión con Google</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportData}
            className="hidden"
          />
          
          <input
            ref={jsonFileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportData}
            className="hidden"
          />

          {/* Modals */}
          <EditProfileModal
            isOpen={showEditProfile}
            onClose={() => setShowEditProfile(false)}
            user={user}
            onSave={handleSaveProfile}
          />

          {showAchievements && (
            <div className="fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Logros</h3>
                  <button onClick={() => setShowAchievements(false)} className="text-white/70 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-3">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="p-3 bg-white/5 border border-white/10 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div>
                          <h4 className="text-white font-medium">{achievement.name}</h4>
                          <p className="text-white/60 text-sm">{achievement.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {showMetrics && (
            <div className="fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Métricas</h3>
                  <button onClick={() => setShowMetrics(false)} className="text-white/70 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                    <div className="text-2xl font-bold text-white mb-1">{Math.round(dailyProgress)}%</div>
                    <div className="text-white/70 text-sm">Progreso Diario</div>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                    <div className="text-2xl font-bold text-white mb-1">{formatTime(timeStats.todayTime)}</div>
                    <div className="text-white/70 text-sm">Tiempo Hoy</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showEmailConfig && (
            <div className="fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Configuración Email</h3>
                  <button onClick={() => setShowEmailConfig(false)} className="text-white/70 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50"
                      placeholder="tu@email.com"
                    />
                  </div>
                  <button className="w-full p-3 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-300 hover:bg-blue-500/30 transition-colors">
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Verificar que estamos en el navegador antes de usar createPortal
  if (typeof window === 'undefined') return null;
  
  return createPortal(modalContent, document.body);
}