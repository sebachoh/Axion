'use client';

import React from 'react';
import { addBancoItem, deleteBancoItem } from '@/app/workspace/alternancia/actions';
import { BankItem } from '@/app/workspace/alternancia/banco/page';

interface Props {
  initialItems: BankItem[];
}

export default function AlternanciaBankUI({ initialItems }: Props) {
  // Category splits
  const companies = initialItems.filter(i => i.category === 'COMPANY');
  const links = initialItems.filter(i => i.category === 'LINK');
  const contacts = initialItems.filter(i => i.category === 'CONTACT');

  const renderCard = (item: BankItem, iconUrlCheck: boolean = false) => (
    <div key={item.id} style={{ 
      padding: '1rem', 
      background: 'rgba(255,255,255,0.03)', 
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 'var(--radius-sm)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '1rem'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
        <h4 style={{ fontWeight: 600, fontSize: '0.95rem', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {item.title}
        </h4>
        {item.meta && (
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.4 }}>
            {iconUrlCheck && item.meta.startsWith('http') ? (
               <a href={item.meta} target="_blank" rel="noreferrer" style={{ color: '#54a0ff', textDecoration: 'underline' }}>{item.meta}</a>
            ) : (
               item.meta
            )}
          </p>
        )}
      </div>
      <form action={deleteBancoItem.bind(null, item.id)}>
         <button type="submit" style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '2px', fontSize: '1rem' }}>
           ✕
         </button>
      </form>
    </div>
  );

  return (
    <div className="bento-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', gridAutoRows: 'minmax(400px, auto)' }}>
      
      {/* Columna 1: Empresas */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '1rem' }}>
           <h3 style={{ fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              🎯 Radar de Empresas
           </h3>
           <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>Blancos franceses y agencias.</p>
        </div>

        <form action={addBancoItem} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <input type="hidden" name="category" value="COMPANY" />
          <input type="text" name="title" placeholder="Ej. Dassault Systèmes" required style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--color-text)', outline: 'none' }} />
          <input type="text" name="meta" placeholder="Sede en París, Data Eng..." style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--color-text)', outline: 'none' }} />
          <button type="submit" className="glass-button" style={{ padding: '6px', marginTop: '4px', fontSize: '0.8rem' }}>Añadir al Radar</button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', overflowY: 'auto' }}>
           {companies.length === 0 ? <span style={{ opacity: 0.5, fontStyle: 'italic', fontSize: '0.85rem' }}>Radar vacío.</span> : companies.map(c => renderCard(c))}
        </div>
      </div>

      {/* Columna 2: Enlaces Útiles */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '1rem' }}>
           <h3 style={{ fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              🔗 Portales & Links
           </h3>
           <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>Headhunters, ofertas directas y recursos.</p>
        </div>

        <form action={addBancoItem} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <input type="hidden" name="category" value="LINK" />
          <input type="text" name="title" placeholder="Nombre (Ej. Carreras L'Oréal)" required style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--color-text)', outline: 'none' }} />
          <input type="url" name="meta" placeholder="https://..." required style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--color-text)', outline: 'none' }} />
          <button type="submit" className="glass-button" style={{ padding: '6px', marginTop: '4px', fontSize: '0.8rem' }}>Guardar Enlace</button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', overflowY: 'auto' }}>
           {links.length === 0 ? <span style={{ opacity: 0.5, fontStyle: 'italic', fontSize: '0.85rem' }}>Sin enlaces.</span> : links.map(l => renderCard(l, true))}
        </div>
      </div>

      {/* Columna 3: Capital Relacional */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '1rem' }}>
           <h3 style={{ fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              🤝 Capital Relacional
           </h3>
           <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>Contactos clave, recruiters y directores.</p>
        </div>

        <form action={addBancoItem} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <input type="hidden" name="category" value="CONTACT" />
          <input type="text" name="title" placeholder="Ej. Jean-Pierre (HR BNP)" required style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--color-text)', outline: 'none' }} />
          <input type="text" name="meta" placeholder="Email, LinkedIn o Breve Descripción" style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--color-text)', outline: 'none' }} />
          <button type="submit" className="glass-button" style={{ padding: '6px', marginTop: '4px', fontSize: '0.8rem' }}>Registrar Contacto</button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', overflowY: 'auto' }}>
           {contacts.length === 0 ? <span style={{ opacity: 0.5, fontStyle: 'italic', fontSize: '0.85rem' }}>No hay contactos mapeados.</span> : contacts.map(c => renderCard(c))}
        </div>
      </div>

    </div>
  );
}
