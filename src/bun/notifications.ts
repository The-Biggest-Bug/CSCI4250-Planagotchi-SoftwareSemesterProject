import { Utils } from "electrobun/bun";
import { and, eq, gt, isNotNull, lt, or } from "drizzle-orm";
import { db } from "../db/client";
import { notificationLog, todos } from "../db/schema";

const DIGEST_HOURS = [9, 18] as const;
const SOON_DAYS = 7;
const PER_TASK_REMINDERS_MINUTES = [24 * 60, 60] as const; // 24h + 1h
const DIGEST_COOLDOWN_MS = 20 * 60 * 60 * 1000; // 20h
const TASK_REMINDER_COOLDOWN_MS = 6 * 60 * 60 * 1000; // 6h

type TimeoutHandle = ReturnType<typeof setTimeout>;

let started = false;
let timeouts: TimeoutHandle[] = [];

function clearScheduled() {
  for (const t of timeouts) clearTimeout(t);
  timeouts = [];
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function addDays(d: Date, days: number) {
  return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
}

function clampList(items: string[], max: number) {
  if (items.length <= max) return items;
  return [...items.slice(0, max - 1), `+${items.length - (max - 1)} more`];
}

async function wasSent(key: string) {
  const [row] = await db
    .select()
    .from(notificationLog)
    .where(eq(notificationLog.key, key))
    .limit(1);
  return row ?? null;
}

async function markSent(key: string, sentAt = new Date()) {
  await db.insert(notificationLog).values({ key, sentAt }).onConflictDoUpdate({
    target: notificationLog.key,
    set: { sentAt },
  });
}

async function showWithCooldown(
  key: string,
  cooldownMs: number,
  options: Parameters<typeof Utils.showNotification>[0],
) {
  const existing = await wasSent(key);
  if (existing) {
    const last = new Date(existing.sentAt).getTime();
    if (Date.now() - last < cooldownMs) return;
  }
  Utils.showNotification(options);
  await markSent(key);
}

async function buildDigestMessage(now: Date) {
  const todayStart = startOfDay(now);
  const tomorrowStart = addDays(todayStart, 1);
  const soonEnd = addDays(todayStart, SOON_DAYS + 1);

  const today = await db
    .select()
    .from(todos)
    .where(
      and(
        eq(todos.completed, false),
        isNotNull(todos.dueAt),
        gt(todos.dueAt, todayStart),
        lt(todos.dueAt, tomorrowStart),
      ),
    );

  const soon = await db
    .select()
    .from(todos)
    .where(
      and(
        eq(todos.completed, false),
        isNotNull(todos.dueAt),
        gt(todos.dueAt, tomorrowStart),
        lt(todos.dueAt, soonEnd),
      ),
    );

  const todayTitles = clampList(
    today.map((t) => t.title),
    6,
  );
  const soonTitles = clampList(
    soon.map((t) => t.title),
    6,
  );

  if (todayTitles.length === 0 && soonTitles.length === 0) {
    return null;
  }

  const lines: string[] = [];
  if (todayTitles.length) lines.push(`Today: ${todayTitles.join(", ")}`);
  if (soonTitles.length) lines.push(`Soon: ${soonTitles.join(", ")}`);

  return {
    title: "Planagotchi reminders",
    body: lines.join("\n"),
  };
}

async function sendDigestIfNeeded(
  kind: "morning" | "evening",
  now = new Date(),
) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const key = `digest-${y}-${m}-${d}-${kind}`;

  const message = await buildDigestMessage(now);
  if (!message) return;

  await showWithCooldown(key, DIGEST_COOLDOWN_MS, message);
}

function scheduleAt(when: Date, fn: () => void | Promise<void>) {
  const delay = when.getTime() - Date.now();
  if (delay <= 0) return;
  timeouts.push(
    setTimeout(() => {
      void fn();
    }, delay),
  );
}

function nextDigestTime(hour: number, now = new Date()) {
  const candidate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    0,
    0,
    0,
  );
  if (candidate.getTime() > now.getTime()) return candidate;
  return addDays(candidate, 1);
}

async function scheduleDigests() {
  for (const hour of DIGEST_HOURS) {
    const kind = hour === DIGEST_HOURS[0] ? "morning" : "evening";
    const when = nextDigestTime(hour);
    scheduleAt(when, async () => {
      await sendDigestIfNeeded(kind);
      // schedule the next day’s run for this slot
      await rescheduleNotifications();
    });
  }
}

async function schedulePerTaskReminders() {
  const now = new Date();
  const minDue = addDays(now, -1); // include slightly overdue tasks for "1h before" windows
  const maxDue = addDays(now, SOON_DAYS + 1);

  const dueSoon = await db
    .select()
    .from(todos)
    .where(
      and(
        eq(todos.completed, false),
        isNotNull(todos.dueAt),
        or(gt(todos.dueAt, minDue), eq(todos.dueAt, minDue)),
        lt(todos.dueAt, maxDue),
      ),
    );

  for (const todo of dueSoon) {
    if (!todo.dueAt) continue;
    const due = new Date(todo.dueAt);

    for (const minutesBefore of PER_TASK_REMINDERS_MINUTES) {
      const when = new Date(due.getTime() - minutesBefore * 60 * 1000);
      if (when.getTime() <= now.getTime()) continue;

      // Include dueAt so changing the due date reschedules reminders.
      const key = `todo-${todo.id}-due-${todo.dueAt}-pre-${minutesBefore}`;
      scheduleAt(when, async () => {
        // If completed by the time we fire, skip.
        const [fresh] = await db
          .select()
          .from(todos)
          .where(eq(todos.id, todo.id))
          .limit(1);
        if (!fresh || fresh.completed || !fresh.dueAt) return;

        const dueAtText = new Date(fresh.dueAt).toLocaleString();
        const title =
          minutesBefore >= 24 * 60
            ? "Task due tomorrow"
            : minutesBefore >= 60
              ? "Task due soon"
              : "Task reminder";

        await showWithCooldown(key, TASK_REMINDER_COOLDOWN_MS, {
          title,
          body: `${fresh.title}\nDue: ${dueAtText}`,
        });
      });
    }
  }
}

export async function rescheduleNotifications() {
  if (!started) return;
  clearScheduled();
  await scheduleDigests();
  await schedulePerTaskReminders();
}

export async function initNotifications() {
  if (started) return;
  started = true;
  await rescheduleNotifications();
}
