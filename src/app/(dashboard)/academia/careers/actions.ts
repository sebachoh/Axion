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

export async function addSpecialization(formData: FormData) {
  const userId = await getUserId();
  const id = crypto.randomUUID();
  const title = formData.get('title') as string;
  const shortCode = (formData.get('shortCode') as string || title.substring(0, 2)).toUpperCase();
  const description = formData.get('description') as string;
  const colorStart = formData.get('colorStart') as string || '#A1C4FD';
  const colorEnd = formData.get('colorEnd') as string || '#C2E9FB';

  if (!title) return { error: "El título es obligatorio" };

  try {
    db.prepare(`
      INSERT INTO user_specializations (id, user_id, title, short_code, description, color_start, color_end)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, shortCode, title, description, colorStart, colorEnd);

    revalidatePath('/academia/careers');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Error al crear la especialización" };
  }
}

export async function deleteSpecialization(id: string) {
  const userId = await getUserId();
  try {
    db.prepare('DELETE FROM user_specializations WHERE id = ? AND user_id = ?').run(id, userId);
    revalidatePath('/academia/careers');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Error al eliminar la especialización" };
  }
}
