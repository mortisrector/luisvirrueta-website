import nodemailer from 'nodemailer';

// Configuración del transportador de email
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, // Tu email de Gmail
      pass: process.env.GMAIL_APP_PASSWORD // App Password de Gmail
    }
  });
};

// Plantilla HTML para código de verificación
const getVerificationEmailTemplate = (code: string, userEmail: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Código de Verificación - Planify</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .logo {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
            letter-spacing: -1px;
        }
        
        .subtitle {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 300;
        }
        
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        
        .welcome-text {
            font-size: 24px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 20px;
            line-height: 1.3;
        }
        
        .description {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 35px;
            line-height: 1.6;
        }
        
        .code-container {
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            border: 2px dashed #cbd5e0;
            border-radius: 16px;
            padding: 30px;
            margin: 30px 0;
            position: relative;
        }
        
        .code-label {
            font-size: 14px;
            color: #718096;
            margin-bottom: 10px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .verification-code {
            font-size: 36px;
            font-weight: 700;
            color: #667eea;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            margin: 15px 0;
            text-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);
        }
        
        .code-note {
            font-size: 13px;
            color: #a0aec0;
            margin-top: 15px;
        }
        
        .expire-warning {
            background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%);
            border-left: 4px solid #f56565;
            padding: 15px 20px;
            margin: 25px 0;
            border-radius: 8px;
            font-size: 14px;
            color: #c53030;
            font-weight: 500;
        }
        
        .instructions {
            background: linear-gradient(135deg, #e6fffa 0%, #b2f5ea 100%);
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            text-align: left;
        }
        
        .instructions h3 {
            color: #234e52;
            font-size: 18px;
            margin-bottom: 15px;
            font-weight: 600;
        }
        
        .step {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            font-size: 14px;
            color: #2d3748;
        }
        
        .step-number {
            background: #38b2ac;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            font-weight: 600;
            font-size: 12px;
        }
        
        .footer {
            background: #f7fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .footer-text {
            font-size: 14px;
            color: #718096;
            margin-bottom: 15px;
            line-height: 1.5;
        }
        
        .social-links {
            margin: 20px 0;
        }
        
        .social-link {
            display: inline-block;
            margin: 0 10px;
            padding: 8px 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            transition: transform 0.2s;
        }
        
        .brand-message {
            background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 600;
            font-size: 16px;
            margin-top: 20px;
        }
        
        .security-note {
            background: #f0fff4;
            border: 1px solid #9ae6b4;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            font-size: 13px;
            color: #22543d;
        }
        
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #cbd5e0, transparent);
            margin: 30px 0;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 16px;
            }
            
            .header, .content, .footer {
                padding: 25px 20px;
            }
            
            .verification-code {
                font-size: 28px;
                letter-spacing: 4px;
            }
            
            .welcome-text {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">✨ Planify</div>
            <div class="subtitle">Tu asistente de productividad personal</div>
        </div>
        
        <div class="content">
            <div class="welcome-text">¡Bienvenido a Planify! 🎉</div>
            
            <div class="description">
                Estás a un paso de unirte a miles de usuarios que han transformado su productividad. 
                Para completar tu registro, necesitamos verificar tu email.
            </div>
            
            <div class="code-container">
                <div class="code-label">Tu código de verificación</div>
                <div class="verification-code">${code}</div>
                <div class="code-note">Ingresa este código en la aplicación</div>
            </div>
            
            <div class="expire-warning">
                ⏰ Este código expira en 15 minutos por tu seguridad
            </div>
            
            <div class="instructions">
                <h3>📋 Pasos para completar tu registro:</h3>
                <div class="step">
                    <div class="step-number">1</div>
                    <div>Regresa a la aplicación Planify</div>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <div>Ingresa el código de 6 dígitos mostrado arriba</div>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <div>¡Comienza a organizar tu vida productiva!</div>
                </div>
            </div>
            
            <div class="security-note">
                🔒 <strong>Nota de seguridad:</strong> Si no solicitaste este código, puedes ignorar este email. 
                Tu cuenta permanecerá segura.
            </div>
            
            <div class="divider"></div>
            
            <div class="brand-message">
                "La productividad no es hacer más cosas, es hacer las cosas correctas"
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-text">
                ¿Tienes problemas? Estamos aquí para ayudarte.<br>
                Contáctanos respondiendo a este email.
            </div>
            
            <div class="social-links">
                <a href="#" class="social-link">📱 Descargar App</a>
                <a href="#" class="social-link">💬 Soporte</a>
                <a href="#" class="social-link">🌟 Blog</a>
            </div>
            
            <div class="footer-text">
                © 2025 Planify. Transformando vidas, una tarea a la vez.<br>
                Este email fue enviado a ${userEmail}
            </div>
        </div>
    </div>
</body>
</html>
`;

// Plantilla para email de bienvenida después de verificación
const getWelcomeEmailTemplate = (userName: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡Bienvenido a Planify!</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        body {
            font-family: 'Inter', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            margin: 0;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .success-icon {
            font-size: 48px;
            margin-bottom: 15px;
        }
        
        .header-title {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .header-subtitle {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        
        .welcome-message {
            font-size: 22px;
            color: #2d3748;
            margin-bottom: 25px;
            line-height: 1.4;
        }
        
        .features {
            text-align: left;
            margin: 30px 0;
        }
        
        .feature {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            padding: 15px;
            background: #f7fafc;
            border-radius: 12px;
        }
        
        .feature-icon {
            font-size: 24px;
            margin-right: 15px;
            width: 40px;
            text-align: center;
        }
        
        .feature-text {
            flex: 1;
        }
        
        .feature-title {
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 5px;
        }
        
        .feature-description {
            font-size: 14px;
            color: #4a5568;
        }
        
        .cta-button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 30px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 600;
            display: inline-block;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        
        .tips {
            background: linear-gradient(135deg, #fef5e7 0%, #fed7aa 100%);
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
            text-align: left;
        }
        
        .tips-title {
            color: #c05621;
            font-size: 18px;
            margin-bottom: 15px;
            font-weight: 600;
        }
        
        .tip {
            margin-bottom: 10px;
            font-size: 14px;
            color: #744210;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="success-icon">🎉</div>
            <div class="header-title">¡Cuenta Verificada!</div>
            <div class="header-subtitle">Bienvenido a la familia Planify</div>
        </div>
        
        <div class="content">
            <div class="welcome-message">
                Hola ${userName},<br><br>
                ¡Tu cuenta ha sido verificada exitosamente! Ahora puedes disfrutar de todas las 
                funcionalidades premium de Planify.
            </div>
            
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">📋</div>
                    <div class="feature-text">
                        <div class="feature-title">Organización Inteligente</div>
                        <div class="feature-description">Carpetas, proyectos y tareas con seguimiento automático</div>
                    </div>
                </div>
                
                <div class="feature">
                    <div class="feature-icon">⏱️</div>
                    <div class="feature-text">
                        <div class="feature-title">Tracking de Tiempo</div>
                        <div class="feature-description">Monitorea tu productividad con sesiones cronometradas</div>
                    </div>
                </div>
                
                <div class="feature">
                    <div class="feature-icon">📊</div>
                    <div class="feature-text">
                        <div class="feature-title">Analytics Detallados</div>
                        <div class="feature-description">Estadísticas y métricas de tu progreso diario</div>
                    </div>
                </div>
                
                <div class="feature">
                    <div class="feature-icon">☁️</div>
                    <div class="feature-text">
                        <div class="feature-title">Backup Automático</div>
                        <div class="feature-description">Tus datos seguros y sincronizados en la nube</div>
                    </div>
                </div>
            </div>
            
            <a href="#" class="cta-button">🚀 Comenzar mi Jornada Productiva</a>
            
            <div class="tips">
                <div class="tips-title">💡 Consejos para empezar:</div>
                <div class="tip">• Crea tu primera carpeta para organizar tus proyectos</div>
                <div class="tip">• Establece objetivos claros para cada proyecto</div>
                <div class="tip">• Usa el cronómetro para sesiones de enfoque profundo</div>
                <div class="tip">• Revisa tus estadísticas semanalmente</div>
            </div>
        </div>
        
        <div class="footer" style="background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <div style="font-size: 14px; color: #718096; margin-bottom: 15px;">
                ¿Necesitas ayuda? Estamos aquí para ti.<br>
                Responde a este email o visita nuestro centro de ayuda.
            </div>
            
            <div style="font-size: 12px; color: #a0aec0; margin-top: 20px;">
                © 2025 Planify - Transformando vidas, una tarea a la vez.
            </div>
        </div>
    </div>
</body>
</html>
`;

// Plantilla HTML para recuperación de contraseña
const getPasswordResetEmailTemplate = (code: string, userEmail: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperar Contraseña - Planify</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', Arial, sans-serif;
            background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%);
            padding: 20px;
            min-height: 100vh;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .logo {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .tagline {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 300;
        }
        
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        
        .title {
            font-size: 28px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 20px;
        }
        
        .message {
            font-size: 16px;
            color: #4a5568;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        
        .code-container {
            background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%);
            padding: 30px;
            border-radius: 15px;
            margin: 30px 0;
            position: relative;
            overflow: hidden;
        }
        
        .code-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.2) 0%, transparent 50%);
        }
        
        .code-label {
            color: white;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 15px;
            opacity: 0.9;
            position: relative;
            z-index: 1;
        }
        
        .code {
            color: white;
            font-size: 36px;
            font-weight: 700;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            position: relative;
            z-index: 1;
        }
        
        .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            color: #856404;
        }
        
        .warning-icon {
            font-size: 20px;
            margin-bottom: 10px;
        }
        
        .warning-text {
            font-size: 14px;
            line-height: 1.5;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
            line-height: 1.6;
        }
        
        .footer-title {
            font-weight: 600;
            color: #495057;
            margin-bottom: 15px;
        }
        
        .highlight {
            color: #ff6b6b;
            font-weight: 600;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 10px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .code {
                font-size: 28px;
                letter-spacing: 4px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🔐 Planify</div>
            <div class="tagline">Recuperación de Contraseña</div>
        </div>
        
        <div class="content">
            <h1 class="title">¿Olvidaste tu contraseña?</h1>
            
            <p class="message">
                No te preocupes, recibimos tu solicitud para restablecer la contraseña de tu cuenta 
                <span class="highlight">${userEmail}</span>
            </p>
            
            <div class="code-container">
                <div class="code-label">TU CÓDIGO DE RECUPERACIÓN</div>
                <div class="code">${code}</div>
            </div>
            
            <div class="warning">
                <div class="warning-icon">⚠️</div>
                <div class="warning-text">
                    <strong>Importante:</strong> Este código expira en <strong>15 minutos</strong> por motivos de seguridad. 
                    Si no solicitaste este cambio, ignora este email y tu contraseña seguirá siendo la misma.
                </div>
            </div>
            
            <p class="message">
                Ingresa este código en la aplicación para crear una nueva contraseña segura.
            </p>
        </div>
        
        <div class="footer">
            <div class="footer-title">🛡️ Tu seguridad es nuestra prioridad</div>
            <div>
                Si tienes problemas o no solicitaste este cambio, contáctanos inmediatamente.
                <br>
                <strong>Nunca compartas este código con nadie.</strong>
            </div>
            <div style="font-size: 12px; color: #a0aec0; margin-top: 20px;">
                © 2025 Planify - Transformando vidas, una tarea a la vez.
            </div>
        </div>
    </div>
</body>
</html>
`;

// Función para enviar email de verificación
export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'Planify App',
        address: process.env.GMAIL_USER || 'noreply@planify.app'
      },
      to: email,
      subject: '🔐 Tu código de verificación para Planify',
      html: getVerificationEmailTemplate(code, email),
      text: `Tu código de verificación para Planify es: ${code}. Este código expira en 15 minutos.`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email de verificación enviado a ${email}:`, info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email de verificación:', error);
    return false;
  }
}

// Función para enviar email de bienvenida
export async function sendWelcomeEmail(email: string, userName: string): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'Planify App',
        address: process.env.GMAIL_USER || 'noreply@planify.app'
      },
      to: email,
      subject: '🎉 ¡Bienvenido a Planify! Tu cuenta está lista',
      html: getWelcomeEmailTemplate(userName),
      text: `¡Hola ${userName}! Bienvenido a Planify. Tu cuenta ha sido verificada exitosamente y ya puedes comenzar a organizar tu productividad.`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email de bienvenida enviado a ${email}:`, info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email de bienvenida:', error);
    return false;
  }
}

// Función para enviar email de recuperación de contraseña
export async function sendPasswordResetEmail(email: string, code: string): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'Planify App',
        address: process.env.GMAIL_USER || 'noreply@planify.app'
      },
      to: email,
      subject: '🔐 Recuperar contraseña - Código de verificación',
      html: getPasswordResetEmailTemplate(code, email),
      text: `Tu código de recuperación para Planify es: ${code}. Este código expira en 15 minutos. Si no solicitaste este cambio, ignora este email.`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email de recuperación enviado a ${email}:`, info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email de recuperación:', error);
    return false;
  }
}