import db from '@/infrastructure/db/sqlite';
import JournalBoard, { JournalEntry } from '@/components/JournalBoard';

async function getJournalEntries(): Promise<JournalEntry[]> {
  const stmt = db.prepare('SELECT id, content, media_url as mediaUrl, mood, created_at as createdAt FROM journal_entries ORDER BY created_at DESC');
  const rows = await stmt.all() as unknown[];
  
  return rows.map((row: unknown) => {
    const r = row as any;
    return {
      id: r.id,
      content: r.content,
      mediaUrl: r.mediaUrl,
      mood: r.mood,
      createdAt: new Date(r.createdAt),
    };
  });
}

export default async function JournalPage() {
  const entries = await getJournalEntries();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 className="page-title" style={{ fontSize: '2.5rem' }}>Journal</h1>
        <p className="page-subtitle">Personal / Tu feed y Bitácora Emocional</p>
      </header>

      <JournalBoard initialEntries={entries} />
    </div>
  );
}
