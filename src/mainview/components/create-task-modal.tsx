import { useState } from "react";
import { formatDateInputValue, formatTimeInputValue } from "@/lib/utils";
import type { TodoDTO } from "@/shared/rpc";
import { electroview } from "@/shared/electrobun";

interface CreateTaskModalProps {
  onCreated: (todo: TodoDTO) => void;
  onClose: () => void;
}

export default function CreateTaskModal({
  onCreated,
  onClose,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => {
    const now = new Date();
    return formatDateInputValue(now);
  });
  const [time, setTime] = useState(() => {
    const now = new Date();
    return formatTimeInputValue(now);
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      const dueAt = date
        ? new Date(`${date}T${time || "00:00"}`).toISOString()
        : undefined;

      const todo = await electroview.rpc!.request.addTodo({
        title: trimmed,
        description: description.trim() || undefined,
        dueAt,
      });
      onCreated(todo);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="absolute inset-0 z-20 bg-card/95 flex flex-col p-2.5 gap-1.5">
      <div className="text-sm font-semibold">New Task</div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-1.5 flex-1 min-h-0"
      >
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

        <div className="flex gap-2 justify-end">
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
            Create
          </button>
        </div>
      </form>
    </div>
  );
}
