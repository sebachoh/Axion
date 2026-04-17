'use server';

import db from '@/infrastructure/db/sqlite';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export async function addJournalEntry(formData: FormData) {
  const content = formData.get('content') as string;
  const mood = formData.get('mood') as string || 'neutral';
  const mediaUrl = formData.get('media_url') as string || '';

  if (!content) return;

  const id = crypto.randomUUID();
  const stmt = db.prepare(`
    INSERT INTO journal_entries (id, content, media_url, mood)
    VALUES (@id, @content, @mediaUrl, @mood)
  `);

  stmt.run({ id, content, mediaUrl, mood });
  revalidatePath('/workspace/journal');
}

export async function deleteJournalEntry(id: string) {
  const stmt = db.prepare('DELETE FROM journal_entries WHERE id = @id');
  stmt.run({ id });
  revalidatePath('/workspace/journal');
}
