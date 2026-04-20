import StickyNotesCanvas from '@/components/StickyNotesCanvas';
import { getStickyNotes } from '@/core/usecases/stickyUsecases';

export default async function StickyNotesPage() {
  const initialNotes = await getStickyNotes();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '90vh' }}>
      <header style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '2.5rem' }}>Notas</h1>
          <p className="page-subtitle">Dashboard / Workspace Rápido</p>
        </div>
      </header>

      <div style={{ flex: 1 }}>
        <StickyNotesCanvas initialNotes={initialNotes} />
      </div>
    </div>
  );
}
