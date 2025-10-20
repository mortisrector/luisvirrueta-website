'use client';

import { Project, Folder, DailyTask } from '@/types';
import { authService } from './auth';

// Base de datos universal que detecta automáticamente si usar Google Drive o local
const API_BASE = '/api/data';
const DRIVE_API_BASE = '/api/drive';

interface DatabaseResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class UniversalDatabase {
  // Cache para el estado de Google Drive (TTL: 60 segundos)
  private static driveStatusCache: { connected: boolean; timestamp: number } | null = null;
  private static readonly CACHE_TTL = 60000; // 60 segundos

  // Verificar si el usuario tiene Google Drive conectado (con caché)
  private static async hasGoogleDriveConnected(): Promise<boolean> {
    // DESHABILITADO: Forzar uso de sistema local siempre
    // Puedes habilitar Google Drive cambiando este return a true cuando las APIs estén listas
    return false;
  }
  
  // Método para limpiar el caché manualmente (útil cuando el usuario conecta/desconecta Drive)
  static clearDriveCache(): void {
    this.driveStatusCache = null;
  }

  // Obtener headers de autenticación
  private static getAuthHeaders(): HeadersInit {
    const session = authService.getCurrentSession();
    return {
      'Content-Type': 'application/json',
      'Authorization': session ? `Bearer ${session.token}` : ''
    };
  }

  // Folders
  static async getFolders(): Promise<Folder[]> {
    try {
      const useGoogleDrive = await this.hasGoogleDriveConnected();
      const apiBase = useGoogleDrive ? DRIVE_API_BASE : API_BASE;
      
      console.log(`📁 Cargando folders desde: ${useGoogleDrive ? 'Google Drive' : 'Local'}`);
      
      const response = await fetch(`${apiBase}/folders`, {
        headers: this.getAuthHeaders()
      });
      const result: DatabaseResponse<Folder[]> = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching folders:', error);
      return [];
    }
  }

  static async saveFolders(folders: Folder[]): Promise<boolean> {
    // DESHABILITADO: No hacer requests a APIs, solo retornar true
    // Los datos se guardan en localStorage y JSON via useUniversalData
    return true;
  }

  // Projects
  static async getProjects(): Promise<Project[]> {
    try {
      const useGoogleDrive = await this.hasGoogleDriveConnected();
      const apiBase = useGoogleDrive ? DRIVE_API_BASE : API_BASE;
      
      console.log(`📋 Cargando projects desde: ${useGoogleDrive ? 'Google Drive' : 'Local'}`);
      
      const response = await fetch(`${apiBase}/projects`, {
        headers: this.getAuthHeaders()
      });
      const result: DatabaseResponse<Project[]> = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  }

  static async saveProjects(projects: Project[]): Promise<boolean> {
    // DESHABILITADO: No hacer requests a APIs, solo retornar true
    // Los datos se guardan en localStorage y JSON via useUniversalData
    return true;
  }

  // Tasks
  static async getTasks(): Promise<DailyTask[]> {
    try {
      const useGoogleDrive = await this.hasGoogleDriveConnected();
      const apiBase = useGoogleDrive ? DRIVE_API_BASE : API_BASE;
      
      console.log(`✅ Cargando tasks desde: ${useGoogleDrive ? 'Google Drive' : 'Local'}`);
      
      const response = await fetch(`${apiBase}/tasks`, {
        headers: this.getAuthHeaders()
      });
      const result: DatabaseResponse<DailyTask[]> = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  }

  static async saveTasks(tasks: DailyTask[]): Promise<boolean> {
    // DESHABILITADO: No hacer requests a APIs, solo retornar true
    // Los datos se guardan en localStorage y JSON via useUniversalData
    return true;
  }
}