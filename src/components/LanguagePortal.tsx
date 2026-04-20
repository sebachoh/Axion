'use client';

import React, { useState } from 'react';
import { 
  addWord, 
  deleteWord, 
  addResource, 
  deleteResource, 
  addTopic,
  updateTopicContent,
  deleteTopic
} from '@/app/(dashboard)/academia/idiomas/[lang]/actions';

export interface LangWord {
  id: string;
  lang: string;
  word: string;
  translation: string;
  precision: string;
  topic: string;
  createdAt: Date;
}

export interface LangResource {
  id: string;
  lang: string;
  title: string;
  url: string;
  type: string;
  skill: string;
  createdAt: Date;
}

export interface LangSkill {
  skill: string;
  level: number;
}

export interface LangTopic {
  id: string;
  lang: string;
  title: string;
  content: string;
  createdAt: Date;
}

export interface LangConfig {
  name: string;
  slug: string;
  flag: string;
  bannerUrl: string;
  countryOutlineUrl: string;
  accentColor: string;
  speakers: string;
}

interface Props {
  config: LangConfig;
  words: LangWord[];
  resources: LangResource[];
  skills: LangSkill[];
  topics: LangTopic[];
}

const SKILLS = [
  { key: 'speaking', label: 'Speaking', icon: '🗣️' },
  { key: 'listening', label: 'Listening', icon: '👂' },
  { key: 'writing', label: 'Writing', icon: '✍️' },
  { key: 'reading', label: 'Reading', icon: '📖' },
];

const PRECISION_COLORS: Record<string, string> = {
  easy: '#1dd1a1',
  medium: '#feca57',
  hard: '#ff6b6b',
};

const TYPE_ICONS: Record<string, string> = {
  VIDEO: '🎬',
  SITIO: '🌐',
  APP: '📱',
  LIBRO: '📚',
  PODCAST: '🎙️',
};

