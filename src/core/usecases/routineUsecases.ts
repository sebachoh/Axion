'use server';

import db from '@/infrastructure/db/sqlite';
import { revalidatePath } from 'next/cache';

export interface RoutineTask {
  id: string;
  type: string;
  taskName: string;
  isCompleted: boolean;
  orderIndex: number;
}

export interface RoutineTask {
  id: string;
  type: string;
  taskName: string;
  isCompleted: boolean;
  orderIndex: number;
}

export async function getRoutineTasks(type: string, date: string): Promise<RoutineTask[]> {
  const stmt = db.prepare(`
    SELECT t.id, t.type, t.task_name as taskName, t.order_index as orderIndex, 
           CASE WHEN c.task_id IS NOT NULL THEN 1 ELSE 0 END as isCompleted
    FROM routine_tasks t
    LEFT JOIN routine_completions c ON t.id = c.task_id AND c.completion_date = ?
    WHERE t.type = ?
    ORDER BY t.order_index ASC, t.created_at ASC
  `);
  const rows = stmt.all(date, type) as any[];
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    taskName: r.taskName,
    isCompleted: r.isCompleted === 1,
    orderIndex: r.orderIndex,
  }));
}

export async function addRoutineTask(type: string, taskName: string) {
  const id = crypto.randomUUID();
  const indexStmt = db.prepare('SELECT MAX(order_index) as maxIdx FROM routine_tasks WHERE type = ?');
  const result: any = indexStmt.get(type);
  const nextIdx = (result?.maxIdx ?? -1) + 1;

  const stmt = db.prepare('INSERT INTO routine_tasks (id, type, task_name, is_completed, order_index) VALUES (?, ?, ?, 0, ?)');
  stmt.run(id, type, taskName, nextIdx);
  revalidatePath(`/${type === 'morning' ? 'rutina-manana' : 'rutina-noche'}`);
}

export async function deleteRoutineTask(id: string) {
  const stmt = db.prepare('DELETE FROM routine_tasks WHERE id = ?');
  stmt.run(id);
  db.prepare('DELETE FROM routine_completions WHERE task_id = ?').run(id);
  revalidatePath('/rutinas');
}

export async function toggleRoutineTask(id: string, isCompleted: boolean, date: string) {
  if (isCompleted) {
    const stmt = db.prepare('INSERT OR IGNORE INTO routine_completions (task_id, completion_date) VALUES (?, ?)');
    stmt.run(id, date);
  } else {
    const stmt = db.prepare('DELETE FROM routine_completions WHERE task_id = ? AND completion_date = ?');
    stmt.run(id, date);
  }
  revalidatePath('/rutinas');
}

export async function updateRoutineOrder(updates: {id: string, orderIndex: number}[]) {
  const stmt = db.prepare('UPDATE routine_tasks SET order_index = ? WHERE id = ?');
  const transaction = db.transaction((u) => {
    for (const item of u) {
      stmt.run(item.orderIndex, item.id);
    }
  });
  transaction(updates);
}

export async function getHabitsAnalytics(periodDays: number) {
  // Determine date bounds
  const today = new Date();
  today.setHours(0,0,0,0);
  const startDate = new Date();
  startDate.setDate(today.getDate() - (periodDays - 1));
  startDate.setHours(0,0,0,0);

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = new Date().toISOString().split('T')[0];

  // For real analytics, we calculate completion rate per day.
  // We need the number of tasks completed each day, and the TOTAL tasks.
  // Simplification: Assume total tasks is the current task amount (historical task counts require complex snapshotting).
  const totalTasks = (db.prepare('SELECT COUNT(*) as count FROM routine_tasks').get() as any).count;
  
  const stmt = db.prepare(`
    SELECT completion_date as date, COUNT(*) as completions
    FROM routine_completions
    WHERE completion_date >= ? AND completion_date <= ?
    GROUP BY completion_date
    ORDER BY completion_date ASC
  `);
  
  const history = stmt.all(startStr, endStr) as any[];
  
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
  const currentStreak = calculateStreak(endStr);
  
  return {
    globalPercentage: Math.round(globalPercentage),
    streak: currentStreak,
    history: data,
    totalTasks
  };
}

function calculateStreak(todayStr: string): number {
  const stmt = db.prepare(`SELECT completion_date as date FROM routine_completions GROUP BY completion_date ORDER BY completion_date DESC`);
  const logs = stmt.all() as any[];
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
       // if we have no activity today, check yesterday. If yesterday has activity, streak is alive
       cursorDate.setDate(cursorDate.getDate() - 1);
    } else {
       break;
    }
  }
  return streak;
}
