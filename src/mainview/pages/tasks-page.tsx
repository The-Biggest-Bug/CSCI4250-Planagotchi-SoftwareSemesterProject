import { useState } from "react";
import { PlusIcon, PencilIcon, HomeIcon } from "@heroicons/react/24/solid";
import Layout from "@/mainview/layout";
import TodoList from "@/mainview/components/todo-list";
import TaskDetailModal from "@/mainview/components/task-detail-modal";
import CreateTaskModal from "@/mainview/components/create-task-modal";
import EditTaskModal from "@/mainview/components/edit-task-modal";
import useTodos from "@/mainview/hooks/use-todos";
import type { ButtonConfig, Navigate } from "@/mainview/types";
import type { TodoDTO } from "@/shared/rpc";

interface TasksPageProps {
  navigate: Navigate;
  eggFillColor: string;
}

export default function TasksPage({ navigate, eggFillColor }: TasksPageProps) {
  const { todos, loading, addTodo, updateTodo, deleteTodo, toggleTodo } =
    useTodos();
  const [showCreate, setShowCreate] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoDTO | null>(null);
  const [viewingTodo, setViewingTodo] = useState<TodoDTO | null>(null);

  const handleCreated = (todo: TodoDTO) => {
    addTodo(todo);
    setShowCreate(false);
    setEditMode(false);
  };

  const handleUpdated = (updated: TodoDTO) => {
    updateTodo(updated);
    setEditingTodo(null);
    setEditMode(false);
  };

  const handleDeleted = (id: number) => {
    deleteTodo(id);
    setEditingTodo(null);
    setEditMode(false);
  };

  const handleToggle = async (id: number) => {
    const updated = await toggleTodo(id);
    if (updated) {
      setViewingTodo((prev) => (prev?.id === updated.id ? updated : prev));
    }
  };

  const handleSelect = (todo: TodoDTO) => {
    if (editMode) {
      setEditingTodo(todo);
    } else {
      setViewingTodo(todo);
    }
  };

  const buttons: ButtonConfig[] = [
    { icon: HomeIcon, onClick: () => navigate("home"), ariaLabel: "home" },
    {
      icon: PlusIcon,
      onClick: () => setShowCreate(true),
      ariaLabel: "create-task",
    },
    {
      icon: PencilIcon,
      onClick: () => setEditMode((v) => !v),
      ariaLabel: "edit-tasks",
    },
  ];

  return (
    <Layout buttons={buttons} eggFillColor={eggFillColor}>
      <div className="w-full h-full flex flex-col overflow-hidden relative">
        <TodoList
          todos={todos}
          loading={loading}
          editMode={editMode}
          onToggle={handleToggle}
          onSelect={handleSelect}
        />

        {viewingTodo && (
          <TaskDetailModal
            todo={viewingTodo}
            onToggle={handleToggle}
            onClose={() => setViewingTodo(null)}
          />
        )}

        {showCreate && (
          <CreateTaskModal
            onCreated={handleCreated}
            onClose={() => setShowCreate(false)}
          />
        )}

        {editingTodo && (
          <EditTaskModal
            todo={editingTodo}
            onUpdated={handleUpdated}
            onDeleted={handleDeleted}
            onClose={() => setEditingTodo(null)}
          />
        )}
      </div>
    </Layout>
  );
}
