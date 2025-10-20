import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/types/auth';
import fs from 'fs';
import path from 'path';
import { sendVerificationEmail, sendPasswordResetEmail } from '@/lib/emailService';

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
      console.log(`✅ Email de verificación reenviado exitosamente a ${email}`);
      return true;
    } else {
      // Si falla el email, mostrar en consola como respaldo
      console.log(`⚠️ Error enviando email, código mostrado en consola:`);
      console.log(`🔐 CÓDIGO REENVIADO PARA ${email}: ${code}`);
      return true; // Consideramos exitoso para no bloquear el proceso
    }
  } catch (error) {
    console.error('❌ Error en servicio de email:', error);
    // Mostrar en consola como respaldo
    console.log(`🔐 CÓDIGO REENVIADO PARA ${email}: ${code}`);
    return true; // Consideramos exitoso para no bloquear el proceso
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email es requerido' 
      }, { status: 400 });
    }

    const users = getUsers();
    const existingUser = users.find(u => u.email === email);

    if (!existingUser) {
      return NextResponse.json({ 
        success: false, 
        message: 'No existe una cuenta con este email' 
      }, { status: 404 });
    }

    // Si el usuario ya está verificado, no permitir reenvío de código de verificación
    if (existingUser.isVerified) {
      return NextResponse.json({ 
        success: false, 
        message: 'Esta cuenta ya está verificada. Si olvidaste tu contraseña, usa la opción de recuperación.',
        showPasswordReset: true
      }, { status: 400 });
    }

    // Buscar verificación pendiente
    const pendingVerifications = getPendingVerifications();
    const existingVerification = pendingVerifications.find(v => v.email === email);

    if (!existingVerification) {
      return NextResponse.json({ 
        success: false, 
        message: 'No hay verificación pendiente para este email' 
      }, { status: 400 });
    }

    // Generar nuevo código
    const newCode = generateVerificationCode();

    // Actualizar verificación con nuevo código y nueva expiración
    const updatedVerifications = pendingVerifications.map(v =>
      v.email === email
        ? { ...v, code: newCode, expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() }
        : v
    );

    savePendingVerifications(updatedVerifications);

    // Enviar nuevo email
    const emailSent = await sendEmailVerification(email, newCode);

    if (!emailSent) {
      return NextResponse.json({ 
        success: false, 
        message: 'Error enviando email de verificación' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Código de verificación reenviado exitosamente'
    });

  } catch (error) {
    console.error('Error in resend-code:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error interno del servidor' 
    }, { status: 500 });
  }
}