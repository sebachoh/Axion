'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Wallet, Eye, EyeOff } from 'lucide-react';

interface Props {
  balance: number;
}

export default function WealthBalanceCard({ balance }: Props) {
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

  const toggleHide = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when toggling the eye
    e.stopPropagation();
    const next = !isHidden;
    setIsHidden(next);
    localStorage.setItem('axion-wealth-hidden', next ? 'true' : 'false');
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <Link href="/finanzas" style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', overflow: 'hidden', height: '100%', cursor: 'pointer', transition: 'transform 0.2s', ...{ ':hover': { transform: 'scale(1.02)' } } as any }}>
        <div style={{ position: 'absolute', top: '10px', right: '10px', transform: 'rotate(15deg)', pointerEvents: 'none' }}>
          <Wallet size={75} strokeWidth={2.5} style={{ color: '#2ed573', opacity: 0.05 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            <Wallet size={22} strokeWidth={2.5} style={{ color: '#2ed573' }} />
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 800, fontSize: '1.6rem', color: '#2ed573' }}>
              {isHidden ? '••••••' : `${balance.toLocaleString()} €`}
            </span>
            <button
              onClick={toggleHide}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: 0,
                transition: 'color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
              onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
              title={isHidden ? 'Mostrar Saldo' : 'Ocultar Saldo'}
            >
              {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <p style={{ fontWeight: 800, fontSize: '0.85rem', margin: 0 }}>Wealth Balance</p>
        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: 0 }}>Wealth Mirror</p>
      </div>
    </Link>
  );
}
