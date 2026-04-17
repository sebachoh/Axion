'use client';

import React, { useState } from 'react';
import { addJournalEntry, deleteJournalEntry } from '@/app/workspace/journal/actions';

export interface JournalEntry {
  id: string;
  content: string;
  mediaUrl: string;
  mood: string;
  createdAt: Date;
}

interface Props {
  initialEntries: JournalEntry[];
}

export default function JournalBoard({ initialEntries }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Agrupar entradas por fecha (YYYY-MM-DD)
  const groupedEntries = initialEntries.reduce((acc, entry) => {
    const dateKey = entry.createdAt.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(entry);
    return acc;
  }, {} as Record<string, JournalEntry[]>);

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'happy': return '😃';
      case 'excited': return '🚀';
      case 'neutral': return '😐';
      case 'sad': return '😔';
      case 'angry': return '😡';
      default: return '😐';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      
      {/* Creador de Entradas (Status Input) */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
         <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>¿Qué ronda por tu mente?</h3>
         
         <form action={addJournalEntry} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
           <textarea 
             name="content" 
             required 
             placeholder="Escribe tu bitácora aquí..." 
             style={{ 
               width: '100%', 
               minHeight: '120px', 
               background: 'rgba(255,255,255,0.03)', 
               border: '1px solid var(--glass-border)', 
               borderRadius: 'var(--radius-sm)',
               padding: '1rem',
               color: 'var(--color-text)',
               outline: 'none',
               resize: 'vertical',
               fontSize: '1rem',
               lineHeight: 1.5
             }} 
           />

           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
             
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                 <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Ánimo</label>
                 <select name="mood" defaultValue="neutral" style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--color-text)', outline: 'none' }}>
                   <option value="happy" style={{color:'black'}}>😃 Feliz</option>
                   <option value="excited" style={{color:'black'}}>🚀 Entusiasmado</option>
                   <option value="neutral" style={{color:'black'}}>😐 Neutral</option>
                   <option value="sad" style={{color:'black'}}>😔 Triste / Cansado</option>
                   <option value="angry" style={{color:'black'}}>😡 Molesto</option>
                 </select>
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                 <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Imagen URL (Opcional)</label>
                 <input type="url" name="media_url" placeholder="https://..." style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--color-text)', outline: 'none', width: '250px' }} />
               </div>
             </div>

             <button type="submit" className="glass-button" style={{ background: 'var(--color-text)', color: 'var(--color-bg)', padding: '10px 20px', fontSize: '1rem', fontWeight: 600 }}>
               Publicar Bitácora
             </button>

           </div>
         </form>
      </div>

      {/* Feed del Journal organizado por días */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
         {Object.keys(groupedEntries).length === 0 ? (
           <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.5, fontStyle: 'italic' }}>El muro está en blanco. Empieza tu registro.</div>
         ) : (
            Object.keys(groupedEntries).map(dateKey => (
              <div key={dateKey} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h4 style={{ fontSize: '1.4rem', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', textTransform: 'capitalize' }}>
                  {dateKey}
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {groupedEntries[dateKey].map(entry => {
                    const isExpanded = expandedId === entry.id;

                    return (
                      <div 
                        key={entry.id} 
                        className="glass-panel"
                        onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                        style={{ 
                          padding: '1.5rem', 
                          cursor: 'pointer', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '1rem',
                          transition: 'all 0.3s ease',
                          gridRow: isExpanded ? 'span 2' : 'span 1', // Simple expansion simulation
                          position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <span style={{ fontSize: '1.5rem' }}>{getMoodEmoji(entry.mood)}</span>
                           <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                             {entry.createdAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                           </span>
                        </div>

                        {entry.mediaUrl && (
                          <div style={{ 
                            width: '100%', 
                            height: isExpanded ? '200px' : '100px', 
                            borderRadius: 'var(--radius-sm)', 
                            background: `url(${entry.mediaUrl}) center/cover`,
                            transition: 'height 0.3s ease'
                          }} />
                        )}

                        <div style={{ 
                          fontSize: '0.95rem', 
                          lineHeight: 1.6, 
                          color: 'var(--color-text)',
                          display: '-webkit-box',
                          WebkitLineClamp: isExpanded ? 'unset' : 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: isExpanded ? 'visible' : 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {entry.content}
                        </div>

                        <form action={deleteJournalEntry.bind(null, entry.id)} style={{ position: 'absolute', top: '10px', right: '10px' }}>
                           <button type="submit" onClick={(e) => e.stopPropagation()} style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                             🗑️
                           </button>
                        </form>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
         )}
      </div>

    </div>
  );
}
