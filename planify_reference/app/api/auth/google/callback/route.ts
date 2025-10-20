import { NextRequest, NextResponse } from 'next/server';
import { driveService } from '@/lib/googleDriveService';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Error en autorización Google:', error);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}?error=google_auth_failed`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}?error=no_code`
      );
    }

    // Intercambiar código por tokens
    const tokens = await driveService.getTokens(code);
    console.log('✅ Tokens obtenidos de Google');

    // Configurar credenciales en el servicio
    driveService.setCredentials(tokens);

    // Obtener información del usuario de Google
    const userInfo = await driveService.getUserInfo();
    console.log('✅ Información del usuario obtenida:', userInfo.email);

    // Verificar conexión con Drive
    const isConnected = await driveService.testConnection();
    if (!isConnected) {
      throw new Error('No se pudo conectar a Google Drive');
    }

    // Crear JWT con información del usuario y tokens de Google
    const userData = {
      id: userInfo.email, // Usar email como ID único
      email: userInfo.email,
      name: userInfo.displayName || userInfo.email.split('@')[0],
      avatar: userInfo.photoLink,
      provider: 'google',
      googleTokens: tokens,
      driveConnected: true,
      connectedAt: new Date().toISOString()
    };

    const sessionToken = jwt.sign(userData, JWT_SECRET, { expiresIn: '7d' });

    // Crear respuesta con redirección
    const redirectUrl = new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000');
    redirectUrl.searchParams.set('google_auth', 'success');
    redirectUrl.searchParams.set('token', sessionToken);

    const response = NextResponse.redirect(redirectUrl.toString());

    // Establecer cookie con el token
    response.cookies.set('planify_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 días
    });

    return response;

  } catch (error) {
    console.error('Error en callback de Google:', error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}?error=google_callback_failed`
    );
  }
}