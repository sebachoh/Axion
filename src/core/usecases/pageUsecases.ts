'use server';

import db from '@/infrastructure/db/sqlite';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function getPageContent(route: string): Promise<string> {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return '';

  const stmt = db.prepare('SELECT content FROM pages WHERE route = ? AND user_id = ?');
  const result = stmt.get(route, userId) as { content: string } | undefined;
  return result?.content || '';
}

export async function savePageContent(route: string, content: string) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  const stmtCheck = db.prepare('SELECT route FROM pages WHERE route = ? AND user_id = ?');
  const exists = stmtCheck.get(route, userId);

  if (exists) {
    const stmtUpdate = db.prepare('UPDATE pages SET content = ? WHERE route = ? AND user_id = ?');
    stmtUpdate.run(content, route, userId);
  } else {
    const stmtInsert = db.prepare('INSERT INTO pages (route, user_id, content) VALUES (?, ?, ?)');
    stmtInsert.run(route, userId, content);
  }

  revalidatePath(route);
}
