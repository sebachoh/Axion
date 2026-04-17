const fs = require('fs');
const path = require('path');

const routes = [
  { path: 'revisiones', title: 'Revisiones', sub: 'Dashboard' },
  { path: 'workspace/proyectos', title: 'Proyectos Tech', sub: 'Workspace' },
  { path: 'workspace/alternancia', title: 'Alternancia', sub: 'Workspace' },
  { path: 'academia/idiomas', title: 'Idiomas', sub: 'Academia' },
  { path: 'academia/programacion', title: 'Programación', sub: 'Academia' },
  { path: 'academia/notas', title: 'Notas de Estudio', sub: 'Academia' },
  { path: 'lifestyle/finanzas', title: 'Finanzas', sub: 'Lifestyle' },
  { path: 'lifestyle/viajes', title: 'Viajes', sub: 'Lifestyle' },
  { path: 'lifestyle/journal', title: 'Journal', sub: 'Lifestyle' },
  { path: 'boveda/vision', title: 'Vision Board', sub: 'Bóveda' },
  { path: 'boveda/recursos', title: 'Recursos', sub: 'Bóveda' }
];

routes.forEach(r => {
  const fullPath = path.join(__dirname, '../src/app', r.path);
  fs.mkdirSync(fullPath, { recursive: true });
  const content = `
import NotionEditor from '@/components/NotionEditor';
import { getPageContent } from '@/core/usecases/pageUsecases';

export default async function Page() {
  const initialContent = await getPageContent('/${r.path}');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 className="page-title" style={{ fontSize: '2.5rem' }}>${r.title}</h1>
        <p className="page-subtitle">${r.sub} Sector</p>
      </header>

      {/* Placeholder for future specialized widgets */}
      <div className="glass-panel" style={{ padding: '1rem', background: 'var(--glass-bg-hover)', color: 'var(--color-text-muted)', fontSize: '0.9rem', textAlign: 'center', borderRadius: 'var(--radius-sm)' }}>
        ✨ Los Widgets Interactivos de ${r.title} pueden insertarse aquí arriba.
      </div>

      {/* Notion-Like Free Text Area */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Página Libre de Bloques</h3>
        <NotionEditor initialContent={initialContent} route="/${r.path}" />
      </div>
    </div>
  );
}
`;
  // Avoid overwriting workspace/proyectos if it was a custom file
  fs.writeFileSync(path.join(fullPath, 'page.tsx'), content.trim() + '\n');
});
