'use server';

import db from '@/infrastructure/db/sqlite';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export interface TravelPin {
  id: string;
  map_id: string;
  city_name: string;
  status: 'visited' | 'want_to_go';
  color?: string;
  notes?: string;
  pos_x?: number;
  pos_y?: number;
  created_at?: string;
}

// Helper para obtener el ID del usuario autenticado
async function getUserId() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

// Obtener todos los pines de un mapa para el usuario actual
export async function getTravelPins(mapId: string): Promise<TravelPin[]> {
  try {
    const userId = await getUserId();
    const stmt = db.prepare(`
      SELECT id, map_id, city_name, status, color, notes, pos_x, pos_y, created_at
      FROM travel_pins
      WHERE user_id = @userId AND map_id = @mapId
      ORDER BY created_at DESC
    `);
    return await stmt.all({ userId, mapId }) as TravelPin[];
  } catch (error) {
    console.error("Error fetching travel pins:", error);
    return [];
  }
}

// Guardar o actualizar un pin
export async function saveTravelPin(data: {
  id?: string;
  mapId: string;
  cityName: string;
  status: 'visited' | 'want_to_go';
  color?: string;
  notes?: string;
  posX?: number;
  posY?: number;
}) {
  const userId = await getUserId();
  const id = data.id || crypto.randomUUID();

  // Verificar si ya existe un pin para esa ciudad en ese mapa para evitar duplicados exactos
  const checkStmt = db.prepare(`
    SELECT id FROM travel_pins 
    WHERE user_id = @userId AND map_id = @mapId AND LOWER(city_name) = LOWER(@cityName)
  `);
  const existing = await checkStmt.get({ userId, mapId: data.mapId, cityName: data.cityName }) as { id: string } | undefined;

  if (existing && !data.id) {
    // Si ya existe la ciudad, actualizamos sus valores
    const updateStmt = db.prepare(`
      UPDATE travel_pins
      SET status = @status, color = @color, notes = @notes, pos_x = @posX, pos_y = @posY
      WHERE id = @id AND user_id = @userId
    `);
    await updateStmt.run({
      id: existing.id,
      userId,
      status: data.status,
      color: data.color || null,
      notes: data.notes || null,
      posX: data.posX ?? null,
      posY: data.posY ?? null
    });
  } else if (data.id) {
    // Actualizar por ID específico
    const updateStmt = db.prepare(`
      UPDATE travel_pins
      SET city_name = @cityName, status = @status, color = @color, notes = @notes, pos_x = @posX, pos_y = @posY
      WHERE id = @id AND user_id = @userId
    `);
    await updateStmt.run({
      id: data.id,
      userId,
      cityName: data.cityName,
      status: data.status,
      color: data.color || null,
      notes: data.notes || null,
      posX: data.posX ?? null,
      posY: data.posY ?? null
    });
  } else {
    // Insertar nuevo pin
    const insertStmt = db.prepare(`
      INSERT INTO travel_pins (id, user_id, map_id, city_name, status, color, notes, pos_x, pos_y)
      VALUES (@id, @userId, @mapId, @cityName, @status, @color, @notes, @posX, @posY)
    `);
    await insertStmt.run({
      id,
      userId,
      mapId: data.mapId,
      cityName: data.cityName,
      status: data.status,
      color: data.color || null,
      notes: data.notes || null,
      posX: data.posX ?? null,
      posY: data.posY ?? null
    });
  }

  revalidatePath('/lifestyle/viajes');
}

// Eliminar un pin
export async function deleteTravelPin(id: string) {
  const userId = await getUserId();
  const stmt = db.prepare('DELETE FROM travel_pins WHERE id = @id AND user_id = @userId');
  await stmt.run({ id, userId });
  revalidatePath('/lifestyle/viajes');
}

// Alternar el estado de un pin (visited <-> want_to_go)
export async function toggleTravelPinStatus(id: string, currentStatus: string) {
  const userId = await getUserId();
  const newStatus = currentStatus === 'visited' ? 'want_to_go' : 'visited';
  // Colores por defecto al alternar para mantener la consistencia
  const defaultColor = newStatus === 'visited' ? '#10b981' : '#8b5cf6';

  const stmt = db.prepare(`
    UPDATE travel_pins
    SET status = @newStatus, color = @defaultColor
    WHERE id = @id AND user_id = @userId
  `);
  await stmt.run({ id, userId, newStatus, defaultColor });
  revalidatePath('/lifestyle/viajes');
}
