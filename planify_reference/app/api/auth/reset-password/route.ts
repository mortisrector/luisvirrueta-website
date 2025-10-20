import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/types/auth';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

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

// Función para guardar usuarios
function saveUsers(users: StoredUser[]): void {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
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

export async function POST(request: NextRequest) {
  try {
    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email, código y nueva contraseña son requeridos' 
      }, { status: 400 });
    }

    // Validar que la nueva contraseña sea segura
    if (newPassword.length < 6) {
      return NextResponse.json({ 
        success: false, 
        message: 'La contraseña debe tener al menos 6 caracteres' 
      }, { status: 400 });
    }

    const passwordResets = getPasswordResets();
    const resetRecord = passwordResets.find(r => r.email === email);

    if (!resetRecord) {
      return NextResponse.json({ 
        success: false, 
        message: 'No hay solicitud de recuperación para este email' 
      }, { status: 404 });
    }

    // Verificar si el código ha expirado
    if (new Date() > new Date(resetRecord.expiresAt)) {
      // Remover el reset expirado
      const filteredResets = passwordResets.filter(r => r.email !== email);
      savePasswordResets(filteredResets);
      
      return NextResponse.json({ 
        success: false, 
        message: 'El código de recuperación ha expirado. Solicita uno nuevo.' 
      }, { status: 400 });
    }

    // Verificar el código
    if (resetRecord.code !== code) {
      return NextResponse.json({ 
        success: false, 
        message: 'Código de recuperación incorrecto' 
      }, { status: 400 });
    }

    // Buscar el usuario
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === email);

    if (userIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      }, { status: 404 });
    }

    // Cambiar la contraseña
    const passwordHash = await bcrypt.hash(newPassword, 12);
    users[userIndex].passwordHash = passwordHash;
    users[userIndex].updatedAt = new Date().toISOString();

    // Guardar cambios
    saveUsers(users);

    // Remover el reset utilizado
    const filteredResets = passwordResets.filter(r => r.email !== email);
    savePasswordResets(filteredResets);

    console.log(`✅ Contraseña cambiada exitosamente para ${email}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Contraseña cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.'
    });

  } catch (error) {
    console.error('Error in reset-password:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error interno del servidor' 
    }, { status: 500 });
  }
}