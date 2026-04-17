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

  const renderCard = (item: BankItem, iconUrlCheck: boolean = false) => {
    const isLink = item.category === 'LINK' || (iconUrlCheck && item.meta.startsWith('http'));
    const isContact = item.category === 'CONTACT';
    const isCompany = item.category === 'COMPANY';

    return (
      <div key={item.id} className="glass-panel" style={{ 
        padding: '1.25rem', 
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        border: '1px solid rgba(255,255,255,0.04)',
        background: 'rgba(255,255,255,0.02)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle Background Accent */}
        <div style={{ 
          position: 'absolute', top: 0, right: 0, width: '40px', height: '40px', 
          background: isContact ? 'rgba(162, 155, 254, 0.05)' : isCompany ? 'rgba(29, 209, 161, 0.05)' : 'rgba(84, 160, 255, 0.05)',
          borderRadius: '0 0 0 40px', zIndex: 0 
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>{isContact ? '👤' : isCompany ? '🏙️' : '🔗'}</span>
            <h4 style={{ fontWeight: 800, fontSize: '1rem', margin: 0, color: '#fff', letterSpacing: '-0.02em' }}>
              {item.title}
            </h4>
          </div>
          <form action={deleteBancoItem.bind(null, item.id)}>
             <button type="submit" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', padding: '4px', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#ff6b6b'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}>
               ✕
             </button>
          </form>
        </div>
        
        {item.meta && (
          <div style={{ 
            fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6,
            padding: '0.25rem 0', position: 'relative', zIndex: 1
          }}>
            {isLink ? (
               <a href={item.meta} target="_blank" rel="noreferrer" style={{ color: '#54a0ff', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                 <span>Visit Link</span>
                 <span style={{ fontSize: '0.7rem' }}>↗</span>
               </a>
            ) : (
               <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{item.meta}</div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
      
      {/* Columna 1: Radar de Empresas */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', minHeight: '600px', borderTop: '4px solid #1dd1a1' }}>
        <header style={{ marginBottom: '1.5rem' }}>
           <h3 style={{ fontSize: '1.25rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '-0.03em' }}>
              <span style={{ background: '#1dd1a122', padding: '6px', borderRadius: '10px' }}>🏙️</span> Radar de Empresas
           </h3>
           <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '6px' }}>Mapeo estratégico de compañías objetivo.</p>
        </header>

        <form action={addBancoItem} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
          <input type="hidden" name="category" value="COMPANY" />
          <input type="text" name="title" placeholder="Nombre de la empresa" required style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: '#fff', outline: 'none', fontSize: '0.9rem' }} />
          <textarea name="meta" placeholder="Notas estratégicas, sede, techs..." style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: '#fff', outline: 'none', minHeight: '80px', resize: 'none', fontSize: '0.85rem' }} />
          <button type="submit" className="glass-button" style={{ padding: '12px', fontWeight: 800, background: '#1dd1a1', color: '#000', border: 'none' }}>Añadir al Radar</button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
           {companies.length === 0 ? <div style={{ opacity: 0.3, textAlign: 'center', marginTop: '2rem', fontSize: '0.8rem' }}>Sin empresas mapeadas.</div> : companies.map(c => renderCard(c))}
        </div>
      </div>

      {/* Columna 2: Portales & Enlaces */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', minHeight: '600px', borderTop: '4px solid #54a0ff' }}>
        <header style={{ marginBottom: '1.5rem' }}>
           <h3 style={{ fontSize: '1.25rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '-0.03em' }}>
              <span style={{ background: '#54a0ff22', padding: '6px', borderRadius: '10px' }}>🔗</span> Portales & Links
           </h3>
           <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '6px' }}>Acceso rápido a ofertas y portales clave.</p>
        </header>

        <form action={addBancoItem} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
          <input type="hidden" name="category" value="LINK" />
          <input type="text" name="title" placeholder="Título del enlace" required style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: '#fff', outline: 'none', fontSize: '0.9rem' }} />
          <input type="url" name="meta" placeholder="https://..." required style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: '#fff', outline: 'none', fontSize: '0.9rem' }} />
          <button type="submit" className="glass-button" style={{ padding: '12px', fontWeight: 800, background: '#54a0ff', color: '#fff', border: 'none' }}>Guardar Link</button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
           {links.length === 0 ? <div style={{ opacity: 0.3, textAlign: 'center', marginTop: '2rem', fontSize: '0.8rem' }}>Sin enlaces registrados.</div> : links.map(l => renderCard(l, true))}
        </div>
      </div>

      {/* Columna 3: Capital Relacional */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', minHeight: '600px', borderTop: '4px solid #a29bfe' }}>
        <header style={{ marginBottom: '1.5rem' }}>
           <h3 style={{ fontSize: '1.25rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '-0.03em' }}>
              <span style={{ background: '#a29bfe22', padding: '6px', borderRadius: '10px' }}>🤝</span> Capital Relacional
           </h3>
           <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '6px' }}>Gestión de contactos y recruiters clave.</p>
        </header>

        <form action={addBancoItem} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
          <input type="hidden" name="category" value="CONTACT" />
          <input type="text" name="title" placeholder="Nombre completo del contacto" required style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: '#fff', outline: 'none', fontSize: '0.9rem' }} />
          <textarea name="meta" placeholder="Role, LinkedIn, última charla..." style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: '#fff', outline: 'none', minHeight: '80px', resize: 'none', fontSize: '0.85rem' }} />
          <button type="submit" className="glass-button" style={{ padding: '12px', fontWeight: 800, background: '#a29bfe', color: '#fff', border: 'none' }}>Registrar Capital</button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
           {contacts.length === 0 ? <div style={{ opacity: 0.3, textAlign: 'center', marginTop: '2rem', fontSize: '0.8rem' }}>No hay contactos mapeados.</div> : contacts.map(c => renderCard(c))}
        </div>
      </div>

    </div>
  );
}
