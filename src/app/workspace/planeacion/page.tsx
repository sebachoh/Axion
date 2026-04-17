import db from '@/infrastructure/db/sqlite';
import TimeBlockingDashboard, { TimeBlock } from '@/components/TimeBlockingDashboard';
import { Task } from '@/core/domain/Task';

function getTimeBlocks(date: string): TimeBlock[] {
  const stmt = db.prepare('SELECT id, title, start_time as startTime, duration_mins as durationMins, color, block_date as blockDate FROM time_blocks WHERE block_date = @date ORDER BY start_time ASC');
  const rows = stmt.all({ date }) as unknown[];
  
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
  // Format YYYY-MM-DD local time manually to avoid UTC offset issues
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
function getTasks(): Task[] {
  const stmt = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC');
  const rows = stmt.all() as any[];
  
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

function getBankActivities() {
  const stmt = db.prepare('SELECT id, name, color, default_mins as defaultMins, icon FROM planning_bank ORDER BY created_at ASC');
  return stmt.all() as any[];
}

export default function PlaneacionPage() {
  const todayStr = getTodayStr();
  const blocks = getTimeBlocks(todayStr);
  const tasks = getTasks();
  const bankActivities = getBankActivities();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
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
