import Link from 'next/link';
import { getDashboardData } from '@/core/usecases/dashboardUsecases';
import db from '@/infrastructure/db/sqlite';
import WealthMirror from '@/components/WealthMirror';
import { auth } from '@/auth';
import BackgroundCustomizer from '@/components/BackgroundCustomizer';
import HeroBanner from '@/components/HeroBanner';
import { Sun, Moon, Zap, Calendar, Wallet, Flame, CheckSquare, Notebook } from 'lucide-react';
import WealthBalanceCard from '@/components/WealthBalanceCard';

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

async function getLatestJournalEntry(userId: string) {
  return await db.prepare('SELECT content FROM journal_entries WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(userId) as { content: string } | undefined;
}

function getEndTime(startTime: string, durationMins: number): string {
  const [h, m] = startTime.split(':').map(Number);
  const totalMins = h * 60 + m + durationMins;
  const endH = Math.floor(totalMins / 60) % 24;
  const endM = totalMins % 60;
  return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  
  if (!userId) return null;

  const data = await getDashboardData(userId);
  const latestJournal = await getLatestJournalEntry(userId);

  const now = new Date();
  const currentHourMins = now.getHours() * 60 + now.getMinutes();

  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  // Calculate Routine Progress
  const totalRoutine = data.routineTasks.length;
  const completedRoutine = data.routineTasks.filter(t => t.completed).length;
  const routinePct = totalRoutine > 0 ? Math.round((completedRoutine / totalRoutine) * 100) : 0;

  // Helper to merge overlapping intervals and get total unique minutes
  const calculateUniqueBlockedMins = (blocks: Array<{ startTime: string; durationMins: number }>) => {
    if (blocks.length === 0) return 0;
    const intervals = blocks.map(b => {
      const [h, m] = b.startTime.split(':').map(Number);
      const start = h * 60 + m;
      const end = start + b.durationMins;
      return { start, end };
    });
    intervals.sort((a, b) => a.start - b.start);
    const merged: Array<{ start: number; end: number }> = [];
    let current = { ...intervals[0] };
    for (let i = 1; i < intervals.length; i++) {
      const next = intervals[i];
      if (next.start <= current.end) {
        current.end = Math.max(current.end, next.end);
      } else {
        merged.push(current);
        current = { ...next };
      }
    }
    merged.push(current);
    return merged.reduce((acc, interval) => acc + (interval.end - interval.start), 0);
  };

  const uniqueBlockedMins = calculateUniqueBlockedMins(data.timeBlocksToday);
  const hoursBlocked = Math.round((uniqueBlockedMins / 60) * 10) / 10;

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

      {/* ── Hero Banner (Dynamic Minimalist Wallpaper Customizer) ── */}
      <HeroBanner 
        currentDate={currentDate} 
        journalMoodToday={data.journalMoodToday} 
        moodEmojis={MOOD_EMOJIS} 
      />

      {/* Center and constrain all page content widgets to 1400px */}
      <div className="dashboard-page-wrapper" style={{ 
        maxWidth: '1400px', 
        width: '100%', 
        margin: '0 auto', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '2rem',
      }}>
        {/* ── Live Focus Widget ── */}
        <div className="glass-panel live-focus-widget" style={{
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
            <div className="live-focus-divider" style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }} />
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
        <div className="stats-pulse-grid">
          {[
            { 
              label: `Rutina ${data.routineType}`, 
              value: `${completedRoutine}/${totalRoutine}`, 
              sub: `${routinePct}% completado`, 
              color: '#1dd1a1', 
              icon: data.routineType === 'mañana' ? <Sun size={22} strokeWidth={2.5} style={{ color: '#1dd1a1' }} /> : <Moon size={22} strokeWidth={2.5} style={{ color: '#1dd1a1' }} />, 
              bgIcon: data.routineType === 'mañana' ? <Sun size={75} strokeWidth={2.5} style={{ color: '#1dd1a1', opacity: 0.05 }} /> : <Moon size={75} strokeWidth={2.5} style={{ color: '#1dd1a1', opacity: 0.05 }} />,
              href: '/workspace/rutinas' 
            },
            { 
              label: 'Tareas Hoy', 
              value: data.tasksToday.length, 
              sub: 'En Agenda', 
              color: '#feca57', 
              icon: <CheckSquare size={22} strokeWidth={2.5} style={{ color: '#feca57' }} />, 
              bgIcon: <CheckSquare size={75} strokeWidth={2.5} style={{ color: '#feca57', opacity: 0.05 }} />,
              href: '/workspace/tareas' 
            },
            { 
              label: 'Time Blocking', 
              value: `${hoursBlocked}h`, 
              sub: 'Estructura', 
              color: '#a29bfe', 
              icon: <Calendar size={22} strokeWidth={2.5} style={{ color: '#a29bfe' }} />, 
              bgIcon: <Calendar size={75} strokeWidth={2.5} style={{ color: '#a29bfe', opacity: 0.05 }} />,
              href: '/workspace/planeacion' 
            },
          ].map(stat => (
            <Link key={stat.label} href={stat.href} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', overflow: 'hidden', height: '100%', cursor: 'pointer', transition: 'transform 0.2s', ...{ ':hover': { transform: 'scale(1.02)' } } as any }}>
                <div style={{ position: 'absolute', top: '10px', right: '10px', transform: 'rotate(15deg)', pointerEvents: 'none' }}>{stat.bgIcon}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{stat.icon}</span>
                  <span style={{ fontWeight: 800, fontSize: '1.6rem', color: stat.color }}>{stat.value}</span>
                </div>
                <p style={{ fontWeight: 800, fontSize: '0.85rem', margin: 0 }}>{stat.label}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: 0 }}>{stat.sub}</p>
              </div>
            </Link>
          ))}

          {/* Wealth Balance (Interactive, localStorage synced card) */}
          <WealthBalanceCard balance={data.financialBalance} />

          {/* Urgencia Card */}
          {[
            { 
              label: 'Urgencia', 
              value: data.pendingTasksHighPriority, 
              sub: 'Puntos de Fuego', 
              color: '#ff6b6b', 
              icon: <Flame size={22} strokeWidth={2.5} style={{ color: '#ff6b6b' }} />, 
              bgIcon: <Flame size={75} strokeWidth={2.5} style={{ color: '#ff6b6b', opacity: 0.05 }} />,
              href: '/workspace/tareas' 
            },
          ].map(stat => (
            <Link key={stat.label} href={stat.href} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', overflow: 'hidden', height: '100%', cursor: 'pointer', transition: 'transform 0.2s', ...{ ':hover': { transform: 'scale(1.02)' } } as any }}>
                <div style={{ position: 'absolute', top: '10px', right: '10px', transform: 'rotate(15deg)', pointerEvents: 'none' }}>{stat.bgIcon}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{stat.icon}</span>
                  <span style={{ fontWeight: 800, fontSize: '1.6rem', color: stat.color }}>{stat.value}</span>
                </div>
                <p style={{ fontWeight: 800, fontSize: '0.85rem', margin: 0 }}>{stat.label}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: 0 }}>{stat.sub}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* ── The Bento Ecosystem Reimagined ── */}
        <div className="bento-ecosystem-grid" style={{ alignItems: 'stretch' }}>

          {/* Column 1: EXECUTIVE FOCUS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Tareas Tácticas */}
            <div className="glass-panel" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderTop: '4px solid #fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={20} strokeWidth={2.5} /> Táctico Hoy
                </h3>
                <Link href="/workspace/tareas" style={{ fontSize: '0.8rem', opacity: 0.5 }}>Ver todo</Link>
              </div>
              {data.tasksToday.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3, fontStyle: 'italic', fontSize: '0.9rem' }}>
                  Agenda despejada.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {data.tasksToday.map(t => (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderLeft: `5px solid ${getPriorityColor(t.priority)}` }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Column 2: RHYTHM & STRUCTURE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Active Routine */}
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {data.routineType === 'mañana' ? <Sun size={20} strokeWidth={2.5} /> : <Moon size={20} strokeWidth={2.5} />}
                  {data.routineType === 'mañana' ? 'Ritual Mañana' : 'Ritual Noche'}
                </h3>
                <Link href="/rutinas" className="glass-button" style={{ fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', textDecoration: 'none' }}>
                  Ver Rutinas ({routinePct}%) →
                </Link>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${routinePct}%`, background: '#1dd1a1', transition: 'width 1s ease' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {data.routineTasks.slice(0, 4).map(task => (
                  <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', opacity: task.completed ? 0.4 : 1 }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: task.completed ? '#1dd1a1' : 'rgba(255,255,255,0.2)' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{task.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeblocking */}
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={20} strokeWidth={2.5} /> Estructura
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {data.timeBlocksToday.slice(0,3).map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: b.color }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{b.title}</span>
                      <span style={{ fontSize: '0.7rem', opacity: 0.4 }}>{b.startTime}</span>
                    </div>
                  </div>
                ))}
                {data.timeBlocksToday.length === 0 && <p style={{ opacity: 0.3, fontSize: '0.8rem' }}>Sin bloques.</p>}
              </div>
            </div>
          </div>

          {/* Column 3: REFLECTION & MIRROR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <WealthMirror balance={data.financialBalance} />
            
            <BackgroundCustomizer />
            
            {/* Life Philosophy / Mantra */}
            <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 100%)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.4, fontWeight: 700 }}>Filosofía</span>
              <p style={{ fontSize: '0.9rem', fontWeight: 500, lineHeight: 1.5, color: 'rgba(255,255,255,0.8)' }}>
                "La disciplina es el puente entre las metas y los logros."
              </p>
            </div>

            {/* Bitácora / Journal */}
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Notebook size={20} strokeWidth={2.5} />
                <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>Bitácora</h3>
              </div>
              {latestJournal ? (
                <div style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: '1rem' }}>
                  "{latestJournal.content.length > 120 ? latestJournal.content.substring(0, 120) + '...' : latestJournal.content}"
                </div>
              ) : (
                <p style={{ opacity: 0.3, fontSize: '0.85rem' }}>No hay entradas hoy.</p>
              )}
              <Link href="/journal" style={{ fontSize: '0.75rem', color: '#ff7f50', fontWeight: 700, marginTop: 'auto' }}>Escribir ahora →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
