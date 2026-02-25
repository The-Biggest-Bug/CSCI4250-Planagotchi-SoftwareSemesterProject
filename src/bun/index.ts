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

const mainViewRPC = BrowserView.defineRPC<MainViewRPC>({
  handlers: {
    requests: {
      listTodos: async () => {
        const rows = await db
          .select()
          .from(todos)
          .orderBy(desc(todos.createdAt));

        return rows.map<TodoDTO>((row) => ({
          id: row.id!,
          title: row.title,
          completed: !!row.completed,
          createdAt: new Date(row.createdAt).toISOString(),
        }));
      },
      addTodo: async ({ title }) => {
        const [inserted] = await db.insert(todos).values({ title }).returning();

        return {
          id: inserted.id!,
          title: inserted.title,
          completed: !!inserted.completed,
          createdAt: new Date(inserted.createdAt).toISOString(),
        } satisfies TodoDTO;
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

        return {
          id: updated.id!,
          title: updated.title,
          completed: !!updated.completed,
          createdAt: new Date(updated.createdAt).toISOString(),
        } satisfies TodoDTO;
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
