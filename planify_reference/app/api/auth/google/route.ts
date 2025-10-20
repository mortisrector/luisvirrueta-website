import { NextRequest, NextResponse } from 'next/server';
import { driveService } from '@/lib/googleDriveService';

export async function GET(request: NextRequest) {
  try {
    // Obtener la URL de autorización de Google
    const authUrl = driveService.getAuthUrl();
    
    // Redirigir al usuario a Google para autorización
    return NextResponse.redirect(authUrl);
    
  } catch (error) {
    console.error('Error iniciando autenticación Google:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error iniciando autenticación con Google' 
    }, { status: 500 });
  }
}