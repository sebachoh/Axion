'use server';

import db from '@/infrastructure/db/sqlite';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

export async function addVaultResource(formData: FormData) {
  const id = uuidv4();
  const title = formData.get('title') as string;
  const type = formData.get('type') as string; // text, image, idea, link
  const content = formData.get('content') as string;
  const media_url = formData.get('media_url') as string;
  const tags = formData.get('tags') as string;

  db.prepare(`
    INSERT INTO vault_resources (id, title, type, content, media_url, tags)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, title, type, content, media_url, tags);

  revalidatePath('/boveda/recursos');
}

export async function deleteVaultResource(id: string) {
  db.prepare('DELETE FROM vault_resources WHERE id = ?').run(id);
  revalidatePath('/boveda/recursos');
}

export async function getVaultResources() {
   return db.prepare('SELECT * FROM vault_resources ORDER BY created_at DESC').all();
}
