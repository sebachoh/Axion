import db from '@/infrastructure/db/sqlite';
import TimeBlockingDashboard, { TimeBlock } from '@/components/TimeBlockingDashboard';
import { Task } from '@/core/domain/Task';
import { auth } from '@/auth';

function getTimeBlocks(date: string, userId: string): TimeBlock[] {
  const stmt = db.prepare('SELECT id, title, start_time as startTime, duration_mins as durationMins, color, block_date as blockDate FROM time_blocks WHERE block_date = @date AND user_id = @userId ORDER BY start_time ASC');
  const rows = stmt.all({ date, userId }) as unknown[];
  
  return rows.map((row: unknown) => {
    const r = row as any;
    return {
      id: r.id,
      title: r.title,
      startTime: r.startTime,
      durationMins: r.durationMins,
      color: r.color,
      blockDate: r.blockDate
    };
  });
}

function getTodayStr() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getTasks(userId: string): Task[] {
  const stmt = db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC');
  const rows = stmt.all(userId) as any[];
  
  return rows.map(row => ({
    id: row.id,
    title: row.title,
    status: row.status,
    priority: row.priority,
    deadline: row.deadline,
    notes: row.notes,
    createdAt: new Date(row.created_at)
  }));
}

function getBankActivities(userId: string) {
  const stmt = db.prepare('SELECT id, name, color, default_mins as defaultMins, icon FROM planning_bank WHERE user_id = ? ORDER BY created_at ASC');
  return stmt.all(userId) as any[];
}

export default async function PlaneacionPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  if (!userId) return null;

  const todayStr = getTodayStr();
  const blocks = getTimeBlocks(todayStr, userId);
  const tasks = getTasks(userId);
  const bankActivities = getBankActivities(userId);

  return (
    <div className="dashboard-page-wrapper" style={{ 
      maxWidth: '1400px', 
      width: '100%', 
      margin: '0 auto', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '2rem',
      paddingBottom: '3rem'
    }}>
      <header>
        <h1 className="page-title" style={{ fontSize: '2.5rem' }}>Planeación del Día</h1>
        <p className="page-subtitle">Time Blocking Visual & Tareas Tácticas / {todayStr}</p>
      </header>

      <TimeBlockingDashboard 
        initialBlocks={blocks} 
        selectedDate={todayStr} 
        initialTasks={tasks} 
        bankActivities={bankActivities}
      />
    </div>
  );
}
