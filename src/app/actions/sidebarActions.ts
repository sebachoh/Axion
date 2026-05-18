'use server';

import db from '@/infrastructure/db/sqlite';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

const defaultSidebarLayout = [
  {
    id: 'sec-dashboard',
    type: 'section',
    title: 'Dashboard',
    isSpecial: false,
    items: [
      { id: 'resumen', href: '/', label: 'Resumen Diario', icon: 'home' },
      { id: 'planeacion', href: '/workspace/planeacion', label: 'Planeación del Día', icon: 'calendar' },
      { id: 'rutinas', href: '/rutinas', label: 'Rutinas', icon: 'routine' },
      { id: 'notas', href: '/stickynotes', label: 'Notas', icon: 'notes' },
      { id: 'detox', href: '/detox', label: 'Detox', icon: 'compass' },
      { id: 'tareas', href: '/workspace/tareas', label: 'Tareas', icon: 'tasks' }
    ]
  },
  {
    id: 'sec-ecole',
    type: 'section',
    title: 'Ecole & Trabajo',
    isSpecial: false,
    items: [
      { id: 'proyectos', href: '/workspace/proyectos', label: 'Proyectos', icon: 'folder' },
      { id: 'alternancia', href: '/workspace/alternancia', label: 'Alternancia', icon: 'alternancia' },
      { id: 'stage', href: '/workspace/stage', label: 'Stage', icon: 'stage' }
    ]
  },
  {
    id: 'sec-academia',
    type: 'section',
    title: 'Academia',
    isSpecial: false,
    items: [
      { id: 'idiomas', href: '/academia/idiomas', label: 'Idiomas', icon: 'idiomas' },
      { id: 'careers', href: '/academia/careers', label: 'Careers', icon: 'careers' }
    ]
  },
  {
    id: 'sec-personal',
    type: 'section',
    title: 'Personal',
    isSpecial: false,
    items: [
      { id: 'journal', href: '/journal', label: 'Journal', icon: 'journal' },
      { id: 'finanzas', href: '/finanzas', label: 'Finanzas', icon: 'finanzas' },
      { id: 'hogar', href: '/lifestyle/hogar', label: 'Hogar', icon: 'hogar' },
      { id: 'viajes', href: '/lifestyle/viajes', label: 'Viajes', icon: 'compass' }
    ]
  },
  {
    id: 'sec-boveda',
    type: 'section',
    title: 'Bóveda',
    isSpecial: true,
    items: [
      { id: 'vision', href: '/boveda/vision', label: 'Vision Board', icon: 'vision' },
      { id: 'recursos', href: '/boveda/recursos', label: 'Recursos (Vault)', icon: 'vault' }
    ]
  }
];

// Load sidebar layout for a user
export async function getSidebarLayout(): Promise<any[]> {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return defaultSidebarLayout;

  try {
    const stmt = db.prepare("SELECT content FROM widgets WHERE user_id = ? AND type = 'sidebar_layout'");
    const row = await stmt.get(userId) as { content: string } | undefined;
    if (row?.content) {
      return JSON.parse(row.content);
    }
  } catch (err) {
    console.error("Error loading sidebar layout:", err);
  }

  return defaultSidebarLayout;
}

// Save sidebar layout for a user
export async function saveSidebarLayout(layout: any[]) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  const layoutJson = JSON.stringify(layout);

  const stmtCheck = db.prepare("SELECT id FROM widgets WHERE user_id = ? AND type = 'sidebar_layout'");
  const exists = await stmtCheck.get(userId) as { id: string } | undefined;

  if (exists) {
    const stmtUpdate = db.prepare("UPDATE widgets SET content = ? WHERE id = ?");
    await stmtUpdate.run(layoutJson, exists.id);
  } else {
    const id = crypto.randomUUID();
    const stmtInsert = db.prepare("INSERT INTO widgets (id, user_id, type, content) VALUES (?, ?, 'sidebar_layout', ?)");
    await stmtInsert.run(id, userId, layoutJson);
  }

  revalidatePath('/');
}
