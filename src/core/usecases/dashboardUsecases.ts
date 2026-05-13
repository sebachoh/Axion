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
  routineType: 'mañana' | 'noche';
  routineTasks: { id: string; name: string; completed: boolean }[];
  latestVision?: { title: string; area: string; timeframe: string };
  latestVaultResource?: { title: string; type: string };
  weeklyHabitStats: { date: string; count: number }[];
  weeklyTaskStats: { date: string; count: number }[];
}

function getTodayStr() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const today = getTodayStr();

  // Habits
  const habitsRows = await db.prepare('SELECT id, name, color, created_at as createdAt FROM habits WHERE user_id = ?').all(userId) as any[];
  const habits: Habit[] = habitsRows.map(r => ({ id: r.id, name: r.name, color: r.color, createdAt: new Date(r.createdAt) }));

  const completedToday = await db.prepare(
    `SELECT COUNT(*) as cnt FROM habit_logs WHERE user_id = @userId AND date = @today AND status = 'done'`
  ).get({ userId, today }) as any;

  // Tasks
  const tasksRows = await db.prepare('SELECT id, title, status, priority, deadline, notes, created_at as createdAt FROM tasks WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[];
  const tasks: Task[] = tasksRows.map(r => ({ ...r, createdAt: new Date(r.createdAt) }));

  const tasksToday = tasks.filter(t => t.deadline === today && t.status !== 'done');
  const tasksPending = tasks.filter(t => t.status === 'pending').length;
  const highPriority = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length;

  // Time blocks
  const blocksRows = await db.prepare(
    'SELECT title, start_time as startTime, duration_mins as durationMins, color FROM time_blocks WHERE user_id = @userId AND block_date = @today ORDER BY start_time ASC'
  ).all({ userId, today }) as any[];
  const totalMins = blocksRows.reduce((acc: number, b: any) => acc + b.durationMins, 0);

  // Journal mood today
  const journalRow = await db.prepare(
    `SELECT mood FROM journal_entries WHERE user_id = @userId AND date(created_at) = @today ORDER BY created_at DESC LIMIT 1`
  ).get({ userId, today }) as any;

  // Financial balance
  const financeRows = await db.prepare('SELECT type, amount FROM finance_transactions WHERE user_id = ?').all(userId) as any[];
  const balance = financeRows.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);

  // Routines Connection
  const hour = new Date().getHours();
  const routineType: 'mañana' | 'noche' = hour < 15 ? 'mañana' : 'noche';
  const dbType = routineType === 'mañana' ? 'morning' : 'night';

  const routineRows = await db.prepare(`
    SELECT rt.id, rt.task_name as name, 
    EXISTS(SELECT 1 FROM routine_completions rc WHERE rc.user_id = @userId AND rc.task_id = rt.id AND rc.completion_date = @today) as completed
    FROM routine_tasks rt
    WHERE rt.user_id = @userId AND rt.type = @dbType
    ORDER BY rt.order_index ASC
  `).all({ userId, dbType, today }) as any[];

  // Vision & Vault snippets
  const vision = await db.prepare('SELECT title, area, timeframe FROM vision_boards WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(userId) as any;
  const vault = await db.prepare('SELECT title, type FROM vault_resources WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(userId) as any;

  // Weekly Stats
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const startDate = sevenDaysAgo.toISOString().split('T')[0];

  const habitWeekly = await db.prepare(`
    SELECT date, COUNT(*) as count FROM habit_logs 
    WHERE user_id = @userId AND date >= @startDate AND status = 'done'
    GROUP BY date ORDER BY date ASC
  `).all({ userId, startDate }) as { date: string; count: number }[];

  const taskWeekly = await db.prepare(`
    SELECT date(created_at) as date, COUNT(*) as count FROM tasks 
    WHERE user_id = @userId AND date(created_at) >= @startDate AND status = 'done'
    GROUP BY date(created_at) ORDER BY date ASC
  `).all({ userId, startDate }) as { date: string; count: number }[];

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
    routineType,
    routineTasks: routineRows,
    latestVision: vision ? { title: vision.title, area: vision.area, timeframe: vision.timeframe } : undefined,
    latestVaultResource: vault ? { title: vault.title, type: vault.type } : undefined,
    weeklyHabitStats: habitWeekly,
    weeklyTaskStats: taskWeekly,
  };
}

// Keep backward compat
export async function getDashboardSummary(userId?: string) {
  if (!userId) return { habits: [], monthlyProgress: 0 };
  const data = await getDashboardData(userId);
  return { habits: data.habits, monthlyProgress: 0 };
}
