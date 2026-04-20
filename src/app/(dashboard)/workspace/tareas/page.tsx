import { Task } from '@/core/domain/Task';
import db from '@/infrastructure/db/sqlite';
import TareasDashboard from '@/components/TareasDashboard';

// Fetch tasks
function getTasks(): Task[] {
  const stmt = db.prepare('SELECT id, title, status, priority, deadline, notes, created_at as createdAt FROM tasks ORDER BY created_at DESC');
  const rows = stmt.all() as unknown[];
  
  return rows.map((row: unknown) => {
    const r = row as { id: string, title: string, status: string, priority: string, deadline: string | null, notes: string | null, createdAt: string };
    return {
    id: r.id,
    title: r.title,
    status: r.status,
    priority: r.priority,
    deadline: r.deadline,
    notes: r.notes,
    createdAt: new Date(r.createdAt),
    };
  });
}

export default function TareasPage() {
  const tasks = getTasks();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 className="page-title" style={{ fontSize: '2.5rem' }}>Vista de Mando (Tareas)</h1>
        <p className="page-subtitle">Priorativas, Deadlines y Sprints.</p>
      </header>

      <TareasDashboard initialTasks={tasks} />
    </div>
  );
}
