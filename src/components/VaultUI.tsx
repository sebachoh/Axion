'use client';

import React, { useState, useMemo, useTransition } from 'react';
import { addVaultResource, deleteVaultResource } from '@/app/boveda/recursos/actions';
import { Plus, Trash2, Search, Link as LinkIcon, Image as ImageIcon, Lightbulb, FileText, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Resource {
  id: string;
  title: string;
  type: string;
  content: string;
  media_url?: string;
  tags?: string;
  created_at: string;
}

interface VaultUIProps {
  initialResources: Resource[];
}

const TYPES = [
  { id: 'all', label: 'Todos', icon: null },
  { id: 'text', label: 'Notas', icon: <FileText size={16} /> },
  { id: 'image', label: 'Imágenes', icon: <ImageIcon size={16} /> },
  { id: 'link', label: 'Enlaces', icon: <LinkIcon size={16} /> },
  { id: 'idea', label: 'Ideas', icon: <Lightbulb size={16} /> },
];

export default function VaultUI({ initialResources }: VaultUIProps) {
  const [resources, setResources] = useState(initialResources);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newType, setNewType] = useState('text');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filtered = useMemo(() => {
    return resources.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                           (r.tags && r.tags.toLowerCase().includes(search.toLowerCase()));
      const matchesType = filterType === 'all' || r.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [resources, search, filterType]);

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este recurso?')) {
      startTransition(async () => {
        await deleteVaultResource(id);
        setResources(prev => prev.filter(r => r.id !== id));
        router.refresh();
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top Bar: Search & Filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} size={18} />
          <input 
            type="text" 
            placeholder="Buscar por título o tags..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-panel"
            style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}
          />
        </div>

        <div className="glass-panel" style={{ display: 'flex', padding: '4px', borderRadius: '12px', overflowX: 'auto' }}>
          {TYPES.map(t => (
            <button 
              key={t.id}
              onClick={() => setFilterType(t.id)}
              className={`icon-btn ${filterType === t.id ? 'is-active' : ''}`}
              style={{ borderRadius: '8px', padding: '8px 16px', fontSize: '0.85rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <button 
          onClick={() => setShowAddForm(true)}
          className="glass-button"
          style={{ background: '#fff', color: '#000', borderRadius: '12px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} /> Agregar Recurso
        </button>
      </div>

      {/* Modern Add Form Modal (Overlay style but inline) */}
      {showAddForm && (
        <div className="glass-panel animate-fade-in" style={{ padding: '2rem', border: '1px solid var(--glass-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Nuevo Recurso</h3>
            <button onClick={() => setShowAddForm(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
          </div>

          <form action={async (formData) => {
            startTransition(async () => {
              await addVaultResource(formData);
              setShowAddForm(false);
              router.refresh();
              window.location.reload();
            });
          }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <select name="type" value={newType} onChange={(e) => setNewType(e.target.value)} style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--glass-border)' }}>
                <option value="text">Bloque de Texto</option>
                <option value="image">Imagen / Foto</option>
                <option value="link">Enlace / Web</option>
                <option value="idea">Idea / Inspiración</option>
              </select>
              <input type="text" name="tags" placeholder="Tags (separados por coma)..." style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--glass-border)' }} />
            </div>

            <input type="text" name="title" placeholder="Título del recurso..." required style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--glass-border)' }} />
            
            {(newType === 'image' || newType === 'link') && (
              <input type="url" name="media_url" placeholder={newType === 'image' ? "URL de la imagen..." : "URL del sitio web..."} required style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--glass-border)' }} />
            )}

            <textarea name="content" placeholder="Contenido o descripción..." style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--glass-border)', minHeight: '120px' }} />
            
            <button type="submit" className="glass-button" style={{ background: '#fff', color: '#000', padding: '14px', fontWeight: 700 }}>Guardar en la Bóveda</button>
          </form>
        </div>
      )}

      {/* Resource Grid (Masonry-like) */}
      <div style={{ columns: 'repeat(auto-fill, minmax(280px, 1fr))', columnGap: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {filtered.map(res => (
          <div key={res.id} className="glass-panel" style={{ 
            display: 'flex', flexDirection: 'column', gap: '12px', breakInside: 'avoid',
            borderBottom: res.type === 'idea' ? '4px solid #f9ca24' : res.type === 'link' ? '4px solid #3498db' : 'none',
            background: res.type === 'idea' ? 'linear-gradient(135deg, rgba(249,202,36,0.05), rgba(255,255,255,0.02))' : 'var(--glass-bg)'
          }}>
            {res.type === 'image' && res.media_url && (
              <img src={res.media_url} alt={res.title} style={{ width: '100%', borderRadius: '12px', marginBottom: '8px' }} />
            )}
            
            <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ fontWeight: 800, fontSize: '1.1rem' }}>{res.title}</h4>
                <button onClick={() => handleDelete(res.id)} style={{ background: 'transparent', border: 'none', color: '#ff4757', cursor: 'pointer' }}><Trash2 size={16} /></button>
              </div>

              {res.content && (
                <p style={{ fontSize: '0.9rem', opacity: 0.7, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{res.content}</p>
              )}

              {res.type === 'link' && res.media_url && (
                <a href={res.media_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#3498db', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <LinkIcon size={12} /> Visitar sitio
                </a>
              )}

              <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '8px' }}>
                <span style={{ fontSize: '0.65rem', padding: '2px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', textTransform: 'uppercase', fontWeight: 700, opacity: 0.5 }}>{res.type}</span>
                {res.tags && res.tags.split(',').map(tag => (
                  <span key={tag} style={{ fontSize: '0.65rem', padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.6)' }}>#{tag.trim()}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: '4rem', textAlign: 'center', opacity: 0.3 }}>
          <p>No se encontraron recursos. Agrega ideas, enlaces o fotos a tu bóveda.</p>
        </div>
      )}
    </div>
  );
}
