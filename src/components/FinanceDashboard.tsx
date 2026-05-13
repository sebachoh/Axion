'use client';

import React, { useState, useEffect } from 'react';
import { 
  addTransaction, 
  deleteTransaction, 
  addGoal, 
  updateGoalAmount, 
  deleteGoal,
  saveBudget
} from '@/app/(dashboard)/finanzas/actions';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  date: string;
}

export interface FinGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  color: string;
}

export interface Budget {
  id: string;
  category: string;
  month: string;
  amount: number;
}

interface Props {
  transactions: Transaction[];
  goals: FinGoal[];
  budgets?: Budget[];
}

const CATEGORIES = [
  '🏠 Vivienda', '🍕 Comida', '🚗 Transporte', '🎬 Ocio', 
  '🏥 Salud', '🎓 Educación', '💼 Trabajo', '📈 Inversión', '🛠 Otros'
];

export default function FinanceDashboard({ transactions, goals, budgets = [] }: Props) {
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [activeTab, setActiveTab] = useState<'flow' | 'budget'>('flow');
  
  // Budget Month Picker (default to current year-month e.g. "2026-05")
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Local input edits for budgets
  const [localBudgets, setLocalBudgets] = useState<Record<string, string>>({});

  // Reset local budget changes when month switches
  useEffect(() => {
    setLocalBudgets({});
  }, [selectedMonth]);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Save budget handler
  const handleSaveCatBudget = async (category: string, value: string) => {
    const amount = parseFloat(value);
    if (isNaN(amount) || amount < 0) return;
    await saveBudget(category, amount, selectedMonth);
    // Visual indicator of saved
    alert(`Presupuesto de "${category}" guardado para ${selectedMonth}: €${amount}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <a href="/finanzas/graficas" className="glass-button" style={{ textDecoration: 'none', padding: '10px 20px', fontWeight: 600, fontSize: '0.9rem' }}>
          📊 Ver Gráficas y Analítica
        </a>
      </div>
      
      {/* ── Top Stats Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '4px solid #1dd1a1' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.6, textTransform: 'uppercase' }}>Balance Total</span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>€{balance.toLocaleString()}</h2>
          <p style={{ fontSize: '0.8rem', color: '#1dd1a1' }}>+{(totalIncome > 0 ? (balance/totalIncome*100).toFixed(0) : 0)}% Tasa de ahorro</p>
        </div>
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '4px solid #feca57' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.6, textTransform: 'uppercase' }}>Ingresos Mensuales</span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>€{totalIncome.toLocaleString()}</h2>
          <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>Flujo de entrada total</p>
        </div>
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '4px solid #ff6b6b' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.6, textTransform: 'uppercase' }}>Gastos Totales</span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>€{totalExpense.toLocaleString()}</h2>
          <p style={{ fontSize: '0.8rem', color: '#ff6b6b' }}>-€{totalExpense.toLocaleString()} consumidos</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
        
        {/* ── Left Column: Flow & Budget Tabs ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Tabs Selector */}
          <div style={{ 
            display: 'flex', 
            background: 'rgba(255,255,255,0.03)', 
            padding: '5px', 
            borderRadius: '12px', 
            border: '1px solid var(--glass-border)' 
          }}>
            <button
              onClick={() => setActiveTab('flow')}
              style={{
                flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                background: activeTab === 'flow' ? 'var(--color-text)' : 'transparent',
                color: activeTab === 'flow' ? 'var(--color-bg)' : 'rgba(255,255,255,0.6)',
                fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              💸 Movimientos y Registro
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              style={{
                flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                background: activeTab === 'budget' ? 'var(--color-text)' : 'transparent',
                color: activeTab === 'budget' ? 'var(--color-bg)' : 'rgba(255,255,255,0.6)',
                fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              📅 Presupuesto Mensual
            </button>
          </div>

          {activeTab === 'flow' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Form: Nueva Transacción */}
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Registrar Movimiento 💸</h3>
                <form action={addTransaction} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 120px', gap: '1rem', alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>Tipo</label>
                    <select name="type" style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--glass-border)' }}>
                      <option value="expense" style={{ color: '#000' }}>Gasto</option>
                      <option value="income" style={{ color: '#000' }}>Ingreso</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>Categoría</label>
                    <select name="category" style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--glass-border)' }}>
                      {CATEGORIES.map(c => <option key={c} value={c} style={{ color: '#000' }}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>Monto (€)</label>
                    <input name="amount" type="number" step="0.01" required style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--glass-border)' }} />
                  </div>
                  <button type="submit" className="glass-button" style={{ padding: '10px', fontWeight: 800, background: 'var(--color-text)', color: 'var(--color-bg)' }}>+</button>
                  
                  <div style={{ gridColumn: '1 / 4', display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '0.5rem' }}>
                    <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>Descripción (opcional)</label>
                    <input name="description" placeholder="Ej: Pizza viernes, Venta freelance..." style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--glass-border)' }} />
                  </div>
                </form>
              </div>

              {/* Feed de Transacciones */}
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Historial Reciente</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {transactions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ fontSize: '3rem', opacity: 0.3 }}>📥</div>
                      <p style={{ opacity: 0.5, fontStyle: 'italic', fontSize: '1rem' }}>Wealth Engine está listo.</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', maxWidth: '300px' }}>
                        Registra tu primer movimiento arriba para empezar a trackear tu balance neto y metas.
                      </p>
                    </div>
                  ) : transactions.map(t => (
                    <div key={t.id} style={{ 
                      display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', 
                      background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      <div style={{ 
                        width: '40px', height: '40px', borderRadius: '10px', 
                        background: t.type === 'income' ? 'rgba(29,209,161,0.1)' : 'rgba(255,107,107,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
                      }}>
                        {t.type === 'income' ? '💰' : '💸'}
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t.category}</span>
                        <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>{t.description || 'Sin descripción'} · {t.date}</span>
                      </div>
                      <span style={{ 
                        fontWeight: 800, fontSize: '1.1rem',
                        color: t.type === 'income' ? '#1dd1a1' : '#ff6b6b'
                      }}>
                        {t.type === 'income' ? '+' : '-'} €{t.amount.toLocaleString()}
                      </span>
                      <button 
                        onClick={() => deleteTransaction(t.id)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', opacity: 0.3, padding: '4px' }}
                      >✕</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>Planificación de Presupuesto 📅</h3>
                  <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: '4px 0 0 0' }}>Establece límites mensuales por categoría y monitorea consumos en tiempo real.</p>
                </div>
                {/* Month Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.6 }}>Mes:</span>
                  <input 
                    type="month" 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    style={{
                      padding: '6px 12px', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)',
                      color: '#fff', fontSize: '0.85rem', outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
                {CATEGORIES.map(cat => {
                  const budgetVal = budgets.find(b => b.category === cat && b.month === selectedMonth)?.amount || 0;
                  
                  // Sum up transactions of type 'expense' for this category in selected month
                  const actualExpense = transactions
                    .filter(t => t.type === 'expense' && t.category === cat && t.date.startsWith(selectedMonth))
                    .reduce((sum, t) => sum + t.amount, 0);

                  const localVal = localBudgets[cat] !== undefined ? localBudgets[cat] : (budgetVal > 0 ? String(budgetVal) : '');
                  
                  const pct = budgetVal > 0 ? Math.min(100, Math.round((actualExpense / budgetVal) * 100)) : 0;
                  const leftAmount = budgetVal - actualExpense;

                  // Dynamic colors and status messages
                  let statusColor = '#a855f7'; // purple by default
                  let statusText = 'Sin presupuesto establecido';
                  if (budgetVal > 0) {
                    if (actualExpense > budgetVal) {
                      statusColor = '#ff6b6b'; // bright red
                      statusText = `¡Excedido por €${Math.abs(leftAmount).toLocaleString()}! 🚨`;
                    } else if (pct > 85) {
                      statusColor = '#feca57'; // orange warning
                      statusText = `¡Límite cercano! Te quedan €${leftAmount.toLocaleString()}`;
                    } else {
                      statusColor = '#1dd1a1'; // safe green
                      statusText = `Te quedan €${leftAmount.toLocaleString()}`;
                    }
                  }

                  return (
                    <div key={cat} style={{ 
                      padding: '1.25rem', borderRadius: '12px', background: 'rgba(255,255,255,0.01)',
                      border: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: '10px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '1rem' }}>{cat}</span>
                        
                        {/* Inline form to establish/update budget */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>Presupuesto: €</span>
                          <input 
                            type="number"
                            placeholder="0"
                            value={localVal}
                            onChange={(e) => setLocalBudgets(prev => ({ ...prev, [cat]: e.target.value }))}
                            style={{
                              width: '80px', padding: '4px 8px', borderRadius: '6px',
                              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                              color: '#fff', fontSize: '0.8rem', outline: 'none', textAlign: 'right'
                            }}
                          />
                          <button
                            onClick={() => handleSaveCatBudget(cat, localVal)}
                            style={{
                              background: 'var(--color-text)', color: 'var(--color-bg)',
                              border: 'none', borderRadius: '6px', padding: '4px 10px',
                              fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
                              opacity: localVal !== (budgetVal > 0 ? String(budgetVal) : '') ? 1 : 0.6
                            }}
                          >
                            💾 Guardar
                          </button>
                        </div>
                      </div>

                      {/* Info & Progress bar */}
                      {budgetVal > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                            <span style={{ opacity: 0.6 }}>Gastado: €{actualExpense.toLocaleString()} de €{budgetVal.toLocaleString()}</span>
                            <span style={{ fontWeight: 700, color: statusColor }}>{pct}%</span>
                          </div>
                          
                          {/* Progress bar */}
                          <div style={{ height: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ 
                              height: '100%', width: `${pct}%`, background: statusColor, 
                              borderRadius: '4px', transition: 'width 0.4s ease' 
                            }} />
                          </div>
                        </div>
                      )}

                      {/* Reference Text ("Te queda x...") */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', opacity: 0.85 }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor, display: 'inline-block' }} />
                        <span style={{ fontWeight: 600, color: budgetVal > 0 ? '#fff' : 'var(--color-text-muted)' }}>{statusText}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* ── Right Column: Goals ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Metas de Ahorro 🏔️</h3>
              <button onClick={() => setShowAddGoal(!showAddGoal)} style={{ padding: '4px 10px', fontSize: '0.75rem' }} className="glass-button">Nuevo</button>
            </div>

            {showAddGoal && (
              <form action={addGoal} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <input name="name" placeholder="Nombre meta" required style={{ padding: '8px', fontSize: '0.8rem', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} />
                <input name="target_amount" type="number" placeholder="Monto objetivo" required style={{ padding: '8px', fontSize: '0.8rem', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} />
                <button type="submit" className="glass-button" style={{ padding: '8px', fontWeight: 700 }}>Crear Meta</button>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {goals.map(goal => {
                const pct = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
                return (
                  <div key={goal.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: goal.color }} />
                        {goal.name}
                      </span>
                      <button onClick={() => deleteGoal(goal.id)} style={{ background: 'transparent', border: 'none', color: '#fff', opacity: 0.2, cursor: 'pointer' }}>✕</button>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: goal.color, transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.6 }}>
                      <span>€{goal.current_amount.toLocaleString()}</span>
                      <span>{pct}% - Goal: €{goal.target_amount.toLocaleString()}</span>
                    </div>
                    {/* Botones de aporte rápido */}
                    <div style={{ display: 'flex', gap: '5px', marginTop: '2px' }}>
                      {[10, 50, 100].map(v => (
                        <button 
                          key={v}
                          onClick={() => updateGoalAmount(goal.id, v)}
                          style={{ 
                            flex: 1, padding: '4px', fontSize: '0.7rem', 
                            background: 'rgba(255,255,255,0.04)', borderRadius: '4px', 
                            color: '#fff', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer'
                          }}
                        >+€{v}</button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
