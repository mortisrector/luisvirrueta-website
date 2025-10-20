export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  // Propiedades para Google Drive
  provider?: 'local' | 'google';
  driveConnected?: boolean;
  googleTokens?: any;
  connectedAt?: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface VerificationRequest {
  email: string;
  code: string;
}

export interface BackupData {
  id: string;
  userId: string;
  fileName: string;
  size: number;
  createdAt: string;
  driveFileId?: string; // Para Google Drive
}

export interface GoogleDriveConfig {
  clientId: string;
  apiKey: string;
  scope: string;
}