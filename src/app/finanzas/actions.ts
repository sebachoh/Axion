'use server';

import db from '@/infrastructure/db/sqlite';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export async function addTransaction(formData: FormData) {
  const type = formData.get('type') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const category = formData.get('category') as string;
  const description = formData.get('description') as string;
  const date = formData.get('date') as string || new Date().toISOString().split('T')[0];

  if (!amount || !category) return;

  const id = crypto.randomUUID();
  const stmt = db.prepare('INSERT INTO finance_transactions (id, type, amount, category, description, date) VALUES (@id, @type, @amount, @category, @description, @date)');
  stmt.run({ id, type, amount, category, description, date });

  revalidatePath('/lifestyle/finanzas');
  revalidatePath('/');
}

export async function deleteTransaction(id: string) {
  const stmt = db.prepare('DELETE FROM finance_transactions WHERE id = @id');
  stmt.run({ id });
  revalidatePath('/lifestyle/finanzas');
  revalidatePath('/');
}

export async function addGoal(formData: FormData) {
  const name = formData.get('name') as string;
  const targetAmount = parseFloat(formData.get('target_amount') as string);
  const color = formData.get('color') as string || '#bfdbfe';

  if (!name || !targetAmount) return;

  const id = crypto.randomUUID();
  const stmt = db.prepare('INSERT INTO finance_goals (id, name, target_amount, current_amount, color) VALUES (@id, @name, @targetAmount, 0, @color)');
  stmt.run({ id, name, targetAmount, color });

  revalidatePath('/lifestyle/finanzas');
}

export async function updateGoalAmount(id: string, amount: number) {
  const stmt = db.prepare('UPDATE finance_goals SET current_amount = current_amount + @amount WHERE id = @id');
  stmt.run({ id, amount });
  revalidatePath('/lifestyle/finanzas');
}

export async function deleteGoal(id: string) {
  const stmt = db.prepare('DELETE FROM finance_goals WHERE id = @id');
  stmt.run({ id });
  revalidatePath('/lifestyle/finanzas');
}
