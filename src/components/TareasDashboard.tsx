'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Task } from '@/core/domain/Task';
import { addTask, updateTaskStatus, deleteTask } from '@/app/workspace/tareas/actions';

interface Props {
  initialTasks: Task[];
}

export default function TareasDashboard({ initialTasks }: Props) {
  const [filterPriority, setFilterPriority] = useState<string>('all');
  
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

  const getPriorityBorder = (priority: string) => {
     return `1px solid ${getPriorityColor(priority)}40`; // 40 hex is 25% opacity
  };

  const filteredTasks = tasks.filter(t => {
    if (filterPriority === 'all') return true;
    return t.priority === filterPriority;
  });

  // Classification Logic
  const todayDate = new Date();
  todayDate.setHours(0,0,0,0);
  
  const sevenDaysDate = new Date();
  sevenDaysDate.setDate(todayDate.getDate() + 7);
  sevenDaysDate.setHours(23,59,59,999);

  const getDaysDiff = (deadlineStr: string) => {
     const deadlineDate = new Date(deadlineStr + 'T00:00:00');
     const diffTime = deadlineDate.getTime() - todayDate.getTime();
     return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const tasksHoy = filteredTasks.filter(t => t.deadline && getDaysDiff(t.deadline) === 0 && t.status !== 'done');
  const tasksProximos7 = filteredTasks.filter(t => t.deadline && getDaysDiff(t.deadline) > 0 && getDaysDiff(t.deadline) <= 7 && t.status !== 'done');
  const tasksSinFecha = filteredTasks.filter(t => !t.deadline && t.status !== 'done');
  
  // Drag-and-drop for Caja de Pendientes
  const basePendientes = filteredTasks.filter(t => t.status === 'pending');
  const [pendingOrder, setPendingOrder] = useState<Task[]>(basePendientes);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

  useEffect(() => {
    setPendingOrder(filteredTasks.filter(t => t.status === 'pending'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterPriority, initialTasks.length]);

  const handleDragStart = (index: number) => {
    dragItem.current = index;
    setDraggingIdx(index);
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

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
    const { reorderTasks } = await import('@/app/workspace/tareas/actions');
    await reorderTasks(copy.map(t => t.id));
  };

  const renderTaskList = (list: Task[], fallbackMsg: string, isDraggable = false) => {
    if (list.length === 0) {
      return <div style={{ opacity: 0.5, fontSize: '0.9rem', fontStyle: 'italic', padding: '1rem', textAlign: 'center' }}>{fallbackMsg}</div>;
    }
    const displayList = isDraggable ? pendingOrder : list;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
        {displayList.map((task, index) => (
          <div
            key={task.id}
            draggable={isDraggable}
            onDragStart={isDraggable ? () => handleDragStart(index) : undefined}
            onDragEnter={isDraggable ? () => handleDragEnter(index) : undefined}
            onDragEnd={isDraggable ? handleDragEnd : undefined}
            onDragOver={isDraggable ? (e) => e.preventDefault() : undefined}
            style={{
              display: 'flex', gap: '0.8rem', padding: '0.8rem',
              borderRadius: 'var(--radius-sm)',
              background: isDraggable && draggingIdx === index ? 'rgba(255,255,255,0.08)' : 'var(--glass-bg-hover)',
              border: getPriorityBorder(task.priority),
              transition: 'all 0.2s',
              alignItems: 'flex-start',
              cursor: isDraggable ? 'grab' : 'default',
              opacity: isDraggable && draggingIdx === index ? 0.5 : 1,
            }}
          >
            {isDraggable && (
              <span style={{ color: 'var(--color-text-muted)', fontSize: '1rem', userSelect: 'none', paddingTop: '2px' }}>⠿</span>
            )}
            <form action={updateTaskStatus.bind(null, task.id, task.status === 'done' ? 'pending' : 'done')}>
              <button type="submit" style={{ flexShrink: 0, width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${getPriorityColor(task.priority)}`, background: task.status === 'done' ? getPriorityColor(task.priority) : 'transparent', cursor: 'pointer', marginTop: '2px' }}></button>
            </form>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '4px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.95rem', textDecoration: task.status === 'done' ? 'line-through' : 'none', color: task.status === 'done' ? 'var(--color-text-muted)' : 'var(--color-text)' }}>{task.title}</span>
              {task.notes && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{task.notes}</span>}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '0.75rem', fontWeight: 500 }}>
                 <span style={{ color: getPriorityColor(task.priority), textTransform: 'capitalize' }}>{task.priority}</span>
                 {task.deadline && <span style={{ color: 'var(--color-text-muted)' }}>⏰ {task.deadline}</span>}
              </div>
            </div>

            <form action={deleteTask.bind(null, task.id)}>
              <button type="submit" style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '4px', fontSize: '1rem' }} title="Eliminar tarea">
                🗑️
              </button>
            </form>
          </div>
        ))}
      </div>
    );
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Barra de Filtros */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--glass-bg)', padding: '10px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Filtro por Prioridad:</span>
        <button onClick={() => setFilterPriority('all')} style={{ background: filterPriority === 'all' ? 'var(--color-text)' : 'transparent', color: filterPriority === 'all' ? 'var(--color-bg)' : 'var(--color-text)', border: 'none', padding: '4px 12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>Todas</button>
        <button onClick={() => setFilterPriority('high')} style={{ background: filterPriority === 'high' ? '#ff6b6b' : 'transparent', color: filterPriority === 'high' ? '#fff' : 'var(--color-text)', border: 'none', padding: '4px 12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>Alta</button>
        <button onClick={() => setFilterPriority('medium')} style={{ background: filterPriority === 'medium' ? '#feca57' : 'transparent', color: filterPriority === 'medium' ? '#fff' : 'var(--color-text)', border: 'none', padding: '4px 12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>Media</button>
        <button onClick={() => setFilterPriority('low')} style={{ background: filterPriority === 'low' ? '#1dd1a1' : 'transparent', color: filterPriority === 'low' ? '#fff' : 'var(--color-text)', border: 'none', padding: '4px 12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>Baja</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Formulario de Input principal */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem' }}>Añadir al Backlog</h3>
          <form action={addTask} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Título *</label>
                <input type="text" name="title" required placeholder="Ej. Presentación Q3" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--color-text)', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                 <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Prioridad</label>
                 <select name="priority" defaultValue="medium" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--color-text)', outline: 'none' }}>
                   <option value="low" style={{color:'black'}}>Baja</option>
                   <option value="medium" style={{color:'black'}}>Media</option>
                   <option value="high" style={{color:'black'}}>Alta</option>
                 </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Deadline</label>
                  <input type="date" name="deadline" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--color-text)', outline: 'none' }} />
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Subnotas opcionales</label>
                  <input type="text" name="notes" placeholder="Detalles extra..." style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--color-text)', outline: 'none' }} />
               </div>
            </div>

            <button type="submit" className="glass-button" style={{ marginTop: '0.5rem', background: 'var(--color-text)', color: 'var(--color-bg)' }}>
              Añadir a la lista
            </button>
          </form>
        </div>

        {/* Global Pending */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Caja de Pendientes</h3>
            <span style={{ fontSize: '0.8rem', background: 'var(--glass-bg)', padding: '2px 8px', borderRadius: '10px' }}>{pendingOrder.length}</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>Arrastra ⠿ para reorganizar</p>
          {renderTaskList(pendingOrder, "No hay tareas pendientes. ¡Genial!", true)}
        </div>

      </div>

      {/* Secciones de Clasificación temporal */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>Clasificación Temporal</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', alignItems: 'start' }}>

        {/* Hoy */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderTop: '3px solid #ff6b6b' }}>
           <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Para Hoy ⚡</h3>
           {renderTaskList(tasksHoy, 'Tu agenda está libre hoy.')}
        </div>

        {/* Proximos 7 dias */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderTop: '3px solid #feca57' }}>
           <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Próximos 7 Días 🗓️</h3>
           {renderTaskList(tasksProximos7, 'Sin urgencias a la vista.')}
        </div>

        {/* Sin Fecha */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderTop: '3px solid #1dd1a1' }}>
           <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Sin Fecha Definida ☁️</h3>
           {renderTaskList(tasksSinFecha, 'No tienes tareas flotantes.')}
        </div>

      </div>
    </div>
  );
}
