'use client';

import React from 'react';
import { BookOpen, Globe, Music, Notebook, Mic, Headphones, Brain, Heart, Layers, Target, Pencil } from 'lucide-react';

export default function DetoxPage() {
  const activities = [
    { text: "Leer 10 minutos libros", icon: <BookOpen size={18} /> },
    { text: "Estudiar 10 minutos de idiomas", icon: <Globe size={18} /> },
    { text: "Tocar piano 10 minutos", icon: <Music size={18} /> },
    { text: "10 minutos de Journal", icon: <Notebook size={18} /> },
    { text: "10 minutos de grabarme hablando", icon: <Mic size={18} /> },
    { text: "10 minutos de podcast", icon: <Headphones size={18} /> },
    { text: "10 minutos de meditación", icon: <Brain size={18} /> },
    { text: "10 minutos de estiramientos", icon: <Heart size={18} /> },
    { text: "10 minutos de ordenar mi espacio", icon: <Layers size={18} /> },
    { text: "10 minutos de ajedrez", icon: <Target size={18} /> },
    { text: "10 minutos de sketch/dibujo", icon: <Pencil size={18} /> }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      <header style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '2.5rem' }}>Detox</h1>
          <p className="page-subtitle">Alternativas para no perder el tiempo</p>
        </div>
      </header>

      <div className="dashboard-page-wrapper" style={{ 
        maxWidth: '1400px', 
        width: '100%', 
        margin: '0 auto', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '2rem',
      }}>
        <div style={{ 
          background: 'var(--glass-bg)', 
          backdropFilter: 'blur(10px)', 
          padding: '2rem', 
          borderRadius: 'var(--radius-md)', 
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--glass-shadow)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
            {activities.map((activity, index) => (
              <div key={index} style={{ 
                background: 'rgba(255, 255, 255, 0.02)', 
                padding: '0.8rem 1.2rem', 
                borderRadius: '8px', 
                fontSize: '1rem', 
                fontWeight: 500,
                color: 'var(--color-text)',
                border: '1px solid rgba(255, 255, 255, 0.03)',
                transition: 'all 0.2s ease',
                cursor: 'default',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.03)';
              }}
              >
                <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
                  {activity.icon}
                </span>
                {activity.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
