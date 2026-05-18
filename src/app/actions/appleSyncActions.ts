'use server';

import { createDAVClient } from 'tsdav';
import db from '@/infrastructure/db/sqlite';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

const APPLE_ID = process.env.APPLE_ID;
const APPLE_APP_SPECIFIC_PASSWORD = process.env.APPLE_APP_SPECIFIC_PASSWORD;

/**
 * Parsea una cadena de fecha iCal y devuelve la fecha (YYYY-MM-DD) y la hora (HH:mm).
 */
function parseICalDate(icalStr: string): { date: string, time: string } {
  if (!icalStr.includes('T')) return { date: '', time: '' };
  
  const parts = icalStr.split('T');
  const datePart = parts[0];
  const timePart = parts[1];
  
  const year = datePart.substring(0, 4);
  const month = datePart.substring(4, 6);
  const day = datePart.substring(6, 8);
  const hour = timePart.substring(0, 2);
  const minute = timePart.substring(2, 4);
  const second = timePart.substring(4, 6) || '00';
  
  let formattedStr = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
  if (icalStr.endsWith('Z')) {
    formattedStr += 'Z';
  }
  
  const dateObj = new Date(formattedStr);
  
  if (isNaN(dateObj.getTime())) {
    return {
      date: `${year}-${month}-${day}`,
      time: `${hour}:${minute}`
    };
  }
  
  const localYear = dateObj.getFullYear();
  const localMonth = String(dateObj.getMonth() + 1).padStart(2, '0');
  const localDay = String(dateObj.getDate()).padStart(2, '0');
  const localHour = String(dateObj.getHours()).padStart(2, '0');
  const localMinute = String(dateObj.getMinutes()).padStart(2, '0');
  
  return {
    date: `${localYear}-${localMonth}-${localDay}`,
    time: `${localHour}:${localMinute}`
  };
}

/**
 * Calcula la duración en minutos entre dos fechas iCal.
 */
function calculateDuration(startStr: string, endStr: string): number {
  const start = parseICalDate(startStr);
  const end = parseICalDate(endStr);
  
  const startDate = new Date(`${start.date}T${start.time}:00`);
  const endDate = new Date(`${end.date}T${end.time}:00`);
  
  const diffMs = endDate.getTime() - startDate.getTime();
  return Math.round(diffMs / 60000);
}

/**
 * Parsea el contenido iCal (VEVENT) para extraer los datos del evento.
 */
function parseEvent(data: string): { title: string, startTime: string, durationMins: number, blockDate: string } | null {
  const lines = data.split('\n');
  let title = '';
  let startStr = '';
  let endStr = '';
  let insideEvent = false;

  for (const line of lines) {
    const cleanLine = line.trim();
    
    if (cleanLine === 'BEGIN:VEVENT') {
      insideEvent = true;
      continue;
    }
    if (cleanLine === 'END:VEVENT') {
      insideEvent = false;
      continue;
    }
    
    if (!insideEvent) continue;

    if (cleanLine.startsWith('SUMMARY:')) {
      title = cleanLine.substring(8).trim();
    } else if (cleanLine.startsWith('DTSTART:') || cleanLine.startsWith('DTSTART;')) {
      const parts = cleanLine.split(':');
      startStr = parts[parts.length - 1].trim();
    } else if (cleanLine.startsWith('DTEND:') || cleanLine.startsWith('DTEND;')) {
      const parts = cleanLine.split(':');
      endStr = parts[parts.length - 1].trim();
    }
  }

  if (!title || !startStr) return null;

  const parsedStart = parseICalDate(startStr);
  let durationMins = 60; // Default

  if (endStr) {
    durationMins = calculateDuration(startStr, endStr);
  }

  return {
    title,
    startTime: parsedStart.time,
    durationMins,
    blockDate: parsedStart.date
  };
}

/**
 * Sincroniza bidireccionalmente el calendario de Apple.
 */
