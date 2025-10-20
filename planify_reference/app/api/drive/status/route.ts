import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        connected: false, 
        error: 'No authenticated' 
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ 
        connected: false, 
        error: 'Invalid token' 
      }, { status: 401 });
    }

    // Verificar si hay una cookie de Google Drive (indica conexión)
    const planifySession = request.cookies.get('planify_session');
    
    if (planifySession) {
      return NextResponse.json({ 
        connected: true,
        message: 'Google Drive conectado'
      });
    } else {
      return NextResponse.json({ 
        connected: false,
        message: 'Google Drive no conectado'
      });
    }

  } catch (error) {
    console.error('Error checking Google Drive status:', error);
    return NextResponse.json({ 
      connected: false, 
      error: 'Error interno' 
    }, { status: 500 });
  }
}