import Link from 'next/link';
import { getDashboardData } from '@/core/usecases/dashboardUsecases';
import db from '@/infrastructure/db/sqlite';

const MOOD_EMOJIS: Record<string, string> = {
  '1': '😫',
  '2': '😕',
  '3': '😐',
  '4': '🙂',
  '5': '😍',
};

function getPriorityColor(p: string) {
  if (p === 'high') return '#ff6b6b';
  if (p === 'medium') return '#feca57';
  return '#1dd1a1';
}

async function getLatestJournalEntry() {
  return db.prepare('SELECT content FROM journal_entries ORDER BY created_at DESC LIMIT 1').get() as { content: string } | undefined;
}

export default async function DashboardPage() {
  const data = getDashboardData();
  const latestJournal = await getLatestJournalEntry();

  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const habitsTotal = data.habits.length;
  const habitsCompleted = data.habitsCompletedToday;
  const habitsPct = habitsTotal > 0 ? Math.round((habitsCompleted / habitsTotal) * 100) : 0;
  const hoursBlocked = Math.round(data.totalTimeBlockedMins / 60 * 10) / 10;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ── Hero Banner ── */}
      <div className="full-bleed" style={{
        width: 'calc(100% + 4rem)',
        marginTop: 'calc(-1 * var(--spacing-xl))',
        height: '280px',
        position: 'relative',
        background: 'url(https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=1400&q=80) center/cover no-repeat', // Nature/Focus
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '3rem',
        marginBottom: '-1rem',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'capitalize', marginBottom: '0.5rem' }}>
            {currentDate}
          </p>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.06em', lineHeight: 1.0, color: '#fff', textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}>
            LifeOS Dashboard
          </h1>
        </div>
        
        {data.journalMoodToday && (
          <div style={{ 
            position: 'absolute', top: '2rem', right: '3rem', textAlign: 'center', 
            padding: '1rem 1.75rem', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', 
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{ fontSize: '2.5rem' }}>{MOOD_EMOJIS[data.journalMoodToday] || '😶'}</div>
            <p style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 700, marginTop: '6px', opacity: 0.8 }}>Mood Actual</p>
          </div>
        )}
      </div>

      {/* ── Quick Stats Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Hábitos Hoy', value: `${habitsCompleted}/${habitsTotal}`, sub: `${habitsPct}%`, color: '#1dd1a1', icon: '🌱' },
          { label: 'Tareas Hoy', value: data.tasksToday.length, sub: 'Pendientes', color: '#feca57', icon: '⚡' },
          { label: 'Time Blocking', value: `${hoursBlocked}h`, sub: 'Agendadas', color: '#a29bfe', icon: '🗓️' },
          { label: 'Financial Balance', value: `$${data.financialBalance.toLocaleString()}`, sub: 'Capital total', color: '#2ed573', icon: '💰' },
          { label: 'Urgencia', value: data.pendingTasksHighPriority, sub: 'Fuego', color: '#ff6b6b', icon: '🔥' },
        ].map(stat => (
          <div key={stat.label} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem' }}>{stat.icon}</span>
              <span style={{ fontWeight: 800, fontSize: '1.4rem', color: stat.color }}>{stat.value}</span>
            </div>
            <p style={{ fontWeight: 700, fontSize: '0.8rem', margin: 0 }}>{stat.label}</p>
            <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', margin: 0 }}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Contextual Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Sector: Foco y Tareas */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>🎯 Foco Táctico</h3>
          {data.tasksToday.length === 0 ? (
            <p style={{ opacity: 0.5, fontStyle: 'italic', fontSize: '0.9rem' }}>Agenda limpia. ¡Disfruta el día!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {data.tasksToday.map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px', borderRadius: '8px', borderLeft: `3px solid ${getPriorityColor(t.priority)}`, background: 'rgba(255,255,255,0.03)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t.title}</span>
                    {t.notes && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{t.notes}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link href="/workspace/tareas" style={{ fontSize: '0.8rem', color: '#feca57', textDecoration: 'none', marginTop: '1rem', fontWeight: 600 }}>Administrar tareas →</Link>
        </div>

        {/* Sector: Journal Reflection */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>📓 Bitácora</h3>
          {latestJournal ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontStyle: 'italic', fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
                "{latestJournal.content.length > 120 ? latestJournal.content.substring(0, 120) + '...' : latestJournal.content}"
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Última reflexión guardada.</p>
            </div>
          ) : (
            <p style={{ opacity: 0.5, fontStyle: 'italic', fontSize: '0.9rem' }}>No has escrito nada hoy.</p>
          )}
          <Link href="/lifestyle/journal" style={{ fontSize: '0.8rem', color: '#ff7f50', textDecoration: 'none', marginTop: '1rem', fontWeight: 600 }}>Ir al Journal →</Link>
        </div>

        {/* Sector: Financial Milestone */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>💰 Wealth Mirror</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
             <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Balance Neto Actual</p>
             <h4 style={{ fontSize: '1.8rem', fontWeight: 800 }}>${data.financialBalance.toLocaleString()}</h4>
             <div style={{ height: '4px', background: 'rgba(46, 213, 115, 0.1)', borderRadius: '2px', overflow: 'hidden', marginTop: '0.5rem' }}>
                <div style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg, #2ed573, #1dd1a1)' }} />
             </div>
          </div>
          <Link href="/lifestyle/finanzas" style={{ fontSize: '0.8rem', color: '#2ed573', textDecoration: 'none', marginTop: '1rem', fontWeight: 600 }}>Ver Finanzas →</Link>
        </div>

      </div>

      {/* ── Quick Navigation ── */}
      <div>
        <p style={{ fontWeight: 800, marginBottom: '1.25rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.75rem' }}>
          Launcher Central
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
          {[
            { label: 'Planeación', href: '/workspace/planeacion', icon: '📅' },
            { label: 'Tareas', href: '/workspace/tareas', icon: '✅' },
            { label: 'Rutinas', href: '/rutinas', icon: '🌀' },
            { label: 'Journal', href: '/lifestyle/journal', icon: '📓' },
            { label: 'Finanzas', href: '/lifestyle/finanzas', icon: '💰' },
            { label: 'Alternancia', href: '/workspace/alternancia', icon: '🎯' },
            { label: 'Idiomas', href: '/academia/idiomas', icon: '🌍' },
            { label: 'Careers', href: '/academia/careers', icon: '💻' },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s ease' }}>
                <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
