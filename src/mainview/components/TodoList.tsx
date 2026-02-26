import { useEffect, useState } from "react";
import { PlusIcon } from "@heroicons/react/24/solid";
import type { TodoDTO } from "@/shared/rpc";
import { electroview } from "@/shared/electrobun";
import { Button } from "@/mainview/components/ui/button";

interface TodoListProps {}

export default function TodoList({}: TodoListProps) {
  const [todos, setTodos] = useState<TodoDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const result = await electroview.rpc!.request.listTodos({});
        if (!cancelled) setTodos(result);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mt-2 w-full space-y-2">
      <div className="px-1">
        <div className="text-xs font-medium mb-2">Today&apos;s tasks</div>
        <form
          className="flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const title = newTitle.trim();
            if (!title) return;
            const created = await electroview.rpc!.request.addTodo({ title });
            setTodos((prev) => [created, ...prev]);
            setNewTitle("");
          }}
        >
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New task"
            className="flex-1 min-w-0 rounded-md bg-background/40 border border-border/60 px-2 py-1 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <Button type="submit" size="icon" className="h-7 w-7 shrink-0" disabled={!newTitle.trim()}>
            <PlusIcon className="w-4 h-4" />
          </Button>
        </form>
      </div>

      <div className="max-h-40 overflow-y-auto mt-1 space-y-1 pr-1">
        {loading && <div className="text-xs text-muted-foreground">Loading…</div>}
        {!loading && todos.length === 0 && (
          <div className="text-xs text-muted-foreground">No tasks yet.</div>
        )}
        {todos.map((todo) => (
          <label
            key={todo.id}
            className="flex items-center justify-between gap-2 rounded-md px-2 py-1 text-xs hover:bg-muted/60 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={async () => {
                  const updated = await electroview.rpc!.request.toggleTodo({ id: todo.id });
                  if (!updated) return;
                  setTodos((prev) =>
                    prev.map((t) => (t.id === updated.id ? updated : t)),
                  );
                }}
              />
              <span className={todo.completed ? "line-through text-muted-foreground" : ""}>
                {todo.title}
              </span>
            </div>
            <button
              type="button"
              onClick={async () => {
                await electroview.rpc!.request.deleteTodo({ id: todo.id });
                setTodos((prev) => prev.filter((t) => t.id !== todo.id));
              }}
              className="text-[10px] text-muted-foreground hover:text-destructive"
            >
              ✕
            </button>
          </label>
        ))}
      </div>
    </div>
  );
}

