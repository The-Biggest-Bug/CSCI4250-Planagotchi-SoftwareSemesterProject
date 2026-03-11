import { useMemo, useState } from "react";
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  HomeIcon,
  PencilSquareIcon,
  TableCellsIcon,
  ViewColumnsIcon,
} from "@heroicons/react/24/solid";
import Layout from "@/mainview/layout";
import TodoList from "@/mainview/components/todo-list";
import TaskDetailModal from "@/mainview/components/task-detail-modal";
import EditTaskModal from "@/mainview/components/edit-task-modal";
import type { ButtonConfig, Navigate } from "@/mainview/types";
import type { TodoDTO } from "@/shared/rpc";
import useTodos from "@/mainview/hooks/use-todos";

type CalendarMode = "week" | "month";

interface CalendarPageProps {
  navigate: Navigate;
  eggFillColor: string;
}

const DAY_INITIALS = ["S", "M", "T", "W", "T", "F", "S"];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date) {
  const day = startOfDay(date);
  day.setDate(day.getDate() - day.getDay());
  return day;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function addDays(date: Date, amount: number) {
  const next = startOfDay(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function addMonths(date: Date, amount: number) {
  const base = new Date(date.getFullYear(), date.getMonth() + amount, 1);
  const lastDay = new Date(
    base.getFullYear(),
    base.getMonth() + 1,
    0,
  ).getDate();

  return new Date(
    base.getFullYear(),
    base.getMonth(),
    Math.min(date.getDate(), lastDay),
  );
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function getDateKey(date: Date) {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function formatWeekLabel(date: Date) {
  const start = startOfWeek(date);
  const end = addDays(start, 6);
  const startMonth = start.toLocaleDateString(undefined, { month: "short" });
  const endMonth = end.toLocaleDateString(undefined, { month: "short" });

  if (startMonth === endMonth) {
    return `${startMonth} ${start.getDate()}-${end.getDate()}`;
  }

  return `${startMonth} ${start.getDate()}-${endMonth} ${end.getDate()}`;
}

function formatDayLabel(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function compareTodos(a: TodoDTO, b: TodoDTO) {
  if (a.dueAt && b.dueAt) {
    return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
  }
  if (a.dueAt) return -1;
  if (b.dueAt) return 1;
  return a.title.localeCompare(b.title);
}

function buildLinePath(points: Array<{ x: number; y: number }>) {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

export default function CalendarPage({
  navigate,
  eggFillColor,
}: CalendarPageProps) {
  const { todos, loading, toggleTodo, updateTodo, deleteTodo } = useTodos();
  const [mode, setMode] = useState<CalendarMode>("week");
  const [focusDate, setFocusDate] = useState(() => startOfDay(new Date()));
  const [selectedDate, setSelectedDate] = useState(() =>
    startOfDay(new Date()),
  );
  const [panelDate, setPanelDate] = useState<Date | null>(null);
  const [dayEditMode, setDayEditMode] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoDTO | null>(null);
  const [viewingTodo, setViewingTodo] = useState<TodoDTO | null>(null);

  const scheduledTodos = useMemo(
    () => todos.filter((todo) => todo.dueAt),
    [todos],
  );

  const todosByDay = useMemo(() => {
    const grouped = new Map<string, TodoDTO[]>();

    for (const todo of scheduledTodos) {
      const day = startOfDay(new Date(todo.dueAt!));
      const key = getDateKey(day);
      const current = grouped.get(key) ?? [];
      current.push(todo);
      grouped.set(key, current);
    }

    for (const [key, list] of grouped.entries()) {
      grouped.set(key, [...list].sort(compareTodos));
    }

    return grouped;
  }, [scheduledTodos]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(focusDate);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }, [focusDate]);

  const weekCounts = weekDays.map(
    (day) => todosByDay.get(getDateKey(day))?.length ?? 0,
  );
  const maxWeekCount = Math.max(...weekCounts, 0);
  const chartPoints = weekCounts.map((count, index) => {
    const x = 10 + (index * 164) / 6;
    const ratio = maxWeekCount === 0 ? 0 : count / maxWeekCount;
    const y = 35 - ratio * 21;
    return { x, y };
  });

  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(focusDate);
    const gridStart = startOfWeek(monthStart);
    const monthEnd = endOfMonth(focusDate);
    const gridEnd = addDays(startOfWeek(monthEnd), 6);
    const days: Date[] = [];

    for (let day = gridStart; day <= gridEnd; day = addDays(day, 1)) {
      days.push(day);
    }

    return days;
  }, [focusDate]);

  const visibleMonthTaskCount = useMemo(
    () =>
      scheduledTodos.filter((todo) => {
        const due = new Date(todo.dueAt!);
        return (
          due.getFullYear() === focusDate.getFullYear() &&
          due.getMonth() === focusDate.getMonth()
        );
      }).length,
    [focusDate, scheduledTodos],
  );

  const dayPanelTodos = useMemo(() => {
    if (!panelDate) return [];
    return todosByDay.get(getDateKey(panelDate)) ?? [];
  }, [panelDate, todosByDay]);

  const ModeIcon = mode === "week" ? TableCellsIcon : ViewColumnsIcon;

  const handleStep = (direction: -1 | 1) => {
    setPanelDate(null);
    setDayEditMode(false);
    setEditingTodo(null);
    setViewingTodo(null);

    if (mode === "week") {
      setFocusDate((current) => addDays(current, direction * 7));
      setSelectedDate((current) => addDays(current, direction * 7));
      return;
    }

    setFocusDate((current) => addMonths(current, direction));
    setSelectedDate((current) => addMonths(current, direction));
  };

  const handleModeChange = (nextMode: CalendarMode) => {
    setMode(nextMode);
    setFocusDate(selectedDate);
    setPanelDate(null);
    setDayEditMode(false);
    setEditingTodo(null);
  };

  const openDay = (date: Date) => {
    const normalized = startOfDay(date);
    setSelectedDate(normalized);
    setPanelDate(normalized);
    setDayEditMode(false);
  };

  const handleToggle = async (id: number) => {
    const updated = await toggleTodo(id);
    if (updated) {
      setViewingTodo((current) =>
        current?.id === updated.id ? updated : current,
      );
    }
  };

  const handleUpdated = (updated: TodoDTO) => {
    updateTodo(updated);
    setEditingTodo(null);
  };

  const handleDeleted = (id: number) => {
    deleteTodo(id);
    setEditingTodo(null);
  };

  const buttons: ButtonConfig[] = [
    {
      icon: HomeIcon,
      onClick: () => navigate("home"),
      ariaLabel: "home",
    },
    {
      icon: ModeIcon,
      onClick: () => handleModeChange(mode === "week" ? "month" : "week"),
      ariaLabel: "toggle-calendar-mode",
    },
    {
      icon: panelDate ? PencilSquareIcon : Cog6ToothIcon,
      onClick: () =>
        panelDate
          ? setDayEditMode((current) => !current)
          : navigate("settings"),
      ariaLabel: panelDate ? "edit-tasks" : "settings",
    },
  ];

  const periodLabel =
    mode === "week" ? formatWeekLabel(focusDate) : formatMonthLabel(focusDate);

  return (
    <Layout buttons={buttons} eggFillColor={eggFillColor}>
      <div className="relative flex h-full flex-col overflow-hidden text-foreground">
        <div className="border-b border-border/60 px-2 py-1.5">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => handleStep(-1)}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-border/60 bg-background/30 text-muted-foreground hover:bg-accent/60"
              aria-label="previous period"
            >
              <ChevronLeftIcon className="h-3.5 w-3.5" />
            </button>

            <div className="min-w-0 text-center">
              <div className="flex items-center justify-center gap-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                <CalendarDaysIcon className="h-3 w-3" />
                Calendar
              </div>
              <div className="truncate text-sm font-semibold text-foreground">
                {periodLabel}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleStep(1)}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-border/60 bg-background/30 text-muted-foreground hover:bg-accent/60"
              aria-label="next period"
            >
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {mode === "week" ? (
          <div
            key="calendar-week-view"
            className="flex flex-1 flex-col gap-1.5 px-2 py-1.5"
          >
            <div className="grid grid-cols-7 gap-0.5">
              {weekDays.map((day, index) => {
                const count = weekCounts[index];
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());

                return (
                  <button
                    key={getDateKey(day)}
                    type="button"
                    onClick={() => openDay(day)}
                    className={`rounded-md border px-0.5 py-1 text-center transition ${isSelected ? "border-sky-400 bg-sky-400/10" : "border-border/60 bg-background/20 hover:bg-accent/40"} ${isToday && !isSelected ? "border-amber-300/80" : ""}`}
                  >
                    <div className="text-[8px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {DAY_INITIALS[day.getDay()]}
                    </div>
                    <div className="text-[11px] font-semibold text-foreground">
                      {day.getDate()}
                    </div>
                    <div className="text-[8px] text-muted-foreground">
                      {count}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-xl border border-border/60 bg-background/20 px-1.5 py-1.5">
              <div className="mb-1 flex items-center justify-between text-[8px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <span>Task Load</span>
                <span>
                  {weekCounts.reduce((sum, count) => sum + count, 0)} total
                </span>
              </div>

              <svg
                viewBox="0 0 184 42"
                className="h-14 w-full overflow-visible"
              >
                {[0, 1].map((row) => {
                  const y = 15 + row * 10;
                  return (
                    <line
                      key={row}
                      x1="10"
                      x2="174"
                      y1={y}
                      y2={y}
                      stroke="rgba(148,163,184,0.18)"
                      strokeWidth="1"
                    />
                  );
                })}

                <path
                  d={buildLinePath(chartPoints)}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {chartPoints.map((point, index) => (
                  <g key={`${point.x}-${point.y}`}>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="3.5"
                      fill={
                        isSameDay(weekDays[index], selectedDate)
                          ? "#e0f2fe"
                          : "hsl(var(--card))"
                      }
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                    />
                  </g>
                ))}
              </svg>
            </div>
          </div>
        ) : (
          <div
            key="calendar-month-view"
            className="flex flex-1 flex-col px-2 py-1.5"
          >
            <div className="mb-0.5 flex items-center justify-between text-[8px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <span>{visibleMonthTaskCount} scheduled</span>
              <span>{focusDate.getFullYear()}</span>
            </div>

            <div className="grid grid-cols-7 gap-0.5 pb-0.5">
              {DAY_INITIALS.map((day) => (
                <div
                  key={day}
                  className="text-center text-[8px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {monthDays.map((day) => {
                const tasks = todosByDay.get(getDateKey(day)) ?? [];
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, focusDate);
                const isToday = isSameDay(day, new Date());

                return (
                  <button
                    key={getDateKey(day)}
                    type="button"
                    onClick={() => openDay(day)}
                    className={`relative h-[24px] rounded-md border transition ${isSelected ? "border-sky-400 bg-sky-400/10" : isCurrentMonth ? "border-border/60 bg-background/20 hover:bg-accent/40" : "border-transparent bg-background/10"} ${isToday && !isSelected ? "border-amber-300/80" : ""}`}
                  >
                    <span
                      className={`absolute inset-0 flex items-center justify-center text-[10px] font-semibold ${isCurrentMonth ? "text-foreground" : "text-muted-foreground/50"}`}
                    >
                      {day.getDate()}
                    </span>
                    <span className="absolute bottom-[2px] left-1/2 flex -translate-x-1/2 items-center justify-center gap-px">
                      {Array.from({ length: Math.min(tasks.length, 3) }).map(
                        (_, index) => (
                          <span
                            key={index}
                            className={`h-[2px] w-[2px] rounded-full ${isSelected ? "bg-sky-400/90" : isCurrentMonth ? "bg-muted-foreground/80" : "bg-muted-foreground/35"}`}
                          />
                        ),
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {panelDate && (
          <div className="absolute inset-0 z-20 flex flex-col bg-card/95 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-2 px-2.5 pb-1 pt-2.5">
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {mode === "week" ? "Daily Tasks" : "Selected Day"}
                </div>
                <div className="truncate text-sm font-semibold text-foreground">
                  {formatDayLabel(panelDate)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPanelDate(null);
                  setDayEditMode(false);
                }}
                className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/60"
              >
                Close
              </button>
            </div>

            <div className="min-h-0 flex-1">
              <TodoList
                todos={dayPanelTodos}
                loading={loading}
                editMode={dayEditMode}
                title="Tasks"
                emptyMessage="No tasks scheduled."
                onToggle={handleToggle}
                onSelect={(todo) => {
                  if (dayEditMode) {
                    setEditingTodo(todo);
                    return;
                  }
                  setViewingTodo(todo);
                }}
              />
            </div>
          </div>
        )}

        {editingTodo && (
          <EditTaskModal
            todo={editingTodo}
            onUpdated={handleUpdated}
            onDeleted={handleDeleted}
            onClose={() => setEditingTodo(null)}
          />
        )}

        {viewingTodo && (
          <TaskDetailModal
            todo={viewingTodo}
            onToggle={handleToggle}
            onClose={() => setViewingTodo(null)}
          />
        )}
      </div>
    </Layout>
  );
}
