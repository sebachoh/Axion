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

// === Chores (Mantenimiento) Actions ===

export async function addHogarChore(formData: FormData) {
  const userId = await getUserId();
  const name = formData.get('name') as string;
  const frequencyDaysStr = formData.get('frequency_days') as string;
  const frequencyDays = frequencyDaysStr ? parseInt(frequencyDaysStr) : 7;

  if (!name) return;

  const id = crypto.randomUUID();
  const stmt = db.prepare(`
    INSERT INTO hogar_chores (id, user_id, name, frequency_days, last_done_at)
    VALUES (@id, @userId, @name, @frequencyDays, NULL)
  `);

  stmt.run({ id, userId, name, frequencyDays });
  revalidatePath('/lifestyle/hogar');
}

export async function logHogarChoreDone(id: string) {
  const userId = await getUserId();
  const stmt = db.prepare(`
    UPDATE hogar_chores
    SET last_done_at = CURRENT_TIMESTAMP
    WHERE id = @id AND user_id = @userId
  `);

  stmt.run({ id, userId });
  revalidatePath('/lifestyle/hogar');
}

export async function deleteHogarChore(id: string) {
  const userId = await getUserId();
  const stmt = db.prepare('DELETE FROM hogar_chores WHERE id = @id AND user_id = @userId');
  stmt.run({ id, userId });
  revalidatePath('/lifestyle/hogar');
}

// === Shopping List Actions ===

export async function addShoppingItem(formData: FormData) {
  const userId = await getUserId();
  const itemName = formData.get('item_name') as string;

  if (!itemName) return;

  const id = crypto.randomUUID();
  const stmt = db.prepare(`
    INSERT INTO hogar_shopping_list (id, user_id, item_name, is_completed)
    VALUES (@id, @userId, @itemName, 0)
  `);

  stmt.run({ id, userId, itemName });
  revalidatePath('/lifestyle/hogar');
}

export async function toggleShoppingItem(id: string, currentCompleted: boolean) {
  const userId = await getUserId();
  const isCompleted = currentCompleted ? 0 : 1;

  const stmt = db.prepare(`
    UPDATE hogar_shopping_list
    SET is_completed = @isCompleted
    WHERE id = @id AND user_id = @userId
  `);

  stmt.run({ id, userId, isCompleted });
  revalidatePath('/lifestyle/hogar');
}

export async function deleteShoppingItem(id: string) {
  const userId = await getUserId();
  const stmt = db.prepare('DELETE FROM hogar_shopping_list WHERE id = @id AND user_id = @userId');
  stmt.run({ id, userId });
  revalidatePath('/lifestyle/hogar');
}

// === Rent Payments Actions ===

export async function addRentPayment(formData: FormData) {
  const userId = await getUserId();
  const monthYear = formData.get('month_year') as string;
  const amountStr = formData.get('amount') as string;
  const amount = amountStr ? parseFloat(amountStr) : 0;

  if (!monthYear || !amount) return;

  const id = crypto.randomUUID();
  const stmt = db.prepare(`
    INSERT INTO hogar_rent_payments (id, user_id, month_year, amount, is_paid, paid_at)
    VALUES (@id, @userId, @monthYear, @amount, 0, NULL)
  `);

  stmt.run({ id, userId, monthYear, amount });
  revalidatePath('/lifestyle/hogar');
}

export async function markRentAsPaid(id: string) {
  const userId = await getUserId();
  const stmt = db.prepare(`
    UPDATE hogar_rent_payments
    SET is_paid = 1, paid_at = CURRENT_TIMESTAMP
    WHERE id = @id AND user_id = @userId
  `);

  stmt.run({ id, userId });
  revalidatePath('/lifestyle/hogar');
}

export async function deleteRentPayment(id: string) {
  const userId = await getUserId();
  const stmt = db.prepare('DELETE FROM hogar_rent_payments WHERE id = @id AND user_id = @userId');
  stmt.run({ id, userId });
  revalidatePath('/lifestyle/hogar');
}
