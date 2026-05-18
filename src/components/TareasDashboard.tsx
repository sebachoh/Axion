'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Task } from '@/core/domain/Task';
import { addTask, updateTaskStatus, deleteTask, reorderTasks, updateTask } from '@/app/(dashboard)/workspace/tareas/actions';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Zap, Calendar, Cloud, CheckCircle } from 'lucide-react';

interface Props {
  initialTasks: Task[];
}

export default function TareasDashboard({ initialTasks }: Props) {
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Convert timestamps mapping since Server Actions pass Date objects or strings
  const tasks = initialTasks.map(t => ({
    ...t,
    createdAt: new Date(t.createdAt)
  }));

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return '#ff6b6b';
      case 'medium': return '#feca57';
      case 'low': return '#1dd1a1';
      default: return 'var(--color-text-muted)';
    }
  };

  const getPriorityBg = (priority: string) => `${getPriorityColor(priority)}18`;
  const getPriorityBorder = (priority: string) => `1px solid ${getPriorityColor(priority)}40`;

  const filteredTasks = tasks.filter(t => {
    if (filterPriority === 'all') return true;
    return t.priority === filterPriority;
  });

  // Date classification
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const getDaysDiff = (deadlineStr: string) => {
    const deadlineDate = new Date(deadlineStr + 'T00:00:00');
    const diffTime = deadlineDate.getTime() - todayDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const tasksHoy = filteredTasks.filter(t => t.deadline && getDaysDiff(t.deadline) <= 0 && t.status !== 'done');
  const tasksProximos7 = filteredTasks.filter(t => t.deadline && getDaysDiff(t.deadline) > 0 && t.status !== 'done');
  const tasksSinFecha = filteredTasks.filter(t => (!t.deadline || String(t.deadline).trim() === '') && t.status !== 'done');
  const tasksDone = filteredTasks.filter(t => t.status === 'done');

  // Drag-and-drop for pending tasks (only the ones with no deadline)
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [pendingOrder, setPendingOrder] = useState<Task[]>([]);

  useEffect(() => {
    setPendingOrder(filteredTasks.filter(t => (!t.deadline || String(t.deadline).trim() === '') && t.status !== 'done'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterPriority, initialTasks.length]);

  const handleDragStart = (index: number) => { dragItem.current = index; setDraggingIdx(index); };
  const handleDragEnter = (index: number) => { dragOverItem.current = index; };
  const handleDragEnd = async () => {
    setDraggingIdx(null);
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;
    const copy = [...pendingOrder];
    const dragged = copy.splice(dragItem.current, 1)[0];
    copy.splice(dragOverItem.current, 0, dragged);
    dragItem.current = null;
    dragOverItem.current = null;
    setPendingOrder(copy);
    await reorderTasks(copy.map(t => t.id));
  };

  const renderTaskCard = (task: Task, isDraggable = false, index = 0) => {
    if (editingTaskId === task.id) {
      return (
        <motion.form 
          key={task.id}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          action={async (fd) => { await updateTask(task.id, fd); setEditingTaskId(null); }} 
          style={{
            display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.85rem 1rem',
            borderRadius: '10px',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            width: '100%',
            backdropFilter: 'blur(30px)'
          }}
        >
          <input type="text" name="title" defaultValue={task.title} required style={{
            padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--glass-border)',
            background: 'rgba(255,255,255,0.05)', color: 'var(--color-text)', outline: 'none',
            fontSize: '0.9rem'
          }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <select name="priority" defaultValue={task.priority} style={{
              padding: '6px', borderRadius: '6px', border: '1px solid var(--glass-border)',
              background: 'rgba(255,255,255,0.05)', color: 'var(--color-text)', outline: 'none', fontSize: '0.85rem'
            }}>
              <option value="low" style={{ color: 'black' }}>⬇ Baja</option>
              <option value="medium" style={{ color: 'black' }}>➡ Media</option>
              <option value="high" style={{ color: 'black' }}>⬆ Alta</option>
            </select>
            <input type="date" name="deadline" defaultValue={task.deadline || ''} style={{
              padding: '6px', borderRadius: '6px', border: '1px solid var(--glass-border)',
              background: 'rgba(255,255,255,0.05)', color: 'var(--color-text)', outline: 'none', fontSize: '0.85rem'
            }} />
          </div>
          <input type="text" name="notes" defaultValue={task.notes || ''} placeholder="Nota (opcional)" style={{
            padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--glass-border)',
            background: 'rgba(255,255,255,0.05)', color: 'var(--color-text)', outline: 'none', fontSize: '0.85rem'
          }} />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setEditingTaskId(null)} style={{
              padding: '4px 10px', borderRadius: '6px', border: 'none',
              background: 'rgba(255,255,255,0.1)', color: 'var(--color-text)', fontWeight: 600,
              cursor: 'pointer', fontSize: '0.8rem'
            }}>Cancelar</button>
            <button type="submit" style={{
              padding: '4px 10px', borderRadius: '6px', border: 'none',
              background: 'var(--color-text)', color: 'var(--color-bg)', fontWeight: 700,
              cursor: 'pointer', fontSize: '0.8rem'
            }}>Guardar</button>
          </div>
        </motion.form>
      );
    }

    return (
      <motion.div
        key={task.id}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ 
          opacity: 0, 
          x: -50,
          height: 0,
          paddingTop: 0,
          paddingBottom: 0,
          marginTop: 0,
          marginBottom: 0,
          overflow: 'hidden',
          transition: { duration: 0.3, ease: 'easeInOut' }
        }}
        draggable={isDraggable}
        onDragStart={isDraggable ? () => handleDragStart(index) : undefined}
        onDragEnter={isDraggable ? () => handleDragEnter(index) : undefined}
        onDragEnd={isDraggable ? handleDragEnd : undefined}
        onDragOver={isDraggable ? e => e.preventDefault() : undefined}
        style={{
          display: 'flex', gap: '0.75rem', padding: '0.85rem 1rem',
          borderRadius: '10px',
          background: isDraggable && draggingIdx === index ? 'rgba(255,255,255,0.08)' : getPriorityBg(task.priority),
          border: getPriorityBorder(task.priority),
          transition: 'background 0.2s, border 0.2s',
          alignItems: 'flex-start',
          cursor: isDraggable ? 'grab' : 'default',
          opacity: isDraggable && draggingIdx === index ? 0.4 : 1,
        }}
      >
        {isDraggable && (
          <span style={{ color: 'var(--color-text-muted)', fontSize: '1rem', userSelect: 'none', paddingTop: '2px', flexShrink: 0 }}>⠿</span>
        )}
        <form action={updateTaskStatus.bind(null, task.id, task.status === 'done' ? 'pending' : 'done')} style={{ flexShrink: 0 }}>
          <button type="submit" style={{
            width: '18px', height: '18px', borderRadius: '50%',
            border: `2px solid ${getPriorityColor(task.priority)}`,
            background: task.status === 'done' ? getPriorityColor(task.priority) : 'transparent',
            cursor: 'pointer', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {task.status === 'done' && <span style={{ fontSize: '8px', color: '#000', fontWeight: 900 }}>✓</span>}
          </button>
        </form>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '3px', minWidth: 0 }}>
          <span style={{
            fontWeight: 600, fontSize: '0.9rem',
            textDecoration: task.status === 'done' ? 'line-through' : 'none',
            color: task.status === 'done' ? 'var(--color-text-muted)' : 'var(--color-text)',
            whiteSpace: 'normal', wordBreak: 'break-word'
          }}>{task.title}</span>
          {task.notes && <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{task.notes}</span>}
          <div style={{ display: 'flex', gap: '8px', marginTop: '2px', fontSize: '0.72rem', fontWeight: 600 }}>
            <span style={{
              color: getPriorityColor(task.priority),
              background: `${getPriorityColor(task.priority)}20`,
              padding: '1px 7px', borderRadius: '8px', textTransform: 'capitalize'
            }}>{task.priority}</span>
            {task.deadline && <span style={{ color: 'var(--color-text-muted)' }}>⏰ {task.deadline}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
          <button type="button" onClick={() => setEditingTaskId(task.id)} style={{
            background: 'transparent', border: 'none', color: 'var(--color-text-muted)',
            cursor: 'pointer', padding: '2px 4px', fontSize: '0.9rem', flexShrink: 0, lineHeight: 1,
            opacity: 0.5, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center'
          }}
            onMouseOver={e => (e.currentTarget.style.opacity = '1')}
            onMouseOut={e => (e.currentTarget.style.opacity = '0.5')}
            title="Editar tarea"
          >
            <Pencil size={14} />
          </button>
          <form action={deleteTask.bind(null, task.id)}>
            <button type="submit" style={{
              background: 'transparent', border: 'none', color: 'var(--color-text-muted)',
              cursor: 'pointer', padding: '2px 4px', fontSize: '0.9rem', flexShrink: 0, lineHeight: 1,
              opacity: 0.5, transition: 'opacity 0.2s'
            }}
              onMouseOver={e => (e.currentTarget.style.opacity = '1')}
              onMouseOut={e => (e.currentTarget.style.opacity = '0.5')}
              title="Eliminar tarea"
            >✕</button>
          </form>
        </div>
      </motion.div>
    );
  };

  const renderColumn = (list: Task[], label: string, accentColor: string, icon: React.ReactNode, emptyMsg: string, isDraggable = false) => (
    <div className="glass-panel" style={{
      padding: '1.5rem', borderTop: `3px solid ${accentColor}`,
      display: 'flex', flexDirection: 'column', gap: '0', minHeight: '260px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: accentColor, display: 'flex', alignItems: 'center' }}>{icon}</span>
          {label}
        </h3>
        <span style={{
          fontSize: '0.75rem', fontWeight: 700,
          background: `${accentColor}25`, color: accentColor,
          padding: '2px 10px', borderRadius: '12px'
        }}>{list.length}</span>
      </div>
      {list.length === 0 ? (
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: 0.4, fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center'
        }}>{emptyMsg}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <AnimatePresence>
            {(isDraggable ? pendingOrder : list).map((task, index) => renderTaskCard(task, isDraggable, index))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Top Bar: Filtros + Botón Crear ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--glass-bg)', padding: '6px 10px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
          <span style={{ fontWeight: 700, fontSize: '0.7rem', opacity: 0.5, marginRight: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prioridad:</span>
          {(['all', 'high', 'medium', 'low'] as const).map(p => {
            const labels: Record<string, string> = { all: 'Todas', high: 'Alta', medium: 'Media', low: 'Baja' };
            const colors: Record<string, string> = { all: '#fff', high: '#ff6b6b', medium: '#feca57', low: '#1dd1a1' };
            const isActive = filterPriority === p;
            return (
              <button key={p} onClick={() => setFilterPriority(p)} style={{
                background: isActive ? colors[p] : 'transparent',
                color: isActive ? '#000' : 'rgba(255,255,255,0.55)',
                border: 'none', padding: '4px 10px', borderRadius: '6px',
                cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem', 
                textTransform: 'uppercase', letterSpacing: '0.05em',
                transition: 'all 0.2s'
              }}>{labels[p]}</button>
            );
          })}
        </div>

        <button
          onClick={() => setShowQuickAdd(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700,
            fontSize: '0.75rem', border: '1px solid var(--glass-border)', transition: 'all 0.2s',
            background: showQuickAdd ? 'rgba(255, 255, 255, 0.1)' : 'var(--glass-bg)',
            color: 'var(--color-text)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
          onMouseOver={(e) => {
            if (!showQuickAdd) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          }}
          onMouseOut={(e) => {
            if (!showQuickAdd) e.currentTarget.style.background = 'var(--glass-bg)';
          }}
        >
          {showQuickAdd ? '✕ Cancelar' : '+ Nueva Tarea'}
        </button>
      </div>

      {/* ── Quick Add Form ── */}
      {showQuickAdd && (
        <form action={async (fd) => { await addTask(fd); setShowQuickAdd(false); }}
          style={{
            display: 'grid', gridTemplateColumns: '1fr auto auto auto auto',
            gap: '0.75rem', alignItems: 'end',
            background: 'var(--glass-bg)', padding: '1rem 1.25rem',
            borderRadius: '12px', border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(30px)'
          }}
        >
          <input type="text" name="title" required placeholder="¿Qué necesitas hacer?" style={{
            padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)',
            background: 'rgba(255,255,255,0.05)', color: 'var(--color-text)', outline: 'none',
            fontSize: '0.9rem', minWidth: 0
          }} />
          <select name="priority" defaultValue="medium" style={{
            padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)',
            background: 'rgba(255,255,255,0.05)', color: 'var(--color-text)', outline: 'none', fontSize: '0.85rem'
          }}>
            <option value="low" style={{ color: 'black' }}>⬇ Baja</option>
            <option value="medium" style={{ color: 'black' }}>➡ Media</option>
            <option value="high" style={{ color: 'black' }}>⬆ Alta</option>
          </select>
          <input type="date" name="deadline" style={{
            padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)',
            background: 'rgba(255,255,255,0.05)', color: 'var(--color-text)', outline: 'none', fontSize: '0.85rem'
          }} />
          <input type="text" name="notes" placeholder="Nota (opcional)" style={{
            padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)',
            background: 'rgba(255,255,255,0.05)', color: 'var(--color-text)', outline: 'none', fontSize: '0.85rem'
          }} />
          <button type="submit" style={{
            padding: '10px 18px', borderRadius: '8px', border: 'none',
            background: 'var(--color-text)', color: 'var(--color-bg)', fontWeight: 700,
            cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap'
          }}>Añadir →</button>
        </form>
      )}

      {/* ── Three Temporal Columns (main view) ── */}
      <div className="tareas-grid-three">
        {renderColumn(tasksHoy, 'Para Hoy', '#ff6b6b', <Zap size={16} />, 'Sin tareas urgentes para hoy.')}
        {renderColumn(tasksProximos7, 'Próximos 7 Días', '#feca57', <Calendar size={16} />, 'Sin urgencias a la vista.')}
        {renderColumn(tasksSinFecha, 'Sin Fecha', '#1dd1a1', <Cloud size={16} />, 'No tienes tareas flotantes.', true)}
      </div>

      {/* ── Completed (collapsible count) ── */}
      {tasksDone.length > 0 && (
        <details style={{ borderRadius: '10px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
          <summary style={{
            padding: '0.85rem 1.25rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
            background: 'var(--glass-bg)', display: 'flex', alignItems: 'center', gap: '8px',
            listStyle: 'none'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={16} style={{ color: 'var(--color-text-muted)' }} />
              Completadas
            </span>
            <span style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 8px', borderRadius: '10px', fontSize: '0.78rem' }}>{tasksDone.length}</span>
          </summary>
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(255,255,255,0.01)' }}>
            <AnimatePresence>
              {tasksDone.map(task => renderTaskCard(task))}
            </AnimatePresence>
          </div>
        </details>
      )}
    </div>
  );
}
