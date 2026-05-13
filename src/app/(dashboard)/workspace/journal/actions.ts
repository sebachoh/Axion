'use server';

import db from '@/infrastructure/db/sqlite';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export async function addJournalEntry(formData: FormData) {
  const content = formData.get('content') as string;
  const mood = formData.get('mood') as string || 'neutral';
  
  let mediaUrl = formData.get('media_url') as string || '';
  const mediaFile = formData.get('media_file') as File | null;

  if (mediaFile && mediaFile.size > 0) {
    const arrayBuffer = await mediaFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    mediaUrl = `data:${mediaFile.type};base64,${buffer.toString('base64')}`;
  }

  if (!content) return;

  const id = crypto.randomUUID();
  const stmt = db.prepare(`
    INSERT INTO journal_entries (id, content, media_url, mood)
    VALUES (@id, @content, @mediaUrl, @mood)
  `);

  await stmt.run({ id, content, mediaUrl, mood });
  revalidatePath('/workspace/journal');
}

export async function deleteJournalEntry(id: string) {
  const stmt = db.prepare('DELETE FROM journal_entries WHERE id = @id');
  await stmt.run({ id });
  revalidatePath('/workspace/journal');
}
