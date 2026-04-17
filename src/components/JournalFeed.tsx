'use client';

import React, { useState } from 'react';
import { addJournalEntry, deleteJournalEntry } from '@/app/journal/actions';

export interface JournalEntry {
  id: string;
  content: string;
  mood: string;
  mediaUrl?: string;
  createdAt: Date;
}

interface Props {
  entries: JournalEntry[];
}

const MOODS = [
  { emoji: '😫', label: 'Terrible', val: '1' },
  { emoji: '😕', label: 'Mal', val: '2' },
  { emoji: '😐', label: 'Neutral', val: '3' },
  { emoji: '🙂', label: 'Bien', val: '4' },
  { emoji: '😍', label: 'Excelente', val: '5' },
];

export default function JournalFeed({ entries }: Props) {
  const [selectedMood, setSelectedMood] = useState('3');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Group entries by date
  const grouped = entries.reduce((acc, entry) => {
    const date = new Date(entry.createdAt).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, JournalEntry[]>);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* ── Nueva Entrada ── */}
      <div className="glass-panel" style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>¿Cómo va tu día? ✨</h3>
        
        <form action={addJournalEntry} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Mood Selector */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
            {MOODS.map(m => (
              <button 
                key={m.val}
                type="button"
                onClick={() => setSelectedMood(m.val)}
                style={{
                  fontSize: '2rem', background: 'transparent', border: 'none', cursor: 'pointer',
                  transition: 'transform 0.2s', filter: selectedMood === m.val ? 'none' : 'grayscale(1) opacity(0.5)',
                  transform: selectedMood === m.val ? 'scale(1.3)' : 'scale(1)'
                }}
                title={m.label}
              >
                {m.emoji}
              </button>
            ))}
            <input type="hidden" name="mood" value={selectedMood} />
          </div>

          <textarea 
            name="content" required
            placeholder="Escribe lo que tienes en mente..."
            style={{
              width: '100%', minHeight: '120px', padding: '1rem', borderRadius: '12px',
              background: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid var(--glass-border)',
              fontSize: '1rem', outline: 'none', lineHeight: '1.6'
            }}
          />

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input 
              name="media_url" 
              placeholder="URL de foto o imagen (opcional)"
              style={{
                flex: 1, padding: '10px 14px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid var(--glass-border)',
                fontSize: '0.9rem', outline: 'none'
              }}
            />
            <button type="submit" className="glass-button" style={{ padding: '10px 24px', background: 'var(--color-text)', color: 'var(--color-bg)', fontWeight: 700 }}>
              Guardar Entrada
            </button>
          </div>
        </form>
      </div>

      {/* ── Feed de Entradas ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {Object.entries(grouped).map(([date, dailyEntries]) => (
          <div key={date} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1))' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{date}</span>
              <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, rgba(255,255,255,0.1), transparent)' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {dailyEntries.map(entry => {
                const moodEmoji = MOODS.find(m => m.val === entry.mood)?.emoji || '😶';
                const isExpanded = expandedId === entry.id;
                
                return (
                  <div 
                    key={entry.id} 
                    className="glass-panel"
                    style={{ 
                      padding: '1.5rem', cursor: 'pointer', transition: 'all 0.3s ease',
                      borderLeft: `4px solid ${['','#ff4757','#ff7f50','#feca57','#1dd1a1','#2ed573'][parseInt(entry.mood)] || 'var(--glass-border)'}`,
                      gridColumn: isExpanded ? '1 / -1' : 'auto'
                    }}
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '2rem' }}>{moodEmoji}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteJournalEntry(entry.id); }}
                        style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', opacity: 0.3 }}
                      >✕</button>
                    </div>

                    <p style={{ 
                      fontSize: '1rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.9)',
                      display: '-webkit-box', WebkitLineClamp: isExpanded ? 'unset' : 3, WebkitBoxOrient: 'vertical',
                      overflow: 'hidden', whiteSpace: 'pre-wrap'
                    }}>
                      {entry.content}
                    </p>

                    {entry.mediaUrl && isExpanded && (
                      <div style={{ marginTop: '1.5rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <img src={entry.mediaUrl} alt="Journal entry media" style={{ width: '100%', height: 'auto', display: 'block' }} />
                      </div>
                    )}

                    {!isExpanded && (
                      <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'right', fontStyle: 'italic' }}>
                        Ver más...
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
