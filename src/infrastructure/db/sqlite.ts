import { createClient } from '@libsql/client';
import path from 'path';

// Determinar la URL de la base de datos
// En desarrollo/local, usará 'file:lifeos.db'
// En producción (Vercel), usará la URL de Turso (ej: 'libsql://mi-db.turso.io')
const dbUrl = process.env.TURSO_DATABASE_URL || `file:${path.resolve(process.cwd(), 'lifeos.db')}`;
const dbAuthToken = process.env.TURSO_AUTH_TOKEN;

console.log(`[DB Initialization] Connecting to database at: ${dbUrl.startsWith('file:') ? 'Local SQLite File' : 'Turso Cloud'}`);

const client = createClient({
  url: dbUrl,
  authToken: dbAuthToken,
});

// Normaliza los argumentos. Si se pasa un solo objeto de argumentos nombrados { a: 1, b: 2 },
// lo extrae para que @libsql/client lo vincule correctamente.
function normalizeArgs(args: any[]): any {
  if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null && !Array.isArray(args[0])) {
    return args[0];
  }
  return args;
}

// Convierte un Row de @libsql/client a un objeto JS plano.
// Esto es vital para evitar errores de serialización de Next.js al pasar datos a componentes del cliente.
function toPlainObject(row: any): any {
  if (!row) return row;
  return { ...row };
}

// El db Wrapper que mantiene 100% de compatibilidad sintáctica de consultas
const db = {
  prepare(sql: string) {
    return {
      async get(...args: any[]) {
        const normalized = normalizeArgs(args);
        const res = await client.execute({ sql, args: normalized });
        return toPlainObject(res.rows[0]);
      },
      async all(...args: any[]) {
        const normalized = normalizeArgs(args);
        const res = await client.execute({ sql, args: normalized });
        return res.rows.map(toPlainObject);
      },
      async run(...args: any[]) {
        const normalized = normalizeArgs(args);
        const res = await client.execute({ sql, args: normalized });
        return {
          changes: res.rowsAffected,
          lastInsertRowid: res.lastInsertRowid
        };
      }
    };
  },
  async exec(sql: string) {
    await client.executeMultiple(sql);
  },
  async batch(statements: any[]) {
    return await client.batch(statements, 'write');
  }
};

