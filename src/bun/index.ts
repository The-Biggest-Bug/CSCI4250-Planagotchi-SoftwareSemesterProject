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
import { todos, appSettings } from "../db/schema";
import type {
    AppBackgroundDTO,
    AppSettingsDTO,
    MainViewRPC,
    TodoDTO,
} from "../shared/rpc";
import { initNotifications, rescheduleNotifications } from "./notifications";

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

const DEFAULT_EGG_COLOR = "#CAF0FE";
const DEFAULT_EGG_BACKGROUND = "egg-triangles";
const DEFAULT_DINO_BACKGROUND: AppBackgroundDTO = {
    kind: "preset",
    value: "dino-landscape",
};

function normalizeEggBackground(value: string | null | undefined) {
    return value?.trim() || DEFAULT_EGG_BACKGROUND;
}

function normalizeDinoBackground(
    background: AppBackgroundDTO,
): AppBackgroundDTO {
    const kind = background.kind === "custom" ? "custom" : "preset";
    const value = background.value?.trim();

    if (!value) {
        return DEFAULT_DINO_BACKGROUND;
    }

    return { kind, value };
}

function mapAppSettings(row: typeof appSettings.$inferSelect): AppSettingsDTO {
    return {
        eggColor: row.eggColor || DEFAULT_EGG_COLOR,
        eggBackground: normalizeEggBackground(row.eggBackgroundValue),
        dinoBackground: normalizeDinoBackground({
            kind: row.dinoBackgroundKind === "custom" ? "custom" : "preset",
            value: row.dinoBackgroundValue || DEFAULT_DINO_BACKGROUND.value,
        }),
    };
}

async function getOrCreateAppSettings() {
    const [existing] = await db.select().from(appSettings).limit(1);
    if (existing) {
        return existing;
    }

    const [inserted] = await db
        .insert(appSettings)
        .values({
            eggColor: DEFAULT_EGG_COLOR,
            eggBackgroundValue: DEFAULT_EGG_BACKGROUND,
            dinoBackgroundKind: DEFAULT_DINO_BACKGROUND.kind,
            dinoBackgroundValue: DEFAULT_DINO_BACKGROUND.value,
        })
        .returning();

    return inserted;
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
                await rescheduleNotifications();
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
                await rescheduleNotifications();
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
                await rescheduleNotifications();
                return mapTodo(updated);
            },
            deleteTodo: async ({ id }) => {
                await db.delete(todos).where(eq(todos.id, id));
                await rescheduleNotifications();
                return { success: true };
            },
            getAppSettings: async () => {
                const settings = await getOrCreateAppSettings();
                return mapAppSettings(settings);
            },
            setEggColor: async ({ color }) => {
                const existing = await getOrCreateAppSettings();
                if (existing) {
                    const [updated] = await db
                        .update(appSettings)
                        .set({ eggColor: color })
                        .where(eq(appSettings.id, existing.id))
                        .returning();
                    return { color: updated.eggColor };
                }
                const [inserted] = await db
                    .insert(appSettings)
                    .values({
                        eggColor: color,
                        eggBackgroundValue: DEFAULT_EGG_BACKGROUND,
                        dinoBackgroundKind: DEFAULT_DINO_BACKGROUND.kind,
                        dinoBackgroundValue: DEFAULT_DINO_BACKGROUND.value,
                    })
                    .returning();
                return { color: inserted.eggColor };
            },
            setEggBackground: async ({ value }) => {
                const existing = await getOrCreateAppSettings();
                const nextValue = normalizeEggBackground(value);

                const [updated] = await db
                    .update(appSettings)
                    .set({ eggBackgroundValue: nextValue })
                    .where(eq(appSettings.id, existing.id))
                    .returning();

                return { value: normalizeEggBackground(updated.eggBackgroundValue) };
            },
            setDinoBackground: async (background) => {
                const existing = await getOrCreateAppSettings();
                const nextBackground = normalizeDinoBackground(background);

                const [updated] = await db
                    .update(appSettings)
                    .set({
                        dinoBackgroundKind: nextBackground.kind,
                        dinoBackgroundValue: nextBackground.value,
                    })
                    .where(eq(appSettings.id, existing.id))
                    .returning();

                return normalizeDinoBackground({
                    kind: updated.dinoBackgroundKind === "custom" ? "custom" : "preset",
                    value: updated.dinoBackgroundValue,
                });
            },
            closeApp: async () => {
                mainWindow.close();
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

await initNotifications();
console.log(`${APP_NAME} started!`);
