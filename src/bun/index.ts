import {
  ApplicationMenu,
  BrowserWindow,
  BrowserView,
  Updater,
  Utils,
} from "electrobun/bun";
import { desc, eq } from "drizzle-orm";
import config from "../../electrobun.config";
import { db } from "../db/client";
import { todos } from "../db/schema";
import type { MainViewRPC, TodoDTO } from "../shared/rpc";

const APP_NAME = config.app.name;
const DEV_SERVER_PORT = 5173;
const DEV_SERVER_URL = `http://localhost:${DEV_SERVER_PORT}`;

// check if Vite dev server is running for HMR
async function getMainViewUrl(): Promise<string> {
  const channel = await Updater.localInfo.channel();
  if (channel !== "dev") return "views://mainview/index.html";

  try {
    await fetch(DEV_SERVER_URL, { method: "HEAD" });
    console.log(`HMR enabled: Using Vite dev server at ${DEV_SERVER_URL}`);
    return DEV_SERVER_URL;
  } catch {
    console.log("Vite dev server not running. Run 'bun run dev:hmr' for HMR.");
    return "views://mainview/index.html";
  }
}

const url = await getMainViewUrl();

function mapTodo(row: typeof todos.$inferSelect): TodoDTO {
  return {
    id: row.id!,
    title: row.title,
    description: row.description ?? null,
    completed: !!row.completed,
    createdAt: new Date(row.createdAt).toISOString(),
    dueAt: row.dueAt ? new Date(row.dueAt).toISOString() : null,
  };
}

const mainViewRPC = BrowserView.defineRPC<MainViewRPC>({
  handlers: {
    requests: {
      listTodos: async () => {
        const rows = await db
          .select()
          .from(todos)
          .orderBy(desc(todos.createdAt));
        return rows.map(mapTodo);
      },
      addTodo: async ({ title, description, dueAt }) => {
        const [inserted] = await db
          .insert(todos)
          .values({
            title,
            description: description || null,
            dueAt: dueAt ? new Date(dueAt) : null,
          })
          .returning();
        return mapTodo(inserted);
      },
      updateTodo: async ({ id, title, description, dueAt }) => {
        const set: Partial<typeof todos.$inferInsert> = {};
        if (title !== undefined) set.title = title;
        if (description !== undefined) set.description = description || null;
        if (dueAt !== undefined) set.dueAt = dueAt ? new Date(dueAt) : null;

        const [updated] = await db
          .update(todos)
          .set(set)
          .where(eq(todos.id, id))
          .returning();
        return updated ? mapTodo(updated) : null;
      },
      toggleTodo: async ({ id }) => {
        const [existing] = await db
          .select()
          .from(todos)
          .where(eq(todos.id, id))
          .limit(1);
        if (!existing) return null;

        const [updated] = await db
          .update(todos)
          .set({ completed: !existing.completed })
          .where(eq(todos.id, id))
          .returning();
        return mapTodo(updated);
      },
      deleteTodo: async ({ id }) => {
        await db.delete(todos).where(eq(todos.id, id));
        return { success: true };
      },
    },
    messages: {},
  },
});

// add cmd+q support for macOS
ApplicationMenu.setApplicationMenu([
  {
    submenu: [{ role: "quit", accelerator: "q" }],
  },
]);

// main window options
const mainWindow = new BrowserWindow({
  title: APP_NAME,
  url,
  frame: {
    width: 420,
    height: 460,
    x: 200,
    y: 200,
  },
  transparent: true,
  titleBarStyle: "hiddenInset",
  rpc: mainViewRPC,
  styleMask: {
    Titled: false,
    Closable: false,
    Miniaturizable: false,
    Resizable: false,
  },
});

mainWindow.on("close", () => Utils.quit());

console.log(`${APP_NAME} started!`);
