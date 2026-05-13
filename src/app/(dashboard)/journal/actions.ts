'use server';

import db from '@/infrastructure/db/sqlite';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function addJournalEntry(formData: FormData) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  const content = formData.get('content') as string;
  const mood = formData.get('mood') as string;
  const mediaUrl = formData.get('media_url') as string;

  if (!content || !mood) return;

  const id = crypto.randomUUID();
  const stmt = db.prepare('INSERT INTO journal_entries (id, user_id, content, mood, media_url) VALUES (@id, @userId, @content, @mood, @mediaUrl)');
  await stmt.run({ id, userId, content, mood, mediaUrl });

  revalidatePath('/lifestyle/journal');
  revalidatePath('/'); 
}

export async function deleteJournalEntry(id: string) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  const stmt = db.prepare('DELETE FROM journal_entries WHERE id = @id AND user_id = @userId');
  await stmt.run({ id, userId });
  revalidatePath('/lifestyle/journal');
  revalidatePath('/');
}
