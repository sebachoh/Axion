'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface WealthMirrorProps {
  balance: number;
}

export default function WealthMirror({ balance }: WealthMirrorProps) {
  const [isHidden, setIsHidden] = useState(false);

  return (
    <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderBottom: '4px solid #2ed573' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontWeight: 800, fontSize: '1.2rem' }}>💰 Wealth Mirror</h3>
        <button 
          onClick={() => setIsHidden(!isHidden)}
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
          onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
          onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          title={isHidden ? 'Mostrar Saldo' : 'Ocultar Saldo'}
        >
          {isHidden ? (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/><circle cx="12" cy="12" r="3"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          )}
        </button>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>Balance Neto</span>
          <h4 style={{ fontSize: '2.5rem', fontWeight: 900, transition: 'all 0.3s' }}>
            {isHidden ? '••••••' : `$${balance.toLocaleString()}`}
          </h4>
      </div>
      <Link href="/finanzas" style={{ fontSize: '0.8rem', opacity: 0.5 }}>Wealth Engine →</Link>
    </div>
  );
}
