'use client';

import React, { useEffect, useRef, useState } from 'react';
import { 
  addTimeBlock, 
  deleteTimeBlock, 
  updateTimeBlock,
  addBankActivity,
  deleteBankActivity
} from '@/app/(dashboard)/workspace/planeacion/actions';
import { Task } from '@/core/domain/Task';

export interface TimeBlock {
  id: string;
  title: string;
  startTime: string;
  durationMins: number;
  color: string;
  blockDate: string;
}

export interface BankActivity {
  id: string;
  name: string;
  color: string;
  defaultMins: number;
  icon?: string;
}

interface Props {
  initialBlocks: TimeBlock[];
  selectedDate: string;
  initialTasks: Task[];
  bankActivities: BankActivity[];
}

const START_HOUR = 6;
const END_HOUR = 24;
const TOTAL_HOURS = END_HOUR - START_HOUR;
const PIXELS_PER_MINUTE = 1.5;

function getPriorityPastel(priority: string) {
  switch (priority) {
    case 'high': return '#ffb3b3';
    case 'medium': return '#fef68a';
    case 'low': return '#bbf7d0';
    default: return '#bfdbfe';
  }
}

function getTaskColor(priority: string) {
  switch (priority) {
    case 'high': return '#ff6b6b';
    case 'medium': return '#feca57';
    case 'low': return '#1dd1a1';
    default: return 'var(--color-text-muted)';
  }
}

function getCategoryName(color: string): string {
  const map: Record<string, string> = {
    '#bbf7d0': 'Trabajo 🟢',
    '#bfdbfe': 'Salud 🔵',
    '#fbcfe8': 'Rutinas 🩷',
    '#fef68a': 'Ocio 🟡',
    '#e9d5ff': 'Creatividad 🟣'
  };
  return map[color] || 'Personal';
}

