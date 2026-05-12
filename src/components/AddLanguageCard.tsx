'use client';

import React, { useState } from 'react';
import { addLanguageTrack } from '@/app/(dashboard)/academia/idiomas/actions';

export default function AddLanguageCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const languages = [
    { name: 'Inglés', flag: '🇺🇸' },
    { name: 'Francés', flag: '🇫🇷' },
    { name: 'Alemán', flag: '🇩🇪' },
    { name: 'Italiano', flag: '🇮🇹' },
    { name: 'Portugués', flag: '🇧🇷' },
    { name: 'Japonés', flag: '🇯🇵' },
    { name: 'Chino', flag: '🇨🇳' },
    { name: 'Coreano', flag: '🇰🇷' },
    { name: 'Ruso', flag: '🇷🇺' },
    { name: 'Darija', flag: '🇲🇦' }
  ];
  const [selectedLang, setSelectedLang] = useState(languages[0]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await addLanguageTrack(formData);
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
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: 'rgba(255,255,255,0.02)',
          border: '1px dashed rgba(255,255,255,0.1)',
          minHeight: '200px'
        }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }}>+</div>
        <h3 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>
          Nuevo Idioma
        </h3>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '200px' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <input type="hidden" name="name" value={selectedLang.name} />
        <input type="hidden" name="flag" value={selectedLang.flag} />
        <select
          onChange={(e) => setSelectedLang(languages[e.target.selectedIndex])}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: '#000', fontSize: '0.9rem' }}
        >
          {languages.map(l => <option key={l.name} value={l.name} style={{ color: 'black' }}>{l.flag} {l.name}</option>)}
        </select>
        <textarea
          name="description"
          placeholder="Propósito para aprender este idioma..."
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', color: '#fff', fontSize: '0.8rem', minHeight: '60px', resize: 'none' }}
        />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="submit"
            disabled={loading}
            style={{ flex: 1, padding: '10px', background: 'var(--color-text)', color: 'var(--color-bg)', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
          >
            {loading ? 'Añadiendo...' : 'Añadir'}
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
