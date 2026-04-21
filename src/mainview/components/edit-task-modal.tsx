import { useState } from "react";
import { formatDateInputValue, formatTimeInputValue } from "@/lib/utils";
import type { TodoDTO } from "@/shared/rpc";
import { electroview } from "@/shared/electrobun";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/mainview/components/ui/select";

type RecurrenceType = "daily" | "weekly" | "monthly" | "";

function pluralize(value: number, unit: string) {
  return `${unit}${value === 1 ? "" : "s"}`;
}

function recurrenceUnitLabel(recurrenceType: Exclude<RecurrenceType, "">) {
  switch (recurrenceType) {
    case "daily":
      return "day";
    case "weekly":
      return "week";
    case "monthly":
      return "month";
  }
}

interface EditTaskModalProps {
  todo: TodoDTO;
  onUpdated: (todo: TodoDTO) => void;
  onDeleted: (id: number) => void;
  onClose: () => void;
}

function parseDueAt(dueAt: string | null) {
  if (!dueAt) return { date: "", time: "" };
  const d = new Date(dueAt);
  const date = formatDateInputValue(d);
  const time = formatTimeInputValue(d);
  return { date, time };
}

export default function EditTaskModal({
  todo,
  onUpdated,
  onDeleted,
  onClose,
}: EditTaskModalProps) {
  const parsed = parseDueAt(todo.dueAt);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description ?? "");
  const [date, setDate] = useState(parsed.date);
  const [time, setTime] = useState(parsed.time);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(
    todo.recurrenceType ?? "",
  );
  const [recurrenceInterval, setRecurrenceInterval] = useState(
    todo.recurrenceInterval ?? 1,
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      const dueAt = date
        ? new Date(`${date}T${time || "00:00"}`).toISOString()
        : null;

      const updated = await electroview.rpc!.request.updateTodo({
        id: todo.id,
        title: trimmed,
        description: description.trim() || null,
        dueAt,
        recurrenceType: recurrenceType || null,
        recurrenceInterval: recurrenceType ? recurrenceInterval : null,
      });
      if (updated) onUpdated(updated);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await electroview.rpc!.request.deleteTodo({ id: todo.id });
      onDeleted(todo.id);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="absolute inset-0 z-20 bg-card/95 flex flex-col p-2.5 gap-1.5">
      <div className="text-sm font-semibold">Edit Task</div>

      <form
        onSubmit={handleSave}
        className="flex flex-col gap-1.5 flex-1 min-h-0"
      >
        <div className="flex flex-col gap-1.5 flex-1 min-h-0 overflow-y-auto pr-0.5">
          <input
            autoFocus
            type="text"
            placeholder="Task name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-md bg-background/40 border border-border/60 px-2 py-1 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />

          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="rounded-md bg-background/40 border border-border/60 px-2 py-1 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          />

          <div className="flex gap-1.5">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 min-w-0 rounded-md bg-background/40 border border-border/60 px-1.5 py-1 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="flex-1 min-w-0 rounded-md bg-background/40 border border-border/60 px-1.5 py-1 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {recurrenceType ? (
            <div className="flex items-center gap-1.5">
              <Select
                value={recurrenceType}
                onValueChange={(value: string) => {
                  if (value === "none") {
                    setRecurrenceType("");
                    setRecurrenceInterval(1);
                    return;
                  }

                  setRecurrenceType(value as RecurrenceType);
                }}
              >
                <SelectTrigger
                  className="w-auto min-w-[76px] px-1.5"
                  hideChevron
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Does not repeat</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>

              <span className="text-xs text-muted-foreground">every</span>
              <input
                type="number"
                min={1}
                max={9}
                value={recurrenceInterval}
                onChange={(e) =>
                  setRecurrenceInterval(
                    Math.min(9, Math.max(1, Number(e.target.value))),
                  )
                }
                className="w-8 rounded-md bg-background/40 border border-border/60 px-1 py-1 text-center text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {pluralize(
                  recurrenceInterval,
                  recurrenceUnitLabel(recurrenceType),
                )}
              </span>
            </div>
          ) : (
            <Select
              value="none"
              onValueChange={(value: string) => {
                if (value === "none") {
                  setRecurrenceType("");
                  setRecurrenceInterval(1);
                  return;
                }

                setRecurrenceType(value as RecurrenceType);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Does not repeat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Does not repeat</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex gap-2 justify-between">
          <button
            type="button"
            onClick={handleDelete}
            disabled={submitting}
            className="px-2.5 py-1 text-sm rounded-md text-destructive-foreground bg-destructive hover:bg-destructive/90 disabled:opacity-50"
          >
            Delete
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1 text-sm rounded-md hover:bg-muted/60 text-muted-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || submitting}
              className="px-2.5 py-1 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
