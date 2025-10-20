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

// POST - Sincronizar datos hacia Google Drive
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    const { folders, projects, tasks } = await request.json();

    // Configurar credenciales de Google Drive
    if (user.googleTokens) {
      driveService.setCredentials(user.googleTokens);
    } else {
      return NextResponse.json({
        success: false,
        message: 'Usuario no conectado a Google Drive'
      }, { status: 401 });
    }

    // Preparar datos para sincronización
    const syncData = {
      folders: folders || [],
      projects: projects || [],
      tasks: tasks || [],
      lastSync: new Date().toISOString(),
      version: '1.0.0'
    };

    // Sincronizar con Google Drive
    const success = await driveService.syncUserData(user.id, syncData);

    if (success) {
      console.log(`✅ Datos sincronizados exitosamente para ${user.email}`);
      return NextResponse.json({
        success: true,
        message: 'Datos sincronizados con Google Drive',
        lastSync: syncData.lastSync
      });
    } else {
      throw new Error('Error en sincronización');
    }

  } catch (error: any) {
    console.error('Error sincronizando datos:', error);
    
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
      message: 'Error sincronizando con Google Drive'
    }, { status: 500 });
  }
}

// GET - Cargar datos desde Google Drive
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

    // Cargar datos desde Google Drive
    const userData = await driveService.loadUserData(user.id);

    if (userData) {
      console.log(`✅ Datos cargados exitosamente para ${user.email}`);
      return NextResponse.json({
        success: true,
        data: userData,
        message: 'Datos cargados desde Google Drive'
      });
    } else {
      // Datos no existen, devolver estructura vacía
      const emptyData = {
        folders: [],
        projects: [],
        tasks: [],
        lastSync: new Date().toISOString(),
        version: '1.0.0'
      };

      return NextResponse.json({
        success: true,
        data: emptyData,
        message: 'Datos inicializados (primera sincronización)'
      });
    }

  } catch (error: any) {
    console.error('Error cargando datos:', error);
    
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
      message: 'Error cargando datos desde Google Drive'
    }, { status: 500 });
  }
}