'use server';

import db from '@/infrastructure/db/sqlite';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function addTransaction(formData: FormData) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  const type = formData.get('type') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const category = formData.get('category') as string;
  const description = formData.get('description') as string;
  const date = formData.get('date') as string || new Date().toISOString().split('T')[0];

  if (!amount || !category) return;

  const id = crypto.randomUUID();
  const stmt = db.prepare('INSERT INTO finance_transactions (id, user_id, type, amount, category, description, date) VALUES (@id, @userId, @type, @amount, @category, @description, @date)');
  stmt.run({ id, userId, type, amount, category, description, date });

  revalidatePath('/lifestyle/finanzas');
  revalidatePath('/');
}

export async function deleteTransaction(id: string) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  const stmt = db.prepare('DELETE FROM finance_transactions WHERE id = @id AND user_id = @userId');
  stmt.run({ id, userId });
  revalidatePath('/lifestyle/finanzas');
  revalidatePath('/');
}

export async function addGoal(formData: FormData) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  const name = formData.get('name') as string;
  const targetAmount = parseFloat(formData.get('target_amount') as string);
  const color = formData.get('color') as string || '#bfdbfe';

  if (!name || !targetAmount) return;

  const id = crypto.randomUUID();
  const stmt = db.prepare('INSERT INTO finance_goals (id, user_id, name, target_amount, current_amount, color) VALUES (@id, @userId, @name, @targetAmount, 0, @color)');
  stmt.run({ id, userId, name, targetAmount, color });

  revalidatePath('/lifestyle/finanzas');
}

export async function updateGoalAmount(id: string, amount: number) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  const stmt = db.prepare('UPDATE finance_goals SET current_amount = current_amount + @amount WHERE id = @id AND user_id = @userId');
  stmt.run({ id, amount, userId });
  revalidatePath('/lifestyle/finanzas');
}

export async function deleteGoal(id: string) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  const stmt = db.prepare('DELETE FROM finance_goals WHERE id = @id AND user_id = @userId');
  stmt.run({ id, userId });
  revalidatePath('/lifestyle/finanzas');
}
