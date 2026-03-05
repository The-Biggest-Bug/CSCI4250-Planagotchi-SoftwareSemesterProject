import { Checkbox } from "@/mainview/components/ui/checkbox";
import type { TodoDTO } from "@/shared/rpc";

interface TaskDetailModalProps {
  todo: TodoDTO;
  onToggle: (id: number) => void;
  onClose: () => void;
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

export default function TaskDetailModal({ todo, onToggle, onClose }: TaskDetailModalProps) {
  return (
    <div className="absolute inset-0 z-20 bg-card flex flex-col p-2.5 gap-1.5">
      <div className="text-sm font-semibold truncate">{todo.title}</div>

      <div className="flex items-center gap-2 rounded-md px-1 py-0.5">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={() => onToggle(todo.id)}
          className="h-3.5 w-3.5 shrink-0 cursor-pointer"
        />
        {todo.dueAt && (
          <span className="text-xs text-muted-foreground">
            {formatDue(todo.dueAt)}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-1 min-h-0">
        <div className="text-sm whitespace-pre-wrap">
          {todo.description || (
            <span className="text-muted-foreground italic text-xs">No description</span>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-2.5 py-1 text-sm rounded-md hover:bg-muted/60 text-muted-foreground"
        >
          Close
        </button>
      </div>
    </div>
  );
}

