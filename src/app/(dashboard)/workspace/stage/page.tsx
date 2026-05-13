import db from '@/infrastructure/db/sqlite';
import { auth } from '@/auth';
import StageDashboard, { StageTask, StageProject, StageCommand } from '@/components/StageDashboard';
import NotionEditor from '@/components/NotionEditor';
import { getPageContent } from '@/core/usecases/pageUsecases';
import { Briefcase } from 'lucide-react';
import { seedStageTasksIfNeeded } from './actions';

async function getStageTasks(userId: string): Promise<StageTask[]> {
  const stmt = db.prepare('SELECT id, title, status, priority, month, created_at as createdAt FROM stage_tasks WHERE user_id = ? ORDER BY created_at DESC');
  const rows = await stmt.all(userId) as any[];
  return rows.map(r => ({
    ...r,
    createdAt: new Date(r.createdAt)
  }));
}

async function getStageProjects(userId: string): Promise<StageProject[]> {
  const stmt = db.prepare('SELECT id, title, description, status, created_at as createdAt FROM stage_projects WHERE user_id = ? ORDER BY created_at DESC');
  const rows = await stmt.all(userId) as any[];
  return rows.map(r => ({
    ...r,
    createdAt: new Date(r.createdAt)
  }));
}

async function getStageCommands(userId: string): Promise<StageCommand[]> {
  const stmt = db.prepare('SELECT id, title, command, description, category, created_at as createdAt FROM stage_commands WHERE user_id = ? ORDER BY created_at DESC');
  const rows = await stmt.all(userId) as any[];
  return rows.map(r => ({
    ...r,
    createdAt: new Date(r.createdAt)
  }));
}

export default async function StagePage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  if (!userId) return null;

  // Sembrar tareas del Stage interactivas si es necesario
  await seedStageTasksIfNeeded();

  const [tasks, projects, commands, initialContent] = await Promise.all([
    getStageTasks(userId),
    getStageProjects(userId),
    getStageCommands(userId),
    getPageContent('/workspace/stage')
  ]);

  return (
    <div className="dashboard-page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: 'var(--color-text)', color: 'var(--color-bg)', padding: '10px', borderRadius: '16px' }}>
          <Briefcase size={28} />
        </div>
        <div>
          <h1 className="page-title" style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, letterSpacing: '-0.05em' }}>Stage</h1>
          <p className="page-subtitle" style={{ color: 'var(--color-text-muted)', fontSize: '1rem', marginTop: '4px' }}>Gestión de pendientes, proyectos, comandos y recursos de tus prácticas</p>
        </div>
      </header>

      {/* Interactive dashboard widgets */}
      <StageDashboard initialTasks={tasks} initialProjects={projects} initialCommands={commands} />

      {/* Notion-style Free Writing Area */}
      <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem', marginTop: '1rem' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>Anexos y Bitácora Libre</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Escribe notas libres, guías de desarrollo completas, bitácora del día a día, etc. El contenido se guardará de forma automática.</p>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <NotionEditor initialContent={initialContent} route="/workspace/stage" />
        </div>
      </div>
    </div>
  );
}
