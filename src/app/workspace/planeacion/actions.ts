'use server';

import db from '@/infrastructure/db/sqlite';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export async function addTimeBlock(formData: FormData) {
  const title = formData.get('title') as string;
  const startTime = formData.get('start_time') as string;
  const durationMinsStr = formData.get('duration_mins') as string;
  const color = formData.get('color') as string;
  const blockDate = formData.get('block_date') as string;

  if (!title || !startTime || !durationMinsStr || !blockDate) return;

  const durationMins = parseInt(durationMinsStr, 10);
  const id = crypto.randomUUID();

  const stmt = db.prepare(`
    INSERT INTO time_blocks (id, title, start_time, duration_mins, color, block_date)
    VALUES (@id, @title, @startTime, @durationMins, @color, @blockDate)
  `);

  stmt.run({ id, title, startTime, durationMins, color, blockDate });
  revalidatePath('/workspace/planeacion');
}

export async function deleteTimeBlock(id: string) {
  const stmt = db.prepare('DELETE FROM time_blocks WHERE id = @id');
  stmt.run({ id });
  revalidatePath('/workspace/planeacion');
}

export async function updateTimeBlock(id: string, updates: { title?: string, start_time?: string, duration_mins?: number, color?: string }) {
  const fields = Object.keys(updates).map(k => `${k} = @${k}`).join(', ');
  if (!fields) return;

  const stmt = db.prepare(`UPDATE time_blocks SET ${fields} WHERE id = @id`);
  stmt.run({ ...updates, id });
  revalidatePath('/workspace/planeacion');
}

export async function addBankActivity(formData: FormData) {
  const name = formData.get('name') as string;
  const color = (formData.get('color') as string) || '#bfdbfe';
  const mins = parseInt(formData.get('default_mins') as string || '60', 10);
  const icon = formData.get('icon') as string;

  if (!name) return;

  const id = crypto.randomUUID();
  db.prepare('INSERT INTO planning_bank (id, name, color, default_mins, icon) VALUES (@id, @name, @color, @mins, @icon)')
    .run({ id, name, color, mins, icon });
  revalidatePath('/workspace/planeacion');
}

export async function deleteBankActivity(id: string) {
  db.prepare('DELETE FROM planning_bank WHERE id = @id').run({ id });
  revalidatePath('/workspace/planeacion');
}
