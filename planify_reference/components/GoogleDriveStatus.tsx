import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGoogleDrive } from '@/hooks/useGoogleDrive';
import { useAuth } from '@/hooks/useAuth';

interface GoogleDriveStatusProps {
  onSyncSuccess?: () => void;
}

export default function GoogleDriveStatus({ onSyncSuccess }: GoogleDriveStatusProps) {
  const { user } = useAuth();
  const { driveStatus, connectDrive, listBackups, createBackup } = useGoogleDrive();
  const [showBackups, setShowBackups] = useState(false);
  const [backups, setBackups] = useState<any[]>([]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  const handleConnectDrive = async () => {
    await connectDrive();
  };

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      // Obtener datos actuales (esto debería venir del contexto de datos)
      const result = await createBackup({
        folders: [],
        projects: [],
        tasks: []
      });

      if (result.success) {
        alert('✅ Backup creado exitosamente en Google Drive');
        onSyncSuccess?.();
      } else {
        alert('❌ Error creando backup: ' + result.error);
      }
    } catch (error) {
      alert('❌ Error creando backup');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleShowBackups = async () => {
    try {
      const result = await listBackups();
      if (result.success && result.backups) {
        setBackups(result.backups);
        setShowBackups(true);
      } else {
        alert('❌ Error cargando backups: ' + result.error);
      }
    } catch (error) {
      alert('❌ Error cargando backups');
    }
  };

  const getStatusColor = () => {
    if (driveStatus.isSyncing) return 'from-blue-500 to-blue-600';
    if (driveStatus.isConnected) return 'from-green-500 to-green-600';
    if (driveStatus.error) return 'from-red-500 to-red-600';
    return 'from-gray-500 to-gray-600';
  };

  const getStatusText = () => {
    if (driveStatus.isSyncing) return 'Sincronizando...';
    if (driveStatus.isConnected) return 'Conectado a Google Drive';
    if (driveStatus.error) return 'Error de conexión';
    return 'No conectado';
  };

  const getStatusIcon = () => {
    if (driveStatus.isSyncing) return '🔄';
    if (driveStatus.isConnected) return '☁️';
    if (driveStatus.error) return '⚠️';
    return '📱';
  };

  return (
    <div className="space-y-4">
      {/* Estado de Conexión */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className={`bg-gradient-to-r ${getStatusColor()} p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getStatusIcon()}</span>
              <div>
                <h3 className="font-bold text-lg">{getStatusText()}</h3>
                {driveStatus.lastSync && (
                  <p className="text-white/80 text-sm">
                    Última sincronización: {new Date(driveStatus.lastSync).toLocaleString('es-ES')}
                  </p>
                )}
                {driveStatus.error && (
                  <p className="text-red-200 text-sm">{driveStatus.error}</p>
                )}
              </div>
            </div>

            {!driveStatus.isConnected && !driveStatus.isSyncing && (
              <button
                onClick={handleConnectDrive}
                className="px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors font-medium"
              >
                Conectar
              </button>
            )}
          </div>

          {/* Barra de sincronización */}
          {driveStatus.isSyncing && (
            <div className="mt-4">
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="bg-white h-2 rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Acciones de Google Drive */}
      {driveStatus.isConnected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
        >
          <h4 className="font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-xl">🛠️</span>
            Acciones de Google Drive
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleCreateBackup}
              disabled={isCreatingBackup}
              className="flex items-center gap-3 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all border border-white/20 disabled:opacity-50"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                {isCreatingBackup ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-white text-lg">💾</span>
                )}
              </div>
              <div className="text-left">
                <div className="text-white font-medium">Crear Backup</div>
                <div className="text-white/60 text-sm">Backup manual</div>
              </div>
            </button>

            <button
              onClick={handleShowBackups}
              className="flex items-center gap-3 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all border border-white/20"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">📋</span>
              </div>
              <div className="text-left">
                <div className="text-white font-medium">Ver Backups</div>
                <div className="text-white/60 text-sm">Historial</div>
              </div>
            </button>
          </div>

          {/* Información del Usuario Google */}
          {user?.email && (
            <div className="mt-4 p-3 bg-white/5 rounded-xl">
              <p className="text-white/80 text-sm">
                <span className="font-medium">Conectado como:</span> {user.email}
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Modal de Backups */}
      {showBackups && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">📋 Backups Disponibles</h3>
                <button
                  onClick={() => setShowBackups(false)}
                  className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <span className="text-gray-600">✕</span>
                </button>
              </div>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              {backups.length > 0 ? (
                <div className="space-y-3">
                  {backups.map((backup, index) => (
                    <div key={backup.id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{backup.name}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(backup.date).toLocaleString('es-ES')}
                          </p>
                          {backup.size && (
                            <p className="text-xs text-gray-500">{backup.size} bytes</p>
                          )}
                        </div>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                          Restaurar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-4xl">📦</span>
                  <p className="text-gray-600 mt-2">No hay backups disponibles</p>
                  <p className="text-gray-500 text-sm">Crea tu primer backup manual</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}