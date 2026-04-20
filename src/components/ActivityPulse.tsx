'use client';

import React from 'react';

interface Stat {
  date: string;
  count: number;
}

interface ActivityPulseProps {
  habits: Stat[];
  tasks: Stat[];
}

export default function ActivityPulse({ habits, tasks }: ActivityPulseProps) {
  // Generate last 7 days labels
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const getDayLabel = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-ES', { weekday: 'short' });
  };

  const maxHabits = Math.max(...habits.map(h => h.count), 1);
  const maxTasks = Math.max(...tasks.map(t => t.count), 1);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      
      {/* Habits Pulse */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>📈 Consistencia de Hábitos</h3>
          <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>Últimos 7 días</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '100px', padding: '0 10px' }}>
          {days.map(day => {
            const stat = habits.find(h => h.date === day);
            const height = stat ? (stat.count / maxHabits) * 100 : 5;
            return (
              <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                <div style={{ 
                  width: '12px', 
                  height: `${height}%`, 
                  maxHeight: '80px',
                  background: 'linear-gradient(to top, #1dd1a1, #10ac84)', 
                  borderRadius: '6px',
                  boxShadow: stat ? '0 0 10px rgba(29, 209, 161, 0.3)' : 'none',
                  transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                }} />
                <span style={{ fontSize: '0.65rem', opacity: 0.4, fontWeight: 700 }}>{getDayLabel(day)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Velocity */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>⚡ Velocidad de Tareas</h3>
          <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>Productividad Semanal</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '100px', padding: '0 10px' }}>
          {days.map(day => {
            const stat = tasks.find(t => t.date === day);
            const height = stat ? (stat.count / maxTasks) * 100 : 5;
            return (
              <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                <div style={{ 
                  width: '12px', 
                  height: `${height}%`, 
                  maxHeight: '80px',
                  background: 'linear-gradient(to top, #54a0ff, #2e86de)', 
                  borderRadius: '6px',
                  boxShadow: stat ? '0 0 10px rgba(84, 160, 255, 0.3)' : 'none',
                  transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                }} />
                <span style={{ fontSize: '0.65rem', opacity: 0.4, fontWeight: 700 }}>{getDayLabel(day)}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
