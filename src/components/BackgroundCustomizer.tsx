'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Palette, Flame, ChevronLeft, ChevronRight } from 'lucide-react';

interface Preset {
  id: string;
  name: string;
  color1: string;
  color2: string;
  color3: string;
  color4: string;
  intensity: number;
  textColor?: string;
  textColorMuted?: string;
  glassBg?: string;
  glassBorder?: string;
  glassBgHover?: string;
  glassBorderHover?: string;
  sidebarBg?: string;
  sidebarLinkColor?: string;
  sidebarActiveBg?: string;
  sidebarActiveColor?: string;
  sidebarActiveBorder?: string;
  logoFilter?: string;
  specialSidebarBg?: string;
  specialSidebarBorder?: string;
  specialSidebarText?: string;
}

const PRESETS: Preset[] = [
  {
    id: 'mistico',
    name: 'Místico',
    color1: '#1a0b2e',
    color2: '#0f1c3f',
    color3: '#1b1031',
    color4: '#0a0a0a',
    intensity: 55
  },
  {
    id: 'aurora',
    name: 'Aurora',
    color1: '#093628',
    color2: '#0d1f3d',
    color3: '#05221c',
    color4: '#030508',
    intensity: 65
  },
  {
    id: 'sunset',
    name: 'Sunset',
    color1: '#400a1d',
    color2: '#1b0d36',
    color3: '#2d061c',
    color4: '#060309',
    intensity: 55
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    color1: '#3d0725',
    color2: '#06203a',
    color3: '#1a0c33',
    color4: '#040409',
    intensity: 70
  },
  {
    id: 'obsidiana',
    name: 'Obsidiana',
    color1: '#16161a',
    color2: '#1a1a20',
    color3: '#111115',
    color4: '#08080a',
    intensity: 45
  },
  {
    id: 'blanco-puro',
    name: 'Blanco Puro',
    color1: '#f1f2f6',
    color2: '#e4e7eb',
    color3: '#f5f6fa',
    color4: '#ffffff',
    intensity: 50,
    textColor: '#000000',
    textColorMuted: '#57606f',
    glassBg: 'rgba(240, 240, 240, 0.75)',
    glassBorder: 'rgba(0, 0, 0, 0.08)',
    glassBgHover: 'rgba(240, 240, 240, 0.95)',
    glassBorderHover: 'rgba(0, 0, 0, 0.15)',
    sidebarBg: 'rgba(255, 255, 255, 0.75)',
    sidebarLinkColor: 'rgba(0, 0, 0, 0.65)',
    sidebarActiveBg: 'rgba(0, 0, 0, 0.08)',
    sidebarActiveColor: '#000000',
    sidebarActiveBorder: 'rgba(0, 0, 0, 0.12)',
    logoFilter: 'invert(1)',
    specialSidebarBg: 'linear-gradient(135deg, rgba(249, 202, 36, 0.15), rgba(249, 202, 36, 0.08))',
    specialSidebarBorder: 'rgba(218, 165, 32, 0.3)',
    specialSidebarText: '#996515'
  },
  {
    id: 'oscuro-puro',
    name: 'Oscuro Puro',
    color1: '#000000',
    color2: '#000000',
    color3: '#000000',
    color4: '#000000',
    intensity: 45,
    textColor: '#ffffff',
    textColorMuted: '#a4b0be',
    glassBg: 'rgba(15, 15, 15, 0.9)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    glassBgHover: 'rgba(25, 25, 25, 0.95)',
    glassBorderHover: 'rgba(255, 255, 255, 0.15)',
    sidebarBg: '#000000',
    sidebarLinkColor: 'rgba(255, 255, 255, 0.6)',
    sidebarActiveBg: 'rgba(255, 255, 255, 0.12)',
    sidebarActiveColor: '#ffffff',
    sidebarActiveBorder: 'rgba(255, 255, 255, 0.15)',
    logoFilter: 'none',
    specialSidebarBg: 'rgba(20, 20, 20, 0.5)',
    specialSidebarBorder: 'rgba(255, 255, 255, 0.08)',
    specialSidebarText: '#f1c40f'
  }
];

