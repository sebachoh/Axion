'use server';

import db from '@/infrastructure/db/sqlite';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

export async function addVisionBoard(formData: FormData) {
  const id = uuidv4();
  const title = formData.get('title') as string;
  const area = formData.get('area') as string;
  const timeframe = formData.get('timeframe') as string;
  const content = formData.get('content') as string;
  const image_url = formData.get('image_url') as string;

  db.prepare(`
    INSERT INTO vision_boards (id, title, area, timeframe, content, image_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, title, area, timeframe, content, image_url);

  revalidatePath('/boveda/vision');
}

export async function deleteVisionBoard(id: string) {
  db.prepare('DELETE FROM vision_boards WHERE id = ?').run(id);
  revalidatePath('/boveda/vision');
}

export async function getVisionBoards() {
   // This should be done directly in the Page or a separate function, 
   // but I'll provide a getter for consistency if needed.
   return db.prepare('SELECT * FROM vision_boards ORDER BY created_at DESC').all();
}
