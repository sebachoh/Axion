import Link from 'next/link';
import db from '@/infrastructure/db/sqlite';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function CareerSubportalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect('/login');
  }

  const career = await db.prepare('SELECT * FROM user_specializations WHERE id = ? AND user_id = ?').get(id, userId) as any;

  if (!career) {
    return <div>Especialización no encontrada</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ paddingBottom: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
        <Link href="/academia/careers" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-block', marginBottom: '1rem' }}>
          ← Volver a Careers
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            fontSize: '2rem', 
            background: `linear-gradient(135deg, ${career.color_start}, ${career.color_end})`, 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent', 
            fontWeight: 800 
          }}>
            {career.short_code}
          </div>
          <h1 className="page-title" style={{ margin: 0 }}>{career.title}</h1>
        </div>
        <p className="page-subtitle" style={{ marginTop: '0.5rem' }}>{career.description}</p>
      </header>

      <div className="glass-panel" style={{ padding: '2rem', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
          El entorno de aprendizaje para "{career.title}" está listo.<br/>
          Pronto podrás añadir módulos, certificaciones y proyectos aquí.
        </p>
      </div>
    </div>
  );
}
