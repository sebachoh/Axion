'use server';

import { createDAVClient } from 'tsdav';

// Se utilizarán variables de entorno para las credenciales
const APPLE_ID = process.env.APPLE_ID;
const APPLE_APP_SPECIFIC_PASSWORD = process.env.APPLE_APP_SPECIFIC_PASSWORD;

/**
 * Sincroniza el calendario de Apple con la base de datos local.
 */
export async function syncAppleCalendar() {
  if (!APPLE_ID || !APPLE_APP_SPECIFIC_PASSWORD) {
    return { 
      success: false, 
      error: 'Credenciales de Apple no configuradas. Por favor, añade APPLE_ID y APPLE_APP_SPECIFIC_PASSWORD a tu archivo .env' 
    };
  }

  try {
    const client = await createDAVClient({
      serverUrl: 'https://caldav.icloud.com',
      credentials: {
        username: APPLE_ID,
        password: APPLE_APP_SPECIFIC_PASSWORD,
      },
      authMethod: 'Basic',
      defaultAccountType: 'caldav',
    });

    const calendars = await client.fetchCalendars();
    
    // TODO: Mapear los calendarios y eventos a nuestra base de datos
    // Por ahora solo devolvemos el conteo para verificar la conexión
    
    return { 
      success: true, 
      message: `Conectado con éxito. Se encontraron ${calendars.length} calendarios.`,
      calendars: calendars.map(c => ({ displayName: c.displayName, url: c.url }))
    };
  } catch (error: any) {
    console.error('Error syncing Apple Calendar:', error);
    return { success: false, error: error.message || 'Error desconocido al conectar con iCloud' };
  }
}

/**
 * Sincroniza los recordatorios de Apple con la base de datos local.
 */
export async function syncAppleReminders() {
  if (!APPLE_ID || !APPLE_APP_SPECIFIC_PASSWORD) {
    return { 
      success: false, 
      error: 'Credenciales de Apple no configuradas. Por favor, añade APPLE_ID y APPLE_APP_SPECIFIC_PASSWORD a tu archivo .env' 
    };
  }

  try {
    const client = await createDAVClient({
      serverUrl: 'https://caldav.icloud.com',
      credentials: {
        username: APPLE_ID,
        password: APPLE_APP_SPECIFIC_PASSWORD,
      },
      authMethod: 'Basic',
      defaultAccountType: 'caldav',
    });

    // En CalDAV, los recordatorios suelen estar en las mismas colecciones pero son objetos VTODO
    // tsdav permite filtrar o buscar. Vamos a intentar listar las colecciones primero.
    const collections = await client.fetchCalendars();
    
    // TODO: Implementar la extracción de VTODOs (Recordatorios)
    
    return { 
      success: true, 
      message: 'Conectado con éxito a iCloud para Recordatorios. Falta implementar la extracción de tareas.',
      collectionsCount: collections.length
    };
  } catch (error: any) {
    console.error('Error syncing Apple Reminders:', error);
    return { success: false, error: error.message || 'Error desconocido al conectar con iCloud' };
  }
}
