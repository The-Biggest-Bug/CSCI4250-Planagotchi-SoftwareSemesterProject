import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { Utils } from "electrobun/bun";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import * as schema from "./schema";

const dbDir = Utils.paths.userData;
mkdirSync(dbDir, { recursive: true });
const sqlite = new Database(join(dbDir, "planagotchi.sqlite"));

sqlite.run(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
    description TEXT,
    due_at INTEGER
  );
`);

try {
  sqlite.run(`ALTER TABLE todos ADD COLUMN due_at INTEGER`);
} catch {
  // column already exists
}

try {
  sqlite.run(`ALTER TABLE todos ADD COLUMN description TEXT`);
} catch {
  // column already exists
}

sqlite.run(`
  CREATE TABLE IF NOT EXISTS app_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    egg_color TEXT NOT NULL DEFAULT '#CAF0FE',
    background_kind TEXT NOT NULL DEFAULT 'preset',
    background_value TEXT NOT NULL DEFAULT 'egg-triangles',
    egg_background_value TEXT NOT NULL DEFAULT 'egg-triangles',
    dino_background_kind TEXT NOT NULL DEFAULT 'preset',
    dino_background_value TEXT NOT NULL DEFAULT 'dino-landscape'
  );
`);

try {
  sqlite.run(
    `ALTER TABLE app_settings ADD COLUMN background_kind TEXT NOT NULL DEFAULT 'preset'`,
  );
} catch {
  // column already exists
}

try {
  sqlite.run(
    `ALTER TABLE app_settings ADD COLUMN background_value TEXT NOT NULL DEFAULT 'egg-triangles'`,
  );
} catch {
  // column already exists
}

try {
  sqlite.run(
    `ALTER TABLE app_settings ADD COLUMN egg_background_value TEXT NOT NULL DEFAULT 'egg-triangles'`,
  );
} catch {
  // column already exists
}

try {
  sqlite.run(
    `ALTER TABLE app_settings ADD COLUMN dino_background_kind TEXT NOT NULL DEFAULT 'preset'`,
  );
} catch {
  // column already exists
}

try {
  sqlite.run(
    `ALTER TABLE app_settings ADD COLUMN dino_background_value TEXT NOT NULL DEFAULT 'dino-landscape'`,
  );
} catch {
  // column already exists
}

sqlite.run(`
  UPDATE app_settings
  SET background_kind = 'preset'
  WHERE background_kind IS NULL OR background_kind = '';
`);

sqlite.run(`
  UPDATE app_settings
  SET background_value = 'egg-triangles'
  WHERE background_value IS NULL OR background_value = '';
`);

sqlite.run(`
  UPDATE app_settings
  SET egg_background_value = 'egg-triangles'
  WHERE egg_background_value IS NULL OR egg_background_value = '';
`);

sqlite.run(`
  UPDATE app_settings
  SET dino_background_kind = COALESCE(NULLIF(background_kind, ''), 'preset')
  WHERE dino_background_kind IS NULL OR dino_background_kind = '';
`);

sqlite.run(`
  UPDATE app_settings
  SET dino_background_value = COALESCE(NULLIF(background_value, ''), 'dino-landscape')
  WHERE dino_background_value IS NULL OR dino_background_value = '';
`);

sqlite.run(`
  INSERT INTO app_settings (
    id,
    egg_color,
    background_kind,
    background_value,
    egg_background_value,
    dino_background_kind,
    dino_background_value
  )
  SELECT
    1,
    '#CAF0FE',
    'preset',
    'egg-triangles',
    'egg-triangles',
    'preset',
    'dino-landscape'
  WHERE NOT EXISTS (SELECT 1 FROM app_settings WHERE id = 1);
`);

export const db = drizzle(sqlite, { schema });
export type Db = typeof db;
