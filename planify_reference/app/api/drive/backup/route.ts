import { NextRequest, NextResponse } from 'next/server';
import { driveService } from '@/lib/googleDriveService';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Función para obtener usuario desde token
function getUserFromToken(request: NextRequest) {
  try {
    const token = request.cookies.get('planify_session')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// POST - Crear backup completo
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    const { folders, projects, tasks, type = 'manual' } = await request.json();

    // Configurar credenciales de Google Drive
    if (user.googleTokens) {
      driveService.setCredentials(user.googleTokens);
    } else {
      return NextResponse.json({
        success: false,
        message: 'Usuario no conectado a Google Drive'
      }, { status: 401 });
    }

    // Preparar datos para backup
    const backupData = {
      folders: folders || [],
      projects: projects || [],
      tasks: tasks || [],
      lastSync: new Date().toISOString(),
      version: '1.0.0',
      backupType: type,
      userInfo: {
        email: user.email,
        name: user.name,
        createdAt: new Date().toISOString()
      }
    };

    // Crear backup en Google Drive
    const fileId = await driveService.createBackup(user.id, backupData);

    console.log(`✅ Backup creado exitosamente para ${user.email}: ${fileId}`);
    
    return NextResponse.json({
      success: true,
      message: 'Backup creado exitosamente en Google Drive',
      fileId: fileId,
      backupDate: backupData.lastSync
    });

  } catch (error: any) {
    console.error('Error creando backup:', error);
    
    // Manejar errores específicos de tokens expirados
    if (error.message?.includes('invalid_grant') || error.code === 401) {
      return NextResponse.json({
        success: false,
        message: 'Sesión de Google Drive expirada',
        requiresReauth: true
      }, { status: 401 });
    }

    return NextResponse.json({
      success: false,
      message: 'Error creando backup en Google Drive'
    }, { status: 500 });
  }
}

// GET - Listar backups disponibles
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request);

    // Configurar credenciales de Google Drive
    if (user.googleTokens) {
      driveService.setCredentials(user.googleTokens);
    } else {
      return NextResponse.json({
        success: false,
        message: 'Usuario no conectado a Google Drive'
      }, { status: 401 });
    }

    // Listar archivos de Planify
    const files = await driveService.listPlanifyFiles();
    
    // Filtrar solo backups
    const backups = files.filter(file => 
      file.name.startsWith(`backup_${user.id}_`)
    );

    console.log(`✅ ${backups.length} backups encontrados para ${user.email}`);
    
    return NextResponse.json({
      success: true,
      backups: backups.map(backup => ({
        id: backup.id,
        name: backup.name,
        date: backup.modifiedTime,
        size: backup.size
      })),
      message: 'Backups cargados exitosamente'
    });

  } catch (error: any) {
    console.error('Error listando backups:', error);
    
    if (error.message?.includes('invalid_grant') || error.code === 401) {
      return NextResponse.json({
        success: false,
        message: 'Sesión de Google Drive expirada',
        requiresReauth: true
      }, { status: 401 });
    }

    return NextResponse.json({
      success: false,
      message: 'Error listando backups desde Google Drive'
    }, { status: 500 });
  }
}