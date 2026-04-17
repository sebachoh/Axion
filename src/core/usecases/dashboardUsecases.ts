import db from '@/infrastructure/db/sqlite';
import { Habit } from '@/core/domain/Habit';
import { Task } from '@/core/domain/Task';

export interface DashboardData {
  date: string;
  habits: Habit[];
  habitsCompletedToday: number;
  tasksToday: Task[];
  tasksPending: number;
  timeBlocksToday: { title: string; startTime: string; durationMins: number; color: string }[];
  totalTimeBlockedMins: number;
  journalMoodToday: string | null;
  pendingTasksHighPriority: number;
  financialBalance: number;
}

function getTodayStr() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
}

export function getDashboardData(): DashboardData {
  const today = getTodayStr();

  // Habits
  const habitsRows = db.prepare('SELECT id, name, color, created_at as createdAt FROM habits').all() as any[];
  const habits: Habit[] = habitsRows.map(r => ({ id: r.id, name: r.name, color: r.color, createdAt: new Date(r.createdAt) }));

  const completedToday = db.prepare(
    `SELECT COUNT(*) as cnt FROM habit_logs WHERE date = @today AND status = 'done'`
  ).get({ today }) as any;

  // Tasks
  const tasksRows = db.prepare('SELECT id, title, status, priority, deadline, notes, created_at as createdAt FROM tasks ORDER BY created_at DESC').all() as any[];
  const tasks: Task[] = tasksRows.map(r => ({ ...r, createdAt: new Date(r.createdAt) }));

  const tasksToday = tasks.filter(t => t.deadline === today && t.status !== 'done');
  const tasksPending = tasks.filter(t => t.status === 'pending').length;
  const highPriority = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length;

  // Time blocks
  const blocksRows = db.prepare(
    'SELECT title, start_time as startTime, duration_mins as durationMins, color FROM time_blocks WHERE block_date = @today ORDER BY start_time ASC'
  ).all({ today }) as any[];
  const totalMins = blocksRows.reduce((acc: number, b: any) => acc + b.durationMins, 0);

  // Journal mood today
  const journalRow = db.prepare(
    `SELECT mood FROM journal_entries WHERE date(created_at) = @today ORDER BY created_at DESC LIMIT 1`
  ).get({ today }) as any;

  // Financial balance
  const financeRows = db.prepare('SELECT type, amount FROM finance_transactions').all() as any[];
  const balance = financeRows.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);

  return {
    date: today,
    habits,
    habitsCompletedToday: completedToday?.cnt ?? 0,
    tasksToday,
    tasksPending,
    timeBlocksToday: blocksRows,
    totalTimeBlockedMins: totalMins,
    journalMoodToday: journalRow?.mood ?? null,
    pendingTasksHighPriority: highPriority,
    financialBalance: balance,
  };
}

// Keep backward compat
export async function getDashboardSummary() {
  const data = getDashboardData();
  return { habits: data.habits, monthlyProgress: 0 };
}
