import Link from 'next/link';
import db from '@/infrastructure/db/sqlite';
import ProjectIdeaBoard, { IdeaItem } from '@/components/ProjectIdeaBoard';
import AddProjectCard from '@/components/AddProjectCard';
import { auth } from '@/auth';

async function getProjectIdeas(userId: string): Promise<IdeaItem[]> {
  const stmt = db.prepare('SELECT id, content, created_at as createdAt FROM project_ideas WHERE user_id = ? ORDER BY created_at DESC');
  const rows = stmt.all(userId) as unknown[];
  
  return rows.map((row: unknown) => {
    const r = row as any;
    return {
      id: r.id,
      content: r.content,
      createdAt: new Date(r.createdAt),
    };
  });
}

async function getActiveProjects(userId: string) {
  const stmt = db.prepare('SELECT * FROM active_projects WHERE user_id = ? ORDER BY created_at DESC');
  return stmt.all(userId) as any[];
}

export default async function ProyectosPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  if (!userId) return null;

  const [ideas, projects] = await Promise.all([
    getProjectIdeas(userId),
    getActiveProjects(userId)
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 className="page-title" style={{ fontSize: '2.5rem' }}>Proyectos de Portafolio</h1>
        <p className="page-subtitle">Ecole & Trabajo / Incubadora de Startups</p>
      </header>

      <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: '1rem', marginBottom: '-1rem' }}>Proyectos Activos</h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '1.5rem',
      }}>
        
        {projects.map((project) => (
          <Link key={project.id} href="#" style={{ textDecoration: 'none', color: 'inherit' }}>
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
              <div style={{ 
                fontSize: '3rem', 
                marginBottom: '1rem', 
                background: `linear-gradient(135deg, ${project.color_start}, ${project.color_end})`, 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent', 
                fontWeight: 800 
              }}>
                {project.short_name}
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                {project.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                {project.description}
              </p>
            </div>
          </Link>
        ))}

        <AddProjectCard />

      </div>

      <ProjectIdeaBoard initialIdeas={ideas} />

    </div>
  );
}
v>

      {/* Muro Inferior de Ideas (Client Component stateful) */}
      <ProjectIdeaBoard initialIdeas={ideas} />

    </div>
  );
}
