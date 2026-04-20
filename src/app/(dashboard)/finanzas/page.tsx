import db from '@/infrastructure/db/sqlite';
import FinanceDashboard, { Transaction, FinGoal } from '@/components/FinanceDashboard';

async function getData() {
  const transactions = db.prepare('SELECT id, type, amount, category, description, date FROM finance_transactions ORDER BY date DESC, created_at DESC').all() as Transaction[];
  const goals = db.prepare('SELECT id, name, target_amount, current_amount, color FROM finance_goals ORDER BY created_at ASC').all() as FinGoal[];
  
  return { transactions, goals };
}

export default async function FinanzasPage() {
  const { transactions, goals } = await getData();

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
