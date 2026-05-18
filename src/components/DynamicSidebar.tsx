'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { saveSidebarLayout } from '@/app/actions/sidebarActions';
import {
  Pencil, Check, Plus, Trash2, ArrowUp, ArrowDown, Folder,
  Terminal, ShieldCheck, Home, Calendar, Notebook, CheckSquare,
  BarChart, Wallet, BookOpen, Compass, Layers, Link2
} from 'lucide-react';
import SidebarLink from './SidebarLink';

interface SidebarItem {
  id: string;
  href: string;
  label: string;
  icon: string;
}
//comentario

interface SidebarSection {
  id: string;
  type: string;
  title: string;
  isSpecial?: boolean;
  items: SidebarItem[];
}

interface DynamicSidebarProps {
  initialLayout: SidebarSection[];
}

export default function DynamicSidebar({ initialLayout }: DynamicSidebarProps) {
  const pathname = usePathname();
  const [layout, setLayout] = useState<SidebarSection[]>(initialLayout);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // SVG Icon mapping for existing options
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'home':
        return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
      case 'calendar':
        return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>;
      case 'routine':
        return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" /></svg>;
      case 'notes':
        return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>;
      case 'tasks':
        return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
      case 'folder':
        return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.1 3.9A2 2 0 0 0 7.4 3H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" /></svg>;
      case 'alternancia':
        return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>;
      case 'stage':
        return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>;
      case 'idiomas':
        return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" x2="22" y1="12" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>;
      case 'careers':
        return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>;
      case 'journal':
        return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>;
      case 'finanzas':
        return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
      case 'hogar':
        return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
      case 'vision':
        return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>;
      case 'vault':
        return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="6" rx="2" /><path d="M12 10v4" /><path d="M2 10h20" /><path d="M6 6V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3" /></svg>;
      case 'compass':
      case 'viajes':
        return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>;
      default:
        return <Link2 size={18} />;
    }
  };

  // Reordering Sections
  const moveSection = (secIndex: number, direction: 'up' | 'down') => {
    const newLayout = [...layout];
    if (direction === 'up' && secIndex > 0) {
      const temp = newLayout[secIndex];
      newLayout[secIndex] = newLayout[secIndex - 1];
      newLayout[secIndex - 1] = temp;
    } else if (direction === 'down' && secIndex < newLayout.length - 1) {
      const temp = newLayout[secIndex];
      newLayout[secIndex] = newLayout[secIndex + 1];
      newLayout[secIndex + 1] = temp;
    }
    setLayout(newLayout);
  };

  // Reordering items within/between sections
  const moveItem = (secIndex: number, itemIndex: number, direction: 'up' | 'down') => {
    const newLayout = JSON.parse(JSON.stringify(layout)) as SidebarSection[];
    const currentSec = newLayout[secIndex];
    const items = currentSec.items;

    if (direction === 'up') {
      if (itemIndex > 0) {
        // Swap within same section
        const temp = items[itemIndex];
        items[itemIndex] = items[itemIndex - 1];
        items[itemIndex - 1] = temp;
      } else if (secIndex > 0) {
        // Move to the end of the previous section
        const item = items.splice(itemIndex, 1)[0];
        newLayout[secIndex - 1].items.push(item);
      }
    } else if (direction === 'down') {
      if (itemIndex < items.length - 1) {
        // Swap within same section
        const temp = items[itemIndex];
        items[itemIndex] = items[itemIndex + 1];
        items[itemIndex + 1] = temp;
      } else if (secIndex < newLayout.length - 1) {
        // Move to the beginning of the next section
        const item = items.splice(itemIndex, 1)[0];
        newLayout[secIndex + 1].items.unshift(item);
      }
    }
    setLayout(newLayout);
  };

  // Edit fields
  const updateSectionTitle = (secIndex: number, title: string) => {
    const newLayout = [...layout];
    newLayout[secIndex].title = title;
    setLayout(newLayout);
  };

  const updateItemLabel = (secIndex: number, itemIndex: number, label: string) => {
    const newLayout = [...layout];
    newLayout[secIndex].items[itemIndex].label = label;
    setLayout(newLayout);
  };

  const updateItemHref = (secIndex: number, itemIndex: number, href: string) => {
    const newLayout = [...layout];
    newLayout[secIndex].items[itemIndex].href = href;
    setLayout(newLayout);
  };

  // Deletion
  const deleteSection = (secIndex: number) => {
    const newLayout = layout.filter((_, idx) => idx !== secIndex);
    setLayout(newLayout);
  };

  const deleteItem = (secIndex: number, itemIndex: number) => {
    const newLayout = [...layout];
    newLayout[secIndex].items = newLayout[secIndex].items.filter((_, idx) => idx !== itemIndex);
    setLayout(newLayout);
  };

  // Add items
  const addSection = () => {
    const newSection: SidebarSection = {
      id: `sec-${crypto.randomUUID()}`,
      type: 'section',
      title: 'Nueva División',
      items: []
    };
    setLayout([...layout, newSection]);
  };

  const addItemToSection = (secIndex: number) => {
    const newLayout = [...layout];
    const newItem: SidebarItem = {
      id: crypto.randomUUID(),
      href: '/workspace/nuevo',
      label: 'Nuevo Enlace',
      icon: 'link'
    };
    newLayout[secIndex].items.push(newItem);
    setLayout(newLayout);
  };

  // Toggle Edit Mode & Save
  const handleToggleEdit = async () => {
    if (isEditing) {
      setIsSaving(true);
      try {
        await saveSidebarLayout(layout);
      } catch (err) {
        console.error("Failed to save sidebar configuration", err);
      } finally {
        setIsSaving(false);
        setIsEditing(false);
      }
    } else {
      setIsEditing(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>

      {/* Scrollable Navigation Menu */}
      <nav className="no-scrollbar sidebar-nav-mask" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: isEditing ? '1.5rem' : '1rem',
        overflowY: 'auto',
        flex: 1,
        paddingRight: '4px',
        paddingBottom: '1rem'
      }}>
        {layout.map((section, secIndex) => (
          <div
            key={section.id}
            className={`sidebar-section ${section.isSpecial ? 'special' : ''}`}
            style={{
              border: isEditing ? '1px dashed rgba(255,255,255,0.15)' : 'none',
              padding: isEditing ? '10px' : '',
              borderRadius: isEditing ? '12px' : '',
              background: isEditing ? 'rgba(255,255,255,0.01)' : ''
            }}
          >
            {/* Section Header */}
            {isEditing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => updateSectionTitle(secIndex, e.target.value)}
                  style={{
                    flex: 1,
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)',
                    color: section.isSpecial ? '#f9ca24' : 'var(--color-text)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                  }}
                />
                <button
                  onClick={() => moveSection(secIndex, 'up')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', padding: '2px' }}
                  title="Subir sección"
                >
                  <ArrowUp size={12} />
                </button>
                <button
                  onClick={() => moveSection(secIndex, 'down')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', padding: '2px' }}
                  title="Bajar sección"
                >
                  <ArrowDown size={12} />
                </button>
                <button
                  onClick={() => deleteSection(secIndex)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff6b6b', display: 'flex', alignItems: 'center', padding: '2px' }}
                  title="Eliminar sección"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ) : (
              <span className="sidebar-section-title">{section.title}</span>
            )}

            {/* Section Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {section.items.map((item, itemIndex) => (
                <div key={item.id}>
                  {isEditing ? (
                    /* EDIT ROW */
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      background: 'rgba(255,255,255,0.02)',
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.04)',
                      marginBottom: '4px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <button
                            onClick={() => moveItem(secIndex, itemIndex, 'up')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '0.6rem', padding: '0 2px' }}
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => moveItem(secIndex, itemIndex, 'down')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '0.6rem', padding: '0 2px' }}
                          >
                            ▼
                          </button>
                        </div>
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => updateItemLabel(secIndex, itemIndex, e.target.value)}
                          placeholder="Nombre"
                          style={{
                            flex: 1,
                            padding: '3px 6px',
                            borderRadius: '4px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.05)',
                            color: '#fff',
                            fontSize: '0.8rem',
                            minWidth: 0
                          }}
                        />
                        <button
                          onClick={() => deleteItem(secIndex, itemIndex)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff6b6b', padding: '4px' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={item.href}
                        onChange={(e) => updateItemHref(secIndex, itemIndex, e.target.value)}
                        placeholder="URL (Ej: /workspace/tareas)"
                        style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          border: '1px solid rgba(255,255,255,0.05)',
                          background: 'rgba(255,255,255,0.02)',
                          color: 'var(--color-text-muted)',
                          fontSize: '0.7rem'
                        }}
                      />
                    </div>
                  ) : (
                    /* STANDARD LINK */
                    <SidebarLink href={item.href} label={item.label} icon={getIcon(item.icon)} />
                  )}
                </div>
              ))}

              {isEditing && (
                <button
                  onClick={() => addItemToSection(secIndex)}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    color: 'var(--color-text-muted)',
                    border: '1px dashed rgba(255,255,255,0.1)',
                    width: '100%',
                    padding: '6px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Plus size={12} /> Añadir Enlace
                </button>
              )}
            </div>
          </div>
        ))}

        {isEditing && (
          <button
            onClick={addSection}
            className="glass-button"
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              border: '1px dashed var(--glass-border)'
            }}
          >
            <Plus size={14} /> Crear Nueva División
          </button>
        )}

        {/* Minimalist icon-only edit button integrated at the bottom of the scrollable list */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '1.2rem',
          paddingBottom: '0.5rem',
          flexShrink: 0
        }}>
          <button
            onClick={handleToggleEdit}
            disabled={isSaving}
            style={{
              background: 'var(--glass-bg, rgba(255,255,255,0.03))',
              border: '1px solid var(--glass-border, rgba(255,255,255,0.08))',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              cursor: 'pointer',
              color: isEditing ? '#1dd1a1' : 'var(--color-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: 'var(--glass-shadow)',
              opacity: 0.75
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.background = 'var(--glass-bg-hover, rgba(255,255,255,0.08))';
              e.currentTarget.style.borderColor = 'var(--glass-border-hover, rgba(255,255,255,0.15))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.75';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = 'var(--glass-bg, rgba(255,255,255,0.03))';
              e.currentTarget.style.borderColor = 'var(--glass-border, rgba(255,255,255,0.08))';
            }}
            title={isEditing ? "Guardar cambios" : "Editar menú lateral"}
          >
            {isSaving ? (
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
            ) : isEditing ? (
              <Check size={18} />
            ) : (
              <Pencil size={18} />
            )}
          </button>
        </div>
      </nav>

      <style jsx global>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
}
