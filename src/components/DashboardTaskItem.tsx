'use client';

import React, { useState } from 'react';
import { updateTaskStatus } from '@/app/(dashboard)/workspace/tareas/actions';

interface DashboardTaskItemProps {
  task: {
    id: string;
    title: string;
    priority: string;
  };
}

function getPriorityColor(p: string) {
  if (p === 'high') return '#ff6b6b';
  if (p === 'medium') return '#feca57';
  return '#1dd1a1';
}

export default function DashboardTaskItem({ task }: DashboardTaskItemProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    
    // Call server action in background
    await updateTaskStatus(task.id, 'done');
    
    // Allow animation to play then remove
    setTimeout(() => {
      setIsRemoved(true);
    }, 400); // match animation duration
  };

  if (isRemoved) return null;

  return (
    <div 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        padding: '14px', 
        borderRadius: '14px', 
        background: 'rgba(255,255,255,0.02)', 
        border: '1px solid rgba(255,255,255,0.05)', 
        borderLeft: `5px solid ${getPriorityColor(task.priority)}`,
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: isCompleting ? 'scale(0.95) translateX(100px)' : 'scale(1) translateX(0)',
        opacity: isCompleting ? 0 : 1,
        pointerEvents: isCompleting ? 'none' : 'auto'
      }}
    >
      <button 
        onClick={handleComplete}
        style={{ 
          width: '20px', 
          height: '20px', 
          borderRadius: '50%', 
          border: `2px solid ${getPriorityColor(task.priority)}`, 
          background: 'transparent', 
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = getPriorityColor(task.priority);
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        aria-label="Completar tarea"
      />
      <span style={{ fontWeight: 700, fontSize: '0.95rem', textDecoration: isCompleting ? 'line-through' : 'none', transition: 'all 0.3s' }}>
        {task.title}
      </span>
    </div>
  );
}
