'use server';

import db from '@/infrastructure/db/sqlite';
import { revalidatePath } from 'next/cache';

export async function getPageContent(route: string): Promise<string> {
  const stmt = db.prepare('SELECT content FROM pages WHERE route = ?');
  const result = stmt.get(route) as { content: string } | undefined;
  return result?.content || '';
}

export async function savePageContent(route: string, content: string) {
  const stmtCheck = db.prepare('SELECT route FROM pages WHERE route = ?');
  const exists = stmtCheck.get(route);

  if (exists) {
    const stmtUpdate = db.prepare('UPDATE pages SET content = ? WHERE route = ?');
    stmtUpdate.run(content, route);
  } else {
    const stmtInsert = db.prepare('INSERT INTO pages (route, content) VALUES (?, ?)');
    stmtInsert.run(route, content);
  }

  // Avoid revalidating path immediately on every keystroke if it's auto-saving.
  // Ideally, revalidate on explicit save or blur.
  revalidatePath(route);
}
