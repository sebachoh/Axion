import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'LifeOS | Personal Workspace',
  description: 'Your aesthetic, dynamic, and modular life management system.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="animate-fade-in" suppressHydrationWarning>
        <div className="dashboard-layout">
          <aside className="sidebar">
            <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ fontSize: '1.4rem' }}>⚡</div>
              <h2>Axion</h2>
            </div>
            
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
              
              {/* Dashboard */}
              <div className="sidebar-section">
                <span className="sidebar-section-title" style={{ fontSize: '0.9rem', color: 'var(--color-text)', opacity: 0.9 }}>❖ Dashboard</span>
                <Link href="/" className="sidebar-link active">Resumen Diario</Link>
                <Link href="/workspace/planeacion" className="sidebar-link">Planeación del Día</Link>
                <Link href="/rutinas" className="sidebar-link">Rutinas</Link>
                <Link href="/stickynotes" className="sidebar-link">Notas</Link>
                <Link href="/workspace/tareas" className="sidebar-link">Tareas</Link>
              </div>

              {/* Workspace / Ecole & Trabajo */}
              <div className="sidebar-section">
                <span className="sidebar-section-title">🚀 Ecole & Trabajo</span>
                <Link href="/workspace/proyectos" className="sidebar-link">Proyectos de Portafolio</Link>
                <Link href="/workspace/alternancia" className="sidebar-link">Seguimiento Alternancia</Link>
              </div>

              {/* Academia */}
              <div className="sidebar-section">
                <span className="sidebar-section-title">🎓 Academia</span>
                <Link href="/academia/idiomas" className="sidebar-link">Idiomas</Link>
                <Link href="/academia/careers" className="sidebar-link">Careers</Link>
              </div>

              {/* Personal */}
              <div className="sidebar-section">
                <span className="sidebar-section-title">👤 Personal</span>
                <Link href="/journal" className="sidebar-link">Journal</Link>
                <Link href="/finanzas" className="sidebar-link">Finanzas</Link>
              </div>

              {/* Bóveda */}
              <div className="sidebar-section">
                <span className="sidebar-section-title">🗃️ Bóveda</span>
                <Link href="/boveda/vision" className="sidebar-link">Vision Board</Link>
                <Link href="/boveda/recursos" className="sidebar-link">Recursos (Vault)</Link>
              </div>
            </nav>
            
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--bg-gradient-1), var(--bg-gradient-3))' }}></div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Sebastián</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Local System</span>
                </div>
              </div>
            </div>
          </aside>
          
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
