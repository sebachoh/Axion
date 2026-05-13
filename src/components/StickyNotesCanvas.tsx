'use client';

import { useState, useRef } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { StickyNote, addStickyNote, deleteStickyNote, updateStickyNotePosition, updateStickyNoteContent } from '@/core/usecases/stickyUsecases';
import { Edit2, X, Plus } from 'lucide-react';

interface Props {
  initialNotes: StickyNote[];
}

export default function StickyNotesCanvas({ initialNotes }: Props) {
  const [notes, setNotes] = useState<StickyNote[]>(initialNotes);
  const [isAdding, setIsAdding] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  // Track if the last gesture was a real drag (to avoid toggling expand on drag end)
  const dragMovedRef = useRef<Record<string, boolean>>({});

  // Form State
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [color, setColor] = useState('#fef68a'); // Default Yellow pastel
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);

  const findSmartPosition = (existingNotes: StickyNote[]): { x: number; y: number } => {
    const NOTE_W = 185;
    const NOTE_H = 185;
    const PADDING = 20;
    const CANVAS_W = canvasRef.current?.clientWidth ?? 800;
    const CANVAS_H = canvasRef.current?.clientHeight ?? 500;

    const cols = Math.max(1, Math.floor((CANVAS_W + PADDING) / (NOTE_W + PADDING)));
    const rows = Math.max(1, Math.floor((CANVAS_H + PADDING) / (NOTE_H + PADDING)));

    // Try grid slots first
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const candidateX = PADDING + c * (NOTE_W + PADDING);
        const candidateY = PADDING + r * (NOTE_H + PADDING);

        const overlaps = existingNotes.some(n => {
          const dx = Math.abs(n.pos_x - candidateX);
          const dy = Math.abs(n.pos_y - candidateY);
          return dx < NOTE_W + PADDING && dy < NOTE_H + PADDING;
        });

        if (!overlaps) return { x: candidateX, y: candidateY };
      }
    }

    // Fallback: offset from last note
    const last = existingNotes[existingNotes.length - 1];
    return last
      ? { x: (last.pos_x + NOTE_W + PADDING) % (CANVAS_W - NOTE_W), y: last.pos_y }
      : { x: PADDING, y: PADDING };
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    if (editingNoteId) {
      // Update Mode
      await updateStickyNoteContent(editingNoteId, title, body, color);
      setNotes(prev => prev.map(n => n.id === editingNoteId ? { ...n, title, body, color } : n));
      setEditingNoteId(null);
    } else {
      // Add Mode - find a smart position
      const { x, y } = findSmartPosition(notes);
      await addStickyNote(title, body, color);
      const newNote: StickyNote = {
        id: crypto.randomUUID(),
        title,
        body,
        color,
        pos_x: x,
        pos_y: y,
      };
      setNotes((prev) => [...prev, newNote]);
    }

    setIsAdding(false);
    setTitle('');
    setBody('');
    setColor('#fef68a');
  };

  const handleNoteClick = (noteId: string) => {
    // Only toggle expand on genuine click, not after drag
    if (dragMovedRef.current[noteId]) {
      dragMovedRef.current[noteId] = false;
      return;
    }
    setExpandedNoteId(prev => prev === noteId ? null : noteId);
  };

  const handleDelete = async (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
    await deleteStickyNote(id);
  };

  const handleDragEnd = async (id: string, info: PanInfo, note: StickyNote) => {
    const newX = note.pos_x + info.offset.x;
    const newY = note.pos_y + info.offset.y;

    // Optimistic update
    setNotes(notes.map(n => n.id === id ? { ...n, pos_x: newX, pos_y: newY } : n));
    
    // Save to DB silently
    await updateStickyNotePosition(id, newX, newY);
  };

  const colorOptions = [
    { name: 'Yellow', code: '#fef68a' },
    { name: 'Pink', code: '#fbcfe8' },
    { name: 'Blue', code: '#bfdbfe' },
    { name: 'Green', code: '#bbf7d0' },
    { name: 'Purple', code: '#e9d5ff' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Sticky Notes</h3>
          <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>{notes.length}</span>
        </div>
        <button 
          onClick={() => {
            if (isAdding) {
              setEditingNoteId(null);
              setTitle('');
              setBody('');
              setColor('#fef68a');
            }
            setIsAdding(!isAdding);
          }}
          className="glass-button" 
          style={{ fontSize: '0.8rem', padding: '6px 12px' }}
        >
          {isAdding ? 'Cancelar' : '+ Nueva Nota'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleFormSubmit} style={{ 
          marginBottom: '1rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px', 
          background: 'var(--glass-bg)', 
          backdropFilter: 'blur(30px)',
          padding: '1rem', 
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          borderRadius: 'var(--radius-sm)' 
        }}>
          <input 
            type="text" 
            placeholder="Título..." 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            required 
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--color-text)' }}
          />
          <textarea 
            placeholder="Escribe algo..." 
            value={body} 
            onChange={e => setBody(e.target.value)} 
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--color-text)', minHeight: '60px' }}
          />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {colorOptions.map(c => (
              <button 
                type="button" 
                key={c.code} 
                onClick={() => setColor(c.code)}
                style={{ 
                  width: '24px', height: '24px', borderRadius: '50%', background: c.code, 
                  border: color === c.code ? '2px solid var(--color-text)' : '2px solid transparent',
                  cursor: 'pointer'
                }}
              />
            ))}
            <button type="submit" className="glass-button" style={{ marginLeft: 'auto', background: 'var(--color-text)', color: 'var(--color-bg)' }}>
              {editingNoteId ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      {/* Canvas Area */}
      <div 
        ref={canvasRef} 
        style={{ 
          flex: 1, 
          position: 'relative', 
          border: '1px solid rgba(255,255,255,0.12)', 
          borderRadius: 'var(--radius-md)', 
          overflow: 'hidden',
          minHeight: '480px',
          background: 'rgba(0, 0, 0, 0.28)',
          boxShadow: 'inset 0 2px 12px rgba(0,0,0,0.2)',
        }}
      >
        {notes.map((note) => (
          <motion.div
            key={note.id}
            drag
            dragConstraints={canvasRef}
            dragElastic={0.1}
            dragMomentum={false}
            onDragStart={() => { dragMovedRef.current[note.id] = false; }}
            onDrag={() => { dragMovedRef.current[note.id] = true; }}
            onDragEnd={(_, info) => handleDragEnd(note.id, info, note)}
            initial={{ x: note.pos_x, y: note.pos_y }}
            layout
            onClick={() => handleNoteClick(note.id)}
            
            style={{
              position: 'absolute',
              x: note.pos_x,
              y: note.pos_y,
              width: expandedNoteId === note.id ? '280px' : '180px',
              minHeight: expandedNoteId === note.id ? '240px' : '180px',
              height: expandedNoteId === note.id ? 'auto' : '180px',
              backgroundColor: note.color,
              padding: '1rem',
              borderRadius: '8px',
              boxShadow: expandedNoteId === note.id ? '0 20px 40px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.1)',
              color: '#1f2937', // Always dark text for pastel notes
              cursor: 'grab',
              display: 'flex',
              flexDirection: 'column',
              zIndex: expandedNoteId === note.id ? 100 : 10,
              transition: 'zIndex 0s'
            }}
            whileHover={{ scale: 1.02, zIndex: expandedNoteId === note.id ? 100 : 20 }}
            whileDrag={{ scale: 1.05, cursor: 'grabbing', boxShadow: '0 12px 24px rgba(0,0,0,0.2)', zIndex: 50 }}
            whileTap={{ scale: 0.98 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <h4 style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0, paddingRight: '12px' }}>{note.title}</h4>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingNoteId(note.id);
                    setTitle(note.title);
                    setBody(note.body || '');
                    setColor(note.color);
                    setIsAdding(true);
                  }}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.8rem', opacity: 0.6, padding: '2px' }}
                  onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseOut={(e) => (e.currentTarget.style.opacity = '0.6')}
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }} 
                  style={{ 
                    background: 'transparent', border: 'none', cursor: 'pointer', 
                    fontSize: '1rem', opacity: 0.6, padding: '2px', lineHeight: 1 
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseOut={(e) => (e.currentTarget.style.opacity = '0.6')}
                >
                  ×
                </button>
              </div>
            </div>
            {note.body && (
              <p style={{ 
                fontSize: '0.85rem', 
                lineHeight: 1.4, 
                flex: 1, 
                margin: 0,
                display: expandedNoteId === note.id ? 'block' : '-webkit-box',
                WebkitLineClamp: expandedNoteId === note.id ? 'unset' : 6,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {note.body}
              </p>
            )}
            
            {/* Grab aesthetic hint */}
            <div style={{ alignSelf: 'center', marginTop: 'auto', opacity: 0.3, letterSpacing: '2px', fontSize: '0.7rem' }}>
              {expandedNoteId === note.id ? '▲ Click para contraer' : '•••'}
            </div>
          </motion.div>
        ))}
        
        {notes.length === 0 && !isAdding && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.5, textAlign: 'center' }}>
             No hay notas.<br/> ¡Desata tu inspiración!
          </div>
        )}
      </div>
    </div>
  );
}
