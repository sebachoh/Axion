'use client';

import React from 'react';
import { addBancoItem, deleteBancoItem } from '@/app/(dashboard)/workspace/alternancia/actions';
import { BankItem } from '@/app/(dashboard)/workspace/alternancia/banco/page';

interface Props {
  initialItems: BankItem[];
}

export default function AlternanciaBankUI({ initialItems }: Props) {
  const [isExporting, setIsExporting] = React.useState(false);

  // Category splits
  const companies = initialItems.filter(i => i.category === 'COMPANY');
  const links = initialItems.filter(i => i.category === 'LINK');
  const contacts = initialItems.filter(i => i.category === 'CONTACT');

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      
      // Dynamic import to prevent SSR (Server-Side Rendering) issues
      const { jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Colors and styling constants (Slate blue & emerald green)
      const primaryColor = [30, 41, 59];    // #1e293b
      const accentColor = [29, 209, 161];     // #1dd1a1
      const linkColor = [59, 130, 246];       // #3b82f6 (Clean standard blue link)

      // Add a header band
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 38, 'F');

      // Accent color line underneath
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(0, 38, 210, 2, 'F');

      // Header Text
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('AXION - BANCO DE EMPRESAS', 15, 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Ecosistema de Mapeo de Empresas, Enlaces y Capital Relacional', 15, 26);

      // Metadatos
      const todayStr = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      doc.setFontSize(8.5);
      doc.setTextColor(203, 213, 225); // light grey
      doc.text(`Generado: ${todayStr}`, 145, 18);
      doc.text(`Total registros: ${initialItems.length}`, 145, 25);

      // Sort items: Companies first, then Links, then Contacts
      const sortedItems = [...initialItems].sort((a, b) => {
        const catOrder: Record<string, number> = { 'COMPANY': 1, 'LINK': 2, 'CONTACT': 3 };
        return (catOrder[a.category] || 99) - (catOrder[b.category] || 99);
      });

      const tableRows: any[] = [];

      sortedItems.forEach((item) => {
        let categoryLabel = '';
        let displayMeta = item.meta || '';
        let isLink = false;

        if (item.category === 'COMPANY') {
          categoryLabel = '🏢 Radar Empresa';
        } else if (item.category === 'LINK') {
          categoryLabel = '🔗 Portal de Empleo';
          isLink = displayMeta.startsWith('http');
        } else if (item.category === 'CONTACT') {
          categoryLabel = '🤝 Capital Relacional';
        }

        tableRows.push([
          item.title,
          categoryLabel,
          {
            content: displayMeta,
            isLink: isLink,
            linkUrl: isLink ? displayMeta : null
          }
        ]);
      });

      // Section title
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('Catálogo de Empresas Mapeadas y Portales de Ofertas', 15, 50);

      // Render Table
      autoTable(doc, {
        startY: 55,
        head: [['Empresa / Título', 'Categoría', 'Enlace / Notas de Interés']],
        body: tableRows.map(row => [row[0], row[1], row[2].content]),
        styles: {
          fontSize: 8.5,
          cellPadding: 4,
          textColor: [51, 65, 85],
          lineColor: [226, 232, 240],
          lineWidth: 0.1,
          font: 'helvetica'
        },
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { cellWidth: 50, fontStyle: 'bold' },
          1: { cellWidth: 38 },
          2: { cellWidth: 92 }
        },
        didDrawCell: (data) => {
          if (data.section === 'body' && data.column.index === 2) {
            const rowIndex = data.row.index;
            const originalRow = tableRows[rowIndex];
            if (originalRow && originalRow[2].isLink && originalRow[2].linkUrl) {
              const url = originalRow[2].linkUrl;
              doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: url });
            }
          }
        },
        willDrawCell: (data) => {
          if (data.section === 'body' && data.column.index === 2) {
            const rowIndex = data.row.index;
            const originalRow = tableRows[rowIndex];
            if (originalRow && originalRow[2].isLink && originalRow[2].linkUrl) {
              doc.setTextColor(linkColor[0], linkColor[1], linkColor[2]);
            }
          }
        },
        margin: { left: 15, right: 15 },
        didDrawPage: (data) => {
          const pageCount = (doc as any).internal.getNumberOfPages();
          doc.setFontSize(7.5);
          doc.setTextColor(148, 163, 184); // #94a3b8
          doc.setFont('helvetica', 'normal');
          doc.text(`Página ${data.pageNumber} de ${pageCount}`, 180, 287);
          doc.text('Ecosistema Axion - LifeOS. Hecho con excelencia para Sebastian.', 15, 287);
        }
      });

      doc.save('Banco_de_Empresas_Axion.pdf');
    } catch (error) {
      console.error('Error generando el PDF:', error);
      alert('Hubo un problema al generar el PDF. Por favor, revisa la consola.');
    } finally {
      setIsExporting(false);
    }
  };


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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      
      {/* Cabecera unificada con botón de PDF */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '1.25rem 2rem', 
        borderRadius: '16px', 
        background: 'rgba(255, 255, 255, 0.01)', 
        border: '1px solid rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0, color: '#fff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>💼</span> Banco de Empresas y Portales
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)', margin: '4px 0 0 0' }}>
            Gestiona tu radar de empresas estratégicas, enlaces de portales de empleo y capital relacional.
          </p>
        </div>
        <button 
          onClick={handleExportPDF}
          disabled={isExporting}
          className="glass-button" 
          style={{ 
            padding: '10px 18px', 
            fontWeight: 800, 
            background: 'linear-gradient(135deg, #1dd1a1, #54a0ff)', 
            color: '#000', 
            border: 'none',
            borderRadius: '12px',
            cursor: isExporting ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
            opacity: isExporting ? 0.7 : 1,
            boxShadow: '0 4px 15px rgba(29, 209, 161, 0.2)'
          }}
        >
          <span>{isExporting ? '⏳' : '📄'}</span> 
          <span>{isExporting ? 'Exportando...' : 'Exportar PDF'}</span>
        </button>
      </div>

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

    </div>
  );
}
