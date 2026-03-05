import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { Checkbox } from "@/mainview/components/ui/checkbox";
import type { TodoDTO } from "@/shared/rpc";

interface TodoListProps {
  todos: TodoDTO[];
  loading: boolean;
  editMode: boolean;
  onToggle: (id: number) => void;
  onSelect: (todo: TodoDTO) => void;
}

function formatDue(dueAt: string | null) {
  if (!dueAt) return null;
  const d = new Date(dueAt);
  const month = d.toLocaleString("default", { month: "short" });
  const day = d.getDate();
  const hours = d.getHours();
  const mins = d.getMinutes().toString().padStart(2, "0");
  if (hours === 0 && mins === "00") return `${month} ${day}`;
  const period = hours >= 12 ? "pm" : "am";
  const h12 = hours % 12 || 12;
  return `${month} ${day}, ${h12}:${mins}${period}`;
}

export default function TodoList({ todos, loading, editMode, onToggle, onSelect }: TodoListProps) {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="px-2 pt-2 pb-1">
        <div className="text-sm font-medium">Tasks</div>
      </div>

      <div className="flex-1 overflow-y-auto px-1 space-y-0.5">
        {loading && (
          <div className="text-sm text-muted-foreground px-1 py-2">Loading…</div>
        )}
        {!loading && todos.length === 0 && (
          <div className="text-sm text-muted-foreground px-1 py-2">No tasks yet.</div>
        )}
        {todos.map((todo) => (
          <div
            key={todo.id}
            className={`flex items-center gap-2 rounded-md px-1.5 py-1.5 text-sm cursor-pointer ${editMode ? "hover:bg-accent/60" : "hover:bg-muted/40"}`}
            onClick={() => onSelect(todo)}
          >
            {editMode ? (
              <PencilSquareIcon className="w-4 h-4 text-muted-foreground shrink-0" />
            ) : (
              <Checkbox
                checked={todo.completed}
                onCheckedChange={(e) => {
                  e.valueOf();
                  onToggle(todo.id);
                }}
                onClick={(e) => e.stopPropagation()}
                className="h-3.5 w-3.5 shrink-0"
              />
            )}
            <span className={`flex-1 truncate ${todo.completed && !editMode ? "line-through text-muted-foreground" : ""}`}>
              {todo.title}
            </span>
            {todo.dueAt && (
              <span className="text-xs text-muted-foreground shrink-0">
                {formatDue(todo.dueAt)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

