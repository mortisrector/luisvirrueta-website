import { NextRequest, NextResponse } from 'next/server';
import { User, AuthSession } from '@/types/auth';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendVerificationEmail, sendWelcomeEmail } from '@/lib/emailService';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PENDING_VERIFICATIONS_FILE = path.join(DATA_DIR, 'pending_verifications.json');

// Asegurar que el directorio existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

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

// Función para generar código de verificación
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Función para enviar email con manejo de errores
async function sendEmailVerification(email: string, code: string): Promise<boolean> {
  try {
    // Intentar enviar email real
    const emailSent = await sendVerificationEmail(email, code);
    
    if (emailSent) {
      console.log(`✅ Email de verificación enviado exitosamente a ${email}`);
      return true;
    } else {
      // Si falla el email, mostrar en consola como respaldo
      console.log(`⚠️ Error enviando email, código mostrado en consola:`);
      console.log(`🔐 CÓDIGO DE VERIFICACIÓN PARA ${email}: ${code}`);
      return true; // Consideramos exitoso para no bloquear el registro
    }
  } catch (error) {
    console.error('❌ Error en servicio de email:', error);
    // Mostrar en consola como respaldo
    console.log(`🔐 CÓDIGO DE VERIFICACIÓN PARA ${email}: ${code}`);
    return true; // Consideramos exitoso para no bloquear el registro
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
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email y contraseña son requeridos' 
      }, { status: 400 });
    }

    const users = getUsers();
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
      // Verificar si el usuario está verificado
      if (existingUser.isVerified) {
        return NextResponse.json({ 
          success: false, 
          message: 'Esta cuenta ya está registrada y verificada. ¿Olvidaste tu contraseña?',
          userExists: true,
          isVerified: true,
          showPasswordReset: true
        }, { status: 400 });
      } else {
        // Usuario existe pero no está verificado - permitir reenvío
        return NextResponse.json({ 
          success: false, 
          message: 'Esta cuenta ya está registrada pero no verificada. ¿Quieres reenviar el código?',
          userExists: true,
          isVerified: false,
          showResendCode: true
        }, { status: 400 });
      }
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 12);

    // Generar código de verificación
    const verificationCode = generateVerificationCode();

    // Guardar verificación pendiente
    const pendingVerifications = getPendingVerifications();
    const newVerification: PendingVerification = {
      email,
      code: verificationCode,
      passwordHash,
      name,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutos
    };

    // Remover verificaciones anteriores para este email
    const filteredVerifications = pendingVerifications.filter(v => v.email !== email);
    filteredVerifications.push(newVerification);
    savePendingVerifications(filteredVerifications);

    // Enviar email de verificación
    const emailSent = await sendEmailVerification(email, verificationCode);

    if (!emailSent) {
      return NextResponse.json({ 
        success: false, 
        message: 'Error enviando email de verificación' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Código de verificación enviado a tu email',
      needsVerification: true
    });

  } catch (error) {
    console.error('Error in register:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error interno del servidor' 
    }, { status: 500 });
  }
}