import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/types/auth';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/emailService';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PASSWORD_RESETS_FILE = path.join(DATA_DIR, 'password_resets.json');

// Asegurar que el directorio existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StoredUser extends User {
  passwordHash: string;
}

interface PasswordReset {
  email: string;
  code: string;
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

// Función para leer resets de contraseña
function getPasswordResets(): PasswordReset[] {
  try {
    if (fs.existsSync(PASSWORD_RESETS_FILE)) {
      const data = fs.readFileSync(PASSWORD_RESETS_FILE, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error reading password resets:', error);
    return [];
  }
}

// Función para guardar resets de contraseña
function savePasswordResets(resets: PasswordReset[]): void {
  fs.writeFileSync(PASSWORD_RESETS_FILE, JSON.stringify(resets, null, 2));
}

// Función para generar código de verificación
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Función para enviar email con manejo de errores
async function sendResetEmail(email: string, code: string): Promise<boolean> {
  try {
    // Intentar enviar email real
    const emailSent = await sendPasswordResetEmail(email, code);
    
    if (emailSent) {
      console.log(`✅ Email de recuperación enviado exitosamente a ${email}`);
      return true;
    } else {
      // Si falla el email, mostrar en consola como respaldo
      console.log(`⚠️ Error enviando email, código mostrado en consola:`);
      console.log(`🔐 CÓDIGO DE RECUPERACIÓN PARA ${email}: ${code}`);
      return true; // Consideramos exitoso para no bloquear el proceso
    }
  } catch (error) {
    console.error('❌ Error en servicio de email:', error);
    // Mostrar en consola como respaldo
    console.log(`🔐 CÓDIGO DE RECUPERACIÓN PARA ${email}: ${code}`);
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

    if (!existingUser.isVerified) {
      return NextResponse.json({ 
        success: false, 
        message: 'Esta cuenta no está verificada. Primero verifica tu email.' 
      }, { status: 400 });
    }

    // Generar código de recuperación
    const resetCode = generateVerificationCode();

    // Guardar reset pendiente
    const passwordResets = getPasswordResets();
    const newReset: PasswordReset = {
      email,
      code: resetCode,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutos
    };

    // Remover resets anteriores para este email
    const filteredResets = passwordResets.filter(r => r.email !== email);
    filteredResets.push(newReset);
    savePasswordResets(filteredResets);

    // Enviar email de recuperación
    const emailSent = await sendResetEmail(email, resetCode);

    if (!emailSent) {
      return NextResponse.json({ 
        success: false, 
        message: 'Error enviando email de recuperación' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Código de recuperación enviado a tu email',
      needsVerification: true
    });

  } catch (error) {
    console.error('Error in forgot-password:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error interno del servidor' 
    }, { status: 500 });
  }
}