import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/types/auth';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface StoredUser extends User {
  passwordHash: string;
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

// Función para obtener usuario del token
function getUserFromToken(request: NextRequest): string | null {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = getUserFromToken(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      }, { status: 404 });
    }

    // Actualizar usuario
    const updatedUser = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    users[userIndex] = updatedUser;
    saveUsers(users);

    // Retornar usuario sin contraseña
    const { passwordHash, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({ 
      success: true, 
      message: 'Perfil actualizado exitosamente',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error interno del servidor' 
    }, { status: 500 });
  }
}