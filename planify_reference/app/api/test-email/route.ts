import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { gmailUser, gmailPassword } = await request.json();

    if (!gmailUser || !gmailPassword) {
      return NextResponse.json({ 
        success: false, 
        message: 'Credenciales de Gmail requeridas' 
      }, { status: 400 });
    }

    // Crear transportador temporal con las credenciales proporcionadas
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPassword
      }
    });

    // Plantilla HTML simple para email de prueba
    const testEmailHTML = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email de Prueba - Planify</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0;
                padding: 20px;
            }
            .container {
                max-width: 500px;
                margin: 0 auto;
                background: white;
                border-radius: 20px;
                padding: 40px 30px;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            }
            .header {
                font-size: 48px;
                margin-bottom: 20px;
            }
            .title {
                font-size: 24px;
                font-weight: bold;
                color: #2d3748;
                margin-bottom: 15px;
            }
            .message {
                font-size: 16px;
                color: #4a5568;
                line-height: 1.6;
                margin-bottom: 25px;
            }
            .success-badge {
                background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
                color: white;
                padding: 12px 24px;
                border-radius: 50px;
                font-weight: bold;
                display: inline-block;
                margin: 15px 0;
            }
            .footer {
                font-size: 14px;
                color: #718096;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
            }
            .brand {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                font-weight: bold;
                font-size: 18px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">🚀</div>
            <div class="title">¡Configuración Exitosa!</div>
            <div class="message">
                Tu configuración de email ha sido probada exitosamente. 
                Planify ahora puede enviar emails de verificación y bienvenida 
                a través de tu cuenta de Gmail.
            </div>
            <div class="success-badge">✅ Email funcionando correctamente</div>
            <div class="footer">
                Este es un email de prueba enviado por<br>
                <div class="brand">✨ Planify</div>
                <br>
                ${new Date().toLocaleString('es-ES')}
            </div>
        </div>
    </body>
    </html>
    `;

    // Enviar email de prueba
    const mailOptions = {
      from: {
        name: 'Planify App - Prueba',
        address: gmailUser
      },
      to: gmailUser, // Se envía a sí mismo como prueba
      subject: '🧪 Email de Prueba - Configuración Planify',
      html: testEmailHTML,
      text: '¡Configuración exitosa! Tu email está funcionando correctamente con Planify.'
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Email de prueba enviado exitosamente:`, info.messageId);

    return NextResponse.json({ 
      success: true, 
      message: 'Email de prueba enviado exitosamente',
      messageId: info.messageId
    });

  } catch (error: any) {
    console.error('❌ Error enviando email de prueba:', error);
    
    let errorMessage = 'Error desconocido enviando email';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Error de autenticación: Verifica tu email y contraseña de aplicación';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Error de conexión: Verifica tu conexión a internet';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json({ 
      success: false, 
      message: errorMessage,
      error: error.code || 'UNKNOWN_ERROR'
    }, { status: 500 });
  }
}