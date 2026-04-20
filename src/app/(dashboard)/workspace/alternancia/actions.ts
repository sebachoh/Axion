'use server';

import db from '@/infrastructure/db/sqlite';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function addAlternancia(formData: FormData) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  const roleName = formData.get('role_name') as string;
  const company = formData.get('company') as string;
  const url = formData.get('url') as string;
  const status = formData.get('status') as string || 'entrevista';

  if (!roleName || !company) return;

  const id = crypto.randomUUID();
  
  // Calculate app_number for THIS user
  const countRow = db.prepare('SELECT COUNT(*) as count FROM alternancia_applications WHERE user_id = ?').get(userId) as { count: number };
  const appNumber = countRow.count + 1;

  const stmt = db.prepare(`
    INSERT INTO alternancia_applications (id, user_id, app_number, role_name, company, url, status)
    VALUES (@id, @userId, @appNumber, @roleName, @company, @url, @status)
  `);

  stmt.run({ id, userId, appNumber, roleName, company, url, status });

  revalidatePath('/workspace/alternancia');
}

export async function updateAlternanciaStatus(id: string, newStatus: string) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  const stmt = db.prepare(`
    UPDATE alternancia_applications
    SET status = @newStatus, last_update = CURRENT_TIMESTAMP
    WHERE id = @id AND user_id = @userId
  `);
  stmt.run({ id, userId, newStatus });
  revalidatePath('/workspace/alternancia');
}

export async function deleteAlternancia(id: string) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  const stmt = db.prepare('DELETE FROM alternancia_applications WHERE id = @id AND user_id = @userId');
  stmt.run({ id, userId });
  revalidatePath('/workspace/alternancia');
}

// === Banco de Alternancia Actions ===

export async function addBancoItem(formData: FormData) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  const category = formData.get('category') as string;
  const title = formData.get('title') as string;
  const meta = formData.get('meta') as string || '';

  if (!category || !title) return;

  const id = crypto.randomUUID();
  const stmt = db.prepare(`
    INSERT INTO alternancia_bank (id, user_id, category, title, meta)
    VALUES (@id, @userId, @category, @title, @meta)
  `);

  stmt.run({ id, userId, category, title, meta });
  revalidatePath('/workspace/alternancia/banco');
}

export async function deleteBancoItem(id: string) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  const stmt = db.prepare('DELETE FROM alternancia_bank WHERE id = @id AND user_id = @userId');
  stmt.run({ id, userId });
  revalidatePath('/workspace/alternancia/banco');
}
