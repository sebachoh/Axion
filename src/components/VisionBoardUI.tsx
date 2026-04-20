'use client';

import React, { useState, useTransition } from 'react';
import { addVisionBoard, deleteVisionBoard } from '@/app/boveda/vision/actions';
import { Plus, Trash2, Filter, Clock, Layout, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Vision {
  id: string;
  title: string;
  area: string;
  timeframe: string;
  content: string;
  image_url?: string;
}

interface VisionBoardUIProps {
  initialVisions: Vision[];
}

const AREAS = ['Salud', 'Profesional', 'Familia', 'Educación', 'Carrera', 'Finanzas', 'Personal'];
const TIMEFRAMES = ['2026', '5 años', '10 años', 'Vida'];

export default function VisionBoardUI({ initialVisions }: VisionBoardUIProps) {
  const [visions, setVisions] = useState(initialVisions);
  const [groupBy, setGroupBy] = useState<'area' | 'timeframe'>('timeframe');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta visión?')) {
      startTransition(async () => {
        await deleteVisionBoard(id);
        setVisions(prev => prev.filter(v => v.id !== id));
        router.refresh();
      });
    }
  };

  const groups = groupBy === 'area' ? AREAS : TIMEFRAMES;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="glass-panel" style={{ display: 'flex', padding: '4px', borderRadius: '12px' }}>
          <button 
            onClick={() => setGroupBy('timeframe')}
            className={`icon-btn ${groupBy === 'timeframe' ? 'is-active' : ''}`}
            style={{ borderRadius: '8px', padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Clock size={16} /> Tiempo
          </button>
          <button 
            onClick={() => setGroupBy('area')}
            className={`icon-btn ${groupBy === 'area' ? 'is-active' : ''}`}
            style={{ borderRadius: '8px', padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Layout size={16} /> Áreas
          </button>
        </div>

        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="glass-button"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-text)', color: 'var(--color-bg)' }}
        >
          <Plus size={18} /> Nueva Visión
        </button>
      </div>

      {/* Add Form (Simple Transition) */}
      {showAddForm && (
        <form 
          action={async (formData) => {
            startTransition(async () => {
              await addVisionBoard(formData);
              setShowAddForm(false);
              router.refresh();
              // In a real app we might fetch the new visions here too, 
              // but router.refresh() handles the server side sync.
              window.location.reload(); 
            });
          }}
          className="glass-panel animate-fade-in" 
          style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}
        >
          <input type="text" name="title" placeholder="Título de la visión..." required style={{ gridColumn: 'span 2', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: '#fff' }} />
          <select name="area" required style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: '#fff' }}>
            {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select name="timeframe" required style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: '#fff' }}>
            {TIMEFRAMES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="url" name="image_url" placeholder="URL de imagen (Opcional)..." style={{ gridColumn: 'span 2', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: '#fff' }} />
          <textarea name="content" placeholder="Escribe tu visión aquí..." style={{ gridColumn: 'span 2', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: '#fff', minHeight: '100px' }} />
          <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
             <button type="button" onClick={() => setShowAddForm(false)} className="glass-button">Cancelar</button>
             <button type="submit" className="glass-button" style={{ background: '#fff', color: '#000' }}>Guardar Visión</button>
          </div>
        </form>
      )}

      {/* Grouped Display */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {groups.map(group => {
          const groupVisions = visions.filter(v => (groupBy === 'area' ? v.area : v.timeframe) === group);
          if (groupVisions.length === 0 && !showAddForm) return null;

          return (
            <div key={group} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{group}</h2>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {groupVisions.map(vision => (
                  <div key={vision.id} className="glass-panel" style={{ overflow: 'hidden', transition: 'transform 0.3s ease' }}>
                    {vision.image_url && (
                      <div style={{ width: '100%', height: '160px', background: `url(${vision.image_url}) center/cover no-repeat` }} />
                    )}
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{vision.title}</h3>
                        <button onClick={() => handleDelete(vision.id)} style={{ color: '#ff4757', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p style={{ opacity: 0.7, fontSize: '0.9rem', lineHeight: 1.6 }}>{vision.content}</p>
                      <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                         <span style={{ fontSize: '0.7rem', padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', opacity: 0.6 }}>{vision.area}</span>
                         <span style={{ fontSize: '0.7rem', padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', opacity: 0.6 }}>{vision.timeframe}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {groupVisions.length === 0 && (
                   <div style={{ gridColumn: '1/-1', opacity: 0.3, fontStyle: 'italic', padding: '2rem', textAlign: 'center', border: '1px dashed var(--glass-border)', borderRadius: 'var(--radius-md)' }}>
                      No hay visiones para este grupo. Añade una para empezar a construir tu futuro.
                   </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
