import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const todos = sqliteTable("todos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  description: text("description"),
  dueAt: integer("due_at", { mode: "timestamp_ms" }),
});

export const appSettings = sqliteTable("app_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eggColor: text("egg_color").notNull().default("#CAF0FE"),
  eggBackgroundValue: text("egg_background_value")
    .notNull()
    .default("egg-triangles"),
  dinoBackgroundKind: text("dino_background_kind").notNull().default("preset"),
  dinoBackgroundValue: text("dino_background_value")
    .notNull()
    .default("dino-landscape"),
});
