import db from '@/infrastructure/db/sqlite';
import JournalFeed, { JournalEntry } from '@/components/JournalFeed';
import { auth } from '@/auth';

async function getJournalEntries(userId: string): Promise<JournalEntry[]> {
  const rows = await db.prepare('SELECT id, content, mood, media_url as mediaUrl, created_at as createdAt FROM journal_entries WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[];
  
  return rows.map(r => ({
    ...r,
    createdAt: new Date(r.createdAt)
  }));
}

export default async function Page() {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  if (!userId) return null;

  const entries = await getJournalEntries(userId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 className="page-title" style={{ fontSize: '3rem', fontWeight: 800 }}>Bitácora del Alma</h1>
        <p className="page-subtitle">Reflexiones, capturas y estados de ánimo.</p>
      </header>

      <JournalFeed entries={entries} />
    </div>
  );
}