function pxToTime(py: number): string {
  const totalMins = Math.round(py / PIXELS_PER_MINUTE / 30) * 30; // snap to 30-min
  const h = Math.floor(totalMins / 60) + START_HOUR;
  const m = totalMins % 60;
  const clampedH = Math.max(START_HOUR, Math.min(END_HOUR - 1, h));
  return `${clampedH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function getEndTime(startTime: string, durationMins: number): string {
  const [h, m] = startTime.split(':').map(Number);
  const totalMins = h * 60 + m + durationMins;
  const endH = Math.floor(totalMins / 60) % 24;
  const endM = totalMins % 60;
  return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
}

export default function TimeBlockingDashboard({ initialBlocks, selectedDate, initialTasks, bankActivities }: Props) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [mounted, setMounted] = useState(false);
  const [ghostTop, setGhostTop] = useState<number | null>(null);
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const [draggingBankActivity, setDraggingBankActivity] = useState<BankActivity | null>(null);
  const [movingBlock, setMovingBlock] = useState<TimeBlock | null>(null);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    
    // Auto-scroll to current time on mount
    if (scrollContainerRef.current) {
      const top = ((currentTime.getHours() - START_HOUR) * 60 + currentTime.getMinutes()) * PIXELS_PER_MINUTE;
      scrollContainerRef.current.scrollTo({
        top: Math.max(0, top - 100),
        behavior: 'smooth'
      });
    }

    return () => clearInterval(interval);
  }, []);

  const blocksToday = initialBlocks.filter(b => b.blockDate === selectedDate);
  const agendatedTitles = new Set(blocksToday.map(b => b.title));

  const calculateTop = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h - START_HOUR) * 60 * PIXELS_PER_MINUTE + m * PIXELS_PER_MINUTE;
  };

  const calculateHeight = (mins: number) => mins * PIXELS_PER_MINUTE;

  const nowHours = currentTime.getHours();
  const nowMinutes = currentTime.getMinutes();
  const isToday = new Date().toISOString().split('T')[0] === selectedDate;
  const showLiveLine = isToday && nowHours >= START_HOUR && nowHours < END_HOUR;
  const liveLineTop = ((nowHours - START_HOUR) * 60 + nowMinutes) * PIXELS_PER_MINUTE;

  // Helper to merge overlapping intervals and get total unique minutes
  const calculateUniqueBlockedMins = (blocks: typeof blocksToday) => {
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

  const totalMins = calculateUniqueBlockedMins(blocksToday);

  const colorGroups = blocksToday.reduce((acc, b) => {
    if (!acc[b.color]) acc[b.color] = [];
    acc[b.color].push(b);
    return acc;
  }, {} as Record<string, typeof blocksToday>);

  const colorMap: Record<string, number> = {};
  Object.entries(colorGroups).forEach(([col, blocks]) => {
    colorMap[col] = calculateUniqueBlockedMins(blocks);
  });

  const getDaysDiff = (d: string) => {
    const dt = new Date(d + 'T00:00:00');
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return Math.ceil((dt.getTime() - today.getTime()) / 86400000);
  };
  const tasksHoy = initialTasks.filter(t => t.deadline && getDaysDiff(t.deadline) === 0 && t.status !== 'done');
  const allNonDone = initialTasks.filter(t => t.status !== 'done');

  // Calendar drag-and-drop handlers
  const handleCalendarDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!calendarRef.current) return;
    if (!draggingTask && !movingBlock && !draggingBankActivity) return;
    
    const rect = calendarRef.current.getBoundingClientRect();
    const relY = Math.max(0, e.clientY - rect.top);
    const snapped = Math.round(relY / (30 * PIXELS_PER_MINUTE)) * (30 * PIXELS_PER_MINUTE);
    setGhostTop(snapped);
  };

  const handleCalendarDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!calendarRef.current) return;
    const rect = calendarRef.current.getBoundingClientRect();
    const relY = Math.max(0, e.clientY - rect.top);
    const snapped = Math.round(relY / (30 * PIXELS_PER_MINUTE)) * (30 * PIXELS_PER_MINUTE);
    const startTime = pxToTime(snapped);

    if (draggingTask) {
      const color = getPriorityPastel(draggingTask.priority);
      const formData = new FormData();
      formData.set('title', draggingTask.title);
      formData.set('start_time', startTime);
      formData.set('duration_mins', '120');
      formData.set('color', color);
      formData.set('block_date', selectedDate);
      await addTimeBlock(formData);
    } else if (draggingBankActivity) {
      const formData = new FormData();
      formData.set('title', `${draggingBankActivity.icon || ''} ${draggingBankActivity.name}`.trim());
      formData.set('start_time', startTime);
      formData.set('duration_mins', draggingBankActivity.defaultMins.toString());
      formData.set('color', draggingBankActivity.color);
      formData.set('block_date', selectedDate);
      await addTimeBlock(formData);
    } else if (movingBlock) {
      await updateTimeBlock(movingBlock.id, { start_time: startTime });
    }

    setGhostTop(null);
    setDraggingTask(null);
    setMovingBlock(null);
    setDraggingBankActivity(null);
  };

  const handleCalendarDragLeave = () => setGhostTop(null);

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingBlock) return;
    const formData = new FormData(e.currentTarget);
    const updates = {
      title: formData.get('title') as string,
      duration_mins: parseInt(formData.get('duration_mins') as string, 10),
      color: formData.get('color') as string,
    };
    await updateTimeBlock(editingBlock.id, updates);
    setEditingBlock(null);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '27% 46% 27%', gap: '1.5rem', alignItems: 'start' }}>

      {/* ── Panel Izquierdo: Creación y Banco ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Section: Añadir Bloque Rápido */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Bloque Directo ⚡</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Agendar sin banco.</p>
          <form action={addTimeBlock} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input type="hidden" name="block_date" value={selectedDate} />
            <input name="title" placeholder="Título del bloque..." required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid var(--glass-border)', fontSize: '0.85rem', outline: 'none' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
               <input name="start_time" type="time" defaultValue={`${nowHours.toString().padStart(2, '0')}:00`} required style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid var(--glass-border)', fontSize: '0.85rem', outline: 'none' }} />
               <input name="duration_mins" type="number" placeholder="Minutos (ej. 60)" defaultValue={60} required style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid var(--glass-border)', fontSize: '0.85rem', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
               <select name="color" style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', color: '#000', border: '1px solid var(--glass-border)', fontSize: '0.85rem', outline: 'none' }}>
                 <option value="#bbf7d0">🟢 Trabajo</option>
                 <option value="#bfdbfe">🔵 Salud</option>
                 <option value="#fbcfe8">🩷 Rutinas</option>
                 <option value="#fef68a">🟡 Ocio</option>
                 <option value="#e9d5ff">🟣 Creatividad</option>
                 <option value="#ff6b6b">🔴 Urgencia</option>
                </select>
               <button type="submit" className="glass-button" style={{ padding: '10px', background: 'var(--color-text)', color: 'var(--color-bg)', fontWeight: 800, fontSize: '0.8rem' }}>Añadir</button>
            </div>
          </form>
        </div>
        
        {/* Section: Actividades Recurrentes (Bank) */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Banco de Actividades 🏦</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Fijas o recurrentes.</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.5rem' }}>
            {bankActivities.length === 0 ? (
              <p style={{ fontSize: '0.8rem', opacity: 0.5, fontStyle: 'italic', width: '100%', textAlign: 'center', padding: '1rem' }}>Sin actividades guardadas.</p>
            ) : bankActivities.map(act => (
              <div 
                key={act.id}
                draggable
                onDragStart={() => setDraggingBankActivity(act)}
                style={{ 
                  padding: '8px 16px', borderRadius: '12px', background: act.color, color: '#1d1d1f',
                  fontSize: '0.85rem', fontWeight: 700, cursor: 'grab', display: 'flex', alignItems: 'center', gap: '6px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s ease'
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <span>{act.icon} {act.name}</span>
                <button 
                  onClick={() => deleteBankActivity(act.id)} 
                  style={{ background: 'transparent', border: 'none', marginLeft: '6px', cursor: 'pointer', fontSize: '10px', opacity: 0.5, padding: '2px' }}
                >✕</button>
              </div>
            ))}
          </div>

          <form action={addBankActivity} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Crea Nueva Actividad</label>
                <input name="name" placeholder="Nombre (ej. Gym, Almuerzo...)" required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid var(--glass-border)', fontSize: '0.9rem', outline: 'none' }} />
             </div>
             
             <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)', gap: '0.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Emoji</label>
                  <input name="icon" placeholder="🏠" style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid var(--glass-border)', fontSize: '0.9rem', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Duración (min)</label>
                  <input name="default_mins" type="number" defaultValue={60} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid var(--glass-border)', fontSize: '0.9rem', outline: 'none' }} />
                </div>
             </div>

             <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Color</label>
                  <select name="color" style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', color: '#000', border: '1px solid var(--glass-border)', fontSize: '0.85rem', outline: 'none' }}>
                    <option value="#bfdbfe">Blue</option>
                    <option value="#fbcfe8">Pink</option>
                    <option value="#bbf7d0">Green</option>
                    <option value="#fef68a">Yellow</option>
                    <option value="#e9d5ff">Purple</option>
                  </select>
                </div>
                <button type="submit" className="glass-button" style={{ padding: '10px', background: 'var(--color-text)', color: 'var(--color-bg)', fontWeight: 800, fontSize: '0.8rem' }}>Añadir</button>
             </div>
          </form>
        </div>
      </div>

      {/* ── Panel Central: Calendario ── */}
      <div 
        className="glass-panel" 
        ref={scrollContainerRef}
        style={{ 
          height: '650px', 
          overflowY: 'auto', 
          position: 'relative',
          padding: '0', 
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.1) transparent'
        }}
      >
        <div
          ref={calendarRef}
          style={{ position: 'relative', height: `${TOTAL_HOURS * 60 * PIXELS_PER_MINUTE}px`, background: 'rgba(0,0,0,0.1)' }}
          onDragOver={handleCalendarDragOver}
          onDrop={handleCalendarDrop}
          onDragLeave={handleCalendarDragLeave}
        >
          {/* Hour markers */}
          {Array.from({ length: TOTAL_HOURS + 1 }).map((_, i) => {
            const hour = START_HOUR + i;
            return (
              <div key={hour} style={{ position: 'absolute', top: `${i * 60 * PIXELS_PER_MINUTE}px`, left: 0, right: 0, borderTop: '1px dashed rgba(255,255,255,0.08)' }}>
                <span style={{ position: 'absolute', top: '-10px', left: '8px', fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
            );
          })}

          {/* Ghost drop preview */}
          {ghostTop !== null && (draggingTask || movingBlock || draggingBankActivity) && (
            <div style={{
              position: 'absolute', top: `${ghostTop}px`, left: '60px', right: '8px',
              height: `${(movingBlock?.durationMins ?? draggingBankActivity?.defaultMins ?? 120) * PIXELS_PER_MINUTE}px`,
              background: 'rgba(255,255,255,0.1)',
              border: '2px dashed #fff',
              borderRadius: '6px', zIndex: 40, pointerEvents: 'none',
            }} />
          )}

          {/* Rendered blocks */}
          {blocksToday.map(block => (
            <div key={block.id}
              draggable
              onDragStart={() => setMovingBlock(block)}
              onDragEnd={() => { setMovingBlock(null); setGhostTop(null); }}
              onClick={() => setEditingBlock(block)}
              style={{
                position: 'absolute',
                top: `${calculateTop(block.startTime)}px`,
                left: '60px', right: '8px',
                height: `${calculateHeight(block.durationMins)}px`,
                background: block.color, borderRadius: '6px',
                padding: '8px 12px', color: '#1d1d1f',
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
                overflow: 'hidden', zIndex: 10, cursor: 'move',
                borderLeft: '4px solid rgba(0,0,0,0.25)',
                transition: 'opacity 0.2s',
                opacity: movingBlock?.id === block.id ? 0.3 : 1
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{block.title}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span style={{ opacity: 0.4, fontSize: '0.7rem' }}>✎</span>
                  <form action={deleteTimeBlock.bind(null, block.id)}>
                    <button type="submit" style={{ background: 'transparent', border: 'none', color: 'rgba(0,0,0,0.4)', cursor: 'pointer' }}>✕</button>
                  </form>
                </div>
              </div>
              <span style={{ fontSize: '0.73rem', opacity: 0.75, marginTop: '2px', fontWeight: 600 }}>
                {block.startTime} - {getEndTime(block.startTime, block.durationMins)} ({block.durationMins}m)
              </span>
            </div>
          ))}

          {/* Real-time Indicator Line */}
          {showLiveLine && (
            <div style={{ 
              position: 'absolute', top: `${liveLineTop}px`, left: 0, right: 0, 
              display: 'flex', alignItems: 'center', pointerEvents: 'none', zIndex: 50 
            }}>
              <div style={{ 
                width: '10px', height: '10px', borderRadius: '50%', background: '#ff4757', 
                marginLeft: '45px', boxShadow: '0 0 10px rgba(255, 71, 87, 0.8)' 
              }} />
              <div style={{ flex: 1, height: '2px', background: '#ff4757', boxShadow: '0 0 5px rgba(255, 71, 87, 0.4)' }} />
              <div style={{ 
                background: '#ff4757', color: '#fff', fontSize: '10px', fontWeight: 800, 
                padding: '2px 6px', borderRadius: '4px', marginRight: '8px'
              }}>
                {mounted ? currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </div>
            </div>
          )}

          {/* Edit Modal (Inline Overlay) */}
          {editingBlock && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
              <div className="glass-panel" style={{ width: '100%', maxWidth: '300px', padding: '1.5rem', background: '#2d2d2f', color: '#fff' }}>
                <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Editar Bloque</h4>
                <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', opacity: 0.7 }}>Título</label>
                    <input name="title" defaultValue={editingBlock.title} required style={{ padding: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid #444' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', opacity: 0.7 }}>Duración (minutos)</label>
                    <input name="duration_mins" type="number" defaultValue={editingBlock.durationMins} step={15} required style={{ padding: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid #444' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', opacity: 0.7 }}>Color</label>
                    <select name="color" defaultValue={editingBlock.color} style={{ padding: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: '#000', border: '1px solid #444' }}>
                      <option value="#bbf7d0">🟢 Trabajo</option>
                      <option value="#bfdbfe">🔵 Salud</option>
                      <option value="#fbcfe8">🩷 Rutinas</option>
                      <option value="#fef68a">🟡 Ocio</option>
                      <option value="#e9d5ff">Lila 🟣 Creatividad</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button type="button" onClick={() => setEditingBlock(null)} style={{ flex: 1, padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none' }}>Cancelar</button>
                    <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: '6px', background: '#fff', color: '#000', border: 'none', fontWeight: 700 }}>Guardar</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Panel Derecho: Tareas y Métricas ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Section: Tareas Launcher */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Tareas Tácticas 🎯</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            Arrastra para agendar.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {tasksHoy.length > 0 && (
              <>
                <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700 }}>Para hoy</p>
                {tasksHoy.map(task => {
                  const isAgendated = agendatedTitles.has(task.title);
                  return (
                    <div key={task.id}
                      draggable={!isAgendated}
                      onDragStart={() => setDraggingTask(task)}
                      onDragEnd={() => { setDraggingTask(null); setGhostTop(null); }}
                      style={{
                        padding: '10px 12px', borderRadius: '8px',
                        background: isAgendated ? 'rgba(255,255,255,0.02)' : `${getTaskColor(task.priority)}18`,
                        borderLeft: `3px solid ${isAgendated ? 'rgba(255,255,255,0.1)' : getTaskColor(task.priority)}`,
                        cursor: isAgendated ? 'default' : 'grab', opacity: isAgendated ? 0.4 : 1,
                        display: 'flex', flexDirection: 'column', gap: '2px',
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{isAgendated ? '🔒 ' : ''}{task.title}</span>
                      <span style={{ fontSize: '0.7rem' }}>{isAgendated ? 'Agendada' : task.priority}</span>
                    </div>
                  );
                })}
              </>
            )}

            <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700, marginTop: '0.5rem' }}>Pendientes</p>
            {allNonDone.filter(t => !(t.deadline && getDaysDiff(t.deadline) === 0)).map(task => {
              const isAgendated = agendatedTitles.has(task.title);
              return (
                <div key={task.id}
                  draggable={!isAgendated}
                  onDragStart={() => setDraggingTask(task)}
                  onDragEnd={() => { setDraggingTask(null); setGhostTop(null); }}
                  style={{
                    padding: '10px 12px', borderRadius: '8px',
                    background: isAgendated ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
                    borderLeft: `3px solid ${isAgendated ? 'rgba(255,255,255,0.1)' : getTaskColor(task.priority)}`,
                    cursor: isAgendated ? 'default' : 'grab', opacity: isAgendated ? 0.4 : 1,
                    display: 'flex', flexDirection: 'column', gap: '2px',
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{isAgendated ? '🔒 ' : ''}{task.title}</span>
                  <span style={{ fontSize: '0.7rem' }}>{isAgendated ? 'Agendada' : task.priority}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section: Métricas de Tiempo */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>Métricas de Tiempo</h3>
          {(() => {
            const hoursBlocked = Math.round((totalMins / 60) * 10) / 10;
            return <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>{hoursBlocked}h de 24h ocupadas</p>;
          })()}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.keys(colorMap).length === 0 ? (
              <p style={{ opacity: 0.5, fontStyle: 'italic', fontSize: '0.8rem' }}>Sin bloques planificados.</p>
            ) : Object.entries(colorMap).map(([col, mins]) => {
              const pct = Math.round((mins / totalMins) * 100);
              return (
                <div key={col} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: col }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, opacity: 0.8 }}>{getCategoryName(col)}</span>
                      <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{pct}%</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.06)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: col }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
