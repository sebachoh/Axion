'use server';

import db from '@/infrastructure/db/sqlite';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export interface RoutineTask {
  id: string;
  type: string;
  taskName: string;
  isCompleted: boolean;
  orderIndex: number;
}

async function getUserId() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

export async function getRoutineTasks(type: string, date: string): Promise<RoutineTask[]> {
  const userId = await getUserId();
  const stmt = db.prepare(`
    SELECT t.id, t.type, t.task_name as taskName, t.order_index as orderIndex, 
           CASE WHEN c.task_id IS NOT NULL THEN 1 ELSE 0 END as isCompleted
    FROM routine_tasks t
    LEFT JOIN routine_completions c ON t.id = c.task_id AND c.completion_date = @date AND c.user_id = @userId
    WHERE t.type = @type AND t.user_id = @userId
    ORDER BY t.order_index ASC, t.created_at ASC
  `);
  const rows = await stmt.all({ date, type, userId }) as any[];
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    taskName: r.taskName,
    isCompleted: r.isCompleted === 1,
    orderIndex: r.orderIndex,
  }));
}

export async function addRoutineTask(type: string, taskName: string) {
  const userId = await getUserId();
  const id = crypto.randomUUID();
  const indexStmt = db.prepare('SELECT MAX(order_index) as maxIdx FROM routine_tasks WHERE type = ? AND user_id = ?');
  const result: any = await indexStmt.get(type, userId);
  const nextIdx = (result?.maxIdx ?? -1) + 1;

  const stmt = db.prepare('INSERT INTO routine_tasks (id, user_id, type, task_name, is_completed, order_index) VALUES (?, ?, ?, ?, 0, ?)');
  await stmt.run(id, userId, type, taskName, nextIdx);
  revalidatePath('/rutinas');
}

export async function deleteRoutineTask(id: string) {
  const userId = await getUserId();
  const stmt = db.prepare('DELETE FROM routine_tasks WHERE id = ? AND user_id = ?');
  await stmt.run(id, userId);
  await db.prepare('DELETE FROM routine_completions WHERE task_id = ? AND user_id = ?').run(id, userId);
  revalidatePath('/rutinas');
}

export async function toggleRoutineTask(id: string, isCompleted: boolean, date: string) {
  const userId = await getUserId();
  if (isCompleted) {
    const stmt = db.prepare('INSERT OR IGNORE INTO routine_completions (user_id, task_id, completion_date) VALUES (?, ?, ?)');
    await stmt.run(userId, id, date);
  } else {
    const stmt = db.prepare('DELETE FROM routine_completions WHERE task_id = ? AND completion_date = ? AND user_id = ?');
    await stmt.run(id, date, userId);
  }
  revalidatePath('/rutinas');
}

export async function updateRoutineOrder(updates: {id: string, orderIndex: number}[]) {
  const userId = await getUserId();
  const sql = 'UPDATE routine_tasks SET order_index = ? WHERE id = ? AND user_id = ?';
  const statements = updates.map((item) => ({
    sql,
    args: [item.orderIndex, item.id, userId]
  }));

  await db.batch(statements);
}

export async function getHabitsAnalytics(periodDays: number) {
  const userId = await getUserId();
  // Determine date bounds
  const today = new Date();
  today.setHours(0,0,0,0);
  const startDate = new Date();
  startDate.setDate(today.getDate() - (periodDays - 1));
  startDate.setHours(0,0,0,0);

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = new Date().toISOString().split('T')[0];

  const totalTasks = (await db.prepare('SELECT COUNT(*) as count FROM routine_tasks WHERE user_id = ?').get(userId) as any).count;
  
  const stmt = db.prepare(`
    SELECT completion_date as date, COUNT(*) as completions
    FROM routine_completions
    WHERE completion_date >= ? AND completion_date <= ? AND user_id = ?
    GROUP BY completion_date
    ORDER BY completion_date ASC
  `);
  
  const history = await stmt.all(startStr, endStr, userId) as any[];
  
  // Create full array of days
  const data = [];
  let globalScoreSum = 0;
  let activeDays = 0;

  for (let i = 0; i < periodDays; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    
    let score = 0;
    if (totalTasks > 0) {
      const match = history.find(h => h.date === dateStr);
      score = match ? (match.completions / totalTasks) : 0;
    }

    data.push({
      dateStr,
      dayIndex: d.getDay(),
      score
    });
    
    globalScoreSum += score;
    if (score > 0) activeDays++;
  }

  const globalPercentage = totalTasks > 0 ? (globalScoreSum / periodDays) * 100 : 0;
  const currentStreak = await calculateStreak(endStr, userId);
  
  return {
    globalPercentage: Math.round(globalPercentage),
    streak: currentStreak,
    history: data,
    totalTasks
  };
}

async function calculateStreak(todayStr: string, userId: string): Promise<number> {
  const stmt = db.prepare(`SELECT completion_date as date FROM routine_completions WHERE user_id = ? GROUP BY completion_date ORDER BY completion_date DESC`);
  const logs = await stmt.all(userId) as any[];
  if (logs.length === 0) return 0;

  let streak = 0;
  let cursorDate = new Date(todayStr);

  for (const log of logs) {
    const logDateStr = log.date;
    const expectedStr = cursorDate.toISOString().split('T')[0];
    
    if (logDateStr === expectedStr) {
      streak++;
      cursorDate.setDate(cursorDate.getDate() - 1);
    } else if (logDateStr === todayStr) {
       cursorDate.setDate(cursorDate.getDate() - 1);
    } else {
       break;
    }
  }
  return streak;
}
