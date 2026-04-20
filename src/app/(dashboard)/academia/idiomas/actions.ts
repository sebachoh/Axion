'use server';

import db from '@/infrastructure/db/sqlite';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

async function getUserId() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

export async function addLanguageTrack(formData: FormData) {
  const userId = await getUserId();
  const id = crypto.randomUUID();
  const name = formData.get('name') as string;
  const flag = formData.get('flag') as string || '🏳️';
  const description = formData.get('description') as string;
  const path = `/academia/idiomas/${name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`;

  if (!name) return { error: "El nombre es obligatorio" };

  try {
    db.prepare(`
      INSERT INTO user_languages (id, user_id, name, flag, description, path)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, userId, name, flag, description, path);

    revalidatePath('/academia/idiomas');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Error al añadir el idioma" };
  }
}

export async function deleteLanguageTrack(id: string) {
  const userId = await getUserId();
  try {
    db.prepare('DELETE FROM user_languages WHERE id = ? AND user_id = ?').run(id, userId);
    revalidatePath('/academia/idiomas');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Error al eliminar el idioma" };
  }
}
