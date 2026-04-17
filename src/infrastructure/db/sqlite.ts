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
      type TEXT NOT NULL,
      content TEXT
    );

    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS habit_logs (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL,
      date DATE NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY(habit_id) REFERENCES habits(id)
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      deadline DATE,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pages (
      route TEXT PRIMARY KEY,
      content TEXT
    );

    CREATE TABLE IF NOT EXISTS sticky_notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT,
      color TEXT NOT NULL,
      pos_x INTEGER NOT NULL DEFAULT 0,
      pos_y INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS routine_tasks (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      task_name TEXT NOT NULL,
      is_completed BOOLEAN NOT NULL DEFAULT 0,
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS routine_completions (
      task_id TEXT NOT NULL,
      completion_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (task_id, completion_date)
    );

    CREATE TABLE IF NOT EXISTS alternancia_applications (
      id TEXT PRIMARY KEY,
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
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      meta TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS project_ideas (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS time_blocks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      start_time TEXT NOT NULL,
      duration_mins INTEGER NOT NULL,
      color TEXT NOT NULL,
      block_date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      media_url TEXT,
      mood TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS language_words (
      id TEXT PRIMARY KEY,
      lang TEXT NOT NULL,
      word TEXT NOT NULL,
      translation TEXT NOT NULL,
      precision TEXT NOT NULL DEFAULT 'medium',
      topic TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS language_resources (
      id TEXT PRIMARY KEY,
      lang TEXT NOT NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'SITIO',
      skill TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS language_skills (
      id TEXT PRIMARY KEY,
      lang TEXT NOT NULL,
      skill TEXT NOT NULL,
      level INTEGER NOT NULL DEFAULT 0,
      UNIQUE(lang, skill)
    );

    CREATE TABLE IF NOT EXISTS language_topics (
      id TEXT PRIMARY KEY,
      lang TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS planning_bank (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#bfdbfe',
      default_mins INTEGER NOT NULL DEFAULT 60,
      icon TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS finance_transactions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL, -- 'income' or 'expense'
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS finance_goals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL,
      current_amount REAL DEFAULT 0,
      color TEXT NOT NULL DEFAULT '#bfdbfe',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Quick SQLite migration for order_index in existing routine_tasks and tasks tables
  try {
    db.exec(`ALTER TABLE routine_tasks ADD COLUMN order_index INTEGER DEFAULT 0;`);
  } catch (e) {
    // If column already exists, this throws an error which we can safely ignore
  }

  try {
    db.exec(`ALTER TABLE tasks ADD COLUMN order_index INTEGER DEFAULT 0;`);
  } catch (e) {
    // Ignore if column exists
  }
}

export default db;

initDB();
