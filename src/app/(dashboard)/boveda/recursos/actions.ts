'use server';

import db from '@/infrastructure/db/sqlite';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function addVaultResource(formData: FormData) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  const id = crypto.randomUUID();
  const title = formData.get('title') as string;
  const type = formData.get('type') as string; // text, image, idea, link
  const content = formData.get('content') as string;
  const media_url = formData.get('media_url') as string;
  const tags = formData.get('tags') as string;

  await db.prepare(`
    INSERT INTO vault_resources (id, user_id, title, type, content, media_url, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, title, type, content, media_url, tags);

  revalidatePath('/boveda/recursos');
}

export async function deleteVaultResource(id: string) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  await db.prepare('DELETE FROM vault_resources WHERE id = ? AND user_id = ?').run(id, userId);
  revalidatePath('/boveda/recursos');
}

export async function getVaultResources() {
   const session = await auth();
   const userId = (session?.user as any)?.id;
   if (!userId) return [];

   return await db.prepare('SELECT * FROM vault_resources WHERE user_id = ? ORDER BY created_at DESC').all(userId);
}
