'use client';

import React, { useState, useEffect } from 'react';
import { Camera, Check, X, Link as LinkIcon } from 'lucide-react';

interface HeroBannerProps {
  currentDate: string;
  journalMoodToday: string | null;
  moodEmojis: Record<string, string>;
}

const PRESET_BANNERS = [
  {
    id: 'architecture',
    name: 'Arquitectura',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 'abstract',
    name: 'Fluido Azul',
    url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 'mountains',
    name: 'Montañas',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 'workspace',
    name: 'Workspace',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 'stars',
    name: 'Aesthetic Sky',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop'
  }
];

export default function HeroBanner({ currentDate, journalMoodToday, moodEmojis }: HeroBannerProps) {
  const [bannerUrl, setBannerUrl] = useState(PRESET_BANNERS[0].url);
  const [showPicker, setShowPicker] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('axion-banner-image');
    if (saved) {
      setBannerUrl(saved);
    }
  }, []);

  const changeBanner = (url: string) => {
    setBannerUrl(url);
    localStorage.setItem('axion-banner-image', url);
  };

  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim().startsWith('http')) {
      changeBanner(customUrl.trim());
      setCustomUrl('');
      setShowPicker(false);
    }
  };

  return (
    <div className="full-bleed" style={{
      marginTop: 'calc(-1 * var(--spacing-xl))',
      height: '288px',
      position: 'relative',
      background: `url(${bannerUrl}) center/cover no-repeat`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      padding: '3.5rem 4rem',
      marginBottom: '-1rem',
      overflow: 'hidden',
      transition: 'background 0.5s ease'
    }}>
      {/* Dark overlay for readability */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 100%)', zIndex: 1 }} />

      {/* Hero Content */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', fontWeight: 600, textTransform: 'capitalize', marginBottom: '0.75rem', letterSpacing: '-0.05em' }}>
          {currentDate}
        </p>
        <h1 style={{ fontSize: '4.5rem', fontWeight: 900, letterSpacing: '-0.07em', lineHeight: 0.95, color: '#fff', textShadow: '0 4px 40px rgba(0,0,0,0.6)' }}>
          Axion
          <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 400, opacity: 0.6, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '-0.01rem' }}>Ecosystem</span>
        </h1>
      </div>

      {/* Mood mindet display */}
      {journalMoodToday && (
        <div style={{
          position: 'absolute', top: '3rem', right: '4rem', textAlign: 'center',
          minWidth: '120px', padding: '1.25rem', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(25px)',
          border: '1px solid rgba(255,255,255,0.2)', borderRadius: '24px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.4)', zIndex: 2
        }}>
          <div style={{ fontSize: '3rem' }}>{moodEmojis[journalMoodToday] || '😐'}</div>
          <p style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 800, marginTop: '8px', opacity: 0.9, letterSpacing: '0.05em' }}>MINDSET</p>
        </div>
      )}

      {/* Camera Icon Floating Button to Change Banner */}
      {mounted && (
        <div style={{ position: 'absolute', bottom: '2.5rem', right: '4rem', zIndex: 3 }}>
          <button
            onClick={() => setShowPicker(!showPicker)}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="Cambiar imagen de portada"
          >
            <Camera size={18} />
          </button>

          {/* Banner selection popup modal */}
          {showPicker && (
            <div style={{
              position: 'absolute',
              bottom: '50px',
              right: 0,
              width: '320px',
              background: 'rgba(20, 20, 20, 0.95)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: '1.25rem',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              animation: 'fade-in 0.2s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ff7f50' }}>Selecciona Portada</span>
                <button onClick={() => setShowPicker(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}>
                  <X size={14} />
                </button>
              </div>

              {/* Predefined cover options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {PRESET_BANNERS.map((preset) => {
                  const isCurrent = bannerUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => changeBanner(preset.url)}
                      style={{
                        background: isCurrent ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                        border: isCurrent ? '1px solid #ff7f50' : '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '10px',
                        padding: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        textAlign: 'left',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!isCurrent) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isCurrent) e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                      }}
                    >
                      {/* Mini Preview Thumbnail */}
                      <div style={{
                        width: '45px',
                        height: '30px',
                        borderRadius: '6px',
                        background: `url(${preset.url}) center/cover no-repeat`,
                        border: '1px solid rgba(255,255,255,0.1)'
                      }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isCurrent ? '#fff' : '#ccc', flex: 1 }}>{preset.name}</span>
                      {isCurrent && <Check size={12} style={{ color: '#ff7f50' }} />}
                    </button>
                  );
                })}
              </div>

              {/* Custom Image URL Form */}
              <form onSubmit={handleCustomUrlSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#aaa' }}>Pegar URL Personalizada</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#fff',
                      fontSize: '0.75rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#ff7f50',
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Aplicar URL"
                  >
                    <LinkIcon size={12} />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
