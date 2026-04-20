import Database from 'better-sqlite3';
import path from 'path';

// Ruta relativa a la raíz del proyecto
const dbPath = path.resolve(process.cwd(), 'lifeos.db');

// Iniciar conexión con base de datos
const db = new Database(dbPath, { verbose: console.log });

// Activar WAL (Write-Ahead Logging) para mejor concurrencia
db.pragma('journal_mode = WAL');

// Inicialización de tablas base
export function initDB() {
  db.exec(`
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
      type TEXT NOT NULL, -- 'income' or 'expense'
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
      area TEXT NOT NULL, -- Salud, Profesional, Familia, Educación, Carrera, etc.
      timeframe TEXT NOT NULL, -- 2026, 5 años, 10 años
      content TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS vault_resources (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL, -- text, image, idea, link, file
      content TEXT,
      media_url TEXT,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT, -- Hashed
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
  `);

  // Multi-user migration
  const tables = [
    'widgets', 'habits', 'habit_logs', 'tasks', 'pages', 'sticky_notes', 
    'routine_tasks', 'routine_completions', 'alternancia_applications', 
    'alternancia_bank', 'project_ideas', 'time_blocks', 'journal_entries', 
    'language_words', 'language_resources', 'language_skills', 
    'language_topics', 'planning_bank', 'finance_transactions', 
    'finance_goals', 'vision_boards', 'vault_resources'
  ];

  tables.forEach(table => {
    try {
      db.exec(`ALTER TABLE ${table} ADD COLUMN user_id TEXT;`);
    } catch (e) {
      // Column already exists
    }
  });


  // Quick SQLite migration for order_index
  try {
    db.exec(`ALTER TABLE routine_tasks ADD COLUMN order_index INTEGER DEFAULT 0;`);
  } catch (e) {}

  try {
    db.exec(`ALTER TABLE tasks ADD COLUMN order_index INTEGER DEFAULT 0;`);
  } catch (e) {}
}

export default db;

initDB();
