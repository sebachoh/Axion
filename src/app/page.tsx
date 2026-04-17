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

function getEndTime(startTime: string, durationMins: number): string {
  const [h, m] = startTime.split(':').map(Number);
  const totalMins = h * 60 + m + durationMins;
  const endH = Math.floor(totalMins / 60) % 24;
  const endM = totalMins % 60;
  return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
}

export default async function DashboardPage() {
  const data = getDashboardData();
  const latestJournal = await getLatestJournalEntry();

  const now = new Date();
  const currentHourMins = now.getHours() * 60 + now.getMinutes();

  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  // Calculate Routine Progress
  const totalRoutine = data.routineTasks.length;
  const completedRoutine = data.routineTasks.filter(t => t.completed).length;
  const routinePct = totalRoutine > 0 ? Math.round((completedRoutine / totalRoutine) * 100) : 0;
  
  const hoursBlocked = Math.round(data.totalTimeBlockedMins / 60 * 10) / 10;

  // Find Current & Next Focus
  const sortedBlocks = [...data.timeBlocksToday].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const currentBlock = sortedBlocks.find(b => {
    const [h, m] = b.startTime.split(':').map(Number);
    const startTotal = h * 60 + m;
    const endTotal = startTotal + b.durationMins;
    return currentHourMins >= startTotal && currentHourMins < endTotal;
  });
  
  const nextBlock = sortedBlocks.find(b => {
    const [h, m] = b.startTime.split(':').map(Number);
    const startTotal = h * 60 + m;
    return startTotal > currentHourMins;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>

      {/* ── Hero Banner (Premium Minimalist Architecture) ── */}
      <div className="full-bleed" style={{
        width: 'calc(100% + 4rem)',
        marginTop: 'calc(-1 * var(--spacing-xl))',
        height: '320px',
        position: 'relative',
        background: 'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop) center/cover no-repeat', 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '3.5rem 4rem',
        marginBottom: '-1rem',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.85) 100%)' }} />
        
        <div style={{ position: 'relative', zIndex: 2 }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', fontWeight: 600, textTransform: 'capitalize', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
            {currentDate}
          </p>
          <h1 style={{ fontSize: '4.5rem', fontWeight: 900, letterSpacing: '-0.07em', lineHeight: 0.95, color: '#fff', textShadow: '0 4px 40px rgba(0,0,0,0.6)' }}>
            Axion LifeOS
            <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 400, opacity: 0.6, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '0.5rem' }}>Ecosystem of Focus</span>
          </h1>
        </div>

        {data.journalMoodToday && (
          <div style={{ 
            position: 'absolute', top: '3rem', right: '4rem', textAlign: 'center', 
            minWidth: '120px', padding: '1.25rem', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(25px)', 
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
          }}>
            <div style={{ fontSize: '3rem' }}>{MOOD_EMOJIS[data.journalMoodToday] || '😐'}</div>
            <p style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 800, marginTop: '8px', opacity: 0.9, letterSpacing: '0.05em' }}>MINDSET</p>
          </div>
        )}
      </div>

      {/* ── Live Focus Widget ── */}
      <div className="glass-panel" style={{ 
        padding: '1.5rem 2.5rem', margin: '0 -0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
        borderLeft: '5px solid var(--color-text)', borderRadius: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.5, fontWeight: 700 }}>Ahora Mismo</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{currentBlock ? currentBlock.title : 'Tiempo Libre / Reflexión'}</h2>
               {currentBlock && <span style={{ padding: '2px 10px', borderRadius: '20px', background: currentBlock.color, color: '#000', fontSize: '0.7rem', fontWeight: 800 }}>HASTA {getEndTime(currentBlock.startTime, currentBlock.durationMins)}</span>}
            </div>
          </div>
          <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }} />
          <div>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.5, fontWeight: 700 }}>A Continuación</span>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)' }}>
              {nextBlock ? `${nextBlock.title} (${nextBlock.startTime})` : 'Fin de la jornada'}
            </p>
          </div>
        </div>
        <Link href="/workspace/planeacion" className="glass-button" style={{ padding: '10px 20px', fontSize: '0.8rem', fontWeight: 700 }}>Ver Horario Completo</Link>
      </div>

      {/* ── Stats Pulse Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        {[
          { label: `Rutina ${data.routineType}`, value: `${completedRoutine}/${totalRoutine}`, sub: `${routinePct}% completado`, color: '#1dd1a1', icon: data.routineType === 'mañana' ? '🌅' : '🌙' },
          { label: 'Tareas Hoy', value: data.tasksToday.length, sub: 'En Agenda', color: '#feca57', icon: '⚡' },
          { label: 'Time Blocking', value: `${hoursBlocked}h`, sub: 'Estructura', color: '#a29bfe', icon: '🗓️' },
          { label: 'Wealth Balance', value: `$${data.financialBalance.toLocaleString()}`, sub: 'Wealth Mirror', color: '#2ed573', icon: '💰' },
          { label: 'Urgencia', value: data.pendingTasksHighPriority, sub: 'Puntos de Fuego', color: '#ff6b6b', icon: '🔥' },
        ].map(stat => (
          <div key={stat.label} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '3rem', opacity: 0.05, transform: 'rotate(15deg)' }}>{stat.icon}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.4rem' }}>{stat.icon}</span>
              <span style={{ fontWeight: 800, fontSize: '1.6rem', color: stat.color }}>{stat.value}</span>
            </div>
            <p style={{ fontWeight: 800, fontSize: '0.85rem', margin: 0 }}>{stat.label}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: 0 }}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ── The Bento Ecosystem ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 0.8fr)', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Column 1: EXECUTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Tareas Tácticas */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.2rem' }}>⚡ Táctico Hoy</h3>
              <Link href="/workspace/tareas" style={{ fontSize: '0.8rem', opacity: 0.5 }}>Ver todo</Link>
            </div>
            {data.tasksToday.length === 0 ? (
              <p style={{ opacity: 0.4, fontStyle: 'italic', fontSize: '0.9rem', textAlign: 'center' }}>Despejado. Tiempo de reflexión.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {data.tasksToday.map(t => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', borderLeft: `4px solid ${getPriorityColor(t.priority)}` }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timeblocking Timeline */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.2rem' }}>🗓️ Estructura</h3>
            {data.timeBlocksToday.length === 0 ? (
              <p style={{ opacity: 0.4, fontStyle: 'italic', fontSize: '0.9rem', textAlign: 'center' }}>Sin bloques hoy.</p>
            ) : (
              <div style={{ borderLeft: '2px solid rgba(255,255,255,0.05)', paddingLeft: '1.5rem', marginLeft: '0.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {data.timeBlocksToday.map((b, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '6px', left: '-1.85rem', width: '10px', height: '10px', borderRadius: '50%', background: b.color, boxShadow: `0 0 10px ${b.color}` }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{b.title}</span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>{b.startTime} - {getEndTime(b.startTime, b.durationMins)} ({b.durationMins}m)</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link href="/workspace/planeacion" style={{ fontSize: '0.8rem', opacity: 0.5 }}>Abrir Planeador →</Link>
          </div>
        </div>

        {/* Column 2: RHYTHM */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Active Routine tasks */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.2rem' }}>{data.routineType === 'mañana' ? '🌅 Mañana' : '🌙 Noche'}</h3>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1dd1a1' }}>{routinePct}%</span>
            </div>
            
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${routinePct}%`, background: '#1dd1a1', transition: 'width 1s ease' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {data.routineTasks.length === 0 ? (
                <p style={{ opacity: 0.4, fontStyle: 'italic', fontSize: '0.9rem', textAlign: 'center' }}>Sin tareas configuradas para esta fase.</p>
              ) : data.routineTasks.map(task => (
                <div key={task.id} style={{ 
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', 
                  borderRadius: '10px', background: task.completed ? 'rgba(29,209,161,0.05)' : 'rgba(255,255,255,0.02)',
                  opacity: task.completed ? 0.6 : 1
                }}>
                  <div style={{ 
                    width: '18px', height: '18px', borderRadius: '4px', border: '2px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: task.completed ? '#1dd1a1' : 'transparent'
                  }}>
                    {task.completed && <span style={{ fontSize: '10px', color: '#000' }}>✓</span>}
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, textDecoration: task.completed ? 'line-through' : 'none' }}>{task.name}</span>
                </div>
              ))}
            </div>
            <Link href="/rutinas" style={{ fontSize: '0.8rem', opacity: 0.5 }}>Gestionar Rutinas →</Link>
          </div>
        </div>

        {/* Column 3: WEALTH & REFLECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderBottom: '4px solid #2ed573' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.2rem' }}>💰 Wealth Mirror</h3>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
               <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>Balance Neto</span>
               <h4 style={{ fontSize: '2.5rem', fontWeight: 900 }}>${data.financialBalance.toLocaleString()}</h4>
            </div>
            <Link href="/finanzas" style={{ fontSize: '0.8rem', opacity: 0.5 }}>Wealth Engine →</Link>
          </div>

          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.2rem' }}>📔 Bitácora</h3>
            {latestJournal ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ 
                  fontStyle: 'italic', fontSize: '1rem', color: 'rgba(255,255,255,0.85)', 
                  lineHeight: 1.6, background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', 
                  padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  "{latestJournal.content.length > 200 ? latestJournal.content.substring(0, 200) + '...' : latestJournal.content}"
                </div>
              </div>
            ) : (
              <p style={{ opacity: 0.4, fontStyle: 'italic', fontSize: '0.9rem', textAlign: 'center' }}>Pensamiento limpio hoy.</p>
            )}
            <Link href="/journal" style={{ fontSize: '0.8rem', color: '#ff7f50', fontWeight: 700 }}>Escribir ahora →</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
