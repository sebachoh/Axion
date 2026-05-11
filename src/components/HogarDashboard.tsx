'use client';

import React, { useState } from 'react';
import { 
  addHogarChore, logHogarChoreDone, deleteHogarChore,
  addShoppingItem, toggleShoppingItem, deleteShoppingItem,
  addRentPayment, markRentAsPaid, deleteRentPayment 
} from '@/app/(dashboard)/lifestyle/hogar/actions';
import { 
  CheckSquare, Trash2, Plus, ShoppingCart, DollarSign, Calendar, 
  Sparkles, Check, Home, Clock, AlertTriangle, ShieldCheck, CheckCircle
} from 'lucide-react';

export interface HogarChore {
  id: string;
  name: string;
  lastDoneAt: Date | null;
  frequencyDays: number;
  createdAt: Date;
}

export interface ShoppingItem {
  id: string;
  itemName: string;
  isCompleted: boolean;
  createdAt: Date;
}

export interface RentPayment {
  id: string;
  monthYear: string;
  amount: number;
  isPaid: boolean;
  paidAt: Date | null;
  createdAt: Date;
}

interface Props {
  initialChores: HogarChore[];
  initialShoppingList: ShoppingItem[];
  initialRentPayments: RentPayment[];
}

export default function HogarDashboard({ initialChores, initialShoppingList, initialRentPayments }: Props) {
  const [shoppingFilter, setShoppingFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Calculate days passed helper
  const getDaysPassed = (lastDone: Date | null) => {
    if (!lastDone) return null;
    const now = new Date();
    const doneDate = new Date(lastDone);
    const diffTime = Math.abs(now.getTime() - doneDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Filter shopping list
  const filteredShopping = initialShoppingList.filter(item => {
    if (shoppingFilter === 'pending') return !item.isCompleted;
    if (shoppingFilter === 'completed') return item.isCompleted;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Bento Grid layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Chores Tracking */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Section: Tareas de Mantenimiento (Chores) */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <Home size={20} style={{ color: 'var(--color-text)' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Mantenimiento del Hogar</h3>
            </div>

            {/* Formulario rápido para nueva tarea */}
            <form action={addHogarChore} style={{ display: 'grid', gridTemplateColumns: '1fr 120px auto', gap: '10px', marginBottom: '1.5rem' }}>
              <input 
                type="text" 
                name="name" 
                required 
                placeholder="Ej: Lavar el baño, Lavar ropa, Botar la basura..." 
                style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text)', outline: 'none', fontSize: '0.9rem' }} 
              />
              <input 
                type="number" 
                name="frequency_days" 
                min="1" 
                placeholder="Días frec." 
                style={{ padding: '10px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text)', outline: 'none', fontSize: '0.9rem' }} 
                title="Frecuencia recomendada en días (ej: 7 para una vez por semana)"
              />
              <button type="submit" className="glass-button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 16px', background: 'var(--color-text)', color: 'var(--color-bg)' }}>
                <Plus size={18} />
              </button>
            </form>

            {/* Listado de Tareas del Hogar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {initialChores.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>
                  Aún no registras tareas de mantenimiento en casa.
                </div>
              ) : (
                initialChores.map(chore => {
                  const daysPassed = getDaysPassed(chore.lastDoneAt);
                  const isOverdue = daysPassed !== null && daysPassed > chore.frequencyDays;

                  return (
                    <div 
                      key={chore.id} 
                      style={{ 
                        padding: '12px 16px', 
                        borderRadius: '16px', 
                        background: 'rgba(255,255,255,0.02)', 
                        border: isOverdue ? '1px solid rgba(255, 107, 107, 0.2)' : '1px solid rgba(255,255,255,0.04)',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)' }}>{chore.name}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '8px' }}>
                            Frec: {chore.frequencyDays}d
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                          <Clock size={12} style={{ color: 'var(--color-text-muted)' }} />
                          {chore.lastDoneAt ? (
                            <span style={{ color: isOverdue ? '#ff6b6b' : 'var(--color-text-muted)' }}>
                              Última vez: {new Date(chore.lastDoneAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} ({daysPassed} {daysPassed === 1 ? 'día' : 'días'} atrás)
                            </span>
                          ) : (
                            <span style={{ color: '#ff9f43', fontStyle: 'italic' }}>Nunca realizada aún</span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button 
                          onClick={() => logHogarChoreDone(chore.id)}
                          className="glass-button"
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '0.75rem', 
                            background: isOverdue ? 'rgba(255, 107, 107, 0.2)' : 'rgba(255,255,255,0.05)', 
                            color: isOverdue ? '#ff6b6b' : 'var(--color-text)',
                            borderColor: isOverdue ? '#ff6b6b' : 'var(--glass-border)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Check size={12} /> Hecho hoy
                        </button>
                        <button 
                          onClick={() => deleteHogarChore(chore.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Shopping List & Rent Payments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Section: Lista de Compras (Shopping List) */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShoppingCart size={20} style={{ color: 'var(--color-text)' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Lista de Compras</h3>
              </div>
              
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '3px', borderRadius: '8px', gap: '2px' }}>
                <button 
                  onClick={() => setShoppingFilter('all')} 
                  style={{ background: shoppingFilter === 'all' ? 'var(--color-text)' : 'transparent', color: shoppingFilter === 'all' ? 'var(--color-bg)' : 'var(--color-text)', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer' }}
                >
                  Todos
                </button>
                <button 
                  onClick={() => setShoppingFilter('pending')} 
                  style={{ background: shoppingFilter === 'pending' ? 'var(--color-text)' : 'transparent', color: shoppingFilter === 'pending' ? 'var(--color-bg)' : 'var(--color-text)', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer' }}
                >
                  Por comprar
                </button>
                <button 
                  onClick={() => setShoppingFilter('completed')} 
                  style={{ background: shoppingFilter === 'completed' ? 'var(--color-text)' : 'transparent', color: shoppingFilter === 'completed' ? 'var(--color-bg)' : 'var(--color-text)', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer' }}
                >
                  Comprados
                </button>
              </div>
            </div>

            {/* Formulario agregar artículo */}
            <form action={addShoppingItem} style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
              <input 
                type="text" 
                name="item_name" 
                required 
                placeholder="Ej: Leche, Frutas, Detergente, Papel..." 
                style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text)', outline: 'none', fontSize: '0.9rem' }} 
              />
              <button type="submit" className="glass-button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 16px', background: 'var(--color-text)', color: 'var(--color-bg)' }}>
                <Plus size={18} />
              </button>
            </form>

            {/* Listado de compras */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredShopping.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>
                  No hay artículos en la lista.
                </div>
              ) : (
                filteredShopping.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      <button 
                        onClick={() => toggleShoppingItem(item.id, item.isCompleted)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: item.isCompleted ? '#1dd1a1' : 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}
                      >
                        {item.isCompleted ? (
                          <CheckCircle size={18} fill="#1dd1a1" style={{ color: '#fff' }} />
                        ) : (
                          <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--color-text-muted)' }} />
                        )}
                      </button>
                      <span style={{ 
                        fontSize: '0.9rem', 
                        fontWeight: 500,
                        textDecoration: item.isCompleted ? 'line-through' : 'none',
                        color: item.isCompleted ? 'var(--color-text-muted)' : 'var(--color-text)',
                        wordBreak: 'break-word'
                      }}>
                        {item.itemName}
                      </span>
                    </div>

                    <button 
                      onClick={() => deleteShoppingItem(item.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section: Pagos de Renta (Rent Tracker) */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <DollarSign size={20} style={{ color: 'var(--color-text)' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Pagos de Renta</h3>
            </div>

            {/* Formulario nuevo pago de renta */}
            <form action={addRentPayment} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr auto', gap: '10px', marginBottom: '1.5rem' }}>
              <input 
                type="text" 
                name="month_year" 
                required 
                placeholder="Mes y Año (Mayo 2026)" 
                style={{ padding: '10px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text)', outline: 'none', fontSize: '0.9rem' }} 
              />
              <input 
                type="number" 
                name="amount" 
                required 
                min="0.01" 
                step="0.01"
                placeholder="Monto" 
                style={{ padding: '10px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text)', outline: 'none', fontSize: '0.9rem' }} 
              />
              <button type="submit" className="glass-button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 16px', background: 'var(--color-text)', color: 'var(--color-bg)' }}>
                <Plus size={18} />
              </button>
            </form>

            {/* Listado de Pagos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {initialRentPayments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>
                  No hay registros de renta aún.
                </div>
              ) : (
                initialRentPayments.map(payment => (
                  <div key={payment.id} style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text)' }}>{payment.monthYear}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1dd1a1' }}>
                        {payment.amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                      </span>
                      {payment.isPaid && payment.paidAt && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                          Pagado el: {new Date(payment.paidAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {payment.isPaid ? (
                        <span style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 600, 
                          color: '#1dd1a1', 
                          background: 'rgba(29, 209, 161, 0.12)', 
                          padding: '4px 10px', 
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <ShieldCheck size={12} /> Pagado
                        </span>
                      ) : (
                        <button
                          onClick={() => markRentAsPaid(payment.id)}
                          className="glass-button"
                          style={{
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            background: 'rgba(255,255,255,0.05)',
                            borderColor: 'var(--glass-border)',
                            color: 'var(--color-text)'
                          }}
                        >
                          Pagar 💳
                        </button>
                      )}

                      <button 
                        onClick={() => deleteRentPayment(payment.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
