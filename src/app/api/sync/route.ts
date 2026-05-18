import { syncAppleCalendar } from '@/app/actions/appleSyncActions';
import { NextResponse } from 'next/server';
import db from '@/infrastructure/db/sqlite';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');

  // Verificar el secreto de Vercel Cron
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Buscamos el primer usuario de la base de datos (asumiendo que es tu app personal)
    const user: any = await db.prepare('SELECT id FROM users LIMIT 1').get();
    if (!user) {
      return NextResponse.json({ success: false, error: 'No se encontró ningún usuario en la base de datos' }, { status: 404 });
    }

    // Ejecutamos la sincronización pasando el ID del usuario
    const result = await syncAppleCalendar(user.id);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
