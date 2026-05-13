'use server';

import db from '@/infrastructure/db/sqlite';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

// Helper to get authorized userId
async function getUserId() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

// === Stage Tasks Actions ===

export async function addStageTask(formData: FormData) {
  const userId = await getUserId();
  const title = formData.get('title') as string;
  const priority = formData.get('priority') as string || 'media';

  if (!title) return;

  const id = crypto.randomUUID();
  const stmt = db.prepare(`
    INSERT INTO stage_tasks (id, user_id, title, status, priority)
    VALUES (@id, @userId, @title, 'Pendiente', @priority)
  `);

  await stmt.run({ id, userId, title, priority });
  revalidatePath('/workspace/stage');
}

export async function toggleStageTaskStatus(id: string, currentStatus: string) {
  const userId = await getUserId();
  const newStatus = currentStatus === 'Completado' ? 'Pendiente' : 'Completado';

  const stmt = db.prepare(`
    UPDATE stage_tasks
    SET status = @newStatus
    WHERE id = @id AND user_id = @userId
  `);

  await stmt.run({ id, userId, newStatus });
  revalidatePath('/workspace/stage');
}

export async function deleteStageTask(id: string) {
  const userId = await getUserId();
  const stmt = db.prepare('DELETE FROM stage_tasks WHERE id = @id AND user_id = @userId');
  await stmt.run({ id, userId });
  revalidatePath('/workspace/stage');
}

// === Stage Projects Actions ===

export async function addStageProject(formData: FormData) {
  const userId = await getUserId();
  const title = formData.get('title') as string;
  const description = formData.get('description') as string || '';
  const status = formData.get('status') as string || 'En progreso';

  if (!title) return;

  const id = crypto.randomUUID();
  const stmt = db.prepare(`
    INSERT INTO stage_projects (id, user_id, title, description, status)
    VALUES (@id, @userId, @title, @description, @status)
  `);

  await stmt.run({ id, userId, title, description, status });
  revalidatePath('/workspace/stage');
}

export async function updateStageProjectStatus(id: string, newStatus: string) {
  const userId = await getUserId();
  const stmt = db.prepare(`
    UPDATE stage_projects
    SET status = @newStatus
    WHERE id = @id AND user_id = @userId
  `);

  await stmt.run({ id, userId, newStatus });
  revalidatePath('/workspace/stage');
}

export async function deleteStageProject(id: string) {
  const userId = await getUserId();
  const stmt = db.prepare('DELETE FROM stage_projects WHERE id = @id AND user_id = @userId');
  await stmt.run({ id, userId });
  revalidatePath('/workspace/stage');
}

// === Stage Commands Actions ===

export async function addStageCommand(formData: FormData) {
  const userId = await getUserId();
  const title = formData.get('title') as string;
  const command = formData.get('command') as string;
  const description = formData.get('description') as string || '';
  const category = formData.get('category') as string || 'General';

  if (!title || !command) return;

  const id = crypto.randomUUID();
  const stmt = db.prepare(`
    INSERT INTO stage_commands (id, user_id, title, command, description, category)
    VALUES (@id, @userId, @title, @command, @description, @category)
  `);

  await stmt.run({ id, userId, title, command, description, category });
  revalidatePath('/workspace/stage');
}

export async function deleteStageCommand(id: string) {
  const userId = await getUserId();
  const stmt = db.prepare('DELETE FROM stage_commands WHERE id = @id AND user_id = @userId');
  await stmt.run({ id, userId });
  revalidatePath('/workspace/stage');
}
