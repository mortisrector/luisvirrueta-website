import { NextRequest, NextResponse } from 'next/server';
import { User, AuthSession } from '@/types/auth';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendWelcomeEmail } from '@/lib/emailService';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PENDING_VERIFICATIONS_FILE = path.join(DATA_DIR, 'pending_verifications.json');

interface StoredUser extends User {
  passwordHash: string;
}

interface PendingVerification {
  email: string;
  code: string;
  passwordHash: string;
  name?: string;
  expiresAt: string;
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

// Función para guardar usuarios
function saveUsers(users: StoredUser[]): void {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Función para leer verificaciones pendientes
function getPendingVerifications(): PendingVerification[] {
  try {
    if (fs.existsSync(PENDING_VERIFICATIONS_FILE)) {
      const data = fs.readFileSync(PENDING_VERIFICATIONS_FILE, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error reading pending verifications:', error);
    return [];
  }
}

// Función para guardar verificaciones pendientes
function savePendingVerifications(verifications: PendingVerification[]): void {
  fs.writeFileSync(PENDING_VERIFICATIONS_FILE, JSON.stringify(verifications, null, 2));
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
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email y código son requeridos' 
      }, { status: 400 });
    }

    const pendingVerifications = getPendingVerifications();
    const verification = pendingVerifications.find(v => v.email === email && v.code === code);

    if (!verification) {
      return NextResponse.json({ 
        success: false, 
        message: 'Código de verificación inválido' 
      }, { status: 400 });
    }

    // Verificar si el código no ha expirado
    if (new Date() > new Date(verification.expiresAt)) {
      return NextResponse.json({ 
        success: false, 
        message: 'El código de verificación ha expirado' 
      }, { status: 400 });
    }

    // Crear el usuario
    const users = getUsers();
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      email: verification.email,
      name: verification.name || verification.email.split('@')[0],
      passwordHash: verification.passwordHash,
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    // Remover verificación pendiente
    const remainingVerifications = pendingVerifications.filter(v => v.email !== email);
    savePendingVerifications(remainingVerifications);

    // Enviar email de bienvenida
    try {
      await sendWelcomeEmail(newUser.email, newUser.name || 'Usuario');
      console.log(`✅ Email de bienvenida enviado a ${newUser.email}`);
    } catch (error) {
      console.error('⚠️ Error enviando email de bienvenida:', error);
      // No fallar la verificación por esto
    }

    // Crear sesión
    const { passwordHash, ...userWithoutPassword } = newUser;
    const session = createSession(userWithoutPassword);

    return NextResponse.json({ 
      success: true, 
      message: 'Cuenta verificada exitosamente',
      session
    });

  } catch (error) {
    console.error('Error in verify:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error interno del servidor' 
    }, { status: 500 });
  }
}