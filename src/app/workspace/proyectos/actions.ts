'use server';

import db from '@/infrastructure/db/sqlite';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export async function addProjectIdea(formData: FormData) {
  const content = formData.get('content') as string;

  if (!content) return;

  const id = crypto.randomUUID();
  const stmt = db.prepare(`
    INSERT INTO project_ideas (id, content)
    VALUES (@id, @content)
  `);

  stmt.run({ id, content });
  revalidatePath('/workspace/proyectos');
}

export async function deleteProjectIdea(id: string) {
  const stmt = db.prepare('DELETE FROM project_ideas WHERE id = @id');
  stmt.run({ id });
  revalidatePath('/workspace/proyectos');
}
