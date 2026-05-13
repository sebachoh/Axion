'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  date: string;
}

interface Budget {
  id: string;
  category: string;
  month: string;
  amount: number;
}

interface Props {
  transactions: Transaction[];
  budgets: Budget[];
}

const CATEGORIES = [
  '🏠 Vivienda', '🍕 Comida', '🚗 Transporte', '🎬 Ocio', 
  '🏥 Salud', '🎓 Educación', '💼 Trabajo', '📈 Inversión', '🛠 Otros'
];

// Color mapping for categories
const CATEGORY_COLORS: Record<string, string> = {
  '🏠 Vivienda': '#3b82f6', // Blue
  '🍕 Comida': '#ef4444', // Red
  '🚗 Transporte': '#f59e0b', // Yellow
  '🎬 Ocio': '#ec4899', // Pink
  '🏥 Salud': '#10b981', // Green
  '🎓 Educación': '#8b5cf6', // Purple
  '💼 Trabajo': '#6366f1', // Indigo
  '📈 Inversión': '#14b8a6', // Teal
  '🛠 Otros': '#6b7280' // Gray
};

export default function FinanceAnalytics({ transactions, budgets }: Props) {
  // Month Picker (default to current year-month e.g. "2026-05")
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // 1. Filtered data for the selected month
  const monthlyExpenses = useMemo(() => {
    return transactions.filter(t => t.type === 'expense' && t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const monthlyIncomes = useMemo(() => {
    return transactions.filter(t => t.type === 'income' && t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // 2. Budgets for the selected month
  const monthlyBudgets = useMemo(() => {
    return budgets.filter(b => b.month === selectedMonth);
  }, [budgets, selectedMonth]);

  // Summary statistics
  const totalSpent = useMemo(() => monthlyExpenses.reduce((sum, t) => sum + t.amount, 0), [monthlyExpenses]);
  const totalIncome = useMemo(() => monthlyIncomes.reduce((sum, t) => sum + t.amount, 0), [monthlyIncomes]);
  const totalBudget = useMemo(() => monthlyBudgets.reduce((sum, b) => sum + b.amount, 0), [monthlyBudgets]);

  // 3. Category Data preparation
  const categoryData = useMemo(() => {
    return CATEGORIES.map(cat => {
      const spent = monthlyExpenses.filter(t => t.category === cat).reduce((sum, t) => sum + t.amount, 0);
      const budgetObj = monthlyBudgets.find(b => b.category === cat);
      const budget = budgetObj ? budgetObj.amount : 0;
      return {
        category: cat,
        spent,
        budget,
        pct: budget > 0 ? Math.min(100, (spent / budget) * 100) : 0,
        color: CATEGORY_COLORS[cat] || '#8b5cf6'
      };
    }).filter(item => item.spent > 0 || item.budget > 0); // only show active ones
  }, [monthlyExpenses, monthlyBudgets]);

  // 4. Daily Spending Velocity Data (Line Chart)
  // Generates array of 1 to 31 depending on month
  const dailyData = useMemo(() => {
    const daysInMonth = new Date(
      parseInt(selectedMonth.split('-')[0]),
      parseInt(selectedMonth.split('-')[1]),
      0
    ).getDate();

    const dataPoints: { day: number; amount: number; cumulative: number }[] = [];
    let cumulative = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = `${selectedMonth}-${String(d).padStart(2, '0')}`;
      const daySpent = monthlyExpenses
        .filter(t => t.date === dayStr)
        .reduce((sum, t) => sum + t.amount, 0);
      
      cumulative += daySpent;
      dataPoints.push({ day: d, amount: daySpent, cumulative });
    }
    return dataPoints;
  }, [monthlyExpenses, selectedMonth]);

  // Max cumulative spend for scale
  const maxCumulative = useMemo(() => {
    const maxVal = Math.max(...dailyData.map(d => d.cumulative), 100);
    return Math.max(maxVal, totalBudget || 100);
  }, [dailyData, totalBudget]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* ── Top Controls & Quick Summary ── */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Filtros y Métricas de Análisis</h2>
          <p style={{ fontSize: '0.85rem', opacity: 0.6, margin: '4px 0 0 0' }}>Estudia detalladamente la distribución de gastos y el estado de tus presupuestos.</p>
        </div>
        
        {/* Month Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, opacity: 0.8 }}>Periodo de Análisis:</span>
          <input 
            type="month" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              padding: '8px 16px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)',
              color: '#fff', fontSize: '0.9rem', fontWeight: 600, outline: 'none'
            }}
          />
        </div>
      </div>

      {/* ── Quick KPI Indicators ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #ef4444' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.5, textTransform: 'uppercase' }}>Gastado este Mes</span>
          <h3 style={{ fontSize: '2rem', fontWeight: 900, margin: '5px 0' }}>€{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>Egresos registrados para {selectedMonth}</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #a855f7' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.5, textTransform: 'uppercase' }}>Presupuesto Total</span>
          <h3 style={{ fontSize: '2rem', fontWeight: 900, margin: '5px 0' }}>€{totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>{totalBudget > 0 ? `${((totalSpent / totalBudget) * 100).toFixed(0)}% consumido` : 'Sin presupuestos asignados'}</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: totalBudget - totalSpent >= 0 ? '4px solid #10b981' : '4px solid #ef4444' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.5, textTransform: 'uppercase' }}>Margen de Ahorro</span>
          <h3 style={{ fontSize: '2rem', fontWeight: 900, margin: '5px 0', color: totalBudget - totalSpent >= 0 ? '#10b981' : '#ff6b6b' }}>
            €{(totalBudget - totalSpent).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>{totalBudget - totalSpent >= 0 ? 'Por debajo del presupuesto 💚' : '¡Excediste tu presupuesto! ⚠️'}</p>
        </div>
      </div>

      {/* ── Main Graphs Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'stretch' }}>
        
        {/* CHART 1: GASTOS POR CATEGORÍA vs PRESUPUESTO */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Gastos por Categoría vs Límite 📊</h3>
            <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: '4px 0 0 0' }}>Compara lo que has gastado contra el presupuesto planeado en cada categoría.</p>
          </div>

          {categoryData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', opacity: 0.5, fontStyle: 'italic' }}>
              No hay transacciones ni presupuestos para este mes.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {categoryData.map(item => (
                <div 
                  key={item.category} 
                  style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '6px', borderRadius: '8px', background: hoveredBar === item.category ? 'rgba(255,255,255,0.02)' : 'transparent', transition: 'background 0.2s' }}
                  onMouseEnter={() => setHoveredBar(item.category)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                      {item.category}
                    </span>
                    <span style={{ opacity: 0.95 }}>
                      €{item.spent.toLocaleString()} / <span style={{ opacity: 0.6 }}>€{item.budget.toLocaleString()}</span>
                    </span>
                  </div>

                  {/* Progressive Bar Stack */}
                  <div style={{ position: 'relative', height: '14px', background: 'rgba(255,255,255,0.04)', borderRadius: '7px', overflow: 'hidden' }}>
                    {/* Budget background line if any */}
                    {item.budget > 0 && (
                      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '100%', borderRight: '2px dashed rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.01)', pointerEvents: 'none' }} />
                    )}
                    {/* Expense line */}
                    <div style={{ 
                      height: '100%', 
                      width: `${item.budget > 0 ? Math.min(100, (item.spent / item.budget) * 100) : 100}%`, 
                      background: item.spent > item.budget && item.budget > 0 ? 'linear-gradient(90deg, #ff6b6b, #ef4444)' : `linear-gradient(90deg, ${item.color}cc, ${item.color})`,
                      borderRadius: '7px',
                      transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.55 }}>
                    <span>{item.budget > 0 ? `${item.pct.toFixed(0)}% del límite` : 'Sin límite establecido'}</span>
                    {item.budget > 0 && (
                      <span style={{ fontWeight: 700, color: item.spent > item.budget ? '#ff6b6b' : '#10b981' }}>
                        {item.spent > item.budget ? `Excedido por €${(item.spent - item.budget).toLocaleString()}` : `Le quedan €${(item.budget - item.spent).toLocaleString()}`}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CHART 2: VELOCIDAD Y EVOLUCIÓN TEMPORAL DE GASTOS */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Velocidad de Gastos Mensual 📈</h3>
            <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: '4px 0 0 0' }}>Visualiza cómo se acumulan tus gastos diarios contra la línea de presupuesto ideal.</p>
          </div>

          <div style={{ flex: 1, position: 'relative', minHeight: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {totalSpent === 0 ? (
              <div style={{ textAlign: 'center', opacity: 0.5, fontStyle: 'italic' }}>
                Registra gastos diarios para ver la curva de consumo.
              </div>
            ) : (
              <div style={{ width: '100%', height: '240px', position: 'relative' }}>
                <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="500" y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  <line x1="0" y1="180" x2="500" y2="180" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

                  {/* Budget Line Limit (constant ceiling) */}
                  {totalBudget > 0 && (
                    <line 
                      x1="0" 
                      y1={180 - (totalBudget / maxCumulative) * 160} 
                      x2="500" 
                      y2={180 - (totalBudget / maxCumulative) * 160} 
                      stroke="#ff6b6b" 
                      strokeWidth="2" 
                      strokeDasharray="4,4"
                      opacity="0.6"
                    />
                  )}

                  {/* Dynamic Spending Area & Curve */}
                  {(() => {
                    const points = dailyData.map((d, i) => {
                      const x = (i / (dailyData.length - 1)) * 500;
                      const y = 180 - (d.cumulative / maxCumulative) * 160;
                      return { x, y, day: d.day, val: d.cumulative };
                    });

                    const pathStr = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                    const areaStr = `${pathStr} L 500 180 L 0 180 Z`;

                    return (
                      <>
                        {/* Area Shading */}
                        <path d={areaStr} fill="url(#spendGrad)" opacity="0.15" />
                        
                        {/* Area Line */}
                        <path d={pathStr} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                        {/* Interactive Circles / Tooltips on Hover */}
                        {points.map((p, i) => (
                          <g key={i}>
                            <circle 
                              cx={p.x} 
                              cy={p.y} 
                              r={hoveredPoint === i ? 6 : 2} 
                              fill={hoveredPoint === i ? '#fff' : '#3b82f6'} 
                              stroke="#1e293b" 
                              strokeWidth="2"
                              style={{ cursor: 'pointer', transition: 'r 0.15s' }}
                              onMouseEnter={() => setHoveredPoint(i)}
                              onMouseLeave={() => setHoveredPoint(null)}
                            />
                            {hoveredPoint === i && (
                              <g transform={`translate(${p.x > 380 ? p.x - 110 : p.x + 10}, ${p.y < 40 ? p.y + 20 : p.y - 30})`}>
                                <rect width="105" height="40" rx="6" fill="#0f172a" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                                <text x="8" y="16" fill="#fff" fontSize="10" fontWeight="bold">Día {p.day} de {selectedMonth.split('-')[1]}</text>
                                <text x="8" y="30" fill="#3b82f6" fontSize="11" fontWeight="extrabold">€{p.val.toLocaleString()}</text>
                              </g>
                            )}
                          </g>
                        ))}
                      </>
                    );
                  })()}

                  {/* Gradient Definition */}
                  <defs>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* X & Y Axis Labels */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', opacity: 0.5, marginTop: '12px' }}>
                  <span>Día 1</span>
                  <span>Mitad de Mes</span>
                  <span>Fin de Mes</span>
                </div>
              </div>
            )}
          </div>
          
          {totalBudget > 0 && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(255,107,107,0.06)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,107,107,0.15)', fontSize: '0.8rem' }}>
              <span style={{ fontSize: '1rem' }}>💡</span>
              <p style={{ margin: 0, opacity: 0.85 }}>
                Tu límite general acumulado está marcado por la línea roja discontinua de **€{totalBudget.toLocaleString()}**. ¡Mantente por debajo de ella para lograr tu meta de ahorro!
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
