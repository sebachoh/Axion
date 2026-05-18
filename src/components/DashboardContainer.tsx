'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import Link from 'next/link';
import UserProfile from '@/components/UserProfile';
import DynamicSidebar from '@/components/DynamicSidebar';

interface DashboardContainerProps {
  initialLayout: any;
  user: any;
  children: React.ReactNode;
}

export default function DashboardContainer({ initialLayout, user, children }: DashboardContainerProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load sidebar preference from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('axion-sidebar-collapsed');
    if (saved) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  const toggleSidebar = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('axion-sidebar-collapsed', String(nextState));
  };

  return (
    <div className="dashboard-layout" style={{ position: 'relative', minHeight: '100vh', display: 'flex' }}>
      
      {/* Floating Expand Sidebar Button (Only visible when collapsed) */}
      {mounted && isCollapsed && (
        <button
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            top: '1.5rem',
            left: '1.5rem',
            zIndex: 90,
            background: 'var(--glass-bg, rgba(20, 20, 20, 0.6))',
            backdropFilter: 'blur(30px) saturate(180%)',
            border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.08))',
            borderRadius: '50%',
            width: '42px',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--glass-shadow, 0 8px 32px rgba(0,0,0,0.2))',
            cursor: 'pointer',
            color: 'var(--color-text, #fff)',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            animation: 'fade-in 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.background = 'var(--glass-bg-hover, rgba(30, 30, 30, 0.8))';
            e.currentTarget.style.borderColor = 'var(--glass-border-hover, rgba(255, 255, 255, 0.15))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.background = 'var(--glass-bg, rgba(20, 20, 20, 0.6))';
            e.currentTarget.style.borderColor = 'var(--glass-border, rgba(255, 255, 255, 0.08))';
          }}
          title="Mostrar menú lateral"
        >
          <ChevronRight size={18} />
        </button>
      )}
      {/* Mobile Backdrop Overlay */}
      {mounted && !isCollapsed && (
        <div 
          className="mobile-sidebar-backdrop"
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 950,
            animation: 'fade-in 0.3s ease'
          }}
        />
      )}

      {/* Animated Pinned/Collapsible Sidebar */}
      <aside 
        className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh'
        }}
      >
        {/* Brand Header with Hide Toggle */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: '1.5rem', 
          flexShrink: 0,
          opacity: isCollapsed ? 0 : 1,
          transition: 'opacity 0.2s ease-in-out'
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
            <img 
              src="/LogoBlanco.png" 
              alt="Axion Logo" 
              style={{ width: '28px', height: '28px', objectFit: 'contain', filter: 'var(--logo-filter, none)' }} 
            />
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 700, 
              margin: 0, 
              color: 'var(--color-text, #fff)', 
              letterSpacing: '-0.05em' 
            }}>
              Axion
            </h2>
          </Link>
          
          {/* Close Sidebar Button */}
          <button
            onClick={toggleSidebar}
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
            title="Ocultar menú lateral"
          >
            <ChevronLeft size={15} />
          </button>
        </div>

        {/* Render actual custom links list */}
        <DynamicSidebar initialLayout={initialLayout} />

        {/* User profile section always stick at bottom */}
        <div style={{ 
          marginTop: 'auto', 
          paddingTop: '1rem', 
          borderTop: '1px solid var(--glass-border)', 
          flexShrink: 0,
          opacity: isCollapsed ? 0 : 1,
          transition: 'opacity 0.2s ease-in-out'
        }}>
          <UserProfile user={user} />
        </div>
      </aside>

      {/* Main Content Pane */}
      <main 
        className="main-content"
        style={{
          transition: 'padding-left 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          paddingLeft: mounted && isCollapsed ? '5rem' : 'var(--spacing-lg)',
          '--sidebar-offset-left': mounted && isCollapsed ? '5rem' : 'var(--spacing-lg)'
        } as React.CSSProperties}
      >
        {children}
      </main>
    </div>
  );
}
