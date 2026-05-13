import Link from 'next/link';
import db from '@/infrastructure/db/sqlite';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import FinanceAnalytics from '@/components/FinanceAnalytics';

export const dynamic = 'force-dynamic';

async function getData(userId: string) {
  const transactions = await db.prepare('SELECT id, type, amount, category, description, date FROM finance_transactions WHERE user_id = ? ORDER BY date ASC').all(userId) as any[];
  const budgets = await db.prepare('SELECT id, category, month, amount FROM finance_budgets WHERE user_id = ?').all(userId) as any[];
  return { transactions, budgets };
}

export default async function FinanzasGraficasPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect('/login');
  }

  const { transactions, budgets } = await getData(userId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
        <Link href="/finanzas" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-block', marginBottom: '1rem' }}>
          ← Volver a Wealth Engine
        </Link>
        <h1 className="page-title" style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800 }}>Analítica Financiera 📊</h1>
        <p className="page-subtitle" style={{ marginTop: '0.5rem' }}>Visualización interactiva de gastos, balances y metas de presupuesto.</p>
      </header>

      <FinanceAnalytics transactions={transactions} budgets={budgets} />
    </div>
  );
}
