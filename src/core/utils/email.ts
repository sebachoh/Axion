import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendVerificationEmail(email: string, token: string) {
  const confirmLink = `${process.env.NEXTAUTH_URL}/verify?token=${token}`;

  console.log('--- EMAIL SIMULATOR ---');
  console.log(`Para: ${email}`);
  console.log(`Link de Confirmación: ${confirmLink}`);
  console.log('-----------------------');

  if (resend) {
    try {
      await resend.emails.send({
        from: 'Axion <onboarding@resend.dev>',
        to: email,
        subject: 'Confirma tu cuenta en Axion',
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #1a1a1a;">
            <h2>Bienvenido a Axion</h2>
            <p>Haz clic en el siguiente enlace para verificar tu cuenta:</p>
            <a href="${confirmLink}" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 8px;">
              Verificar mi cuenta
            </a>
            <p style="margin-top: 20px; font-size: 0.8rem; color: #666;">Si no creaste esta cuenta, puedes ignorar este mensaje.</p>
          </div>
        `
      });
    } catch (error) {
      console.error('Error enviando email via Resend:', error);
    }
  }
}
