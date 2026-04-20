'use server';

import db from '@/infrastructure/db/sqlite';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function addTask(formData: FormData) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  const title = formData.get('title') as string;
  const status = formData.get('status') as string || 'pending';
  const priority = formData.get('priority') as string || 'medium';
  const deadlineInput = formData.get('deadline') as string;
  const deadline = deadlineInput && deadlineInput.trim() !== '' ? deadlineInput : null;
  const notes = formData.get('notes') as string || null;

  if (!title) return { error: 'Title is required' };

  const id = crypto.randomUUID();

  const stmt = db.prepare(`
    INSERT INTO tasks (id, user_id, title, status, priority, deadline, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(id, userId, title, status, priority, deadline, notes);

  revalidatePath('/workspace/tareas');
}

export async function deleteTask(id: string) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  const stmt = db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?');
  stmt.run(id, userId);
  revalidatePath('/workspace/tareas');
}

export async function updateTaskStatus(id: string, newStatus: string) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  const stmt = db.prepare('UPDATE tasks SET status = @newStatus WHERE id = @id AND user_id = @userId');
  stmt.run({ id, newStatus, userId });
  revalidatePath('/workspace/tareas');
}

export async function reorderTasks(taskIds: string[]) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  const stmt = db.prepare('UPDATE tasks SET order_index = @orderIndex WHERE id = @id AND user_id = @userId');
  db.transaction(() => {
    taskIds.forEach((id, index) => {
      stmt.run({ id, orderIndex: index, userId });
    });
  })();
  revalidatePath('/workspace/tareas');
}
