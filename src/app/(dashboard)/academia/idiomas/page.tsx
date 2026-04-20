'use client';

import Link from 'next/link';

export default function IdiomasPage() {
  const languages = [
    { name: 'Francés', flag: '🇫🇷', desc: 'Ruta hacia la fluidez y vocabulario.', path: '/academia/idiomas/frances' },
    { name: 'Portugués', flag: '🇵🇹', desc: 'Práctica, modismos y gramática.', path: '/academia/idiomas/portugues' },
    { name: 'Darija', flag: '🇲🇦', desc: 'Árabe marroquí conversacional.', path: '/academia/idiomas/darija' },
    { name: 'Alemán', flag: '🇩🇪', desc: 'Reglas absolutas y casos.', path: '/academia/idiomas/aleman' },
    { name: 'Italiano', flag: '🇮🇹', desc: 'Cultura, verbos y pasión.', path: '/academia/idiomas/italiano' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 className="page-title" style={{ fontSize: '2.5rem' }}>Centro de Idiomas</h1>
        <p className="page-subtitle">Academia / Políglota</p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
        gap: '1.5rem',
        marginTop: '1rem' 
      }}>
        {languages.map((lang) => (
          <Link href={lang.path} key={lang.name} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="glass-panel" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              height: '100%'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <div style={{ 
                fontSize: '4rem', 
                marginBottom: '1rem', 
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' 
              }}>
                {lang.flag}
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                {lang.name}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                {lang.desc}
              </p>
            </div>
          </Link>
        ))}

        {/* Añadir Nuevo Idioma Card */}
        <div className="glass-panel" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: 'rgba(255,255,255,0.02)',
          border: '1px dashed rgba(255,255,255,0.1)'
        }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }}>+</div>
          <h3 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>
            Nuevo Idioma
          </h3>
        </div>
      </div>
    </div>
  );
}
