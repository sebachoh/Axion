'use server';

import db from '@/infrastructure/db/sqlite';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export async function addJournalEntry(formData: FormData) {
  const content = formData.get('content') as string;
  const mood = formData.get('mood') as string;
  const mediaUrl = formData.get('media_url') as string;

  if (!content || !mood) return;

  const id = crypto.randomUUID();
  const stmt = db.prepare('INSERT INTO journal_entries (id, content, mood, media_url) VALUES (@id, @content, @mood, @mediaUrl)');
  stmt.run({ id, content, mood, mediaUrl });

  revalidatePath('/lifestyle/journal');
  revalidatePath('/'); // Revalidate dashboard summary
}

export async function deleteJournalEntry(id: string) {
  const stmt = db.prepare('DELETE FROM journal_entries WHERE id = @id');
  stmt.run({ id });
  revalidatePath('/lifestyle/journal');
  revalidatePath('/');
}
