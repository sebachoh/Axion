'use server';

import db from '@/infrastructure/db/sqlite';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function addTask(formData: FormData): Promise<void> {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  const title = formData.get('title') as string;
  const status = formData.get('status') as string || 'pending';
  const priority = formData.get('priority') as string || 'medium';
  const deadlineInput = formData.get('deadline') as string;
  const deadline = deadlineInput && deadlineInput.trim() !== '' ? deadlineInput : null;
  const notes = formData.get('notes') as string || null;

  if (!title) return;

  const id = crypto.randomUUID();

  const stmt = db.prepare(`
    INSERT INTO tasks (id, user_id, title, status, priority, deadline, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  await stmt.run(id, userId, title, status, priority, deadline, notes);

  revalidatePath('/workspace/tareas');
}

export async function deleteTask(id: string) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  const stmt = db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?');
  await stmt.run(id, userId);
  revalidatePath('/workspace/tareas');
}

export async function updateTaskStatus(id: string, newStatus: string) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  const stmt = db.prepare('UPDATE tasks SET status = @newStatus WHERE id = @id AND user_id = @userId');
  await stmt.run({ id, newStatus, userId });
  revalidatePath('/workspace/tareas');
}

export async function updateTask(id: string, formData: FormData): Promise<void> {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  const title = formData.get('title') as string;
  const priority = formData.get('priority') as string;
  const deadlineInput = formData.get('deadline') as string;
  const deadline = deadlineInput && deadlineInput.trim() !== '' ? deadlineInput : null;
  const notes = formData.get('notes') as string || null;

  if (!title) return;

  const stmt = db.prepare(`
    UPDATE tasks 
    SET title = ?, priority = ?, deadline = ?, notes = ?
    WHERE id = ? AND user_id = ?
  `);

  await stmt.run(title, priority, deadline, notes, id, userId);

  revalidatePath('/workspace/tareas');
}

export async function reorderTasks(taskIds: string[]) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  const sql = 'UPDATE tasks SET order_index = @orderIndex WHERE id = @id AND user_id = @userId';
  const statements = taskIds.map((id, index) => ({
    sql,
    args: { id, orderIndex: index, userId }
  }));

  await db.batch(statements);
  revalidatePath('/workspace/tareas');
}
