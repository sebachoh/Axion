'use client';

import React, { useRef } from 'react';
import { addProjectIdea, deleteProjectIdea } from '@/app/workspace/proyectos/actions';

export interface IdeaItem {
  id: string;
  content: string;
  createdAt: Date;
}

interface Props {
  initialIdeas: IdeaItem[];
}

export default function ProjectIdeaBoard({ initialIdeas }: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  const pastelColors = ['#fbcfe8', '#bfdbfe', '#bbf7d0', '#e9d5ff', '#fef68a', '#ffccca'];

  return (
    <div style={{ marginTop: '3rem' }}>
      <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
          💡 Banco de Ideas
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Anota chispazos de inspiración crudos para futuros proyectos gigantes.</p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start' }}>
        
        {/* Formulario rápido para añadir idea */}
        <form ref={formRef} action={async (formData) => { await addProjectIdea(formData); formRef.current?.reset(); }} style={{ 
          width: '200px', 
          height: '200px', 
          padding: '1rem', 
          background: 'rgba(255,255,255,0.02)', 
          border: '1px dashed rgba(255,255,255,0.2)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px'
        }}>
          <textarea 
            name="content" 
            placeholder="Escribe una idea..." 
            required 
            maxLength={180}
            style={{ 
              width: '100%', 
              height: '100%', 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--color-text)', 
              outline: 'none', 
              resize: 'none',
              fontSize: '0.9rem',
              textAlign: 'center'
            }} 
          />
          <button type="submit" className="glass-button" style={{ fontSize: '0.8rem', padding: '6px 12px', opacity: 0.8 }}>Plantarla</button>
        </form>

        {/* Muro de ideas (Mini post-its) */}
        {initialIdeas.map((idea, index) => {
          const color = pastelColors[index % pastelColors.length];

          return (
            <div key={idea.id} style={{ 
              position: 'relative',
              width: '200px', 
              height: '200px', 
              padding: '1.5rem', 
              background: color, 
              borderRadius: '2px', // Square edge for post-it feel
              boxShadow: '2px 4px 10px rgba(0,0,0,0.1)',
              color: '#1d1d1f', // Dark text always
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              transform: `rotate(${Math.floor(Math.random() * 6) - 3}deg)`, // Slight random tilt
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05) rotate(0deg)'; e.currentTarget.style.boxShadow = '5px 10px 20px rgba(0,0,0,0.2)'; e.currentTarget.style.zIndex = '10'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = `scale(1) rotate(${Math.floor(Math.random() * 6) - 3}deg)`; e.currentTarget.style.boxShadow = '2px 4px 10px rgba(0,0,0,0.1)'; e.currentTarget.style.zIndex = '1'; }}
            >
              <form action={deleteProjectIdea.bind(null, idea.id)} style={{ position: 'absolute', top: '8px', right: '8px' }}>
                 <button type="submit" style={{ background: 'transparent', border: 'none', color: 'rgba(0,0,0,0.4)', cursor: 'pointer', fontSize: '1rem' }}>
                   ✕
                 </button>
              </form>
              
              <p style={{ fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.4, wordBreak: 'break-word' }}>
                {idea.content}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
