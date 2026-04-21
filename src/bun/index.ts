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
import { todos, appSettings, notificationLog, petState } from "../db/schema";
import type {
  AppBackgroundDTO,
  AppSettingsDTO,
  MainViewRPC,
  PetDTO,
  TodoDTO,
} from "../shared/rpc";
import {
  getDefaultPetState,
  getPetProgress,
  getHamsterProgress,
  penalizePetForMissedTask,
  rewardPetForCompletedTask,
} from "../types/pet";
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
    completedAt: row.completedAt
      ? new Date(row.completedAt).toISOString()
      : null,
    createdAt: new Date(row.createdAt).toISOString(),
    dueAt: row.dueAt ? new Date(row.dueAt).toISOString() : null,
  };
}

function isOverdueTodo(todo: typeof todos.$inferSelect, now: Date) {
  return (
    !todo.completed && !!todo.dueAt && todo.dueAt.getTime() < now.getTime()
  );
}

function getProductivitySnapshot(
  todoRows: Array<typeof todos.$inferSelect>,
  now = new Date(),
) {
  return {
    totalTodos: todoRows.length,
    completedTodos: todoRows.filter((todo) => todo.completed).length,
    overdueTodos: todoRows.filter((todo) => isOverdueTodo(todo, now)).length,
  };
}

function mapPet(
  row: typeof petState.$inferSelect,
  {
    todoRows = [],
    hardMode = false,
  }: { todoRows?: Array<typeof todos.$inferSelect>; hardMode?: boolean } = {},
): PetDTO {
  const pet = { health: row.health, xp: row.xp };
  const productivity = getProductivitySnapshot(todoRows);
  return hardMode
    ? getHamsterProgress(pet, productivity)
    : getPetProgress(pet, productivity);
}

const DEFAULT_EGG_COLOR = "#CAF0FE";
const DEFAULT_EGG_BACKGROUND = "egg-triangles";
const DEFAULT_PET_BACKGROUND: AppBackgroundDTO = {
  kind: "preset",
  value: "dino-landscape",
};

function normalizeEggBackground(value: string | null | undefined) {
  return value?.trim() || DEFAULT_EGG_BACKGROUND;
}

function normalizePetBackground(
  background: AppBackgroundDTO,
): AppBackgroundDTO {
  const kind = background.kind === "custom" ? "custom" : "preset";
  const value = background.value?.trim();

  if (!value) {
    return DEFAULT_PET_BACKGROUND;
  }

  return { kind, value };
}

function mapAppSettings(row: typeof appSettings.$inferSelect): AppSettingsDTO {
  return {
    eggColor: row.eggColor || DEFAULT_EGG_COLOR,
    eggBackground: normalizeEggBackground(row.eggBackgroundValue),
    petBackground: normalizePetBackground({
      kind: row.dinoBackgroundKind === "custom" ? "custom" : "preset",
      value: row.dinoBackgroundValue || DEFAULT_PET_BACKGROUND.value,
    }),
    hardMode: !!row.hardMode,
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
      dinoBackgroundKind: DEFAULT_PET_BACKGROUND.kind,
      dinoBackgroundValue: DEFAULT_PET_BACKGROUND.value,
      hardMode: false,
    })
    .returning();

  return inserted;
}

async function getOrCreatePetState() {
  const [existing] = await db.select().from(petState).limit(1);
  if (existing) {
    return existing;
  }

  const defaults = getDefaultPetState();
  const [inserted] = await db
    .insert(petState)
    .values({
      health: defaults.health,
      xp: defaults.xp,
    })
    .returning();

  return inserted;
}

function hasMissedDueDate(
  todo: typeof todos.$inferSelect,
  now: Date,
): todo is typeof todo & { dueAt: Date } {
  return (
    isOverdueTodo(todo, now) &&
    !!todo.dueAt &&
    todo.penaltyAppliedForDueAt?.getTime() !== todo.dueAt.getTime()
  );
}

