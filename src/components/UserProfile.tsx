'use client';

import React from 'react';
import { signOut } from 'next-auth/react';

interface UserProfileProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export default function UserProfile({ user }: UserProfileProps) {
  if (!user) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', color: 'var(--color-text)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {user.image ? (
          <img src={user.image} alt="User" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
        ) : (
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--bg-gradient-1), var(--bg-gradient-3))' }}></div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '100px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name || 'Usuario'}</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</span>
        </div>
      </div>
      
      <button 
        onClick={() => signOut()}
        style={{ 
          background: 'none', border: 'none', padding: '8px', cursor: 'pointer', opacity: 0.5, transition: 'opacity 0.3s' 
        }} 
        onMouseOver={(e) => (e.currentTarget.style.opacity = '1')} 
        onMouseOut={(e) => (e.currentTarget.style.opacity = '0.5')}
        title="Cerrar sesión"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" x2="9" y1="12" y2="12" />
        </svg>
      </button>
    </div>
  );
}
