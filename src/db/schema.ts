import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const todos = sqliteTable("todos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  completedAt: integer("completed_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  description: text("description"),
  dueAt: integer("due_at", { mode: "timestamp_ms" }),
  penaltyAppliedForDueAt: integer("penalty_applied_for_due_at", {
    mode: "timestamp_ms",
  }),
  recurrenceType: text("recurrence_type"), // 'daily' | 'weekly' | 'monthly' | null
  recurrenceInterval: integer("recurrence_interval"), // e.g. 1 = every 1 day/week/month
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
  hardMode: integer("hard_mode", { mode: "boolean" }).notNull().default(false),
});

export const notificationLog = sqliteTable("notification_log", {
  key: text("key").primaryKey().notNull(),
  sentAt: integer("sent_at", { mode: "timestamp_ms" }).notNull(),
});

export const petState = sqliteTable("pet_state", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  health: integer("health").notNull(),
  xp: integer("xp").notNull().default(0),
});
