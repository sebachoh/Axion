'use server';

import db from '@/infrastructure/db/sqlite';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function addVisionBoard(formData: FormData) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  const id = crypto.randomUUID();
  const title = formData.get('title') as string;
  const area = formData.get('area') as string;
  const timeframe = formData.get('timeframe') as string;
  const content = formData.get('content') as string;
  const image_url = formData.get('image_url') as string;

  await db.prepare(`
    INSERT INTO vision_boards (id, user_id, title, area, timeframe, content, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, title, area, timeframe, content, image_url);

  revalidatePath('/boveda/vision');
}

export async function deleteVisionBoard(id: string) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  await db.prepare('DELETE FROM vision_boards WHERE id = ? AND user_id = ?').run(id, userId);
  revalidatePath('/boveda/vision');
}

export async function getVisionBoards() {
   const session = await auth();
   const userId = (session?.user as any)?.id;
   if (!userId) return [];

   return await db.prepare('SELECT * FROM vision_boards WHERE user_id = ? ORDER BY created_at DESC').all(userId);
}
