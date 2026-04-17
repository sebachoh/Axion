import NotionEditor from '@/components/NotionEditor';
import { getPageContent } from '@/core/usecases/pageUsecases';

export default async function Page() {
  const initialContent = await getPageContent('/lifestyle/viajes');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 className="page-title" style={{ fontSize: '2.5rem' }}>Viajes</h1>
        <p className="page-subtitle">Lifestyle Sector</p>
      </header>

      {/* Placeholder for future specialized widgets */}
      <div className="glass-panel" style={{ padding: '1rem', background: 'var(--glass-bg-hover)', color: 'var(--color-text-muted)', fontSize: '0.9rem', textAlign: 'center', borderRadius: 'var(--radius-sm)' }}>
        ✨ Los Widgets Interactivos de Viajes pueden insertarse aquí arriba.
      </div>

      {/* Notion-Like Free Text Area */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Página Libre de Bloques</h3>
        <NotionEditor initialContent={initialContent} route="/lifestyle/viajes" />
      </div>
    </div>
  );
}
