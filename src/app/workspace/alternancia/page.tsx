import db from '@/infrastructure/db/sqlite';
import AlternanciaDashboard, { AlternanciaApp } from '@/components/AlternanciaDashboard';

function getAlternanciaApps(): AlternanciaApp[] {
  const stmt = db.prepare('SELECT id, app_number as appNumber, role_name as roleName, company, url, status, last_update as lastUpdate, created_at as createdAt FROM alternancia_applications ORDER BY created_at DESC');
  const rows = stmt.all() as unknown[];
  
  return rows.map((row: unknown) => {
    const r = row as any;
    return {
      id: r.id,
      appNumber: r.appNumber,
      roleName: r.roleName,
      company: r.company,
      url: r.url,
      status: r.status,
      lastUpdate: new Date(r.lastUpdate),
      createdAt: new Date(r.createdAt),
    };
  });
}

export default function AlternanciaPage() {
  const apps = getAlternanciaApps();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <AlternanciaDashboard initialApps={apps} />
    </div>
  );
}
