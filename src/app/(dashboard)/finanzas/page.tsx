import db from '@/infrastructure/db/sqlite';
import FinanceDashboard, { Transaction, FinGoal } from '@/components/FinanceDashboard';
import { auth } from '@/auth';

async function getData(userId: string) {
  const transactions = db.prepare('SELECT id, type, amount, category, description, date FROM finance_transactions WHERE user_id = ? ORDER BY date DESC, created_at DESC').all(userId) as Transaction[];
  const goals = db.prepare('SELECT id, name, target_amount, current_amount, color FROM finance_goals WHERE user_id = ? ORDER BY created_at ASC').all(userId) as FinGoal[];
  
  return { transactions, goals };
}

export default async function FinanzasPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  if (!userId) return null;

  const { transactions, goals } = await getData(userId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 className="page-title" style={{ fontSize: '3rem', fontWeight: 800 }}>Wealth Engine</h1>
        <p className="page-subtitle">Control total sobre tu capital y metas financieras.</p>
      </header>

      <FinanceDashboard transactions={transactions} goals={goals} />
    </div>
  );
}
