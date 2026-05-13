'use server';

import db from '@/infrastructure/db/sqlite';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function addTimeBlock(formData: FormData) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  const title = formData.get('title') as string;
  const startTime = formData.get('start_time') as string;
  const durationMinsStr = formData.get('duration_mins') as string;
  const color = formData.get('color') as string;
  const blockDate = formData.get('block_date') as string;

  if (!title || !startTime || !durationMinsStr || !blockDate) return;

  const durationMins = parseInt(durationMinsStr, 10);
  const id = crypto.randomUUID();

  const stmt = db.prepare(`
    INSERT INTO time_blocks (id, user_id, title, start_time, duration_mins, color, block_date)
    VALUES (@id, @userId, @title, @startTime, @durationMins, @color, @blockDate)
  `);

  await stmt.run({ id, userId, title, startTime, durationMins, color, blockDate });
  revalidatePath('/workspace/planeacion');
}

export async function deleteTimeBlock(id: string) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  const stmt = db.prepare('DELETE FROM time_blocks WHERE id = @id AND user_id = @userId');
  await stmt.run({ id, userId });
  revalidatePath('/workspace/planeacion');
}

export async function updateTimeBlock(id: string, updates: { title?: string, start_time?: string, duration_mins?: number, color?: string }) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  const fields = Object.keys(updates).map(k => `${k} = @${k}`).join(', ');
  if (!fields) return;

  const stmt = db.prepare(`UPDATE time_blocks SET ${fields} WHERE id = @id AND user_id = @userId`);
  await stmt.run({ ...updates, id, userId });
  revalidatePath('/workspace/planeacion');
}

export async function addBankActivity(formData: FormData) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  const name = formData.get('name') as string;
  const color = (formData.get('color') as string) || '#bfdbfe';
  const mins = parseInt(formData.get('default_mins') as string || '60', 10);
  const icon = formData.get('icon') as string;

  if (!name) return;

  const id = crypto.randomUUID();
  await db.prepare('INSERT INTO planning_bank (id, user_id, name, color, default_mins, icon) VALUES (@id, @userId, @name, @color, @mins, @icon)')
    .run({ id, userId, name, color, mins, icon });
  revalidatePath('/workspace/planeacion');
}

export async function deleteBankActivity(id: string) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  await db.prepare('DELETE FROM planning_bank WHERE id = @id AND user_id = @userId').run({ id, userId });
  revalidatePath('/workspace/planeacion');
}
