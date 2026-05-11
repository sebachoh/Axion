import Link from 'next/link';

export default function FinanzasGraficasPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ paddingBottom: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
        <Link href="/finanzas" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-block', marginBottom: '1rem' }}>
          ← Volver a Finanzas
        </Link>
        <h1 className="page-title" style={{ margin: 0 }}>Analítica Financiera</h1>
        <p className="page-subtitle" style={{ marginTop: '0.5rem' }}>Visualiza tus gastos, ingresos y patrimonio neto.</p>
      </header>

      <div className="glass-panel" style={{ padding: '3rem', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <div style={{ fontSize: '4rem', opacity: 0.5 }}>📊</div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text)' }}>Espacio reservado para gráficas</h3>
        <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', textAlign: 'center', maxWidth: '400px' }}>
          Próximamente: Integración con Recharts o Chart.js para visualizar tus gastos por categoría, evolución del balance en el tiempo y cumplimiento de metas.
        </p>
      </div>
    </div>
  );
}
