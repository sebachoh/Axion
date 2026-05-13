import db from '@/infrastructure/db/sqlite';
import { auth } from '@/auth';
import HogarDashboard, { HogarChore, ShoppingItem, RentPayment } from '@/components/HogarDashboard';
import { Home } from 'lucide-react';

async function getHogarChores(userId: string): Promise<HogarChore[]> {
  const stmt = db.prepare('SELECT id, name, last_done_at as lastDoneAt, frequency_days as frequencyDays, created_at as createdAt FROM hogar_chores WHERE user_id = ? ORDER BY last_done_at ASC, created_at DESC');
  const rows = await stmt.all(userId) as any[];
  return rows.map(r => ({
    ...r,
    lastDoneAt: r.lastDoneAt ? new Date(r.lastDoneAt) : null,
    createdAt: new Date(r.createdAt)
  }));
}

async function getShoppingList(userId: string): Promise<ShoppingItem[]> {
  const stmt = db.prepare('SELECT id, item_name as itemName, is_completed as isCompleted, created_at as createdAt FROM hogar_shopping_list WHERE user_id = ? ORDER BY is_completed ASC, created_at DESC');
  const rows = await stmt.all(userId) as any[];
  return rows.map(r => ({
    ...r,
    isCompleted: !!r.isCompleted,
    createdAt: new Date(r.createdAt)
  }));
}

async function getRentPayments(userId: string): Promise<RentPayment[]> {
  const stmt = db.prepare('SELECT id, month_year as monthYear, amount, is_paid as isPaid, paid_at as paidAt, created_at as createdAt FROM hogar_rent_payments WHERE user_id = ? ORDER BY created_at DESC');
  const rows = await stmt.all(userId) as any[];
  return rows.map(r => ({
    ...r,
    isPaid: !!r.isPaid,
    paidAt: r.paidAt ? new Date(r.paidAt) : null,
    createdAt: new Date(r.createdAt)
  }));
}

export default async function HogarPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  if (!userId) return null;

  const [chores, shopping, rent] = await Promise.all([
    getHogarChores(userId),
    getShoppingList(userId),
    getRentPayments(userId)
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: 'var(--color-text)', color: 'var(--color-bg)', padding: '10px', borderRadius: '16px' }}>
          <Home size={28} />
        </div>
        <div>
          <h1 className="page-title" style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, letterSpacing: '-0.05em' }}>Hogar</h1>
          <p className="page-subtitle" style={{ color: 'var(--color-text-muted)', fontSize: '1rem', marginTop: '4px' }}>Seguimiento de tareas domésticas, lista de compras y control de pagos de renta</p>
        </div>
      </header>

      {/* Interactive Hogar Dashboard Widget */}
      <HogarDashboard initialChores={chores} initialShoppingList={shopping} initialRentPayments={rent} />
    </div>
  );
}
