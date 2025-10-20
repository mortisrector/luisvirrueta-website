import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // En una implementación real, aquí invalidarías el token en la base de datos
    // Por ahora, simplemente retornamos éxito ya que el logout se maneja en el cliente
    
    return NextResponse.json({ 
      success: true, 
      message: 'Sesión cerrada exitosamente'
    });

  } catch (error) {
    console.error('Error in logout:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error interno del servidor' 
    }, { status: 500 });
  }
}