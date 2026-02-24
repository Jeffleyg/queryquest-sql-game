import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(email: string, token: string, username: string): Promise<void> {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: email,
    subject: '🎮 Verify Your QueryQuest Account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #1e2139; color: #fff; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1e2139 0%, #2a2d4a 100%); border-radius: 16px; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 48px; }
          h1 { color: #a78bfa; margin: 20px 0; }
          .content { line-height: 1.6; color: #8b92b8; }
          .button { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #a78bfa 100%); color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #3a3f5c; color: #8b92b8; font-size: 14px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎮</div>
            <h1>Welcome to QueryQuest!</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${username}</strong>,</p>
            <p>Thank you for joining QueryQuest, the ultimate SQL learning adventure!</p>
            <p>To start your journey and unlock all missions, please verify your email address by clicking the button below:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; word-break: break-all; font-family: monospace; font-size: 12px;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p><strong>Get ready to:</strong></p>
            <ul>
              <li>🎯 Complete 30 challenging SQL missions</li>
              <li>⚡ Earn XP and level up</li>
              <li>📚 Learn from basic to advanced SQL</li>
              <li>🏆 Track your progress</li>
            </ul>
          </div>
          <div class="footer">
            <p>If you didn't create this account, please ignore this email.</p>
            <p>© 2026 QueryQuest - Master SQL Through Adventure</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendPasswordResetEmail(email: string, token: string, username: string): Promise<void> {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: email,
    subject: '🔐 Reset Your QueryQuest Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #1e2139; color: #fff; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1e2139 0%, #2a2d4a 100%); border-radius: 16px; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 48px; }
          h1 { color: #a78bfa; margin: 20px 0; }
          .content { line-height: 1.6; color: #8b92b8; }
          .button { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #a78bfa 100%); color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #3a3f5c; color: #8b92b8; font-size: 14px; text-align: center; }
          .warning { background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; padding: 12px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🔐</div>
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${username}</strong>,</p>
            <p>We received a request to reset your QueryQuest password.</p>
            <p>Click the button below to create a new password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; word-break: break-all; font-family: monospace; font-size: 12px;">${resetUrl}</p>
            <div class="warning">
              <p><strong>⚠️ Security Notice:</strong></p>
              <p>This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
            </div>
          </div>
          <div class="footer">
            <p>© 2026 QueryQuest - Master SQL Through Adventure</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}
