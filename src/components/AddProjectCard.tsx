'use client';

import React, { useState } from 'react';
import { addProject } from '@/app/(dashboard)/workspace/proyectos/actions';

export default function AddProjectCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await addProject(formData);
    setLoading(false);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <div 
        onClick={() => setIsOpen(true)}
        className="glass-panel" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: 'rgba(255,255,255,0.02)',
          border: '1px dashed rgba(255,255,255,0.1)',
          minHeight: '200px'
        }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', opacity: 0.5 }}>+</div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>
          Lanzar nuevo proyecto
        </h3>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '200px' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <input 
          name="title" 
          placeholder="Título del Proyecto" 
          required 
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: '#fff', fontSize: '0.9rem' }}
        />
        <input 
          name="shortName" 
          placeholder="Siglas (ej: ES)" 
          maxLength={2}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: '#fff', fontSize: '0.9rem' }}
        />
        <textarea 
          name="description" 
          placeholder="Breve descripción..." 
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: '#fff', fontSize: '0.8rem', minHeight: '60px', resize: 'none' }}
        />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            type="submit" 
            disabled={loading}
            style={{ flex: 1, padding: '10px', background: 'var(--color-text)', color: 'var(--color-bg)', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
          >
            {loading ? 'Creando...' : 'Crear'}
          </button>
          <button 
            type="button" 
            onClick={() => setIsOpen(false)}
            style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      </form>
    </div>
  );
}
