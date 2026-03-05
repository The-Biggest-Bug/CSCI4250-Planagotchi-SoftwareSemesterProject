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

export const db = drizzle(sqlite, { schema });
export type Db = typeof db;

