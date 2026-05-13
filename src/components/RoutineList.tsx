'use client';

import { useState, useEffect } from 'react';
import { RoutineTask, addRoutineTask, deleteRoutineTask, toggleRoutineTask, updateRoutineOrder } from '@/core/usecases/routineUsecases';
import { Reorder } from 'framer-motion';

interface Props {
  initialTasks: RoutineTask[];
  type: 'morning' | 'night';
  dateStr: string;
}

export default function RoutineList({ initialTasks, type, dateStr }: Props) {
  const [tasks, setTasks] = useState<RoutineTask[]>(initialTasks);
  const [newTaskName, setNewTaskName] = useState('');

  const handleToggle = async (id: string, isCompleted: boolean) => {
    // Optimistic UI updates
    setTasks(tasks.map(t => t.id === id ? { ...t, isCompleted: !isCompleted } : t));
    await toggleRoutineTask(id, !isCompleted, dateStr);
  };

  const handleDelete = async (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    await deleteRoutineTask(id);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;

    const tempId = crypto.randomUUID();
    const maxOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.orderIndex ?? 0)) : -1;
    
    const newTask: RoutineTask = {
      id: tempId,
      type,
      taskName: newTaskName,
      isCompleted: false,
      orderIndex: maxOrder + 1
    };

    setTasks([...tasks, newTask]);
    setNewTaskName('');
    await addRoutineTask(type, newTaskName);
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100%' }}>
      
      {/* Progress Bar overall */}
      {tasks.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
            <span>Progreso</span>
            <span>{Math.round((tasks.filter(t => t.isCompleted).length / tasks.length) * 100)}%</span>
          </div>
          <div style={{ height: '8px', width: '100%', background: 'rgba(0,0,0,0.1)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ 
              width: `${(tasks.filter(t => t.isCompleted).length / tasks.length) * 100}%`, 
              background: 'linear-gradient(90deg, var(--bg-gradient-3), var(--color-text))', 
              height: '100%', 
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.3s ease'
             }}></div>
          </div>
        </div>
      )}

      {/* List */}
      <Reorder.Group 
        axis="y" 
        values={tasks} 
        onReorder={async (newOrder) => {
          setTasks(newOrder);
          // Map to new indices
          const updates = newOrder.map((t, idx) => ({ id: t.id, orderIndex: idx }));
          await updateRoutineOrder(updates);
        }}
        className="custom-scrollbar"
        style={{ 
          display: 'flex', flexDirection: 'column', gap: '0.8rem', 
          marginBottom: 'auto', paddingRight: '10px' 
        }}
      >
        {tasks.map(task => (
           <Reorder.Item key={task.id} value={task} style={{ listStyleType: 'none', cursor: 'grab' }} whileDrag={{ cursor: 'grabbing', scale: 1.02, zIndex: 10 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '12px', 
              background: 'var(--glass-bg-hover)', 
              borderRadius: 'var(--radius-sm)',
              opacity: task.isCompleted ? 0.6 : 1,
              transition: 'opacity 0.2s'
            }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button 
                  onClick={() => handleToggle(task.id, task.isCompleted)}
                  style={{ 
                    width: '24px', height: '24px', borderRadius: '50%', 
                    border: '2px solid var(--color-text)', 
                    background: task.isCompleted ? 'var(--color-text)' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  {task.isCompleted && <span style={{ color: 'var(--color-bg)', fontSize: '0.8rem' }}>✓</span>}
                </button>
                <span style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: 500, 
                  textDecoration: task.isCompleted ? 'line-through' : 'none' 
                }}>
                  {task.taskName}
                </span>
             </div>
             <button 
               onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }}
               className="icon-btn"
               title="Eliminar rutina"
             >
               ×
             </button>
            </div>
           </Reorder.Item>
        ))}

        {tasks.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem', fontStyle: 'italic', margin: '2rem 0' }}>
            Aún no has definido ninguna rutina.
          </p>
        )}
      </Reorder.Group>

      {/* Add Form */}
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', marginTop: '2rem' }}>
        <input 
          type="text" 
          placeholder="Añadir nuevo hábito a la rutina..."
          value={newTaskName}
          onChange={e => setNewTaskName(e.target.value)}
          style={{ 
            flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-sm)', 
            border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', 
            color: 'var(--color-text)', outline: 'none' 
          }}
        />
        <button type="submit" className="glass-button" style={{ background: 'var(--color-text)', color: 'var(--color-bg)' }}>
          Añadir
        </button>
      </form>
    </div>
  );
}