export async function syncAppleCalendar(manualUserId?: string) {
  const session = await auth();
  const userId = manualUserId || (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  if (!APPLE_ID || !APPLE_APP_SPECIFIC_PASSWORD) {
    return { 
      success: false, 
      error: 'Credenciales de Apple no configuradas. Por favor, añade APPLE_ID y APPLE_APP_SPECIFIC_PASSWORD a tu archivo .env.local' 
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

    // Crear tabla de mapeo si no existe
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS icloud_sync_mappings (
        local_id TEXT PRIMARY KEY,
        icloud_id TEXT NOT NULL
      )
    `).run();

    const calendars = await client.fetchCalendars();
    const validCalendars = calendars.filter(c => c.displayName !== 'Reminders ⚠️' && c.displayName !== 'Recordatorios');
    
    if (validCalendars.length === 0) {
      return { success: false, error: 'No se encontraron calendarios válidos.' };
    }

    // Usaremos el primer calendario válido para subir eventos nuevos
    const targetCalendar = validCalendars[0];
    let importedCount = 0;
    let pushedCount = 0;

    // 1. Sincronización de iCloud -> Web (Importar)
    for (const cal of validCalendars) {
      const objects = await client.fetchCalendarObjects({ calendar: cal });
      
      for (const obj of objects) {
        if (!obj.data) continue;
        
        const event = parseEvent(obj.data);
        if (!event) continue;

        const lines = obj.data.split('\n');
        // Fix: Added explicit type annotation for Vercel build
        const uidLine = lines.find((l: string) => l.trim().startsWith('UID:'));
        const icloud_id = uidLine ? uidLine.substring(4).trim() : obj.url;

        // Verificar si ya tenemos mapeado este evento
        const mapping = await db.prepare('SELECT local_id FROM icloud_sync_mappings WHERE icloud_id = @icloud_id')
          .get({ icloud_id });

        if (!mapping) {
          // Si no está mapeado, verificar si existe uno idéntico para evitar duplicados de pruebas anteriores
          const existing = await db.prepare(`
            SELECT id FROM time_blocks 
            WHERE user_id = @userId AND title = @title AND block_date = @blockDate AND start_time = @startTime
          `).get({ 
            userId, 
            title: event.title, 
            blockDate: event.blockDate, 
            startTime: event.startTime 
          });

          let local_id = existing?.id;

          if (!existing) {
            local_id = crypto.randomUUID();
            const color = cal.displayName === 'Work' ? '#bfdbfe' : '#bbf7d0';
            
            await db.prepare(`
              INSERT INTO time_blocks (id, user_id, title, start_time, duration_mins, color, block_date)
              VALUES (@id, @userId, @title, @startTime, @durationMins, @color, @blockDate)
            `).run({ 
              id: local_id, 
              userId, 
              title: event.title, 
              startTime: event.startTime, 
              durationMins: event.durationMins, 
              color, 
              blockDate: event.blockDate 
            });
            
            importedCount++;
          }

          // Verificar si el local_id ya tiene un mapeo para evitar errores de restricción UNIQUE
          const existingLocalMapping = await db.prepare('SELECT icloud_id FROM icloud_sync_mappings WHERE local_id = @local_id')
            .get({ local_id });

          if (!existingLocalMapping) {
            // Guardar el mapeo
            await db.prepare('INSERT INTO icloud_sync_mappings (local_id, icloud_id) VALUES (@local_id, @icloud_id)')
              .run({ local_id, icloud_id });
          }
        }
      }
    }

    // 2. Sincronización de Web -> iCloud (Exportar)
    const localBlocks = await db.prepare('SELECT * FROM time_blocks WHERE user_id = @userId').all({ userId });
    
    const authHeader = Buffer.from(`${APPLE_ID}:${APPLE_APP_SPECIFIC_PASSWORD}`).toString('base64');
    const baseUrl = targetCalendar.url;

    for (const block of localBlocks as any[]) {
      const mapping = await db.prepare('SELECT icloud_id FROM icloud_sync_mappings WHERE local_id = @local_id')
        .get({ local_id: block.id });

      if (!mapping) {
        // Este bloque fue creado en la web y no existe en iCloud. ¡Lo subimos!
        const cleanDate = block.block_date.replace(/-/g, '');
        const cleanTime = block.start_time.replace(':', '');
        
        // Calcular fecha de fin
        const startDate = new Date(`${block.block_date}T${block.start_time}:00`);
        const endDate = new Date(startDate.getTime() + block.duration_mins * 60000);
        const endYear = endDate.getFullYear();
        const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
        const endDay = String(endDate.getDate()).padStart(2, '0');
        const endHour = String(endDate.getHours()).padStart(2, '0');
        const endMinute = String(endDate.getMinutes()).padStart(2, '0');
        
        const cleanEndDate = `${endYear}${endMonth}${endDay}`;
        const cleanEndTime = `${endHour}${endMinute}00`;

        let summary = block.title;
        const iconToEmoji: Record<string, string> = {
          'Target': '🎯',
          'Dumbbell': '🏋️',
          'Book': '📚',
          'Laptop': '💻',
          'Brain': '🧠',
          'Apple': '🍎',
          'Music': '🎵',
          'Palette': '🎨',
          'Home': '🏠',
          'Car': '🚗'
        };
        const words = summary.split(' ');
        const firstWord = words[0];
        if (iconToEmoji[firstWord]) {
          summary = iconToEmoji[firstWord] + ' ' + words.slice(1).join(' ');
        }

        const icsData = [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//Apple Inc.//macOS 26.0.1//EN',
          'CALSCALE:GREGORIAN',
          'BEGIN:VEVENT',
          `UID:${block.id}@axion.app`,
          `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
          `CREATED:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
          `DTSTART:${cleanDate}T${cleanTime}00`,
          `DTEND:${cleanEndDate}T${cleanEndTime}`,
          'STATUS:CONFIRMED',
          `SUMMARY:${summary}`,
          'END:VEVENT',
          'END:VCALENDAR'
        ].join('\r\n');

        try {
          const res = await fetch(baseUrl + `${block.id}.ics`, {
            method: 'PUT',
            headers: { 
              'Authorization': `Basic ${authHeader}`, 
              'Content-Type': 'text/calendar; charset=utf-8' 
            },
            body: icsData,
          });

          if (res.status === 201 || res.status === 204) {
            // Guardar el mapeo
            await db.prepare('INSERT INTO icloud_sync_mappings (local_id, icloud_id) VALUES (@local_id, @icloud_id)')
              .run({ local_id: block.id, icloud_id: block.id });

            pushedCount++;
          } else {
            console.error(`Error subiendo evento ${block.title} a iCloud. Status: ${res.status}`);
          }
        } catch (e: any) {
          console.error(`Error subiendo evento ${block.title} a iCloud:`, e.message);
        }
      }
    }

    if (importedCount > 0 || pushedCount > 0) {
      revalidatePath('/workspace/planeacion');
    }

    return { 
      success: true, 
      message: `Sincronización bidireccional completada. Importados: ${importedCount}, Exportados: ${pushedCount}.`
    };
  } catch (error: any) {
    console.error('Error syncing Apple Calendar:', error);
    return { success: false, error: error.message || 'Error desconocido al conectar con iCloud' };
  }
}