// Inicialización de tablas base
export async function initDB() {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS widgets (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        content TEXT
      );

      CREATE TABLE IF NOT EXISTS habits (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        color TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS habit_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        habit_id TEXT NOT NULL,
        date DATE NOT NULL,
        status TEXT NOT NULL,
        FOREIGN KEY(habit_id) REFERENCES habits(id)
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        status TEXT NOT NULL,
        priority TEXT NOT NULL,
        deadline DATE,
        notes TEXT,
        order_index INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS pages (
        route TEXT,
        user_id TEXT NOT NULL,
        content TEXT,
        PRIMARY KEY (route, user_id)
      );

      CREATE TABLE IF NOT EXISTS sticky_notes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        body TEXT,
        color TEXT NOT NULL,
        pos_x INTEGER NOT NULL DEFAULT 0,
        pos_y INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS routine_tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        task_name TEXT NOT NULL,
        is_completed BOOLEAN NOT NULL DEFAULT 0,
        order_index INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS routine_completions (
        user_id TEXT NOT NULL,
        task_id TEXT NOT NULL,
        completion_date TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, task_id, completion_date)
      );

      CREATE TABLE IF NOT EXISTS alternancia_applications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        app_number INTEGER NOT NULL,
        role_name TEXT NOT NULL,
        company TEXT NOT NULL,
        url TEXT,
        status TEXT NOT NULL,
        last_update DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS alternancia_bank (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        meta TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS project_ideas (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS time_blocks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        start_time TEXT NOT NULL,
        duration_mins INTEGER NOT NULL,
        color TEXT NOT NULL,
        block_date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS journal_entries (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        media_url TEXT,
        mood TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS language_words (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        lang TEXT NOT NULL,
        word TEXT NOT NULL,
        translation TEXT NOT NULL,
        precision TEXT NOT NULL DEFAULT 'medium',
        topic TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS language_resources (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        lang TEXT NOT NULL,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'SITIO',
        skill TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS language_skills (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        lang TEXT NOT NULL,
        skill TEXT NOT NULL,
        level INTEGER NOT NULL DEFAULT 0,
        UNIQUE(user_id, lang, skill)
      );

      CREATE TABLE IF NOT EXISTS language_topics (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        lang TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS planning_bank (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        color TEXT NOT NULL DEFAULT '#bfdbfe',
        default_mins INTEGER NOT NULL DEFAULT 60,
        icon TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS finance_transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS finance_goals (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        target_amount REAL NOT NULL,
        current_amount REAL DEFAULT 0,
        color TEXT NOT NULL DEFAULT '#bfdbfe',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS vision_boards (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        area TEXT NOT NULL,
        timeframe TEXT NOT NULL,
        content TEXT,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS vault_resources (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        content TEXT,
        media_url TEXT,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        name TEXT,
        image TEXT,
        email_verified DATETIME,
        verification_token TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS active_projects (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        short_name TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        color_start TEXT DEFAULT '#FF9A9E',
        color_end TEXT DEFAULT '#FECFEF',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_languages (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        flag TEXT NOT NULL,
        description TEXT,
        path TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_specializations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        short_code TEXT NOT NULL,
        description TEXT,
        color_start TEXT DEFAULT '#A1C4FD',
        color_end TEXT DEFAULT '#C2E9FB',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS stage_projects (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS stage_tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        status TEXT NOT NULL,
        priority TEXT NOT NULL DEFAULT 'media',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS stage_commands (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        command TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL DEFAULT 'General',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS hogar_chores (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        last_done_at DATETIME,
        frequency_days INTEGER DEFAULT 7,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS hogar_shopping_list (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        item_name TEXT NOT NULL,
        is_completed BOOLEAN NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS hogar_rent_payments (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        month_year TEXT NOT NULL,
        amount REAL NOT NULL,
        is_paid BOOLEAN NOT NULL DEFAULT 0,
        paid_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS travel_pins (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        map_id TEXT NOT NULL,
        city_name TEXT NOT NULL,
        status TEXT NOT NULL,
        color TEXT,
        notes TEXT,
        pos_x REAL,
        pos_y REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Migración de Multi-Usuario (añadir columnas user_id)
    const tables = [
      'widgets', 'habits', 'habit_logs', 'tasks', 'pages', 'sticky_notes', 
      'routine_tasks', 'routine_completions', 'alternancia_applications', 
      'alternancia_bank', 'project_ideas', 'time_blocks', 'journal_entries', 
      'language_words', 'language_resources', 'language_skills', 
      'language_topics', 'planning_bank', 'finance_transactions', 
      'finance_goals', 'vision_boards', 'vault_resources', 'travel_pins'
    ];

    for (const table of tables) {
      try {
        await db.exec(`ALTER TABLE ${table} ADD COLUMN user_id TEXT;`);
      } catch (e) {
        // La columna ya existe
      }
    }

    // Migración rápida para order_index
    try {
      await db.exec(`ALTER TABLE routine_tasks ADD COLUMN order_index INTEGER DEFAULT 0;`);
    } catch (e) {}

    try {
      await db.exec(`ALTER TABLE tasks ADD COLUMN order_index INTEGER DEFAULT 0;`);
    } catch (e) {}

    console.log('[DB Initialization] Database tables initialized successfully.');
  } catch (e) {
    console.error('[DB Initialization] Error during table creation/migration:', e);
  }
}

export default db;

// Inicializar la base de datos de manera asíncrona al cargar el módulo
initDB().catch(console.error);
