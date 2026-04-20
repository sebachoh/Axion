import Link from 'next/link';
import React from 'react';

export default function CareersPage() {
  const careers = [
    { title: 'Cyberseguridad', short: 'CY', colors: ['#ff9a9e', '#fecfef'], desc: 'Defensa de infraestructuras, red teaming y criptografía.' },
    { title: 'Redes', short: 'NW', colors: ['#a1c4fd', '#c2e9fb'], desc: 'Topologías, enrutamiento, switches y arquitectura sólida.' },
    { title: 'DevOps', short: 'DO', colors: ['#d4fc79', '#96e6a1'], desc: 'Integración continua, pipelines, Docker y Kubernetes.' },
    { title: 'Dev.Mobile', short: 'MB', colors: ['#e0c3fc', '#8ec5fc'], desc: 'Desarrollo nativo e híbrido, iOS y Android architects.' },
    { title: 'AI Engineer', short: 'AI', colors: ['#fbc2eb', '#a6c1ee'], desc: 'Modelos predictivos, machine learning y redes neuronales.' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 className="page-title" style={{ fontSize: '2.5rem' }}>Careers</h1>
        <p className="page-subtitle">Academia / Especializaciones del Futuro</p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '1.5rem',
      }}>
        {careers.map(career => (
          <Link key={career.title} href="#" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="glass-panel" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'flex-start', 
              justifyContent: 'center',
              padding: '2rem',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              height: '100%',
              minHeight: '200px'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', background: `linear-gradient(135deg, ${career.colors[0]}, ${career.colors[1]})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>
                {career.short}
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                {career.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                {career.desc}
              </p>
            </div>
          </Link>
        ))}

        {/* Añadir Nueva Carrera Card */}
        <div className="glass-panel" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: 'rgba(255,255,255,0.02)',
          border: '1px dashed rgba(255,255,255,0.1)'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', opacity: 0.5 }}>+</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>
            Nueva Especialización
          </h3>
        </div>
      </div>
    </div>
  );
}
