'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AlternanciaNavigation() {
  const pathname = usePathname();

  return (
    <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
      <Link href="/workspace/alternancia" style={{
        padding: '8px 16px',
        borderRadius: 'var(--radius-sm)',
        fontWeight: 600,
        fontSize: '0.9rem',
        textDecoration: 'none',
        background: pathname === '/workspace/alternancia' ? '#fff' : 'transparent',
        color: pathname === '/workspace/alternancia' ? '#000' : 'var(--color-text-muted)',
        transition: 'all 0.2s',
      }}>
        🕹️ Tracker Activo
      </Link>
      
      <Link href="/workspace/alternancia/banco" style={{
        padding: '8px 16px',
        borderRadius: 'var(--radius-sm)',
        fontWeight: 600,
        fontSize: '0.9rem',
        textDecoration: 'none',
        background: pathname === '/workspace/alternancia/banco' ? '#fff' : 'transparent',
        color: pathname === '/workspace/alternancia/banco' ? '#000' : 'var(--color-text-muted)',
        transition: 'all 0.2s',
      }}>
        🏦 Banco de Datos
      </Link>
    </div>
  );
}
