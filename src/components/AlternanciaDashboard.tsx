'use client';

import React from 'react';
import { addAlternancia, updateAlternanciaStatus, deleteAlternancia } from '@/app/workspace/alternancia/actions';

export interface AlternanciaApp {
  id: string;
  appNumber: number;
  roleName: string;
  company: string;
  url: string | null;
  status: string;
  lastUpdate: Date;
  createdAt: Date;
}

interface Props {
  initialApps: AlternanciaApp[];
}

export default function AlternanciaDashboard({ initialApps }: Props) {
  // We receive Date objects correctly mapped from the Server Component
  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'aceptado': return '#1dd1a1'; // Green
      case 'rechazado': return '#ff6b6b'; // Red
      case 'en espera': return '#c8d6e5'; // Gray
      case 'entrevista': return '#54a0ff'; // Blue
      case 'pruebas': return '#9b59b6'; // Purple
      default: return 'transparent';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Última Actualización Box */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '350px', borderLeft: '4px solid var(--color-text)' }}>
         <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Última Actualización</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 500 }}>
              {initialApps.length > 0 
                 ? initialApps.reduce((latest, app) => app.lastUpdate > latest ? app.lastUpdate : latest, initialApps[0].lastUpdate).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
                 : 'Sin datos'}
            </span>
         </div>
         <div style={{ fontSize: '2rem' }}>⏱️</div>
      </div>

      {/* Formulario de Alta Rápida */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Nueva Postulación</h3>
        <form action={addAlternancia} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Oferta (Rol)*</label>
            <input type="text" name="role_name" required placeholder="Data Engineer Trainee" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text)', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Empresa*</label>
            <input type="text" name="company" required placeholder="L'Oréal, BNP Paribas..." style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text)', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>URL (Opcional)</label>
            <input type="url" name="url" placeholder="https://..." style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text)', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
             <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Estado Inicial</label>
             <select name="status" defaultValue="en espera" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text)', outline: 'none' }}>
               <option value="en espera" style={{color:'black'}}>⚪ En espera</option>
               <option value="pruebas" style={{color:'black'}}>🟣 Pruebas</option>
               <option value="entrevista" style={{color:'black'}}>🔵 Entrevista</option>
               <option value="aceptado" style={{color:'black'}}>🟢 Aceptado</option>
               <option value="rechazado" style={{color:'black'}}>🔴 Rechazado</option>
             </select>
          </div>

          <button type="submit" className="glass-button" style={{ padding: '10px', background: 'var(--color-text)', color: 'var(--color-bg)' }}>
            + Registrar
          </button>
        </form>
      </div>

      {/* Tabla Dinámica */}
      <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--color-text-muted)' }}>
              <th style={{ padding: '1rem 0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>#</th>
              <th style={{ padding: '1rem 0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Oferta (Rol)</th>
              <th style={{ padding: '1rem 0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Empresa</th>
              <th style={{ padding: '1rem 0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Enlace URL</th>
              <th style={{ padding: '1rem 0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Estado</th>
              <th style={{ padding: '1rem 0.5rem', fontWeight: 600, fontSize: '0.9rem', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {initialApps.length === 0 ? (
               <tr>
                 <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                    Aún no hay postulaciones... El mercado te espera.
                 </td>
               </tr>
            ) : (
               initialApps.map(app => (
                 <tr key={app.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>{app.appNumber}</td>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>{app.roleName}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>{app.company}</td>
                    <td style={{ padding: '1rem 0.5rem', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {app.url ? (
                         <a href={app.url} target="_blank" rel="noreferrer" style={{ color: '#54a0ff', textDecoration: 'underline' }}>Enlace</a>
                      ) : (
                         <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Sin URL</span>
                      )}
                    </td>
                    
                    <td style={{ padding: '1rem 0.5rem' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                         <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: getStatusColor(app.status), boxShadow: `0 0 8px ${getStatusColor(app.status)}` }}></div>
                         <form>
                           <select 
                             name="status" 
                             defaultValue={app.status.toLowerCase()} 
                             onChange={(e) => updateAlternanciaStatus(app.id, e.target.value)}
                             style={{ background: 'transparent', border: 'none', color: 'var(--color-text)', outline: 'none', cursor: 'pointer', fontWeight: 500, WebkitAppearance: 'none', appearance: 'none' }}
                           >
                              <option value="en espera" style={{color:'black'}}>En espera</option>
                              <option value="pruebas" style={{color:'black'}}>Pruebas</option>
                              <option value="entrevista" style={{color:'black'}}>Entrevista</option>
                              <option value="aceptado" style={{color:'black'}}>Aceptado</option>
                              <option value="rechazado" style={{color:'black'}}>Rechazado</option>
                           </select>
                         </form>
                       </div>
                    </td>

                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                       <form action={deleteAlternancia.bind(null, app.id)}>
                          <button type="submit" style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '4px', fontSize: '1rem' }} title="Eliminar registro">
                            🗑️
                          </button>
                       </form>
                    </td>

                 </tr>
               ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
