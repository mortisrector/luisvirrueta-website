import { NextRequest, NextResponse } from 'next/server';
import { User, AuthSession } from '@/types/auth';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

interface StoredUser extends User {
  passwordHash: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Función para leer usuarios
function getUsers(): StoredUser[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
}

// Función para crear sesión
function createSession(user: User): AuthSession {
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  
  return {
    user,
    token,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 días
  };
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email y contraseña son requeridos' 
      }, { status: 400 });
    }

    const users = getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email o contraseña incorrectos' 
      }, { status: 401 });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email o contraseña incorrectos' 
      }, { status: 401 });
    }

    // Verificar si el usuario está verificado
    if (!user.isVerified) {
      return NextResponse.json({ 
        success: false, 
        message: 'Tu cuenta no está verificada. Revisa tu email.',
        needsVerification: true
      }, { status: 401 });
    }

    // Crear sesión
    const { passwordHash, ...userWithoutPassword } = user;
    const session = createSession(userWithoutPassword);

    return NextResponse.json({ 
      success: true, 
      message: 'Inicio de sesión exitoso',
      session
    });

  } catch (error) {
    console.error('Error in login:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error interno del servidor' 
    }, { status: 500 });
  }
}