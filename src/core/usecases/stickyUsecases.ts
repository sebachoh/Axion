'use server';

import db from '@/infrastructure/db/sqlite';
import { revalidatePath } from 'next/cache';

export interface StickyNote {
  id: string;
  title: string;
  body: string | null;
  color: string;
  pos_x: number;
  pos_y: number;
}

export async function getStickyNotes(): Promise<StickyNote[]> {
  const stmt = db.prepare('SELECT id, title, body, color, pos_x, pos_y FROM sticky_notes');
  const rows = await stmt.all() as any[];
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    body: r.body,
    color: r.color,
    pos_x: r.pos_x,
    pos_y: r.pos_y,
  }));
}

export async function addStickyNote(title: string, body: string, color: string) {
  const id = crypto.randomUUID();
  const stmt = db.prepare('INSERT INTO sticky_notes (id, title, body, color, pos_x, pos_y) VALUES (?, ?, ?, ?, ?, ?)');
  // Add some random initial offset so they stack nicely
  const spawnX = Math.floor(Math.random() * 50);
  const spawnY = Math.floor(Math.random() * 50);
  await stmt.run(id, title, body, color, spawnX, spawnY);
  revalidatePath('/');
}

export async function deleteStickyNote(id: string) {
  const stmt = db.prepare('DELETE FROM sticky_notes WHERE id = ?');
  await stmt.run(id);
  revalidatePath('/');
}

export async function updateStickyNotePosition(id: string, x: number, y: number) {
  const stmt = db.prepare('UPDATE sticky_notes SET pos_x = ?, pos_y = ? WHERE id = ?');
  await stmt.run(x, y, id);
}

export async function updateStickyNoteContent(id: string, title: string, body: string, color: string) {
  const stmt = db.prepare('UPDATE sticky_notes SET title = ?, body = ?, color = ? WHERE id = ?');
  await stmt.run(title, body, color, id);
  revalidatePath('/');
}
