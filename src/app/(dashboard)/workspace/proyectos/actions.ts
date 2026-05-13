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

export async function addProject(formData: FormData) {
  const userId = await getUserId();
  const id = crypto.randomUUID();
  const title = formData.get('title') as string;
  const shortName = (formData.get('shortName') as string || title.substring(0, 2)).toUpperCase();
  const description = formData.get('description') as string;
  const colorStart = formData.get('colorStart') as string || '#FF9A9E';
  const colorEnd = formData.get('colorEnd') as string || '#FECFEF';

  if (!title) return { error: "El título es obligatorio" };

  try {
    await db.prepare(`
      INSERT INTO active_projects (id, user_id, short_name, title, description, color_start, color_end)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, shortName, title, description, colorStart, colorEnd);

    revalidatePath('/workspace/proyectos');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Error al crear el proyecto" };
  }
}

export async function deleteProject(id: string): Promise<void> {
  const userId = await getUserId();
  try {
    await db.prepare('DELETE FROM active_projects WHERE id = ? AND user_id = ?').run(id, userId);
    revalidatePath('/workspace/proyectos');
  } catch (e) {
    console.error(e);
  }
}

export async function addProjectIdea(formData: FormData): Promise<void> {
  const userId = await getUserId();
  const content = formData.get('content') as string;
  if (!content) return;

  try {
    await db.prepare('INSERT INTO project_ideas (id, user_id, content) VALUES (?, ?, ?)').run(crypto.randomUUID(), userId, content);
    revalidatePath('/workspace/proyectos');
  } catch (e) {
    console.error(e);
  }
}

export async function deleteProjectIdea(id: string): Promise<void> {
  const userId = await getUserId();
  try {
    await db.prepare('DELETE FROM project_ideas WHERE id = ? AND user_id = ?').run(id, userId);
    revalidatePath('/workspace/proyectos');
  } catch (e) {
    console.error(e);
  }
}
