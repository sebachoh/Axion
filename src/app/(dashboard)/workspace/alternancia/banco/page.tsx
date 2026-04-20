import db from '@/infrastructure/db/sqlite';
import AlternanciaBankUI from '@/components/AlternanciaBankUI';

export interface BankItem {
  id: string;
  category: string;
  title: string;
  meta: string;
  createdAt: Date;
}

function getBankItems(): BankItem[] {
  const stmt = db.prepare('SELECT id, category, title, meta, created_at as createdAt FROM alternancia_bank ORDER BY created_at DESC');
  const rows = stmt.all() as unknown[];
  
  return rows.map((row: unknown) => {
    const r = row as any;
    return {
      id: r.id,
      category: r.category,
      title: r.title,
      meta: r.meta || '',
      createdAt: new Date(r.createdAt),
    };
  });
}

export default function BancoAlternanciaPage() {
  const items = getBankItems();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AlternanciaBankUI initialItems={items} />
    </div>
  );
}
