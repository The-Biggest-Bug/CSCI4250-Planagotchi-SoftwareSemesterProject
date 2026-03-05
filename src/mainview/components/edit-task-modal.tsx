import { useState } from "react";
import type { TodoDTO } from "@/shared/rpc";
import { electroview } from "@/shared/electrobun";

interface EditTaskModalProps {
  todo: TodoDTO;
  onUpdated: (todo: TodoDTO) => void;
  onDeleted: (id: number) => void;
  onClose: () => void;
}

function parseDueAt(dueAt: string | null) {
  if (!dueAt) return { date: "", time: "" };
  const d = new Date(dueAt);
  const date = d.toISOString().slice(0, 10);
  const time = d.toTimeString().slice(0, 5);
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
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      const dueAt = date ? new Date(`${date}T${time || "00:00"}`).toISOString() : null;

      const updated = await electroview.rpc!.request.updateTodo({
        id: todo.id,
        title: trimmed,
        description: description.trim() || null,
        dueAt,
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

      <form onSubmit={handleSave} className="flex flex-col gap-1.5 flex-1 min-h-0">
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
          rows={2}
          className="rounded-md bg-background/40 border border-border/60 px-2 py-1 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none flex-shrink"
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

        <div className="flex-1" />

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
