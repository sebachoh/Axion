import Link from 'next/link';

export default function BovedaPage() {
  const cards = [
    {
      href: '/boveda/vision',
      icon: '✨',
      emoji: '🎯',
      title: 'Vision Board',
      desc: 'Visualiza tus metas a 2026, 5 y 10 años.',
      accent: '#a78bfa',
      bg: 'radial-gradient(ellipse at top left, rgba(167,139,250,0.15) 0%, transparent 60%)',
    },
    {
      href: '/boveda/recursos',
      icon: '📦',
      emoji: '🔐',
      title: 'Recursos (Vault)',
      desc: 'Tu repositorio personal de ideas, medios y enlaces.',
      accent: '#38bdf8',
      bg: 'radial-gradient(ellipse at top left, rgba(56,189,248,0.15) 0%, transparent 60%)',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 className="page-title" style={{ fontSize: '2.5rem' }}>Bóveda Estratégica</h1>
        <p className="page-subtitle">Gestión de visión, recursos y activos de vida.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {cards.map(card => (
          <Link
            key={card.href}
            href={card.href}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div
              className="glass-panel"
              style={{
                padding: '2.5rem',
                background: card.bg,
                border: `1px solid ${card.accent}30`,
                borderTop: `3px solid ${card.accent}`,
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                cursor: 'pointer',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
              onMouseOver={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px ${card.accent}40`;
              }}
              onMouseOut={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '';
              }}
            >
              {/* Large background emoji watermark */}
              <div style={{
                position: 'absolute', bottom: '-1rem', right: '1rem',
                fontSize: '7rem', opacity: 0.07, userSelect: 'none', lineHeight: 1
              }}>{card.emoji}</div>

              <div>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px',
                  background: `${card.accent}22`, border: `1px solid ${card.accent}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.6rem', marginBottom: '1.25rem'
                }}>{card.icon}</div>

                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                  {card.title}
                </h3>
                <p style={{ opacity: 0.6, fontSize: '0.9rem', lineHeight: 1.5 }}>{card.desc}</p>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1.5rem',
                fontSize: '0.8rem', fontWeight: 600, color: card.accent
              }}>
                <span>Explorar</span>
                <span>→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
