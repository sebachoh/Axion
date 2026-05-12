import React from 'react';
import NotionEditor from '@/components/NotionEditor';
import ViajesDashboard from '@/components/ViajesDashboard';
import { getPageContent } from '@/core/usecases/pageUsecases';
import { getTravelPins } from './actions';

export default async function Page() {
  // Obtener contenido inicial para la zona libre
  const initialContent = await getPageContent('/lifestyle/viajes');
  
  // Precargar los pines de ambos mapas desde SQLite
  const francePins = await getTravelPins('francia');
  const europePins = await getTravelPins('europa');
  const initialPins = [...francePins, ...europePins];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%' }}>
      {/* Dashboard Interactivo de Mapas y Destinos */}
      <ViajesDashboard initialPins={initialPins} />

      {/* Notion-Like Free Text Area (Bitácora de Viajes General) */}
      <div style={{ marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.8rem' }}>
          Bitácora Libre de Bloques (Notion-like)
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem', opacity: 0.8 }}>
          Espacio libre para planificaciones generales, listas de equipaje o notas extensas de viajes.
        </p>
        <NotionEditor initialContent={initialContent} route="/lifestyle/viajes" />
      </div>
    </div>
  );
}