async function applyMissedTaskPenalties(now = new Date()) {
  const settings = await getOrCreateAppSettings();
  const hardMode = !!settings.hardMode;
  const currentPet = await getOrCreatePetState();
  const overdueTodos = (await db.select().from(todos)).filter((todo) =>
    hasMissedDueDate(todo, now),
  );

  if (overdueTodos.length === 0) {
    return currentPet;
  }

  let nextPet = currentPet;

  for (const todo of overdueTodos) {
    const penalizedPet = hardMode
      ? { health: 0, xp: nextPet.xp }
      : penalizePetForMissedTask({
          health: nextPet.health,
          xp: nextPet.xp,
        });

    [nextPet] = await db
      .update(petState)
      .set({
        health: penalizedPet.health,
        xp: penalizedPet.xp,
      })
      .where(eq(petState.id, nextPet.id))
      .returning();

    await db
      .update(todos)
      .set({
        penaltyAppliedForDueAt: todo.dueAt,
      })
      .where(eq(todos.id, todo.id));
  }

  return nextPet;
}

const mainViewRPC = BrowserView.defineRPC<MainViewRPC>({
  handlers: {
    requests: {
      listTodos: async () => {
        await applyMissedTaskPenalties();
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
        let nextPet = await applyMissedTaskPenalties();
        const settings = await getOrCreateAppSettings();
        const hardMode = !!settings.hardMode;
        const [existing] = await db
          .select()
          .from(todos)
          .where(eq(todos.id, id))
          .limit(1);
        if (!existing) return null;

        const nextCompleted = !existing.completed;
        const [updated] = await db
          .update(todos)
          .set({ completed: nextCompleted })
          .where(eq(todos.id, id))
          .returning();

        if (
          !existing.completed &&
          nextCompleted &&
          !hardMode &&
          nextPet.health > 0
        ) {
          const rewardedPet = rewardPetForCompletedTask({
            health: nextPet.health,
            xp: nextPet.xp,
          });

          [nextPet] = await db
            .update(petState)
            .set({
              health: rewardedPet.health,
              xp: rewardedPet.xp,
            })
            .where(eq(petState.id, nextPet.id))
            .returning();
        }

        await rescheduleNotifications();
        const todoRows = await db.select().from(todos);
        return {
          todo: mapTodo(updated),
          pet: mapPet(nextPet, { todoRows, hardMode }),
        };
      },
      deleteTodo: async ({ id }) => {
        await db.delete(todos).where(eq(todos.id, id));
        await rescheduleNotifications();
        return { success: true };
      },
      getPetState: async () => {
        const pet = await applyMissedTaskPenalties();
        const settings = await getOrCreateAppSettings();
        const hardMode = !!settings.hardMode;
        const todoRows = await db.select().from(todos);
        return mapPet(pet, { todoRows, hardMode });
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
            dinoBackgroundKind: DEFAULT_PET_BACKGROUND.kind,
            dinoBackgroundValue: DEFAULT_PET_BACKGROUND.value,
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
      setPetBackground: async (background) => {
        const existing = await getOrCreateAppSettings();
        const nextBackground = normalizePetBackground(background);

        const [updated] = await db
          .update(appSettings)
          .set({
            dinoBackgroundKind: nextBackground.kind,
            dinoBackgroundValue: nextBackground.value,
          })
          .where(eq(appSettings.id, existing.id))
          .returning();

        return normalizePetBackground({
          kind: updated.dinoBackgroundKind === "custom" ? "custom" : "preset",
          value: updated.dinoBackgroundValue,
        });
      },
      setHardMode: async ({ enabled }) => {
        const existing = await getOrCreateAppSettings();
        const [updated] = await db
          .update(appSettings)
          .set({ hardMode: !!enabled })
          .where(eq(appSettings.id, existing.id))
          .returning();
        return { enabled: !!updated.hardMode };
      },
      closeApp: async () => {
        mainWindow.close();
        return { success: true };
      },
      resetAllData: async () => {
        await db.delete(todos);
        await db.delete(notificationLog);
        await db.delete(appSettings);
        await db.delete(petState);

        const settings = await getOrCreateAppSettings();
        const pet = await getOrCreatePetState();

        await rescheduleNotifications();

        return {
          success: true,
          appSettings: mapAppSettings(settings),
          pet: mapPet(pet, { hardMode: !!settings.hardMode }),
        };
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
