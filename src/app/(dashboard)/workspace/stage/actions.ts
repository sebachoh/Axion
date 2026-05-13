'use server';

import db from '@/infrastructure/db/sqlite';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

// Helper to get authorized userId
async function getUserId() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

// === Stage Tasks Actions ===

export async function seedStageTasksIfNeeded() {
  const userId = await getUserId();

  // Check if any monthly stage tasks already exist for this user
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM stage_tasks WHERE user_id = ? AND month > 0');
  const countRes = await countStmt.get(userId) as { count: number };

  if (countRes.count > 0) {
    return; // Already seeded
  }

  const defaultTasks = [
    // Month 1
    { title: 'Estudiar arquitectura 5G Standalone (SA) y señalización de red', priority: 'alta', month: 1 },
    { title: 'Analizar especificaciones 3GPP para flujos de baja latencia (URLLC)', priority: 'media', month: 1 },
    { title: 'Configurar entorno de virtualización en Ubuntu con soporte Docker/K8s', priority: 'alta', month: 1 },
    { title: 'Preparar controladores UHD para transceptores de radio USRP', priority: 'media', month: 1 },
    { title: 'Desplegar Core Network 5G (CN5G) de OpenAirInterface con Docker', priority: 'alta', month: 1 },

    // Month 2
    { title: 'Estudiar requerimientos de ancho de banda y latencia para VR Metavers', priority: 'alta', month: 2 },
    { title: 'Capturar y analizar trazas de tráfico de renderizado centralizado (Wireshark)', priority: 'media', month: 2 },
    { title: 'Desarrollar cliente de visualización interactivo para el Gemelo Digital', priority: 'alta', month: 2 },
    { title: 'Programar scripts (Python/Shell) de simulación de telemetría industrial 4.0', priority: 'media', month: 2 },
    { title: 'Validar rendimiento de la app de realidad virtual en localhost', priority: 'media', month: 2 },

    // Month 3
    { title: 'Integrar hardware de radio USRP y levantar estación base gNB de OAI', priority: 'alta', month: 3 },
    { title: 'Conectar dispositivo móvil comercial (UE) a la red gNB privada', priority: 'alta', month: 3 },
    { title: 'Definir e implementar Network Slicing avanzado (identificadores SST/SD)', priority: 'alta', month: 3 },
    { title: 'Configurar slice de alta prioridad exclusivo para el tráfico de realidad virtual', priority: 'alta', month: 3 },
    { title: 'Transmitir flujos de telemetría y renderizado del gemelo digital por el canal 5G', priority: 'alta', month: 3 },

    // Month 4
    { title: 'Medir latencia (RTT), pérdida de paquetes y throughput en diferentes slices', priority: 'alta', month: 4 },
    { title: 'Simular degradación de canal de radio y evaluar el impacto en la app de VR', priority: 'media', month: 4 },
    { title: 'Ajustar schedulers y timers en el RAN de OAI para minimizar latencia', priority: 'alta', month: 4 },
    { title: 'Escribir manuales de configuración de OAI Core, gNB y Docker-Compose', priority: 'media', month: 4 },
    { title: 'Redactar memoria final del Stage para el Prof. Patrick Sondi', priority: 'alta', month: 4 }
  ];

  for (const t of defaultTasks) {
    const id = crypto.randomUUID();
    const insertStmt = db.prepare(`
      INSERT INTO stage_tasks (id, user_id, title, status, priority, month)
      VALUES (@id, @userId, @title, 'Pendiente', @priority, @month)
    `);
    await insertStmt.run({ id, userId, title: t.title, priority: t.priority, month: t.month });
  }

  revalidatePath('/workspace/stage');
}

export async function addStageTask(formData: FormData) {
  const userId = await getUserId();
  const title = formData.get('title') as string;
  const priority = formData.get('priority') as string || 'media';
  const month = parseInt(formData.get('month') as string || '0', 10);

  if (!title) return;

  const id = crypto.randomUUID();
  const stmt = db.prepare(`
    INSERT INTO stage_tasks (id, user_id, title, status, priority, month)
    VALUES (@id, @userId, @title, 'Pendiente', @priority, @month)
  `);

  await stmt.run({ id, userId, title, priority, month });
  revalidatePath('/workspace/stage');
}

export async function toggleStageTaskStatus(id: string, currentStatus: string) {
  const userId = await getUserId();
  const newStatus = currentStatus === 'Completado' ? 'Pendiente' : 'Completado';

  const stmt = db.prepare(`
    UPDATE stage_tasks
    SET status = @newStatus
    WHERE id = @id AND user_id = @userId
  `);

  await stmt.run({ id, userId, newStatus });
  revalidatePath('/workspace/stage');
}

export async function deleteStageTask(id: string) {
  const userId = await getUserId();
  const stmt = db.prepare('DELETE FROM stage_tasks WHERE id = @id AND user_id = @userId');
  await stmt.run({ id, userId });
  revalidatePath('/workspace/stage');
}

// === Stage Projects Actions ===

export async function addStageProject(formData: FormData) {
  const userId = await getUserId();
  const title = formData.get('title') as string;
  const description = formData.get('description') as string || '';
  const status = formData.get('status') as string || 'En progreso';

  if (!title) return;

  const id = crypto.randomUUID();
  const stmt = db.prepare(`
    INSERT INTO stage_projects (id, user_id, title, description, status)
    VALUES (@id, @userId, @title, @description, @status)
  `);

  await stmt.run({ id, userId, title, description, status });
  revalidatePath('/workspace/stage');
}

export async function updateStageProjectStatus(id: string, newStatus: string) {
  const userId = await getUserId();
  const stmt = db.prepare(`
    UPDATE stage_projects
    SET status = @newStatus
    WHERE id = @id AND user_id = @userId
  `);

  await stmt.run({ id, userId, newStatus });
  revalidatePath('/workspace/stage');
}

export async function deleteStageProject(id: string) {
  const userId = await getUserId();
  const stmt = db.prepare('DELETE FROM stage_projects WHERE id = @id AND user_id = @userId');
  await stmt.run({ id, userId });
  revalidatePath('/workspace/stage');
}

// === Stage Commands Actions ===

export async function addStageCommand(formData: FormData) {
  const userId = await getUserId();
  const title = formData.get('title') as string;
  const command = formData.get('command') as string;
  const description = formData.get('description') as string || '';
  const category = formData.get('category') as string || 'General';

  if (!title || !command) return;

  const id = crypto.randomUUID();
  const stmt = db.prepare(`
    INSERT INTO stage_commands (id, user_id, title, command, description, category)
    VALUES (@id, @userId, @title, @command, @description, @category)
  `);

  await stmt.run({ id, userId, title, command, description, category });
  revalidatePath('/workspace/stage');
}

export async function deleteStageCommand(id: string) {
  const userId = await getUserId();
  const stmt = db.prepare('DELETE FROM stage_commands WHERE id = @id AND user_id = @userId');
  await stmt.run({ id, userId });
  revalidatePath('/workspace/stage');
}
