import Link from 'next/link';
import React from 'react';
import db from '@/infrastructure/db/sqlite';
import { auth } from '@/auth';
import AddCareerCard from '@/components/AddCareerCard';

async function getUserCareers(userId: string) {
  const stmt = db.prepare('SELECT * FROM user_specializations WHERE user_id = ? ORDER BY created_at DESC');
  return await stmt.all(userId) as any[];
}

export default async function CareersPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  if (!userId) return null;

  const careers = await getUserCareers(userId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 className="page-title" style={{ fontSize: '2.5rem' }}>Careers</h1>
        <p className="page-subtitle">Academia / Especializaciones del Futuro</p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '1.5rem',
      }}>
        {careers.map(career => (
          <Link key={career.id} href={`/academia/careers/${career.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="glass-panel" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'flex-start', 
              justifyContent: 'center',
              padding: '2rem',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              height: '100%',
              minHeight: '200px'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', background: `linear-gradient(135deg, ${career.color_start}, ${career.color_end})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>
                {career.short_code}
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                {career.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                {career.description}
              </p>
            </div>
          </Link>
        ))}

        <AddCareerCard />
      </div>
    </div>
  );
}
