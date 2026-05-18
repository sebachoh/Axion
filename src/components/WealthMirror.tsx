'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Wallet, Eye, EyeOff } from 'lucide-react';

interface WealthMirrorProps {
  balance: number;
}

export default function WealthMirror({ balance }: WealthMirrorProps) {
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('axion-wealth-hidden');
    setIsHidden(saved === 'true');

    const handleSync = () => {
      const updated = localStorage.getItem('axion-wealth-hidden');
      setIsHidden(updated === 'true');
    };

    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  const toggleHide = () => {
    const next = !isHidden;
    setIsHidden(next);
    localStorage.setItem('axion-wealth-hidden', next ? 'true' : 'false');
    window.dispatchEvent(new Event('storage'));
  };
  //hola
  return (
    <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderBottom: '4px solid #2ed573' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontWeight: 800, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wallet size={20} strokeWidth={2.5} /> Wealth Mirror
        </h3>
        <button
          onClick={toggleHide}
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
          onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
          onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          title={isHidden ? 'Mostrar Saldo' : 'Ocultar Saldo'}
        >
          {isHidden ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>Balance Neto</span>
        <h4 style={{ fontSize: '1.8rem', fontWeight: 900, transition: 'all 0.3s', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {isHidden ? '••••••' : `${balance.toLocaleString()} €`}
        </h4>
      </div>
      <Link href="/finanzas" style={{ fontSize: '0.8rem', opacity: 0.5 }}>Wealth Engine →</Link>
    </div>
  );
}