export default function BackgroundCustomizer() {
  const [activePreset, setActivePreset] = useState('mistico');
  const [hoveredPreset, setHoveredPreset] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (container) {
      const scrollAmount = direction === 'left' ? -100 : 100;
      try {
        container.scrollTo({
          left: container.scrollLeft + scrollAmount,
          behavior: 'smooth'
        });
      } catch (err) {
        container.scrollLeft += scrollAmount;
      }
    }
  };

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('axion-theme-bg');
      if (saved) {
        const parsed = JSON.parse(saved);
        const found = PRESETS.find(p => p.color4 === parsed.color4 && p.color1 === parsed.color1);
        if (found) {
          setActivePreset(found.id);
        } else {
          setActivePreset('mistico');
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const applyPreset = (preset: Preset) => {
    setActivePreset(preset.id);
    
    const root = document.documentElement;
    root.style.setProperty('--bg-gradient-1', preset.color1);
    root.style.setProperty('--bg-gradient-2', preset.color2);
    root.style.setProperty('--bg-gradient-3', preset.color3);
    root.style.setProperty('--bg-gradient-4', preset.color4);
    root.style.setProperty('--bg-gradient-size', `${preset.intensity}%`);

    // Helper to safely apply or remove property on root style
    const setOrRemove = (variable: string, value?: string) => {
      if (value) {
        root.style.setProperty(variable, value);
      } else {
        root.style.removeProperty(variable);
      }
    };

    setOrRemove('--color-text', preset.textColor);
    setOrRemove('--color-text-muted', preset.textColorMuted);
    setOrRemove('--glass-bg', preset.glassBg);
    setOrRemove('--glass-border', preset.glassBorder);
    setOrRemove('--glass-bg-hover', preset.glassBgHover);
    setOrRemove('--glass-border-hover', preset.glassBorderHover);

    // Sidebar specifically
    setOrRemove('--sidebar-bg', preset.sidebarBg);
    setOrRemove('--sidebar-link-color', preset.sidebarLinkColor);
    setOrRemove('--sidebar-active-bg', preset.sidebarActiveBg);
    setOrRemove('--sidebar-active-color', preset.sidebarActiveColor);
    setOrRemove('--sidebar-active-border', preset.sidebarActiveBorder);
    setOrRemove('--logo-filter', preset.logoFilter);

    // Special Sidebar elements
    setOrRemove('--special-sidebar-bg', preset.specialSidebarBg);
    setOrRemove('--special-sidebar-border', preset.specialSidebarBorder);
    setOrRemove('--special-sidebar-text', preset.specialSidebarText);

    // Save configuration with all parameters
    localStorage.setItem(
      'axion-theme-bg',
      JSON.stringify({ 
        color1: preset.color1, 
        color2: preset.color2, 
        color3: preset.color3, 
        color4: preset.color4, 
        intensity: preset.intensity,
        textColor: preset.textColor,
        textColorMuted: preset.textColorMuted,
        glassBg: preset.glassBg,
        glassBorder: preset.glassBorder,
        glassBgHover: preset.glassBgHover,
        glassBorderHover: preset.glassBorderHover,
        sidebarBg: preset.sidebarBg,
        sidebarLinkColor: preset.sidebarLinkColor,
        sidebarActiveBg: preset.sidebarActiveBg,
        sidebarActiveColor: preset.sidebarActiveColor,
        sidebarActiveBorder: preset.sidebarActiveBorder,
        logoFilter: preset.logoFilter,
        specialSidebarBg: preset.specialSidebarBg,
        specialSidebarBorder: preset.specialSidebarBorder,
        specialSidebarText: preset.specialSidebarText
      })
    );
  };

  const getActiveName = () => {
    if (hoveredPreset) {
      return PRESETS.find(p => p.id === hoveredPreset)?.name || '';
    }
    return PRESETS.find(p => p.id === activePreset)?.name || '';
  };

  if (!mounted) {
    return (
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', height: '80px' }}>
        <p style={{ opacity: 0.5, fontSize: '0.8rem', fontStyle: 'italic', margin: 'auto' }}>Cargando fondo...</p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '1.2rem', 
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Row 1: Header + Navigation Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        {/* Title Block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Palette size={13} style={{ color: '#ff7f50' }} />
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>Ambiente</span>
          </div>
          <span style={{ 
            fontWeight: 950, 
            fontSize: '1.2rem', 
            color: 'var(--color-text)', 
            letterSpacing: '-0.03em',
            transition: 'color 0.2s ease-in-out'
          }}>
            {getActiveName()}
          </span>
        </div>

        {/* Navigation Arrows Control Deck */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            style={{
              background: 'var(--glass-bg, rgba(255, 255, 255, 0.03))',
              border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.08))',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--color-text-muted, rgba(255, 255, 255, 0.5))',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--glass-bg-hover, rgba(255, 255, 255, 0.08))';
              e.currentTarget.style.color = 'var(--color-text, #fff)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--glass-bg, rgba(255, 255, 255, 0.03))';
              e.currentTarget.style.color = 'var(--color-text-muted, rgba(255, 255, 255, 0.5))';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="Ver anteriores"
          >
            <ChevronLeft size={14} />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            style={{
              background: 'var(--glass-bg, rgba(255, 255, 255, 0.03))',
              border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.08))',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--color-text-muted, rgba(255, 255, 255, 0.5))',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--glass-bg-hover, rgba(255, 255, 255, 0.08))';
              e.currentTarget.style.color = 'var(--color-text, #fff)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--glass-bg, rgba(255, 255, 255, 0.03))';
              e.currentTarget.style.color = 'var(--color-text-muted, rgba(255, 255, 255, 0.5))';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="Ver siguientes"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Row 2: Full-Width Scrollable Orbs Viewport */}
      <div 
        ref={scrollRef}
        className="no-scrollbar"
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          overflowX: 'scroll',
          scrollBehavior: 'smooth',
          padding: '4px 2px',
          width: '100%',
          maskImage: 'linear-gradient(to right, transparent 0%, black 15px, black calc(100% - 15px), transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15px, black calc(100% - 15px), transparent 100%)'
        }}
      >
        {PRESETS.map((preset) => {
          const isSelected = activePreset === preset.id;
          
          let backgroundGradient = `linear-gradient(135deg, ${preset.color1}, ${preset.color2})`;
          if (preset.id === 'blanco-puro') {
            backgroundGradient = 'linear-gradient(135deg, #ffffff, #dcdde1)';
          } else if (preset.id === 'oscuro-puro') {
            backgroundGradient = 'linear-gradient(135deg, #1e1e24, #000000)';
          }

          return (
            <div
              key={preset.id}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                flexShrink: 0
              }}
            >
              {/* Concentric Selection Halo Ring */}
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: isSelected ? '2px solid var(--color-text, #fff)' : '2px solid transparent',
                opacity: isSelected ? 1 : 0,
                transform: isSelected ? 'scale(1.1)' : 'scale(0.8)',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
              }} />

              {/* Sphere Orb */}
              <button
                onClick={() => applyPreset(preset)}
                onMouseEnter={() => setHoveredPreset(preset.id)}
                onMouseLeave={() => setHoveredPreset(null)}
                style={{
                  background: backgroundGradient,
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  cursor: 'pointer',
                  zIndex: 2,
                  boxShadow: isSelected 
                    ? `0 4px 15px rgba(0,0,0,0.2), inset 0 2px 5px rgba(255,255,255,0.2)` 
                    : `0 2px 6px rgba(0,0,0,0.1)`,
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: hoveredPreset === preset.id ? 'scale(1.15)' : 'scale(1)'
                }}
                title={preset.name}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
