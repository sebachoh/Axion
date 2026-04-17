import Link from 'next/link';
import db from '@/infrastructure/db/sqlite';
import ProjectIdeaBoard, { IdeaItem } from '@/components/ProjectIdeaBoard';

function getProjectIdeas(): IdeaItem[] {
  const stmt = db.prepare('SELECT id, content, created_at as createdAt FROM project_ideas ORDER BY created_at DESC');
  const rows = stmt.all() as unknown[];
  
  return rows.map((row: unknown) => {
    const r = row as any;
    return {
      id: r.id,
      content: r.content,
      createdAt: new Date(r.createdAt),
    };
  });
}

export default function ProyectosPage() {
  const ideas = getProjectIdeas();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 className="page-title" style={{ fontSize: '2.5rem' }}>Proyectos de Portafolio</h1>
        <p className="page-subtitle">Ecole & Trabajo / Incubadora de Startups</p>
      </header>

      {/* Proyectos Principales (Top Widgets like Idiomas) */}
      <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: '1rem', marginBottom: '-1rem' }}>Proyectos Activos</h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '1.5rem',
      }}>
        
        {/* Widget 1 */}
        <Link href="#" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="glass-panel" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-start', 
            justifyContent: 'center',
            padding: '2rem',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            height: '100%'
          }}
          // Basic inline hover effect simulation since it's a server component visually, 
          // but we can rely on standard CSS or simple transitions
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(135deg, #FF9A9E, #FECFEF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>
              ES
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
              Exploradores de Sueños
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
              Startup core. Arquitectura escalable y modelo de usuarios interactivo.
            </p>
          </div>
        </Link>

        {/* Widget 2 */}
        <Link href="#" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="glass-panel" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-start', 
            justifyContent: 'center',
            padding: '2rem',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            height: '100%'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(135deg, #A1C4FD, #C2E9FB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>
              MC
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
              Mecani
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
              Plataforma y automatizaciones. Motor interno y lógica de negocio.
            </p>
          </div>
        </Link>

        {/* Añadir Nuevo Proyecto Card */}
        <div className="glass-panel" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: 'rgba(255,255,255,0.02)',
          border: '1px dashed rgba(255,255,255,0.1)'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', opacity: 0.5 }}>+</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>
            Lanzar nuevo proyecto
          </h3>
        </div>

      </div>

      {/* Muro Inferior de Ideas (Client Component stateful) */}
      <ProjectIdeaBoard initialIdeas={ideas} />

    </div>
  );
}
