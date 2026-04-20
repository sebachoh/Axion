import Link from 'next/link';

export default function BovedaPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 className="page-title" style={{ fontSize: '2.5rem' }}>Bóveda Estratégica</h1>
        <p className="page-subtitle">Gestión de visión, recursos y activos de vida.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <Link href="/boveda/vision" className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', transition: 'transform 0.3s ease', textDecoration: 'none' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>Vision Board</h3>
          <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>Visualiza tus metas a 2026, 5 y 10 años.</p>
        </Link>

        <Link href="/boveda/recursos" className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', transition: 'transform 0.3s ease', textDecoration: 'none' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>Recursos (Vault)</h3>
          <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>Tu repositorio personal de ideas, medios y enlaces.</p>
        </Link>
      </div>
    </div>
  );
}