export default function LanguagePortal({ config, words, resources, skills, topics }: Props) {
  const [tab, setTab] = useState<'vocab' | 'recursos' | 'topics' | 'stats'>('vocab');
  const [topicFilter, setTopicFilter] = useState('');
  const [resourceSkillFilter, setResourceSkillFilter] = useState<string | null>(null);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [topicDraft, setTopicDraft] = useState('');

  const vocabTopics = Array.from(new Set(words.map(w => w.topic).filter(Boolean)));
  const filteredWords = topicFilter ? words.filter(w => w.topic === topicFilter) : words;
  
  const filteredResources = resourceSkillFilter 
    ? resources.filter(r => r.skill === resourceSkillFilter) 
    : resources;

  const startEditingTopic = (topic: LangTopic) => {
    setEditingTopicId(topic.id);
    setTopicDraft(topic.content);
  };

  const handleSaveTopic = async (topicId: string) => {
    await updateTopicContent(topicId, config.slug, topicDraft);
    setEditingTopicId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ──────────────── HERO BANNER ──────────────── */}
      <div className="full-bleed" style={{
        position: 'relative',
        width: 'calc(100% + 4rem)',
        marginTop: 'calc(-1 * var(--spacing-xl))',
        height: '340px',
        background: `linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%), url(${config.bannerUrl}) center/cover no-repeat`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '2.5rem 3rem',
        marginBottom: '2rem',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `linear-gradient(135deg, ${config.accentColor}22, transparent 60%), linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.75))` }} />
        
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'flex-end', gap: '1.5rem', width: '100%', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5rem' }}>
            <div style={{ fontSize: '5rem', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}>{config.flag}</div>
            <div>
              <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Academia / Idiomas</p>
              <h1 style={{ fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1, color: '#fff', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>{config.name}</h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{config.speakers} hablantes en el mundo</p>
            </div>
          </div>

          {config.countryOutlineUrl && (
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={config.countryOutlineUrl} alt={`${config.name} Outline`} style={{ height: '100px', width: 'auto', filter: 'invert(1) opacity(0.4) drop-shadow(0 0 10px rgba(255,255,255,0.2))' }} />
            </div>
          )}
        </div>
      </div>

      {/* ──────────────── SKILLS NAV ──────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {SKILLS.map(s => (
          <div 
            key={s.key} 
            className="glass-panel" 
            onClick={() => {
              setResourceSkillFilter(s.key);
              setTab('recursos');
            }}
            style={{ 
              padding: '1.5rem', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.5rem', 
              cursor: 'pointer',
              border: resourceSkillFilter === s.key ? `2px solid ${config.accentColor}` : '1px solid var(--glass-border)',
              background: resourceSkillFilter === s.key ? `${config.accentColor}11` : 'var(--glass-bg)',
              transition: 'all 0.2s ease',
              transform: resourceSkillFilter === s.key ? 'translateY(-4px)' : 'none'
            }}
          >
            <span style={{ fontSize: '2rem' }}>{s.icon}</span>
            <p style={{ fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>{s.label}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>Ver recursos segmentados</p>
          </div>
        ))}
      </div>

      {/* ──────────────── TABS ──────────────── */}
      <div style={{ display: 'flex', gap: '0.5rem', padding: '6px', background: 'var(--glass-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', width: 'fit-content', marginBottom: '1.5rem' }}>
        {[
          { id: 'vocab', label: '📘 Vocabulario' },
          { id: 'recursos', label: '📚 Recursos' },
          { id: 'topics', label: '🎓 Temas' },
          { id: 'stats', label: '📊 Estadísticas' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)} style={{
            padding: '8px 20px', borderRadius: '8px', border: 'none',
            background: tab === t.id ? config.accentColor : 'transparent',
            color: tab === t.id ? '#fff' : 'var(--color-text-muted)',
            fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s'
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ──────────────── VOCABULARIO ──────────────── */}
      {tab === 'vocab' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>+ Nueva Palabra</h3>
            <form action={addWord} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
              <input type="hidden" name="lang" value={config.slug} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Palabra original *</label>
                <input name="word" required placeholder={`En ${config.name}...`} style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--color-text)', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Traducción *</label>
                <input name="translation" required placeholder="En español..." style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--color-text)', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Dificultad</label>
                <select name="precision" style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--color-text)', outline: 'none' }}>
                  <option value="easy" style={{color:'black'}}>🟢 Fácil</option>
                  <option value="medium" style={{color:'black'}}>🟡 Media</option>
                  <option value="hard" style={{color:'black'}}>🔴 Difícil</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Tema</label>
                <input name="topic" placeholder="Ej. Comida, Viajes..." style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--color-text)', outline: 'none' }} />
              </div>
              <button type="submit" className="glass-button" style={{ padding: '9px', background: config.accentColor, color: '#fff', border: 'none' }}>
                Añadir
              </button>
            </form>
          </div>

          {vocabTopics.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Filtrar:</span>
              <button onClick={() => setTopicFilter('')} style={{ padding: '4px 12px', borderRadius: '20px', border: '1px solid var(--glass-border)', background: !topicFilter ? config.accentColor : 'transparent', color: !topicFilter ? '#fff' : 'var(--color-text)', cursor: 'pointer', fontSize: '0.8rem' }}>Todos</button>
              {vocabTopics.map(t => (
                <button key={t} onClick={() => setTopicFilter(t)} style={{ padding: '4px 12px', borderRadius: '20px', border: '1px solid var(--glass-border)', background: topicFilter === t ? config.accentColor : 'transparent', color: topicFilter === t ? '#fff' : 'var(--color-text)', cursor: 'pointer', fontSize: '0.8rem' }}>{t}</button>
              ))}
            </div>
          )}

          <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 600, fontSize: '1.1rem' }}>Banco de Vocabulario</h3>
              <span style={{ fontSize: '0.8rem', background: 'var(--glass-bg)', padding: '2px 10px', borderRadius: '12px' }}>{filteredWords.length} palabras</span>
            </div>
            {filteredWords.length === 0 ? (
              <p style={{ textAlign: 'center', opacity: 0.5, fontStyle: 'italic', padding: '2rem' }}>Añade tu primera palabra.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>Palabra</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>Traducción</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>Dificultad</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>Tema</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWords.map(w => (
                    <tr key={w.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '0.9rem 0.5rem', fontWeight: 700, fontSize: '1rem' }}>{w.word}</td>
                      <td style={{ padding: '0.9rem 0.5rem', color: 'var(--color-text-muted)' }}>{w.translation}</td>
                      <td style={{ padding: '0.9rem 0.5rem' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '20px', background: `${PRECISION_COLORS[w.precision]}22`, color: PRECISION_COLORS[w.precision], fontSize: '0.8rem', fontWeight: 600 }}>
                          {w.precision === 'easy' ? 'Fácil' : w.precision === 'medium' ? 'Media' : 'Difícil'}
                        </span>
                      </td>
                      <td style={{ padding: '0.9rem 0.5rem' }}>
                        {w.topic && <span style={{ padding: '3px 10px', borderRadius: '20px', background: `${config.accentColor}22`, color: config.accentColor, fontSize: '0.8rem' }}>{w.topic}</span>}
                      </td>
                      <td style={{ padding: '0.9rem 0.5rem', textAlign: 'right' }}>
                        <form action={deleteWord.bind(null, w.id, config.slug)}>
                          <button type="submit" style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>✕</button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ──────────────── RECURSOS ──────────────── */}
      {tab === 'recursos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Filtro actual:</span>
              <button 
                onClick={() => setResourceSkillFilter(null)}
                style={{ padding: '6px 16px', borderRadius: '20px', border: '1px solid var(--glass-border)', background: !resourceSkillFilter ? config.accentColor : 'transparent', color: !resourceSkillFilter ? '#fff' : 'var(--color-text)', cursor: 'pointer', fontSize: '0.85rem' }}
              >Todos</button>
              {SKILLS.map(s => (
                <button 
                  key={s.key}
                  onClick={() => setResourceSkillFilter(s.key)}
                  style={{ padding: '6px 16px', borderRadius: '20px', border: '1px solid var(--glass-border)', background: resourceSkillFilter === s.key ? config.accentColor : 'transparent', color: resourceSkillFilter === s.key ? '#fff' : 'var(--color-text)', cursor: 'pointer', fontSize: '0.85rem' }}
                >{s.icon} {s.label}</button>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>+ Nuevo Recurso</h3>
            <form action={addResource} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
              <input type="hidden" name="lang" value={config.slug} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Título *</label>
                <input name="title" required placeholder="Nombre" style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--color-text)', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>URL *</label>
                <input name="url" type="url" required placeholder="https://..." style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--color-text)', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Tipo</label>
                <select name="type" style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--color-text)', outline: 'none' }}>
                  <option value="SITIO" style={{color:'black'}}>🌐 Sitio Web</option>
                  <option value="VIDEO" style={{color:'black'}}>🎬 Video</option>
                  <option value="APP" style={{color:'black'}}>📱 App</option>
                  <option value="PODCAST" style={{color:'black'}}>🎙️ Podcast</option>
                  <option value="LIBRO" style={{color:'black'}}>📚 Libro</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Habilidad</label>
                <select name="skill" style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--color-text)', outline: 'none' }}>
                  <option value="" style={{color:'black'}}>General</option>
                  {SKILLS.map(s => <option key={s.key} value={s.key} style={{color:'black'}}>{s.icon} {s.label}</option>)}
                </select>
              </div>
              <button type="submit" className="glass-button" style={{ padding: '9px', background: config.accentColor, color: '#fff', border: 'none' }}>Guardar</button>
            </form>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {filteredResources.length === 0 ? (
              <p style={{ gridColumn: '1/-1', textAlign: 'center', opacity: 0.5, fontStyle: 'italic', padding: '2rem' }}>No hay recursos para este filtro.</p>
            ) : filteredResources.map(r => (
              <div key={r.id} className="glass-panel" style={{ padding: '1.5rem', position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '2.5rem' }}>{TYPE_ICONS[r.type] ?? '🔗'}</span>
                  <form action={deleteResource.bind(null, r.id, config.slug)}>
                    <button type="submit" style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>✕</button>
                  </form>
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px' }}>{r.title}</h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: `${config.accentColor}22`, color: config.accentColor, fontWeight: 600 }}>{r.type}</span>
                    {r.skill && <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)' }}>{SKILLS.find(s => s.key === r.skill)?.icon} {r.skill}</span>}
                  </div>
                </div>
                <a href={r.url} target="_blank" rel="noreferrer" className="glass-button" style={{ color: '#fff', fontSize: '0.85rem', textDecoration: 'none', background: 'rgba(255,255,255,0.05)', textAlign: 'center', padding: '8px' }}>
                  Abrir enlace ↗
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────── TEMAS (NOTAS PROFUNDAS) ──────────────── */}
      {tab === 'topics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>+ Nuevo Tema de Estudio</h3>
            <form action={addTopic} style={{ display: 'flex', gap: '0.75rem', alignItems: 'end' }}>
              <input type="hidden" name="lang" value={config.slug} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Título del Tema (Gramática, Cultura, etc.) *</label>
                <input name="title" required placeholder="Ej. El pasado perfecto (Passé Composé)" style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--color-text)', outline: 'none' }} />
              </div>
              <button type="submit" className="glass-button" style={{ padding: '10px 24px', background: config.accentColor, color: '#fff', border: 'none' }}>Crear Tema</button>
            </form>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '1rem' 
          }}>
            {topics.length === 0 ? (
              <p style={{ gridColumn: '1/-1', textAlign: 'center', opacity: 0.5, fontStyle: 'italic', padding: '2rem' }}>Crea temas para organizar tu conocimiento profundo.</p>
            ) : topics.map(topic => (
              <div key={topic.id} className="glass-panel" style={{ 
                padding: editingTopicId === topic.id ? '1.5rem' : '1.25rem', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1rem',
                gridColumn: editingTopicId === topic.id ? '1 / -1' : 'auto',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', color: config.accentColor, margin: 0 }}>{topic.title}</h4>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {editingTopicId !== topic.id ? (
                      <button onClick={() => startEditingTopic(topic)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>✎</button>
                    ) : (
                      <button onClick={() => handleSaveTopic(topic.id)} style={{ padding: '4px 10px', borderRadius: '4px', background: '#1dd1a1', color: '#fff', border: 'none', fontSize: '0.75rem', fontWeight: 700 }}>Guardar</button>
                    )}
                    <button onClick={() => deleteTopic(topic.id, config.slug)} style={{ background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: '0.9rem' }}>✕</button>
                  </div>
                </div>
                
                {editingTopicId === topic.id ? (
                  <textarea 
                    value={topicDraft}
                    onChange={e => setTopicDraft(e.target.value)}
                    placeholder="Escribe aquí tus notas detalladas..."
                    style={{ 
                      width: '100%', minHeight: '200px', padding: '1rem', borderRadius: '8px', 
                      background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid var(--glass-border)',
                      outline: 'none', fontFamily: 'monospace', lineHeight: '1.6', fontSize: '0.95rem'
                    }}
                  />
                ) : (
                  <div style={{ 
                    fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', 
                    lineHeight: '1.6', maxHeight: '100px', overflow: 'hidden', 
                    display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical',
                    background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px',
                    borderLeft: `3px solid ${config.accentColor}`, cursor: 'pointer'
                  }} onClick={() => startEditingTopic(topic)}>
                    {topic.content || 'Sin notas.'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────── ESTADÍSTICAS ──────────────── */}
      {tab === 'stats' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontWeight: 600, fontSize: '1.2rem' }}>📊 Resumen de Vocabulario</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ textAlign: 'center', padding: '1.5rem', background: '#1dd1a122', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1dd1a1' }}>{words.filter(w => w.precision === 'easy').length}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Fáciles</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1.5rem', background: '#feca5722', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#feca57' }}>{words.filter(w => w.precision === 'medium').length}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Medias</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1.5rem', background: '#ff6b6b22', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ff6b6b' }}>{words.filter(w => w.precision === 'hard').length}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Difíciles</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1.5rem', background: `${config.accentColor}22`, borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: config.accentColor }}>{words.length}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Total</div>
              </div>
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontWeight: 600, fontSize: '1.2rem' }}>🎯 Recursos por Habilidad</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              {SKILLS.map(s => {
                const count = resources.filter(r => r.skill === s.key).length;
                return (
                  <div key={s.key} style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>{s.icon}</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: config.accentColor }}>{count}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{s.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
