import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Tipos para nuestros datos
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
}

export interface SyncData {
  folders: any[];
  projects: any[];
  tasks: any[];
  lastSync: string;
  version: string;
}

export class GoogleDriveService {
  private oauth2Client: OAuth2Client;
  private drive: any;
  private PLANIFY_FOLDER = 'Planify App Data';

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
  }

  // Configurar tokens de acceso del usuario
  setCredentials(tokens: any) {
    this.oauth2Client.setCredentials(tokens);
  }

  // Obtener URL para autorización OAuth2 con Drive + Gmail
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.appdata',
      'https://www.googleapis.com/auth/gmail.readonly', // Gmail read access
      'https://www.googleapis.com/auth/gmail.send',     // Gmail send access
      'https://www.googleapis.com/auth/userinfo.email', // User info
      'https://www.googleapis.com/auth/userinfo.profile' // User profile
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent' // Forzar que muestre todos los permisos
    });
  }

  // Intercambiar código por tokens
  async getTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  // Refrescar token de acceso
  async refreshToken(refreshToken: string) {
    this.oauth2Client.setCredentials({
      refresh_token: refreshToken
    });
    
    const { credentials } = await this.oauth2Client.refreshAccessToken();
    return credentials;
  }

  // Crear o encontrar la carpeta de Planify
  async ensurePlanifyFolder(): Promise<string> {
    try {
      // Buscar si ya existe la carpeta
      const response = await this.drive.files.list({
        q: `name='${this.PLANIFY_FOLDER}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        spaces: 'drive'
      });

      if (response.data.files && response.data.files.length > 0) {
        return response.data.files[0].id;
      }

      // Crear la carpeta si no existe
      const folderResponse = await this.drive.files.create({
        requestBody: {
          name: this.PLANIFY_FOLDER,
          mimeType: 'application/vnd.google-apps.folder'
        }
      });

      return folderResponse.data.id;
    } catch (error) {
      console.error('Error managing Planify folder:', error);
      throw error;
    }
  }

  // Subir datos como archivo JSON
  async uploadData(fileName: string, data: any): Promise<string> {
    try {
      const folderId = await this.ensurePlanifyFolder();
      const jsonData = JSON.stringify(data, null, 2);

      // Verificar si el archivo ya existe
      const existingFiles = await this.drive.files.list({
        q: `name='${fileName}' and parents in '${folderId}' and trashed=false`,
        spaces: 'drive'
      });

      if (existingFiles.data.files && existingFiles.data.files.length > 0) {
        // Actualizar archivo existente
        const response = await this.drive.files.update({
          fileId: existingFiles.data.files[0].id,
          media: {
            mimeType: 'application/json',
            body: jsonData
          }
        });
        return response.data.id;
      } else {
        // Crear nuevo archivo
        const response = await this.drive.files.create({
          requestBody: {
            name: fileName,
            parents: [folderId],
            mimeType: 'application/json'
          },
          media: {
            mimeType: 'application/json',
            body: jsonData
          }
        });
        return response.data.id;
      }
    } catch (error) {
      console.error('Error uploading data to Drive:', error);
      throw error;
    }
  }

  // Descargar datos desde Drive
  async downloadData(fileName: string): Promise<any> {
    try {
      const folderId = await this.ensurePlanifyFolder();

      const files = await this.drive.files.list({
        q: `name='${fileName}' and parents in '${folderId}' and trashed=false`,
        spaces: 'drive'
      });

      if (!files.data.files || files.data.files.length === 0) {
        return null; // Archivo no existe
      }

      const fileId = files.data.files[0].id;
      const response = await this.drive.files.get({
        fileId: fileId,
        alt: 'media'
      });

      return JSON.parse(response.data);
    } catch (error) {
      console.error('Error downloading data from Drive:', error);
      throw error;
    }
  }

  // Listar archivos de Planify
  async listPlanifyFiles(): Promise<DriveFile[]> {
    try {
      const folderId = await this.ensurePlanifyFolder();

      const response = await this.drive.files.list({
        q: `parents in '${folderId}' and trashed=false`,
        fields: 'files(id, name, mimeType, modifiedTime, size)',
        orderBy: 'modifiedTime desc'
      });

      return response.data.files || [];
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }

  // Sincronizar todos los datos del usuario
  async syncUserData(userId: string, data: SyncData): Promise<boolean> {
    try {
      const fileName = `user_${userId}_data.json`;
      const syncData = {
        ...data,
        lastSync: new Date().toISOString(),
        version: '1.0.0'
      };

      await this.uploadData(fileName, syncData);
      console.log(`✅ Datos sincronizados para usuario ${userId}`);
      return true;
    } catch (error) {
      console.error('Error syncing user data:', error);
      return false;
    }
  }

  // Cargar datos del usuario desde Drive
  async loadUserData(userId: string): Promise<SyncData | null> {
    try {
      const fileName = `user_${userId}_data.json`;
      const data = await this.downloadData(fileName);
      
      if (data) {
        console.log(`✅ Datos cargados para usuario ${userId}`);
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('Error loading user data:', error);
      return null;
    }
  }

  // Crear backup completo
  async createBackup(userId: string, data: SyncData): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `backup_${userId}_${timestamp}.json`;
      
      const backupData = {
        ...data,
        backupDate: new Date().toISOString(),
        userId: userId,
        type: 'full_backup'
      };

      const fileId = await this.uploadData(fileName, backupData);
      console.log(`✅ Backup creado: ${fileName}`);
      return fileId;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }

  // Verificar conectividad con Drive
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.drive.about.get({
        fields: 'user, storageQuota'
      });
      
      console.log(`✅ Conectado a Google Drive de ${response.data.user.emailAddress}`);
      return true;
    } catch (error) {
      console.error('Error testing Drive connection:', error);
      return false;
    }
  }

  // Obtener información del usuario y espacio de almacenamiento
  async getUserInfo(): Promise<any> {
    try {
      const response = await this.drive.about.get({
        fields: 'user, storageQuota'
      });
      
      return {
        email: response.data.user.emailAddress,
        displayName: response.data.user.displayName,
        photoLink: response.data.user.photoLink,
        storageQuota: response.data.storageQuota
      };
    } catch (error) {
      console.error('Error getting user info:', error);
      throw error;
    }
  }

  // Eliminar archivo específico
  async deleteFile(fileName: string): Promise<boolean> {
    try {
      const folderId = await this.ensurePlanifyFolder();

      const files = await this.drive.files.list({
        q: `name='${fileName}' and parents in '${folderId}' and trashed=false`,
        spaces: 'drive'
      });

      if (files.data.files && files.data.files.length > 0) {
        await this.drive.files.delete({
          fileId: files.data.files[0].id
        });
        console.log(`✅ Archivo eliminado: ${fileName}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
}

// Instancia singleton del servicio
export const driveService = new GoogleDriveService();