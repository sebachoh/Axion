'use server';

import db from '@/infrastructure/db/sqlite';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/core/utils/email';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(formData: FormData) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Credenciales inválidas.' };
        default:
          // Check for the custom error thrown in authorize()
          if (error.cause?.err?.message) {
             return { error: error.cause.err.message };
          }
          return { error: 'Error al iniciar sesión.' };
      }
    }
    throw error;
  }
}

export async function registerUser(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;

  if (!email || !password || !name) {
    return { error: "Todos los campos son obligatorios" };
  }

  // Check if user exists
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existingUser) {
    return { error: "El correo ya está registrado" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const id = crypto.randomUUID();
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  try {
    db.prepare(`
      INSERT INTO users (id, email, password, name, verification_token)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, email, hashedPassword, name, token);

    await sendVerificationEmail(email, token);

    return { success: "Te hemos enviado un correo de confirmación." };
  } catch (e) {
    console.error(e);
    return { error: "Error al registrar el usuario" };
  }
}

export async function verifyEmail(token: string) {
  const user = db.prepare('SELECT id FROM users WHERE verification_token = ?').get(token) as any;

  if (!user) {
    return { error: "Token de verificación inválido" };
  }

  try {
    db.prepare(`
      UPDATE users 
      SET email_verified = CURRENT_TIMESTAMP, verification_token = NULL 
      WHERE id = ?
    `).run(user.id);

    return { success: "Correo verificado con éxito. Ya puedes iniciar sesión." };
  } catch (e) {
    console.error(e);
    return { error: "Error al verificar el correo" };
  }
}
