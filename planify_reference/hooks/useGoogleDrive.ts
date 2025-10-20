import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

export interface DriveStatus {
  isConnected: boolean;
  isSyncing: boolean;
  lastSync: string | null;
  error: string | null;
}

export interface BackupInfo {
  id: string;
  name: string;
  date: string;
  size?: string;
}

export const useGoogleDrive = () => {
  const { user } = useAuth();
  const [driveStatus, setDriveStatus] = useState<DriveStatus>({
    isConnected: false,
    isSyncing: false,
    lastSync: null,
    error: null
  });

  // Conectar con Google Drive
  const connectDrive = useCallback(async () => {
    try {
      setDriveStatus(prev => ({ ...prev, error: null }));
      
      // Redirigir a la autenticación de Google
      window.location.href = '/api/auth/google';
      
    } catch (error: any) {
      setDriveStatus(prev => ({ 
        ...prev, 
        error: 'Error conectando con Google Drive' 
      }));
      console.error('Error connecting to Google Drive:', error);
    }
  }, []);

  // Sincronizar datos con Google Drive
  const syncData = useCallback(async (data: { folders: any[], projects: any[], tasks: any[] }) => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    setDriveStatus(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      const response = await fetch('/api/drive/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.requiresReauth) {
          setDriveStatus(prev => ({ 
            ...prev, 
            isConnected: false,
            error: 'Se requiere reautenticación con Google Drive' 
          }));
          return { success: false, requiresReauth: true };
        }
        throw new Error(result.message || 'Error sincronizando datos');
      }

      setDriveStatus(prev => ({ 
        ...prev, 
        isConnected: true,
        lastSync: result.lastSync,
        error: null 
      }));

      console.log('✅ Datos sincronizados con Google Drive');
      return { success: true, lastSync: result.lastSync };

    } catch (error: any) {
      setDriveStatus(prev => ({ 
        ...prev, 
        error: error.message 
      }));
      console.error('Error syncing data:', error);
      return { success: false, error: error.message };
    } finally {
      setDriveStatus(prev => ({ ...prev, isSyncing: false }));
    }
  }, [user]);

  // Cargar datos desde Google Drive
  const loadData = useCallback(async () => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    setDriveStatus(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      const response = await fetch('/api/drive/sync', {
        method: 'GET',
        credentials: 'include'
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.requiresReauth) {
          setDriveStatus(prev => ({ 
            ...prev, 
            isConnected: false,
            error: 'Se requiere reautenticación con Google Drive' 
          }));
          return { success: false, requiresReauth: true };
        }
        throw new Error(result.message || 'Error cargando datos');
      }

      setDriveStatus(prev => ({ 
        ...prev, 
        isConnected: true,
        lastSync: result.data.lastSync,
        error: null 
      }));

      console.log('✅ Datos cargados desde Google Drive');
      return { success: true, data: result.data };

    } catch (error: any) {
      setDriveStatus(prev => ({ 
        ...prev, 
        error: error.message 
      }));
      console.error('Error loading data:', error);
      return { success: false, error: error.message };
    } finally {
      setDriveStatus(prev => ({ ...prev, isSyncing: false }));
    }
  }, [user]);

  // Crear backup en Google Drive
  const createBackup = useCallback(async (data: { folders: any[], projects: any[], tasks: any[] }) => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const response = await fetch('/api/drive/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, type: 'manual' }),
        credentials: 'include'
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.requiresReauth) {
          setDriveStatus(prev => ({ 
            ...prev, 
            isConnected: false,
            error: 'Se requiere reautenticación con Google Drive' 
          }));
          return { success: false, requiresReauth: true };
        }
        throw new Error(result.message || 'Error creando backup');
      }

      console.log('✅ Backup creado en Google Drive');
      return { success: true, fileId: result.fileId, backupDate: result.backupDate };

    } catch (error: any) {
      console.error('Error creating backup:', error);
      return { success: false, error: error.message };
    }
  }, [user]);

  // Listar backups disponibles
  const listBackups = useCallback(async (): Promise<{ success: boolean, backups?: BackupInfo[], error?: string }> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const response = await fetch('/api/drive/backup', {
        method: 'GET',
        credentials: 'include'
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.requiresReauth) {
          setDriveStatus(prev => ({ 
            ...prev, 
            isConnected: false,
            error: 'Se requiere reautenticación con Google Drive' 
          }));
          return { success: false, error: 'Se requiere reautenticación' };
        }
        throw new Error(result.message || 'Error listando backups');
      }

      return { success: true, backups: result.backups };

    } catch (error: any) {
      console.error('Error listing backups:', error);
      return { success: false, error: error.message };
    }
  }, [user]);

  // Verificar estado de conexión
  const checkConnection = useCallback(() => {
    if (user && user.driveConnected) {
      setDriveStatus(prev => ({ 
        ...prev, 
        isConnected: true 
      }));
    }
  }, [user]);

  return {
    driveStatus,
    connectDrive,
    syncData,
    loadData,
    createBackup,
    listBackups,
    checkConnection
  };
};