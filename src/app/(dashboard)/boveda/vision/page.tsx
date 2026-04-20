import VisionBoardUI from '@/components/VisionBoardUI';
import { getVisionBoards } from './actions';
import NotionEditor from '@/components/NotionEditor';
import { getPageContent } from '@/core/usecases/pageUsecases';

export default async function Page() {
  const visions = await getVisionBoards();
  const initialContent = await getPageContent('/boveda/vision');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <header>
        <h1 className="page-title" style={{ fontSize: '2.5rem' }}>Vision Board</h1>
        <p className="page-subtitle">Visualización estratégica a largo plazo</p>
      </header>

      {/* Structured Vision Board */}
      <VisionBoardUI initialVisions={visions as any} />

      <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)', margin: '2rem 0' }} />

      {/* Notion-Like Free Text Area for details */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.5rem', opacity: 0.5 }}>Notas & Manifiestos</h3>
        <NotionEditor initialContent={initialContent} route="/boveda/vision" />
      </div>
    </div>
  );
}
