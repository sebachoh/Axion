'use server';

import db from '@/infrastructure/db/sqlite';
import { revalidatePath } from 'next/cache';

export async function addTask(formData: FormData) {
  const title = formData.get('title') as string;
  const status = formData.get('status') as string || 'pending';
  const priority = formData.get('priority') as string || 'medium';
  const deadline = formData.get('deadline') as string || null;
  const notes = formData.get('notes') as string || null;

  if (!title) return { error: 'Title is required' };

  const id = crypto.randomUUID();

  const stmt = db.prepare(`
    INSERT INTO tasks (id, title, status, priority, deadline, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(id, title, status, priority, deadline, notes);

  revalidatePath('/workspace/tareas');
}

export async function deleteTask(id: string) {
  const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
  stmt.run(id);
  revalidatePath('/workspace/tareas');
}

export async function updateTaskStatus(id: string, newStatus: string) {
  const stmt = db.prepare('UPDATE tasks SET status = @newStatus WHERE id = @id');
  stmt.run({ id, newStatus });
  revalidatePath('/workspace/tareas');
}

export async function reorderTasks(taskIds: string[]) {
  const stmt = db.prepare('UPDATE tasks SET order_index = @orderIndex WHERE id = @id');
  db.transaction(() => {
    taskIds.forEach((id, index) => {
      stmt.run({ id, orderIndex: index });
    });
  })();
  revalidatePath('/workspace/tareas');
}
