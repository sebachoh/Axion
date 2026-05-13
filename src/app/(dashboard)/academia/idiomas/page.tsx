import Link from 'next/link';
import db from '@/infrastructure/db/sqlite';
import { auth } from '@/auth';
import AddLanguageCard from '@/components/AddLanguageCard';

async function getUserLanguages(userId: string) {
  const stmt = db.prepare('SELECT * FROM user_languages WHERE user_id = ? ORDER BY created_at DESC');
  return await stmt.all(userId) as any[];
}

export default async function IdiomasPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  if (!userId) return null;

  const languages = await getUserLanguages(userId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 className="page-title" style={{ fontSize: '2.4rem' }}>Centro de Idiomas</h1>
        <p className="page-subtitle">Academia / Políglota</p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
        gap: '1.5rem',
        marginTop: '1rem' 
      }}>
        {languages.map((lang) => (
          <Link href={lang.path} key={lang.id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="glass-panel" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              height: '100%'
            }}>
              <div style={{ 
                fontSize: '4rem', 
                marginBottom: '1rem', 
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' 
              }}>
                {lang.flag}
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                {lang.name}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                {lang.description}
              </p>
            </div>
          </Link>
        ))}

        <AddLanguageCard />
      </div>
    </div>
  );
}
