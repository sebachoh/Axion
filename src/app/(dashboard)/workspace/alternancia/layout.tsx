import React from 'react';
import AlternanciaNavigation from '@/components/AlternanciaNavigation';

export default function AlternanciaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={{ marginBottom: '1rem' }}>
        <h1 className="page-title" style={{ fontSize: '2.5rem' }}>Ecosistema de Alternancia</h1>
        <p className="page-subtitle">Ecole & Trabajo / Inteligencia del Mercado</p>
      </header>
      
      <AlternanciaNavigation />

      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
